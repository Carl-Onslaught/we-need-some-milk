require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { MONGO_OPTIONS } = require('../config');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@wealthclicks.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        // Create new admin
        const admin = new User({
            username: 'admin',
            email: 'admin@wealthclicks.com',
            password: 'admin123',
            role: 'admin',
            status: 'approved',
            isActive: true
        });

        await admin.save();
        console.log('Admin created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
