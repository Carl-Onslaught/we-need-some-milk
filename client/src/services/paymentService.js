import api from './api';

const paymentService = {
  // Initialize a new payment
  initializePayment: async (paymentData) => {
    try {
      const response = await api.post('/payment/initialize', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payment/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  },

  // Get user stats (wallet balance, total investment, earnings)
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
    }
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    try {
      const response = await api.get(`/payment/verify/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  },

  // Get available payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payment/methods');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  },

  // Poll payment status
  pollPaymentStatus: async (paymentId, interval = 5000, maxAttempts = 12) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await api.get(`/payment/verify/${paymentId}`);
        const status = response.data.status;
        
        if (status === 'completed' || status === 'failed') {
          return response.data;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Payment status check timed out');
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to poll payment status');
      }
    };
    
    return poll();
  }
};

export default paymentService; 