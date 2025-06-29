const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
const { MONGO_OPTIONS } = require('../config');

async function createAgent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Check if agent already exists
    const existingAgent = await User.findOne({ email: 'agent@wealthclicks.com' });
    if (existingAgent) {
      console.log('Agent already exists');
      process.exit(0);
    }

    // Create new agent
    const agent = new User({
      username: 'agent',
      email: 'agent@wealthclicks.com',
      password: 'agent123',
      role: 'agent',
      status: 'approved',
      isActive: true
    });

    await agent.save();
    console.log('Agent created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating agent:', error);
    process.exit(1);
  }
}

createAgent(); 