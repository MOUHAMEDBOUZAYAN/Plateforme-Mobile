const express = require('express');
const { check } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const { protect, admin, isAuthorOrAdmin } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/tickets
// @desc    Créer un nouveau ticket
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('title', 'Le titre est requis et doit contenir au moins 5 caractères')
        .isLength({ min: 5 })
        .trim(),
      check('description', 'La description est requise et doit contenir au moins 10 caractères')
        .isLength({ min: 10 })
        .trim(),
      check('priority', 'La priorité est requise et doit être valide')
        .isIn(['low', 'medium', 'high', 'critical'])
    ]
  ],
  ticketController.createTicket
);

// @route   GET /api/tickets
// @desc    Obtenir tous les tickets
// @access  Private
router.get('/', protect, ticketController.getTickets);

// @route   GET /api/tickets/stats
// @desc    Obtenir les statistiques des tickets (admin)
// @access  Private/Admin
router.get('/stats', protect, admin, ticketController.getTicketStats);

// @route   GET /api/tickets/user/:userId
// @desc    Obtenir les tickets d'un utilisateur spécifique
// @access  Private/Admin
router.get('/user/:userId', protect, admin, ticketController.getTicketsByUser);

// @route   GET /api/tickets/status/:status
// @desc    Obtenir les tickets par statut
// @access  Private/Admin
router.get('/status/:status', protect, admin, ticketController.getTicketsByStatus);

// @route   GET /api/tickets/:id/history
// @desc    Obtenir l'historique d'un ticket
// @access  Private (auteur ou admin)
router.get('/:id/history', protect, isAuthorOrAdmin, ticketController.getTicketHistory);

// @route   PUT /api/tickets/:id/assign
// @desc    Assigner un ticket à un utilisateur (admin)
// @access  Private/Admin
router.put(
  '/:id/assign',
  [
    protect,
    admin,
    [
      check('assignedTo', 'L\'ID de l\'utilisateur assigné est requis')
        .notEmpty()
        .isMongoId()
        .withMessage('ID utilisateur invalide')
    ]
  ],
  ticketController.assignTicket
);

// @route   PUT /api/tickets/:id/unassign
// @desc    Désassigner un ticket (admin)
// @access  Private/Admin
router.put('/:id/unassign', protect, admin, ticketController.unassignTicket);

// @route   POST /api/tickets/:id/comments
// @desc    Ajouter un commentaire à un ticket
// @access  Private
router.post(
  '/:id/comments',
  [
    protect,
    [
      check('content', 'Le contenu du commentaire est requis et doit contenir au moins 3 caractères')
        .isLength({ min: 3 })
        .trim()
    ]
  ],
  ticketController.addComment
);

// @route   PUT /api/tickets/:id/comments/:commentId
// @desc    Mettre à jour un commentaire
// @access  Private (auteur du commentaire ou admin)
router.put(
  '/:id/comments/:commentId',
  [
    protect,
    [
      check('content', 'Le contenu du commentaire est requis et doit contenir au moins 3 caractères')
        .isLength({ min: 3 })
        .trim()
    ]
  ],
  ticketController.updateComment
);

// @route   DELETE /api/tickets/:id/comments/:commentId
// @desc    Supprimer un commentaire
// @access  Private (auteur du commentaire ou admin)
router.delete('/:id/comments/:commentId', protect, ticketController.deleteComment);

// @route   GET /api/tickets/:id
// @desc    Obtenir un ticket par ID
// @access  Private
router.get('/:id', protect, ticketController.getTicketById);

// @route   PUT /api/tickets/:id
// @desc    Mettre à jour un ticket
// @access  Private (auteur ou admin)
router.put(
  '/:id',
  [
    protect,
    isAuthorOrAdmin,
    [
      check('title', 'Le titre doit contenir au moins 5 caractères')
        .optional()
        .isLength({ min: 5 })
        .trim(),
      check('description', 'La description doit contenir au moins 10 caractères')
        .optional()
        .isLength({ min: 10 })
        .trim(),
      check('status', 'Le statut est invalide')
        .optional()
        .isIn(['pending', 'in_progress', 'resolved', 'closed']),
      check('priority', 'La priorité est invalide')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
    ]
  ],
  ticketController.updateTicket
);

// @route   DELETE /api/tickets/:id
// @desc    Supprimer un ticket
// @access  Private (auteur ou admin)
router.delete('/:id', protect, isAuthorOrAdmin, ticketController.deleteTicket);

module.exports = router;