const Ticket = require('../models/Ticket');

class TicketService {
  // Créer un nouveau ticket
  async createTicket(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la création du ticket: ${error.message}`);
    }
  }

  // Récupérer tous les tickets (avec filtres optionnels)
  async getTickets(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.author) query.author = filters.author;
      if (filters.priority) query.priority = filters.priority;
      
      return await Ticket.find(query)
        .populate('author', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets: ${error.message}`);
    }
  }

  // Récupérer un ticket par ID
  async getTicketById(id) {
    try {
      const ticket = await Ticket.findById(id)
        .populate('author', 'name email')
        .populate('assignedTo', 'name email');
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du ticket: ${error.message}`);
    }
  }

  // Mettre à jour un ticket
  async updateTicket(id, updates) {
    try {
      updates.updatedAt = Date.now();
      
      const ticket = await Ticket.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).populate('author', 'name email')
       .populate('assignedTo', 'name email');
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
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
      
      return { message: 'Ticket supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du ticket: ${error.message}`);
    }
  }
}

module.exports = new TicketService();