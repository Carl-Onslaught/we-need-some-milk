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
    await User.deleteMany({ username: process.env.WC_AGENT_USERNAME });

    // Create new agent
    const agent = new User({
      username: process.env.WC_AGENT_USERNAME,
      email: 'agent@wealthclicks.com',
      password: process.env.WC_AGENT_PASSWORD, // The pre-save hook will hash this
      role: 'agent',
      status: 'approved',
      approvedAt: new Date(),
      isActive: true
    });

    await agent.save();
    console.log('Agent user created successfully!');

    // Verify the password
    const savedAgent = await User.findOne({ username: process.env.WC_AGENT_USERNAME });
    const isMatch = await bcrypt.compare(process.env.WC_AGENT_PASSWORD, savedAgent.password);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAgent(); 