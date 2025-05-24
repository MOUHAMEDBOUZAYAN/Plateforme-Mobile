// src/constants/index.js

// Statuts des tickets (correspondant au backend)
export const TICKET_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Priorités des tickets
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Rôles utilisateur
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Labels d'affichage des statuts
export const STATUS_LABELS = {
  [TICKET_STATUS.PENDING]: 'En attente',
  [TICKET_STATUS.IN_PROGRESS]: 'En cours',
  [TICKET_STATUS.RESOLVED]: 'Résolu',
  [TICKET_STATUS.CLOSED]: 'Fermé'
};

// Couleurs des statuts
export const STATUS_COLORS = {
  [TICKET_STATUS.PENDING]: '#FFC107',
  [TICKET_STATUS.IN_PROGRESS]: '#2196F3',
  [TICKET_STATUS.RESOLVED]: '#4CAF50',
  [TICKET_STATUS.CLOSED]: '#9E9E9E'
};

// Labels d'affichage des priorités
export const PRIORITY_LABELS = {
  [TICKET_PRIORITY.LOW]: 'Faible',
  [TICKET_PRIORITY.MEDIUM]: 'Moyenne',
  [TICKET_PRIORITY.HIGH]: 'Élevée',
  [TICKET_PRIORITY.CRITICAL]: 'Critique'
};

// Couleurs des priorités
export const PRIORITY_COLORS = {
  [TICKET_PRIORITY.LOW]: '#4CAF50',
  [TICKET_PRIORITY.MEDIUM]: '#FFC107',
  [TICKET_PRIORITY.HIGH]: '#FF9800',
  [TICKET_PRIORITY.CRITICAL]: '#F44336'
};