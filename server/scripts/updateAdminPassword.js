const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function updateAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Find the admin user
    const admin = await User.findOne({ username: 'WClickAdmin' });
    if (!admin) {
      console.log('Admin user not found!');
      return;
    }

    // Generate new password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Ridge1228', salt);

    // Update the password
    admin.password = hashedPassword;
    await admin.save();

    // Verify the password
    const isMatch = await bcrypt.compare('Ridge1228', admin.password);
    console.log('Password updated and verified:', isMatch ? 'SUCCESS' : 'FAILED');

    console.log('Admin password updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdminPassword(); 