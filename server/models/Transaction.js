const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'click', 'referral', 'investment', 'interest', 'withdrawal', 'clicking_task_activation', 'shared_capital_claim', 'shared_capital_return'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  referralType: {
    type: String,
    enum: ['direct', 'indirect']
  },
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