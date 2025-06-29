require('dotenv').config();
const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const { processDailyInterest } = require('../controllers/investmentController');
const { MONGO_OPTIONS } = require('../config');

async function processAllInvestments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB');

    // Get all active investments
    const investments = await Investment.find({ status: 'active' });
    console.log(`Found ${investments.length} active investments`);

    // Process interest for each investment
    let processed = 0;
    let failed = 0;

    for (const investment of investments) {
      try {
        const success = await processDailyInterest(investment);
        if (success) {
          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error processing investment ${investment._id}:`, error);
        failed++;
      }
    }

    console.log(`Processed ${processed} investments successfully`);
    if (failed > 0) {
      console.log(`Failed to process ${failed} investments`);
    }
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
processAllInvestments(); 