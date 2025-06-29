const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteMany({ username: 'WClickAdmin' });

    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Ridge1228', salt);

    const admin = new User({
      username: 'WClickAdmin',
      email: 'admin@wealthclicks.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Admin user created successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin(); 