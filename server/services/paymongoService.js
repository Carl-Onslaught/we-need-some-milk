const axios = require('axios');

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

class PayMongoService {
  constructor() {
    this.client = axios.create({
      baseURL: PAYMONGO_API_URL,
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Create a payment intent
  async createPaymentIntent(amount, currency = 'PHP') {
    try {
      const response = await this.client.post('/payment_intents', {
        data: {
          attributes: {
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            payment_method_allowed: ['card', 'gcash', 'grab_pay'],
            payment_method_options: {
              card: {
                request_three_d_secure: 'any'
              }
            }
          }
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('PayMongo payment intent error:', error.response?.data || error.message);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create a payment method
  async createPaymentMethod(type, details) {
    try {
      const response = await this.client.post('/payment_methods', {
        data: {
          attributes: {
            type,
            details
          }
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('PayMongo payment method error:', error.response?.data || error.message);
      throw new Error('Failed to create payment method');
    }
  }

  // Attach payment method to payment intent
  async attachPaymentMethod(paymentIntentId, paymentMethodId) {
    try {
      const response = await this.client.post(`/payment_intents/${paymentIntentId}/attach`, {
        data: {
          attributes: {
            payment_method: paymentMethodId
          }
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('PayMongo attach payment method error:', error.response?.data || error.message);
      throw new Error('Failed to attach payment method');
    }
  }

  // Retrieve payment intent
  async getPaymentIntent(paymentIntentId) {
    try {
      const response = await this.client.get(`/payment_intents/${paymentIntentId}`);
      return response.data.data;
    } catch (error) {
      console.error('PayMongo get payment intent error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  // Get payment intent status
  async getPaymentIntentStatus(paymentIntentId) {
    const paymentIntent = await this.getPaymentIntent(paymentIntentId);
    return paymentIntent.attributes.status;
  }

  // Create a source for alternative payment methods
  async createSource(amount, type, currency = 'PHP') {
    try {
      const response = await this.client.post('/sources', {
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency,
            type,
            redirect: {
              success: `${process.env.FRONTEND_URL}/payment/success`,
              failed: `${process.env.FRONTEND_URL}/payment/failed`
            }
          }
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('PayMongo create source error:', error.response?.data || error.message);
      throw new Error('Failed to create payment source');
    }
  }

  // Retrieve a source
  async getSource(sourceId) {
    try {
      const response = await this.client.get(`/sources/${sourceId}`);
      return response.data.data;
    } catch (error) {
      console.error('PayMongo get source error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve payment source');
    }
  }

  // Get source status
  async getSourceStatus(sourceId) {
    const source = await this.getSource(sourceId);
    return source.attributes.status;
  }

  // Create payment from source
  async createPaymentFromSource(sourceId, amount) {
    try {
      const response = await this.client.post('/payments', {
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            source: { id: sourceId, type: 'source' },
            currency: 'PHP'
          }
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('PayMongo create payment error:', error.response?.data || error.message);
      throw new Error('Failed to create payment from source');
    }
  }

  // Get available payment methods
  async getAvailablePaymentMethods() {
    return [
      { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
      { id: 'gcash', name: 'GCash', icon: 'mobile' },
      { id: 'grab_pay', name: 'GrabPay', icon: 'mobile' }
    ];
  }
}

module.exports = new PayMongoService(); 