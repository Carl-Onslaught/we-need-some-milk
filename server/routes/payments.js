const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// Initialize payment
router.post('/initialize', auth, paymentController.initializePayment);

// Verify payment
router.get('/verify/:reference', auth, paymentController.verifyPayment);

// Get payment history
router.get('/history', auth, paymentController.getPaymentHistory);

// Get payment methods
router.get('/methods', auth, paymentController.getPaymentMethods);

module.exports = router; 