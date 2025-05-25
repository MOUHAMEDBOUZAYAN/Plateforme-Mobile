const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Inscription d'un utilisateur
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Le nom est requis et doit contenir au moins 2 caractères')
      .isLength({ min: 2 })
      .trim(),
    check('email', 'Veuillez inclure un email valide')
      .isEmail()
      .normalizeEmail(),
    check('password', 'Le mot de passe doit contenir au moins 6 caractères')
      .isLength({ min: 6 }),
    check('phone', 'Le numéro de téléphone est requis')
      .notEmpty()
      .trim()
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide')
      .isEmail()
      .normalizeEmail(),
    check('password', 'Le mot de passe est requis')
      .exists()
      .notEmpty()
  ],
  authController.login
);

// @route   GET /api/auth/profile
// @desc    Obtenir le profil utilisateur
// @access  Private
router.get('/profile', protect, authController.getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Mettre à jour le profil utilisateur
// @access  Private
router.put(
  '/profile',
  [
    protect,
    [
      check('name', 'Le nom doit contenir au moins 2 caractères')
        .optional()
        .isLength({ min: 2 })
        .trim(),
      check('email', 'Veuillez inclure un email valide')
        .optional()
        .isEmail()
        .normalizeEmail(),
      check('phone', 'Le numéro de téléphone est invalide')
        .optional()
        .trim(),
      check('password', 'Le nouveau mot de passe doit contenir au moins 6 caractères')
        .optional()
        .isLength({ min: 6 })
    ]
  ],
  authController.updateUserProfile
);

// @route   GET /api/auth/users
// @desc    Obtenir tous les utilisateurs (admin seulement)
// @access  Private/Admin
router.get('/users', protect, admin, authController.getAllUsers);

// @route   PUT /api/auth/users/:id/role
// @desc    Mettre à jour le rôle d'un utilisateur (admin seulement)
// @access  Private/Admin
router.put(
  '/users/:id/role',
  [
    protect,
    admin,
    [
      check('role', 'Le rôle doit être "user" ou "admin"')
        .isIn(['user', 'admin'])
    ]
  ],
  authController.updateUserRole
);

// @route   GET /api/auth/users/:id
// @desc    Obtenir un utilisateur par ID (admin seulement)
// @access  Private/Admin
router.get('/users/:id', protect, admin, authController.getUserById);

// @route   DELETE /api/auth/users/:id
// @desc    Supprimer un utilisateur (admin seulement)
// @access  Private/Admin
router.delete('/users/:id', protect, admin, authController.deleteUser);

// @route   GET /api/auth/me
// @desc    Obtenir l'utilisateur actuel
// @access  Private
router.get('/me', protect, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

// @route   POST /api/auth/change-password
// @desc    Changer le mot de passe
// @access  Private
router.put(
  '/change-password',
  [
    protect,
    [
      check('currentPassword', 'Le mot de passe actuel est requis')
        .notEmpty(),
      check('newPassword', 'Le nouveau mot de passe doit contenir au moins 6 caractères')
        .isLength({ min: 6 })
    ]
  ],
  authController.changePassword
);

module.exports = router;