const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getSettings } = require('../utils/settingsService');

// These values are fetched from Settings at runtime (cached).
let CLICK_REWARD = 0.20;
let MAX_DAILY_EARNINGS = 10;
let MAX_CLICKS = 50;

(async () => {
  const settings = await getSettings();
  CLICK_REWARD = settings.clickReward;
  MAX_DAILY_EARNINGS = settings.dailyClickCap;
  MAX_CLICKS = Math.floor(MAX_DAILY_EARNINGS / CLICK_REWARD);
})();

// Helper function to check if daily clicks should be reset
const shouldResetDailyClicks = (lastReset) => {
  const now = new Date();
  const last = new Date(lastReset);
  return now.getDate() !== last.getDate() ||
         now.getMonth() !== last.getMonth() ||
         now.getFullYear() !== last.getFullYear();
};

// Record a click
exports.recordClick = async (req, res) => {
  try {
    const user = req.user;

    // Check if daily clicks should be reset
    if (shouldResetDailyClicks(user.dailyClicks.lastReset)) {
      user.dailyClicks.count = 0;
      user.dailyClicks.lastReset = new Date();
    }

    // Check if user has reached daily limit
    if (user.dailyClicks.count >= MAX_CLICKS) {
      return res.status(400).json({
        message: 'Daily click limit reached',
        dailyClicks: user.dailyClicks.count,
        maxClicks: MAX_CLICKS
      });
    }

    // Record the click
    user.dailyClicks.count += 1;
    user.balance += CLICK_REWARD;

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      type: 'click',
      amount: CLICK_REWARD,
      description: `Reward for click #${user.dailyClicks.count}`,
      status: 'completed',
      metadata: {
        clickNumber: user.dailyClicks.count
      }
    });

    // Save changes
    await Promise.all([
      user.save(),
      transaction.save()
    ]);

    res.json({
      message: 'Click recorded successfully',
      reward: CLICK_REWARD,
      dailyClicks: user.dailyClicks.count,
      maxClicks: MAX_CLICKS,
      balance: user.balance
    });
  } catch (error) {
    console.error('Click recording error:', error);
    res.status(500).json({ message: 'Error recording click' });
  }
};

// Get click statistics
exports.getClickStats = async (req, res) => {
  try {
    const user = req.user;

    // Check if daily clicks should be reset
    if (shouldResetDailyClicks(user.dailyClicks.lastReset)) {
      user.dailyClicks.count = 0;
      user.dailyClicks.lastReset = new Date();
      await user.save();
    }

    // Get today's earnings from clicks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          type: 'click',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      dailyClicks: user.dailyClicks.count,
      maxClicks: MAX_CLICKS,
      remainingClicks: MAX_CLICKS - user.dailyClicks.count,
      todayEarnings: todayEarnings[0]?.total || 0,
      maxDailyEarnings: MAX_DAILY_EARNINGS
    });
  } catch (error) {
    console.error('Error fetching click stats:', error);
    res.status(500).json({ message: 'Error fetching click statistics' });
  }
}; 