import axios from 'axios';
import { API_URL, axiosConfig } from '../config';

const authService = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, axiosConfig);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during login' };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, axiosConfig);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during registration' };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, axiosConfig);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching user data' };
    }
  }
};

export default authService; 