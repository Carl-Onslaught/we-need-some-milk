const User = require('../models/User');

/**
 * Migration helper to fix data format issues
 */
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Migration 1: Fix dailyClicks format
    await fixDailyClicksFormat();
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw error to prevent server startup failure
  }
}

/**
 * Fix dailyClicks field format from object to number
 */
async function fixDailyClicksFormat() {
  try {
    console.log('Checking dailyClicks format...');
    
    // Find users with dailyClicks as object
    const usersWithObjectClicks = await User.find({
      dailyClicks: { $type: 'object' }
    });
    
    if (usersWithObjectClicks.length > 0) {
      console.log(`Found ${usersWithObjectClicks.length} users with dailyClicks as object, fixing...`);
      
      for (const user of usersWithObjectClicks) {
        let newDailyClicks = 0;
        if (user.dailyClicks && typeof user.dailyClicks === 'object') {
          newDailyClicks = user.dailyClicks.count || 0;
        }
        
        await User.findByIdAndUpdate(user._id, {
          dailyClicks: newDailyClicks
        });
        
        console.log(`Fixed dailyClicks for user ${user.username}: ${JSON.stringify(user.dailyClicks)} → ${newDailyClicks}`);
      }
    } else {
      console.log('No users found with dailyClicks as object');
    }
    
    // Fix null/undefined dailyClicks
    const usersWithNullClicks = await User.find({
      $or: [
        { dailyClicks: null },
        { dailyClicks: { $exists: false } }
      ]
    });
    
    if (usersWithNullClicks.length > 0) {
      console.log(`Found ${usersWithNullClicks.length} users with null/undefined dailyClicks, fixing...`);
      
      for (const user of usersWithNullClicks) {
        await User.findByIdAndUpdate(user._id, {
          dailyClicks: 0
        });
        
        console.log(`Set dailyClicks to 0 for user ${user.username}`);
      }
    } else {
      console.log('No users found with null/undefined dailyClicks');
    }
    
  } catch (error) {
    console.error('Error fixing dailyClicks format:', error);
  }
}

module.exports = {
  runMigrations,
  fixDailyClicksFormat
}; 