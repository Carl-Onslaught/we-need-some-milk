const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { MONGO_OPTIONS } = require('./config');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@wealthclicks.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      status: 'approved',
      approvedAt: new Date(),
      balance: 0
    });
    console.log('Created admin user');

    // Create test agent user
    await User.create({
      username: 'testagent',
      email: 'agent@wealthclicks.com',
      password: 'agent123',
      role: 'agent',
      isActive: true,
      status: 'approved',
      approvedAt: new Date(),
      balance: 1000, // Initial balance for testing
      referralCode: 'TEST001'
    });
    console.log('Created test agent user');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
