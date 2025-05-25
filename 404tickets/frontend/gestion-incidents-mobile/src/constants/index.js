// src/constants/index.js

// Ticket Status
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const STATUS_LABELS = {
  [STATUS.PENDING]: 'En attente',
  [STATUS.IN_PROGRESS]: 'En cours',
  [STATUS.RESOLVED]: 'Résolu',
  [STATUS.CLOSED]: 'Fermé',
};

export const STATUS_COLORS = {
  [STATUS.PENDING]: '#FFC107',    // Yellow
  [STATUS.IN_PROGRESS]: '#2196F3', // Blue
  [STATUS.RESOLVED]: '#4CAF50',    // Green
  [STATUS.CLOSED]: '#9E9E9E',      // Grey
};

// Ticket Priority
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_LABELS = {
  [PRIORITY.LOW]: 'Basse',
  [PRIORITY.MEDIUM]: 'Moyenne',
  [PRIORITY.HIGH]: 'Haute',
  [PRIORITY.URGENT]: 'Urgente',
};

export const PRIORITY_COLORS = {
  [PRIORITY.LOW]: '#4CAF50',     // Green
  [PRIORITY.MEDIUM]: '#2196F3',   // Blue
  [PRIORITY.HIGH]: '#FF9800',     // Orange
  [PRIORITY.URGENT]: '#F44336',   // Red
};

// User Roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPPORT: 'support',
};

// Navigation Routes
export const ROUTES = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  TICKETS: 'Tickets',
  CREATE_TICKET: 'CreateTicket',
  TICKET_DETAILS: 'TicketDetails',
  PROFILE: 'Profile',
  ADMIN: 'Admin',
};

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  TICKETS: {
    BASE: '/tickets',
    STATS: '/tickets/stats',
    COMMENTS: '/tickets/:id/comments',
    STATUS: '/tickets/:id/status',
    ASSIGN: '/tickets/:id/assign',
    HISTORY: '/tickets/:id/history',
  },
};