// Script to migrate legacy dailyClicks number field to object format
// Usage: node scripts/fixDailyClicks.js
// Ensures all user documents store dailyClicks as { count, lastReset }

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const legacyUsers = await User.find({ dailyClicks: { $type: 'number' } }).lean();
    console.log(`Found ${legacyUsers.length} legacy user(s)`);

    for (const user of legacyUsers) {
      const count = typeof user.dailyClicks === 'number' ? user.dailyClicks : 0;
      await User.updateOne(
        { _id: user._id },
        { $set: { dailyClicks: { count, lastReset: new Date() } } }
      );
      console.log(`Fixed user ${user._id}`);
    }

    console.log('Migration complete');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    mongoose.connection.close();
  }
};

run();
