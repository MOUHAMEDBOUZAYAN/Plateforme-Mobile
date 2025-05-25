const Ticket = require('../models/Ticket');
const User = require('../models/User');

class TicketService {
  // Créer un nouveau ticket avec validation et historique
  async createTicket(ticketData, authorId) {
    try {
      const ticket = new Ticket({
        ...ticketData,
        author: authorId
      });
      
      // Ajouter l'entrée d'historique de création
      ticket.history.push({
        action: 'created',
        user: authorId,
        description: 'Ticket créé'
      });
      
      await ticket.save();
      
      // Populer les références
      await ticket.populate([
        { path: 'author', select: 'name email' },
        { path: 'assignedTo', select: 'name email' }
      ]);
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la création du ticket: ${error.message}`);
    }
  }

  // Récupérer tous les tickets avec filtres et pagination
  async getTickets(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = { createdAt: -1 },
        populate = true
      } = options;
      
      const query = Ticket.find(filters);
      
      if (populate) {
        query.populate([
          { path: 'author', select: 'name email' },
          { path: 'assignedTo', select: 'name email' },
          { path: 'comments.author', select: 'name email' }
        ]);
      }
      
      const tickets = await query
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await Ticket.countDocuments(filters);
      
      return {
        tickets,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets: ${error.message}`);
    }
  }

  // Récupérer un ticket par ID avec toutes les relations
  async getTicketById(id, userId = null, userRole = 'user') {
    try {
      const ticket = await Ticket.findById(id);
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      // Vérifier les permissions si un utilisateur est spécifié
      if (userId && userRole !== 'admin' && ticket.author._id.toString() !== userId.toString()) {
        throw new Error('Non autorisé à consulter ce ticket');
      }
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du ticket: ${error.message}`);
    }
  }

  // Mettre à jour un ticket avec gestion de l'historique
  async updateTicket(id, updates, userId) {
    try {
      // Récupérer le ticket original pour l'historique
      const originalTicket = await Ticket.findById(id).lean();
      
      if (!originalTicket) {
        throw new Error('Ticket non trouvé');
      }
      
      // Préparer les mises à jour avec l'utilisateur courant
      const updateData = {
        ...updates,
        _currentUser: userId,
        updatedAt: new Date()
      };
      
      const ticket = await Ticket.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du ticket: ${error.message}`);
    }
  }

  // Supprimer un ticket
  async deleteTicket(id) {
    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      return { 
        message: 'Ticket supprimé avec succès',
        deletedTicket: {
          _id: ticket._id,
          title: ticket.title
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du ticket: ${error.message}`);
    }
  }

  // Ajouter un commentaire à un ticket
  async addComment(ticketId, commentData, authorId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      // Ajouter le commentaire
      const comment = {
        content: commentData.content,
        author: authorId
      };
      
      ticket.comments.push(comment);
      
      // Ajouter à l'historique
      ticket.history.push({
        action: 'commented',
        user: authorId,
        description: 'Commentaire ajouté'
      });
      
      await ticket.save();
      
      // Repopuler pour la réponse
      await ticket.populate([
        { path: 'comments.author', select: 'name email' }
      ]);
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout du commentaire: ${error.message}`);
    }
  }

  // Obtenir les statistiques complètes
  async getStatistics() {
    try {
      const stats = await Ticket.getStatistics();
      
      // Statistiques supplémentaires
      const [recentTickets, overdueTickets, userStats] = await Promise.all([
        Ticket.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('author', 'name email'),
        
        Ticket.findOverdue().limit(10),
        
        this.getUserTicketStats()
      ]);
      
      return {
        total: stats.total,
        byStatus: {
          pending: stats.pending,
          in_progress: stats.in_progress,
          resolved: stats.resolved,
          closed: stats.closed
        },
        byPriority: {
          low: stats.low_priority,
          medium: stats.medium_priority,
          high: stats.high_priority,
          critical: stats.critical_priority
        },
        recentTickets,
        overdueTickets,
        userStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Statistiques par utilisateur
  async getUserTicketStats() {
    try {
      const userStats = await Ticket.aggregate([
        {
          $group: {
            _id: '$author',
            totalTickets: { $sum: 1 },
            openTickets: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['pending', 'in_progress']] },
                  1,
                  0
                ]
              }
            },
            resolvedTickets: {
              $sum: {
                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            totalTickets: 1,
            openTickets: 1,
            resolvedTickets: 1,
            'user.name': 1,
            'user.email': 1
          }
        },
        {
          $sort: { totalTickets: -1 }
        },
        {
          $limit: 10
        }
      ]);
      
      return userStats;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques utilisateur: ${error.message}`);
    }
  }

  // Recherche avancée de tickets
  async searchTickets(searchQuery, filters = {}, options = {}) {
    try {
      const searchFilter = {
        ...filters,
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      };
      
      return await this.getTickets(searchFilter, options);
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de tickets: ${error.message}`);
    }
  }

  // Assigner un ticket à un utilisateur
  async assignTicket(ticketId, userId, assignedBy) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      // Utiliser la méthode du modèle
      await ticket.assignTo(userId, assignedBy);
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de l'assignation: ${error.message}`);
    }
  }

  // Obtenir les tickets en retard
  async getOverdueTickets(limit = 20) {
    try {
      const overdueTickets = await Ticket.findOverdue().limit(limit);
      return overdueTickets;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets en retard: ${error.message}`);
    }
  }

  // Obtenir les tickets par utilisateur
  async getTicketsByUser(userId, options = {}) {
    try {
      const filters = { author: userId };
      return await this.getTickets(filters, options);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets utilisateur: ${error.message}`);
    }
  }

  // Obtenir les tickets par statut
  async getTicketsByStatus(status, options = {}) {
    try {
      const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Statut invalide');
      }
      
      const filters = { status };
      return await this.getTickets(filters, options);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets par statut: ${error.message}`);
    }
  }

  // Changer le statut d'un ticket
  async changeTicketStatus(ticketId, newStatus, userId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      await ticket.updateStatus(newStatus, userId);
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors du changement de statut: ${error.message}`);
    }
  }

  // Obtenir le tableau de bord pour un utilisateur
  async getUserDashboard(userId) {
    try {
      const [myTickets, assignedTickets, recentActivity] = await Promise.all([
        // Mes tickets
        Ticket.find({ author: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('assignedTo', 'name email'),
        
        // Tickets qui me sont assignés
        Ticket.find({ assignedTo: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('author', 'name email'),
        
        // Activité récente sur mes tickets
        Ticket.find({ 
          $or: [
            { author: userId },
            { assignedTo: userId }
          ]
        })
          .sort({ updatedAt: -1 })
          .limit(10)
          .select('title status updatedAt history')
          .populate('history.user', 'name email')
      ]);
      
      return {
        myTickets,
        assignedTickets,
        recentActivity
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du tableau de bord: ${error.message}`);
    }
  }
}

module.exports = new TicketService();