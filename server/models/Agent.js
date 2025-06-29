const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true
  },
  earnings: {
    directReferral: { type: Number, default: 0 },
    indirectReferral: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    sharedEarnings: { type: Number, default: 0 }
  },
  totalWithdraw: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agent', agentSchema); 