const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixDailyClicksMigration() {
  try {
    console.log('Starting dailyClicks migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wealth-clicks');
    console.log('Connected to MongoDB');
    
    // Find all users with dailyClicks as object
    const users = await User.find({
      dailyClicks: { $type: 'object' }
    });
    
    console.log(`Found ${users.length} users with dailyClicks as object`);
    
    for (const user of users) {
      console.log(`Processing user: ${user.username} (${user._id})`);
      
      // Extract the count value from the object, or default to 0
      let newDailyClicks = 0;
      if (user.dailyClicks && typeof user.dailyClicks === 'object') {
        newDailyClicks = user.dailyClicks.count || 0;
        console.log(`  Converting dailyClicks from ${JSON.stringify(user.dailyClicks)} to ${newDailyClicks}`);
      }
      
      // Update the user with the new number format
      await User.findByIdAndUpdate(user._id, {
        dailyClicks: newDailyClicks
      });
      
      console.log(`  Updated user ${user.username} dailyClicks to ${newDailyClicks}`);
    }
    
    // Also check for any users with null or undefined dailyClicks and set them to 0
    const nullUsers = await User.find({
      $or: [
        { dailyClicks: null },
        { dailyClicks: { $exists: false } }
      ]
    });
    
    console.log(`Found ${nullUsers.length} users with null/undefined dailyClicks`);
    
    for (const user of nullUsers) {
      console.log(`Setting dailyClicks to 0 for user: ${user.username}`);
      await User.findByIdAndUpdate(user._id, {
        dailyClicks: 0
      });
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixDailyClicksMigration(); 