const Payment = require('../models/Payment');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { generatePaymentReference } = require('../utils/paymentUtils');
const paymongoService = require('../services/paymongoService');

// Initialize a new payment
const initializePayment = async (req, res) => {
  try {
    const { amount, type, method } = req.body;
    const userId = req.user._id;

    // Validate payment data
    if (!amount || !type || !method) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Create payment record
    const payment = new Payment({
      user: userId,
      amount,
      type,
      method,
      status: 'pending',
      reference: generatePaymentReference()
    });

    await payment.save();

    let paymentData;
    if (method === 'card') {
      // Create payment intent for card payments
      paymentData = await paymongoService.createPaymentIntent(amount);
      payment.metadata = { paymentIntentId: paymentData.id };
    } else {
      // Create source for alternative payment methods
      paymentData = await paymongoService.createSource(amount, method);
      payment.metadata = { sourceId: paymentData.id };
    }

    await payment.save();

    res.status(201).json({
      message: 'Payment initialized successfully',
      payment: {
        id: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        type: payment.type,
        method: payment.method,
        status: payment.status,
        metadata: paymentData
      }
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ message: 'Error initializing payment' });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
};

// Verify payment status
const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let status;
    if (payment.method === 'card') {
      status = await paymongoService.getPaymentIntentStatus(payment.metadata.paymentIntentId);
    } else {
      status = await paymongoService.getSourceStatus(payment.metadata.sourceId);
    }

    payment.status = status;
    await payment.save();

    res.json({ status: payment.status });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Get available payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings?.paymentMethods || []);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
};

// Handle webhook events
const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event.data);
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data);
        break;
      case 'source.chargeable':
        await handleChargeableSource(event.data);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Error handling webhook' });
  }
};

// Helper functions
const handleSuccessfulPayment = async (paymentData) => {
  const payment = await Payment.findOne({ 'metadata.paymentIntentId': paymentData.id });
  if (payment) {
    payment.status = 'completed';
    await payment.save();

    // Update user's balance if it's a wallet top-up
    if (payment.type === 'wallet') {
      await User.findByIdAndUpdate(payment.user, {
        $inc: { walletBalance: payment.amount }
      });
    }
  }
};

const handleFailedPayment = async (paymentData) => {
  const payment = await Payment.findOne({ 'metadata.paymentIntentId': paymentData.id });
  if (payment) {
    payment.status = 'failed';
    await payment.save();
  }
};

const handleChargeableSource = async (sourceData) => {
  const payment = await Payment.findOne({ 'metadata.sourceId': sourceData.id });
  if (payment) {
    await paymongoService.createPaymentFromSource(sourceData.id, payment.amount);
  }
};

module.exports = {
  initializePayment,
  getPaymentHistory,
  verifyPayment,
  getPaymentMethods,
  handleWebhook
}; 