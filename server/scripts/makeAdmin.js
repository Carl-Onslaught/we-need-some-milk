require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { MONGO_OPTIONS } = require('../config');

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
        console.log('Connected to MongoDB');

        const adminData = {
            username: 'admin',
            email: 'admin@wealthclicks.com',
            role: 'admin'
        };

        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let admin = await User.findOne({ email: adminData.email });
        
        if (admin) {
            admin.role = 'admin';
            admin.password = hashedPassword;
            await admin.save();
            console.log('Updated existing user to admin:', admin.email);
        } else {
            admin = new User({
                ...adminData,
                password: hashedPassword
            });
            await admin.save();
            console.log('Created new admin user:', admin.email);
        }

        console.log('Admin credentials:', {
            email: adminData.email,
            password: password
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

makeAdmin();
