// Run this as a standalone script (e.g., node scripts/migrateUserInvestments.js)
const mongoose = require('mongoose');
const User = require('./models/User');
const Investment = require('./models/Investment');
require('dotenv').config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find();
  for (const user of users) {
    const investments = await Investment.find({ user: user._id });
    user.investments = investments.map(inv => inv._id);
    await user.save();
    console.log(`Updated user ${user.username} with ${investments.length} investments`);
  }
  await mongoose.disconnect();
  console.log('Migration complete!');
}

migrate();