const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// Middleware de protection des routes - Vérification du token JWT
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Extraire le token du header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({ 
        message: 'Accès refusé, token d\'authentification requis' 
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Token invalide, utilisateur non trouvé' 
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    console.error('Erreur d\'authentification:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token invalide' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expiré, veuillez vous reconnecter' 
      });
    }

    return res.status(500).json({ 
      message: 'Erreur serveur lors de l\'authentification' 
    });
  }
};

// Middleware pour vérifier le rôle administrateur
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Accès refusé, privilèges administrateur requis' 
    });
  }
};

// Middleware pour vérifier si l'utilisateur est l'auteur du ticket ou un admin
exports.isAuthorOrAdmin = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    // Vérifier si l'ID du ticket est valide
    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }

    const ticket = await Ticket.findById(ticketId).select('author');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Vérifier si l'utilisateur est l'auteur du ticket ou un admin
    if (
      ticket.author.toString() === req.user._id.toString() ||
      req.user.role === 'admin'
    ) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Accès refusé, vous devez être l\'auteur du ticket ou administrateur' 
      });
    }
  } catch (error) {
    console.error('Erreur dans isAuthorOrAdmin:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la vérification des permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut voir le ticket
exports.canViewTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }

    const ticket = await Ticket.findById(ticketId).select('author assignedTo');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // L'utilisateur peut voir le ticket s'il est :
    // - L'auteur du ticket
    // - Assigné au ticket
    // - Administrateur
    const canView = 
      ticket.author.toString() === req.user._id.toString() ||
      (ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (canView) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Accès refusé, vous n\'avez pas l\'autorisation de voir ce ticket' 
      });
    }
  } catch (error) {
    console.error('Erreur dans canViewTicket:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la vérification des permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut commenter
exports.canComment = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de ticket invalide' });
    }

    const ticket = await Ticket.findById(ticketId).select('author assignedTo status');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    // Empêcher les commentaires sur les tickets fermés (sauf pour les admins)
    if (ticket.status === 'closed' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Impossible de commenter un ticket fermé' 
      });
    }

    // L'utilisateur peut commenter s'il est :
    // - L'auteur du ticket
    // - Assigné au ticket
    // - Administrateur
    const canComment = 
      ticket.author.toString() === req.user._id.toString() ||
      (ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (canComment) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Accès refusé, vous n\'avez pas l\'autorisation de commenter ce ticket' 
      });
    }
  } catch (error) {
    console.error('Erreur dans canComment:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la vérification des permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware pour vérifier si l'utilisateur peut modifier son propre profil ou est admin
exports.canModifyUser = async (req, res, next) => {
  try {
    const userId = req.params.id || req.params.userId;

    // Si pas d'ID spécifié, c'est pour le profil de l'utilisateur connecté
    if (!userId) {
      return next();
    }

    // Vérifier si l'utilisateur modifie son propre profil ou est admin
    if (userId === req.user._id.toString() || req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Accès refusé, vous ne pouvez modifier que votre propre profil' 
      });
    }
  } catch (error) {
    console.error('Erreur dans canModifyUser:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la vérification des permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware pour limiter le taux de requêtes (rate limiting basique)
exports.rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Nettoyer les anciennes entrées
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }

    const userRequests = requests.get(key) || [];

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
};

// Middleware pour logger les actions des utilisateurs
exports.auditLogger = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
      // Logger l'action après la réponse réussie
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[AUDIT] ${new Date().toISOString()} - User: ${req.user?.email || 'Anonymous'} - Action: ${action} - IP: ${req.ip} - Method: ${req.method} - URL: ${req.originalUrl}`);
      }

      originalSend.call(this, data);
    };

    next();
  };
};