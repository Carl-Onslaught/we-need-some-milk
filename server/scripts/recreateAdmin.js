const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function recreateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ username: 'WClickAdmin' });
    console.log('Deleted existing admin user');

    // Create new admin with plain password (it will be hashed by the pre-save hook)
    const admin = new User({
      username: 'WClickAdmin',
      email: 'admin@wealthclicks.com',
      password: 'Ridge1228',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Created new admin user');

    // Verify the password
    const savedAdmin = await User.findOne({ username: 'WClickAdmin' });
    const isMatch = await savedAdmin.comparePassword('Ridge1228');
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

    console.log('Admin user recreated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recreateAdmin(); 