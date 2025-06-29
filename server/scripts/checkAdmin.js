require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wealth-clicks');
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@wealthclicks.com' });
        
        if (admin) {
            console.log('Admin user found:', {
                username: admin.username,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive
            });

            // Test password
            const testPassword = 'admin123';
            const isMatch = await admin.comparePassword(testPassword);
            console.log('Password test:', {
                testPassword,
                isMatch,
                hashedPassword: admin.password
            });
        } else {
            console.log('Admin user not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

checkAdmin();
