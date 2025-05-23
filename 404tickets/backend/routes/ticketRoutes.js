const express = require('express');
const { check } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const { protect, admin, isAuthorOrAdmin } = require('../middlewares/auth');

const router = express.Router();

// Créer un ticket
router.post(
  '/',
  [
    protect,
    [
      check('title', 'Le titre est requis').not().isEmpty(),
      check('description', 'La description est requise').not().isEmpty(),
      check('priority', 'La priorité est requise').isIn(['low', 'medium', 'high', 'critical'])
    ]
  ],
  ticketController.createTicket
);

// Obtenir tous les tickets
router.get('/', protect, ticketController.getTickets);

// Obtenir les statistiques des tickets (admin)
router.get('/stats', protect, admin, ticketController.getTicketStats);

// Obtenir un ticket par ID
router.get('/:id', protect, ticketController.getTicketById);

// Mettre à jour un ticket
router.put(
  '/:id',
  [
    protect,
    isAuthorOrAdmin,
    [
      check('title', 'Le titre est requis').optional().not().isEmpty(),
      check('description', 'La description est requise').optional().not().isEmpty(),
      check('status', 'Le statut est invalide').optional()
        .isIn(['pending', 'in_progress', 'resolved', 'closed']),
      check('priority', 'La priorité est invalide').optional()
        .isIn(['low', 'medium', 'high', 'critical'])
    ]
  ],
  ticketController.updateTicket
);

// Supprimer un ticket
router.delete('/:id', protect, isAuthorOrAdmin, ticketController.deleteTicket);

module.exports = router;