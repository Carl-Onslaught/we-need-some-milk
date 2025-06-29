const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function resetPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Reset admin password
    const admin = await User.findOne({ username: 'WClickAdmin' });
    if (admin) {
      // Hash password directly with bcrypt
      const adminPassword = 'Ridge1228';
      const adminSalt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash(adminPassword, adminSalt);
      
      // Update admin user
      admin.password = adminHash;
      admin.isActive = true;
      admin.status = 'approved';
      await admin.save();
      console.log('Admin password reset successfully');
      
      // Verify password
      const adminMatch = await bcrypt.compare(adminPassword, admin.password);
      console.log('Admin password verification:', adminMatch);
    } else {
      console.log('Admin user not found');
    }
    
    // Reset agent password
    const agent = await User.findOne({ username: 'agent' });
    if (agent) {
      // Hash password directly with bcrypt
      const agentPassword = 'agent123';
      const agentSalt = await bcrypt.genSalt(10);
      const agentHash = await bcrypt.hash(agentPassword, agentSalt);
      
      // Update agent user
      agent.password = agentHash;
      agent.isActive = true;
      agent.status = 'approved';
      await agent.save();
      console.log('Agent password reset successfully');
      
      // Verify password
      const agentMatch = await bcrypt.compare(agentPassword, agent.password);
      console.log('Agent password verification:', agentMatch);
    } else {
      console.log('Agent user not found');
    }
    
    console.log('Password reset completed');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetPasswords();
