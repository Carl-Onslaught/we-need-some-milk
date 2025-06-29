const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

const defaultPaymentMethods = [
    {
        name: 'GCash',
        accountName: 'Wealth Clicks',
        accountNumber: '09123456789',
        details: 'Please include your username in the reference/note when sending payment'
    },
    {
        name: 'Maya',
        accountName: 'Wealth Clicks',
        accountNumber: '09123456789',
        details: 'Please include your username in the reference/note when sending payment'
    },
    {
        name: 'Bank Transfer',
        accountName: 'Wealth Clicks',
        accountNumber: '1234567890',
        details: 'Please include your username in the reference/note when sending payment'
    }
];

async function addDefaultPaymentMethods() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
        console.log('Connected to MongoDB');

        // Get or create settings
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        // Update payment methods
        settings.paymentMethods = defaultPaymentMethods;
        await settings.save();

        console.log('Default payment methods added successfully');
    } catch (error) {
        console.error('Error adding default payment methods:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addDefaultPaymentMethods(); 