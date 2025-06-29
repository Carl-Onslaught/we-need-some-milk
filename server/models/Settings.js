const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    income: {
        type: Number,
        required: true
    }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
    clickReward: {
        type: Number,
        required: true,
        default: 1
    },
    referralBonus: {
        type: Number,
        required: true,
        default: 50
    },
    minimumWithdrawal: {
        type: Number,
        required: true,
        default: 500
    },
    sharedEarningPercentage: {
        type: Number,
        required: true,
        default: 0.5
    },
    packages: {
        type: Map,
        of: packageSchema,
        default: {
            package1: { amount: 100, duration: 12, income: 20 },
            package2: { amount: 500, duration: 20, income: 50 },
            package3: { amount: 1000, duration: 30, income: 80 },
            package4: { amount: 5000, duration: 45, income: 120 }
        }
    },
    paymentMethods: [{
        name: {
            type: String,
            required: true
        },
        accountName: {
            type: String,
            required: true
        },
        accountNumber: {
            type: String,
            required: true
        },
        qr: {
            type: String
        },
        details: {
            type: String
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema); 