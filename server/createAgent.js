const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { MONGO_OPTIONS } = require('./config');

async function createAgent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Delete existing agent if exists
    await User.deleteMany({ username: 'agent' });

    // Create new agent
    const agent = new User({
      username: 'agent',
      email: 'agent@wealthclicks.com',
      password: 'agent123', // The pre-save hook will hash this
      role: 'agent',
      status: 'approved',
      approvedAt: new Date(),
      isActive: true
    });

    await agent.save();
    console.log('Agent user created successfully!');

    // Verify the password
    const savedAgent = await User.findOne({ username: 'agent' });
    const isMatch = await bcrypt.compare('agent123', savedAgent.password);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAgent(); 