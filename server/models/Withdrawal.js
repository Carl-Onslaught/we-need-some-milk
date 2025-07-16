const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        required: true,
        enum: ['gcash', 'gotyme', 'paymaya', 'others']
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    source: {
        type: String,
        enum: ['direct_indirect', 'click_earnings', 'shared_capital'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
