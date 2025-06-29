const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ username: 'WClickAdmin' });
    if (!adminExists) {
      const admin = new User({
        username: 'WClickAdmin',
        email: 'admin@wealthclicks.com',
        password: 'Ridge1228',
        role: 'admin',
        isActive: true,
        status: 'approved',
        approvedAt: new Date()
      });
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('Ridge1228', salt);
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      // Update existing admin password
      const salt = await bcrypt.genSalt(10);
      adminExists.password = await bcrypt.hash('Ridge1228', salt);
      adminExists.isActive = true;
      adminExists.status = 'approved';
      adminExists.approvedAt = adminExists.approvedAt || new Date();
      await adminExists.save();
      console.log('Admin user updated successfully');
    }

    // Create or update test agent
    const existingAgent = await User.findOne({ username: 'agent' });
    if (existingAgent) {
      // Update existing agent's password and status
      const salt = await bcrypt.genSalt(10);
      existingAgent.password = await bcrypt.hash('agent123', salt);
      existingAgent.isActive = true;
      existingAgent.status = 'approved';
      existingAgent.approvedAt = existingAgent.approvedAt || new Date();
      await existingAgent.save();
      console.log('Updated agent status:', {
        isActive: existingAgent.isActive,
        status: existingAgent.status
      });
      console.log('Agent user updated successfully');
    } else {
      // Create new agent
      const agent = new User({
        username: 'agent',
        email: 'agent@wealthclicks.com',
        role: 'agent',
        isActive: true,
        status: 'approved',
        approvedAt: new Date(),
        referralCode: 'TEST001'
      });
      
      // Generate a proper bcrypt salt and hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('agent123', salt);
      
      // Ensure the password is stored in bcrypt format
      if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
        console.error('Invalid bcrypt hash format:', hash);
        throw new Error('Failed to generate valid bcrypt hash');
      }
      
      agent.password = hash;
      await agent.save();
      console.log('Agent user created successfully');
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupDatabase(); 