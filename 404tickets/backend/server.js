const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require ("./config/db.js");
const logger = require('./middlewares/logger');


// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialiser Express
const app = express();

// Middlewares de sécurité et parsing
app.use(helmet({
  contentSecurityPolicy: false, // Désactiver pour le développement
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:3000'], // Ajoutez vos domaines autorisés
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Middleware de logging personnalisé
app.use(logger);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API 404 Tickets',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Route de santé pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API 404 Tickets fonctionnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Erreur de validation',
      errors
    });
  }
  
  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID invalide'
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token invalide'
    });
  }
  
  // Erreur par défaut
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Gestion des routes non trouvées - doit être après toutes les autres routes
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} non trouvée`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'GET /api/auth/users',
      'PUT /api/auth/users/:id/role',
      'GET /api/tickets',
      'POST /api/tickets',
      'GET /api/tickets/stats',
      'GET /api/tickets/:id',
      'PUT /api/tickets/:id',
      'DELETE /api/tickets/:id',
      'POST /api/tickets/:id/comments'
    ]
  });
});

// Gestion gracieuse de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// Port et démarrage du serveur
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Serveur 404 Tickets démarré avec succès !
📡 Port: ${PORT}
🌍 Environnement: ${process.env.NODE_ENV || 'development'}
🔗 API: http://localhost:${PORT}
📊 Santé: http://localhost:${PORT}/api/health
⏰ Démarré à: ${new Date().toLocaleString('fr-FR')}
  `);
});

// Gestion des erreurs de serveur
server.on('error', (err) => {
  console.error('Erreur du serveur:', err);
  process.exit(1);
});

module.exports = app;