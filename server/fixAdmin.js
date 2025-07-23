const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('./config');

async function fixAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Delete all admin users
    await User.deleteMany({ role: 'admin' });
    console.log('Deleted all admin users');

    // Create new admin with exact password
    const admin = new User({
      username: process.env.WC_SUPERADMIN_USERNAME,
      email: 'admin@wealthclicks.com',
      password: process.env.WC_SUPERADMIN_PASSWORD, // The pre-save hook will hash this
      role: 'admin',
      status: 'approved',
      approvedAt: new Date(),
      isActive: true
    });

    await admin.save();
    console.log('New admin user created successfully!');

    // Verify the password
    const savedAdmin = await User.findOne({ username: process.env.WC_SUPERADMIN_USERNAME });
    const isMatch = await bcrypt.compare(process.env.WC_SUPERADMIN_PASSWORD, savedAdmin.password);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixAdmin(); 