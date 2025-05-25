const mongoose = require('mongoose');

// Schéma pour les commentaires
const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est requis'],
    trim: true,
    minlength: [3, 'Le commentaire doit contenir au moins 3 caractères'],
    maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'auteur du commentaire est requis']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  }
});

// Schéma pour l'historique des modifications
const HistorySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'status_changed', 'priority_changed', 'assigned', 'unassigned', 'commented']
  },
  field: {
    type: String // Champ modifié (status, priority, etc.)
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed // Ancienne valeur
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed // Nouvelle valeur
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String // Description de l'action
  }
});

// Schéma principal du ticket
const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'resolved', 'closed'],
      message: 'Le statut doit être: pending, in_progress, resolved ou closed'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'La priorité doit être: low, medium, high ou critical'
    },
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'auteur est requis']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [CommentSchema],
  history: [HistorySchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedTime: {
    type: Number, // en heures
    min: 0
  },
  actualTime: {
    type: Number, // en heures
    min: 0
  },
  dueDate: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  toJSON: { virtuals: true }, // Inclure les champs virtuels dans JSON
  toObject: { virtuals: true }
});

// Index pour améliorer les performances des requêtes
TicketSchema.index({ author: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ title: 'text', description: 'text' }); // Recherche textuelle

// Champs virtuels
TicketSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'closed';
});

TicketSchema.virtual('timeToResolve').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.ceil((this.resolvedAt - this.createdAt) / (1000 * 60 * 60)); // en heures
  }
  return null;
});

TicketSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Middleware pre-save pour l'historique
TicketSchema.pre('save', function(next) {
  const ticket = this;
  
  // Mettre à jour le timestamp
  ticket.updatedAt = new Date();
  
  // Ajouter à l'historique si le document est modifié (mais pas nouveau)
  if (!ticket.isNew && ticket.isModified()) {
    const modifiedFields = ticket.modifiedPaths();
    
    modifiedFields.forEach(field => {
      if (field !== 'updatedAt' && field !== 'history') {
        const historyEntry = {
          action: 'updated',
          field: field,
          oldValue: ticket._original ? ticket._original[field] : undefined,
          newValue: ticket[field],
          user: ticket._currentUser || ticket.author,
          description: `${field} modifié`
        };
        
        ticket.history.push(historyEntry);
      }
    });
  }
  
  // Mettre à jour les dates de résolution/fermeture
  if (ticket.isModified('status')) {
    if (ticket.status === 'resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }
    if (ticket.status === 'closed' && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }
  }
  
  next();
});

// Middleware pre-findOneAndUpdate pour l'historique
TicketSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  if (update.$set) {
    // Récupérer le document original
    const original = await this.model.findOne(this.getQuery()).lean();
    
    if (original) {
      const historyEntries = [];
      
      Object.keys(update.$set).forEach(field => {
        if (field !== 'updatedAt' && original[field] !== update.$set[field]) {
          historyEntries.push({
            action: field === 'status' ? 'status_changed' : 
                   field === 'priority' ? 'priority_changed' :
                   field === 'assignedTo' ? 'assigned' : 'updated',
            field: field,
            oldValue: original[field],
            newValue: update.$set[field],
            user: update.$set._currentUser || original.author,
            timestamp: new Date(),
            description: `${field} modifié de ${original[field]} vers ${update.$set[field]}`
          });
        }
      });
      
      if (historyEntries.length > 0) {
        this.update({}, { 
          $push: { history: { $each: historyEntries } },
          $set: { updatedAt: new Date() }
        });
      }
    }
  }
  
  next();
});

// Middleware pour populer automatiquement les références
TicketSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name email'
  }).populate({
    path: 'assignedTo',
    select: 'name email'
  }).populate({
    path: 'comments.author',
    select: 'name email'
  }).populate({
    path: 'history.user',
    select: 'name email'
  });
  
  next();
});

// Méthodes d'instance
TicketSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId
  });
  
  this.history.push({
    action: 'commented',
    user: authorId,
    description: 'Commentaire ajouté'
  });
  
  return this.save();
};

TicketSchema.methods.updateStatus = function(newStatus, userId) {
  const oldStatus = this.status;
  this.status = newStatus;
  this._currentUser = userId;
  
  return this.save();
};

TicketSchema.methods.assignTo = function(userId, assignedBy) {
  this.assignedTo = userId;
  this._currentUser = assignedBy;
  
  this.history.push({
    action: 'assigned',
    field: 'assignedTo',
    newValue: userId,
    user: assignedBy,
    description: 'Ticket assigné'
  });
  
  return this.save();
};

// Méthodes statiques
TicketSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        low_priority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        medium_priority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        high_priority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        critical_priority: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    low_priority: 0,
    medium_priority: 0,
    high_priority: 0,
    critical_priority: 0
  };
};

TicketSchema.statics.findByUser = function(userId) {
  return this.find({ author: userId }).sort({ createdAt: -1 });
};

TicketSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

TicketSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['resolved', 'closed'] }
  }).sort({ dueDate: 1 });
};

module.exports = mongoose.model('Ticket', TicketSchema);