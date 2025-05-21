const { validationResult } = require('express-validator');
const TicketService = require('../services/TicketService');

// Créer un nouveau ticket
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ticketData = {
      ...req.body,
      author: req.user._id
    };
    
    const ticket = await TicketService.createTicket(ticketData);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les tickets
exports.getTickets = async (req, res) => {
  try {
    const filters = {};
    
    // Filtres optionnels
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    
    // Si l'utilisateur n'est pas admin, il ne voit que ses tickets
    if (req.user.role !== 'admin' && !req.query.all) {
      filters.author = req.user._id;
    } else if (req.query.userId) {
      filters.author = req.query.userId;
    }
    
    const tickets = await TicketService.getTickets(filters);
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un ticket par ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await TicketService.getTicketById(req.params.id);
    
    // Vérifier si l'utilisateur a le droit de voir ce ticket
    if (
      req.user.role !== 'admin' && 
      ticket.author._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ 
        message: 'Non autorisé à consulter ce ticket' 
      });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    if (error.message === 'Ticket non trouvé') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Mettre à jour un ticket
exports.updateTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updates = { ...req.body };
    
    // Seuls les admins peuvent réassigner un ticket
    if (req.user.role !== 'admin') {
      delete updates.assignedTo;
    }
    
    const ticket = await TicketService.updateTicket(req.params.id, updates);
    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    if (error.message === 'Ticket non trouvé') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Supprimer un ticket
exports.deleteTicket = async (req, res) => {
  try {
    const result = await TicketService.deleteTicket(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Delete ticket error:', error);
    if (error.message === 'Ticket non trouvé') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Statistiques des tickets (pour le tableau de bord admin)
exports.getTicketStats = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Non autorisé, accès réservé aux administrateurs' 
      });
    }
    
    const tickets = await TicketService.getTickets();
    
    // Calculer les statistiques
    const stats = {
      total: tickets.length,
      byStatus: {
        pending: tickets.filter(t => t.status === 'pending').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length
      },
      byPriority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        critical: tickets.filter(t => t.priority === 'critical').length
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ message: error.message });
  }
};