const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ajouter les informations utilisateur à la requête
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès réservé aux administrateurs' });
  }
};

exports.isAuthorOrAdmin = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const ticket = await require('../models/Ticket').findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Vérifier si l'utilisateur est l'auteur du ticket ou un admin
    if (
      ticket.author.toString() === req.user.id ||
      req.user.role === 'admin'
    ) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Non autorisé, vous devez être l'auteur ou un administrateur' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
