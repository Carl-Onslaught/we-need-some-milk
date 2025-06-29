const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['wallet', 'investment']
  },
  method: {
    type: String,
    required: true,
    enum: ['card', 'bank', 'crypto']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ reference: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 