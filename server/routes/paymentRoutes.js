const express = require('express');
const router = express.Router();
const { initializePayment, getPaymentHistory, verifyPayment, getPaymentMethods, handleWebhook } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const Settings = require('../models/Settings');

// Webhook endpoint (no auth required)
router.post('/webhook', handleWebhook);

// Initialize a new payment
router.post('/initialize', auth, initializePayment);

// Get payment history
router.get('/history', auth, getPaymentHistory);

// Verify payment status
router.get('/verify/:paymentId', auth, verifyPayment);

// Get available payment methods (public endpoint)
router.get('/methods', getPaymentMethods);

// Public endpoint to get payment methods
router.get('/methods', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings?.paymentMethods || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment methods' });
  }
});

module.exports = router; 