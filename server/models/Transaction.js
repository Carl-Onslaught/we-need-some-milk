const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'click', 'referral', 'investment', 'interest', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  referenceId: String,
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  withdrawal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Withdrawal'
  },
  metadata: {
    clickNumber: Number,
    referralLevel: Number,
    packageType: Number,
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment'
    }
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 