const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Créer un nouveau ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données invalides',
      errors: errors.array() 
    });
  }

  try {
    const ticketData = {
      ...req.body,
      author: req.user._id
    };
    
    const ticket = new Ticket(ticketData);
    
    // Ajouter l'entrée d'historique de création
    ticket.history.push({
      action: 'created',
      user: req.user._id,
      description: 'Ticket créé'
    });
    
    await ticket.save();
    
    // Populer les références pour la réponse
    await ticket.populate([
      { path: 'author', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);
    
    res.status(201).json({
      message: 'Ticket créé avec succès',
      ticket
    });

  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création du ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Récupérer tous les tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, author, assignedTo, search, page = 1, limit = 20 } = req.query;
    
    // Construction du filtre
    const filter = {};
    
    // Si l'utilisateur n'est pas admin, il ne voit que ses tickets
    if (req.user.role !== 'admin') {
      filter.author = req.user._id;
    } else {
      // Filtres pour admin
      if (author) filter.author = author;
      if (assignedTo) filter.assignedTo = assignedTo;
    }
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Recherche textuelle
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Ticket.countDocuments(filter);
    
    res.json({
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Récupérer un ticket par ID
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && ticket.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Non autorisé à consulter ce ticket' 
      });
    }
    
    res.json(ticket);

  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération du ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mettre à jour un ticket
// @route   PUT /api/tickets/:id
// @access  Private (auteur ou admin)
exports.updateTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données invalides',
      errors: errors.array() 
    });
  }

  try {
    const updates = { ...req.body };
    updates._currentUser = req.user._id;
    
    // Seuls les admins peuvent modifier l'assignation
    if (req.user.role !== 'admin') {
      delete updates.assignedTo;
    }
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.json({
      message: 'Ticket mis à jour avec succès',
      ticket
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du ticket:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour du ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Supprimer un ticket
// @route   DELETE /api/tickets/:id
// @access  Private (auteur ou admin)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.json({ 
      message: 'Ticket supprimé avec succès',
      deletedTicket: {
        _id: ticket._id,
        title: ticket.title
      }
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression du ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtenir les statistiques des tickets
// @route   GET /api/tickets/stats
// @access  Private/Admin
exports.getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.getStatistics();
    
    // Statistiques supplémentaires
    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status priority createdAt author')
      .populate('author', 'name email');
    
    const overdueTickets = await Ticket.findOverdue();
    
    res.json({
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
      overdueCount: overdueTickets.length,
      overdueTickets: overdueTickets.slice(0, 5) // Limiter à 5 pour la performance
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Ajouter un commentaire à un ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données invalides',
      errors: errors.array() 
    });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && ticket.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Non autorisé à commenter ce ticket' 
      });
    }
    
    const comment = {
      content: req.body.content.trim(),
      author: req.user._id
    };
    
    ticket.comments.push(comment);
    
    // Ajouter à l'historique
    ticket.history.push({
      action: 'commented',
      user: req.user._id,
      description: 'Commentaire ajouté'
    });
    
    await ticket.save();
    
    // Repopuler le ticket pour la réponse
    await ticket.populate([
      { path: 'comments.author', select: 'name email' }
    ]);
    
    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      ticket
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'ajout du commentaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mettre à jour un commentaire
// @route   PUT /api/tickets/:id/comments/:commentId
// @access  Private (auteur du commentaire ou admin)
exports.updateComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données invalides',
      errors: errors.array() 
    });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const comment = ticket.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && comment.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Non autorisé à modifier ce commentaire' 
      });
    }
    
    comment.content = req.body.content.trim();
    comment.updatedAt = new Date();
    comment.isEdited = true;
    
    await ticket.save();
    
    res.json({
      message: 'Commentaire mis à jour avec succès',
      comment
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour du commentaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Supprimer un commentaire
// @route   DELETE /api/tickets/:id/comments/:commentId
// @access  Private (auteur du commentaire ou admin)
exports.deleteComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const comment = ticket.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && comment.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Non autorisé à supprimer ce commentaire' 
      });
    }
    
    comment.remove();
    await ticket.save();
    
    res.json({ message: 'Commentaire supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression du commentaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Assigner un ticket à un utilisateur
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données invalides',
      errors: errors.array() 
    });
  }

  try {
    const { assignedTo } = req.body;
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    await ticket.assignTo(assignedTo, req.user._id);
    
    res.json({
      message: `Ticket assigné à ${user.name || user.email}`,
      ticket
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'assignation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Désassigner un ticket
// @route   PUT /api/tickets/:id/unassign
// @access  Private/Admin
exports.unassignTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        $unset: { assignedTo: 1 },
        $push: {
          history: {
            action: 'unassigned',
            field: 'assignedTo',
            user: req.user._id,
            description: 'Ticket désassigné'
          }
        }
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.json({
      message: 'Ticket désassigné avec succès',
      ticket
    });

  } catch (error) {
    console.error('Erreur lors de la désassignation:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la désassignation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtenir les tickets d'un utilisateur
// @route   GET /api/tickets/user/:userId
// @access  Private/Admin
exports.getTicketsByUser = async (req, res) => {
  try {
    const tickets = await Ticket.findByUser(req.params.userId);
    
    res.json({
      tickets,
      count: tickets.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tickets utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des tickets utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtenir les tickets par statut
// @route   GET /api/tickets/status/:status
// @access  Private/Admin
exports.getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Valider le statut
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Statut invalide',
        validStatuses 
      });
    }
    
    const tickets = await Ticket.findByStatus(status);
    
    res.json({
      status,
      tickets,
      count: tickets.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par statut:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des tickets par statut',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtenir l'historique d'un ticket
// @route   GET /api/tickets/:id/history
// @access  Private (auteur ou admin)
exports.getTicketHistory = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .select('history')
      .populate('history.user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.json({
      ticketId: req.params.id,
      history: ticket.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de l\'historique',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};