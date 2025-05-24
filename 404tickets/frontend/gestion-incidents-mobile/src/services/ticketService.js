// src/services/ticketService.js
import axios from 'axios';
import API_URL from '../config/api';

class TicketService {
  // Récupérer tous les tickets
  async getAllTickets(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.userId) params.append('userId', filters.userId);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/tickets?${queryString}` : `${API_URL}/tickets`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Récupérer un ticket par ID
  async getTicketById(ticketId) {
    try {
      const response = await axios.get(`${API_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  // Créer un nouveau ticket
  async createTicket(ticketData) {
    try {
      const response = await axios.post(`${API_URL}/tickets`, ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Mettre à jour un ticket
  async updateTicket(ticketId, updateData) {
    try {
      const response = await axios.put(`${API_URL}/tickets/${ticketId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  // Supprimer un ticket
  async deleteTicket(ticketId) {
    try {
      const response = await axios.delete(`${API_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  // Ajouter un commentaire
  async addComment(ticketId, commentData) {
    try {
      const response = await axios.post(`${API_URL}/tickets/${ticketId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStats() {
    try {
      const response = await axios.get(`${API_URL}/tickets/stats`);
      return {
        totalTickets: response.data.total || 0,
        pendingTickets: response.data.byStatus?.pending || 0,
        inProgressTickets: response.data.byStatus?.in_progress || 0,
        resolvedTickets: response.data.byStatus?.resolved || 0,
        closedTickets: response.data.byStatus?.closed || 0
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Récupérer tous les utilisateurs (admin only)
  async getAllUsers() {
    try {
      const response = await axios.get(`${API_URL}/auth/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Mettre à jour le rôle d'un utilisateur (admin only)
  async updateUserRole(userId, role) {
    try {
      const response = await axios.put(`${API_URL}/auth/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
}

export default new TicketService();