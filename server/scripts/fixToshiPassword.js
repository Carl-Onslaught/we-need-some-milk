const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function fixToshiPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Find Toshi user
    const user = await User.findOne({ username: 'Toshi' });
    if (user) {
      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Ridge1228', salt);
      
      // Update user's password
      user.password = hash;
      await user.save();
      
      // Verify the password
      const isMatch = await bcrypt.compare('Ridge1228', user.password);
      console.log('Password reset successful:', isMatch);
    } else {
      console.log('User Toshi not found');
    }

    console.log('Password fix completed');
  } catch (error) {
    console.error('Error fixing password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixToshiPassword(); 