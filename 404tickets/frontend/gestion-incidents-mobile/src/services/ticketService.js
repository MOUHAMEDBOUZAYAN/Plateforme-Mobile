// src/services/ticketService.js
import axios from 'axios';
import API_URL from '../config/api';

const ticketService = {
  // Get ticket statistics
  getStats: async () => {
    const response = await axios.get(`${API_URL}/tickets/stats`);
    return response.data;
  },

  // Get all tickets
  getAllTickets: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/tickets`, { params: filters });
    return response.data;
  },

  // Get a single ticket
  getTicket: async (id) => {
    const response = await axios.get(`${API_URL}/tickets/${id}`);
    return response.data;
  },

  // Create a new ticket
  createTicket: async (ticketData) => {
    const response = await axios.post(`${API_URL}/tickets`, ticketData);
    return response.data;
  },

  // Update a ticket
  updateTicket: async (id, ticketData) => {
    const response = await axios.put(`${API_URL}/tickets/${id}`, ticketData);
    return response.data;
  },

  // Delete a ticket
  deleteTicket: async (id) => {
    const response = await axios.delete(`${API_URL}/tickets/${id}`);
    return response.data;
  },

  // Add a comment to a ticket
  addComment: async (ticketId, comment) => {
    const response = await axios.post(`${API_URL}/tickets/${ticketId}/comments`, { comment });
    return response.data;
  },

  // Update ticket status
  updateStatus: async (ticketId, status) => {
    const response = await axios.put(`${API_URL}/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  // Assign ticket to user
  assignTicket: async (ticketId, userId) => {
    const response = await axios.put(`${API_URL}/tickets/${ticketId}/assign`, { userId });
    return response.data;
  },

  // Get ticket history
  getTicketHistory: async (ticketId) => {
    const response = await axios.get(`${API_URL}/tickets/${ticketId}/history`);
    return response.data;
  },

  // Récupérer tous les utilisateurs (admin only)
  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/auth/users`);
    return response.data;
  },

  // Mettre à jour le rôle d'un utilisateur (admin only)
  updateUserRole: async (userId, role) => {
    const response = await axios.put(`${API_URL}/auth/users/${userId}/role`, { role });
    return response.data;
  },
};

export default ticketService;