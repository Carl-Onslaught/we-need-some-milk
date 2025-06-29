const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('./config');

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Check for admin user
    const admin = await User.findOne({ username: 'WClickAdmin' });
    console.log('Admin user:', admin ? {
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    } : 'Not found');

    if (!admin) {
      console.log('Admin user not found!');
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare('Ridge1228', admin.password);
    console.log('Password match:', isMatch);

    if (!admin.isActive) {
      console.log('Admin user found but inactive. Activating...');
      admin.isActive = true;
      await admin.save();
      console.log('Admin user activated successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin(); 