import axios from 'axios';
import API_URL from '../config/api';

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.put(`${API_URL}/auth/profile`, data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await axios.put(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
    });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  },
};

export default authService; 