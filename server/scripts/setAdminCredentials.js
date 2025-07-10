/*
 * One-off script to (re)create the platform admin account with
 * username: WClickAdmin
 * password: Ridge1228
 *
 * Usage (from /server folder):
 *   node scripts/setAdminCredentials.js
 *
 * It will:
 *   1. Connect to MongoDB using your normal MONGO_URI from .env
 *   2. If an admin user already exists, update its username + password
 *   3. If no admin user exists, create one.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/wealthclick';
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const username = 'WClickAdmin';
    const passwordPlain = 'Ridge1228';
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      admin.username = username;
      admin.password = passwordHash;
      await admin.save();
      console.log('Existing admin credentials updated ✓');
    } else {
      admin = await User.create({
        username,
        email: 'admin@wealthclicks.local',
        password: passwordHash,
        role: 'admin',
        status: 'approved',
      });
      console.log('Admin user created ✓');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
