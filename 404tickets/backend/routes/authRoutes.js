const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Inscription d'un utilisateur
router.post(
  '/register',
  [
    check('name', 'Le nom est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Veuillez entrer un mot de passe de 6 caractères ou plus').isLength({ min: 6 }),
    check('phone', 'Le numéro de téléphone est requis').optional()
  ],
  authController.register
);

// Connexion d'un utilisateur
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
  ],
  authController.login
);

// Obtenir le profil utilisateur
router.get('/profile', protect, authController.getUserProfile);

// Mettre à jour le profil utilisateur
router.put('/profile', protect, authController.updateUserProfile);

module.exports = router;