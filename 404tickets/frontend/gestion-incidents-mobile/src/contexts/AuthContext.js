// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = {
          ...response.data,
          role: response.data.role || 'user' // Default to 'user' if role is not specified
        };
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://192.168.20.243:5000/api/auth/login', {
        email,
        password
      });
      const { token, user } = response.data;
      
      // Ensure user object has all required properties
      const userData = {
        ...user,
        role: user.role || 'user' // Default to 'user' if role is not specified
      };
      
      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('start fetching register');
      console.log(userData);
      const response = await axios.post('http://192.168.20.243:5000/api/auth/register', userData);
      console.log('end fetching register');
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Une erreur inconnue est survenue lors de l\'inscription'
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de mise à jour du profil'
      };
    }
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;