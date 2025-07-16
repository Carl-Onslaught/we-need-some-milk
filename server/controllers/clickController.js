const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getSettings } = require('../utils/settingsService');

// Helper to obtain latest settings (cached inside settingsService for 60s)
async function loadRuntimeSettings() {
  const settings = await getSettings();
  const CLICK_REWARD = settings.clickReward;
  const MAX_DAILY_EARNINGS = settings.dailyClickCap;
  const MAX_CLICKS = Math.floor(MAX_DAILY_EARNINGS / CLICK_REWARD);
  return { CLICK_REWARD, MAX_DAILY_EARNINGS, MAX_CLICKS };
}

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
  // always use latest settings
  const { CLICK_REWARD, MAX_CLICKS } = await loadRuntimeSettings();
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

    const dailyEarnings = user.dailyClicks.count * CLICK_REWARD;
    res.json({
      message: 'Click recorded successfully',
      reward: CLICK_REWARD,
      dailyClicks: user.dailyClicks.count,
      clicks: user.dailyClicks.count, // backward-compat
      dailyEarnings,
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
  const { MAX_CLICKS, MAX_DAILY_EARNINGS } = await loadRuntimeSettings();
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