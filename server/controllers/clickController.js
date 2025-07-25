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

// Helper: returns true if lastClick was before today (i.e. a new calendar day)
function isNewDay(lastClick) {
  if (!lastClick) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(lastClick) < today;
}

// Record a click
exports.recordClick = async (req, res) => {
  // always use latest settings
  const { CLICK_REWARD, MAX_CLICKS } = await loadRuntimeSettings();
  try {
    const user = req.user;
    // Defensive fix: ensure dailyClicks is always a number
    if (typeof user.dailyClicks !== 'number') {
      user.dailyClicks = 0;
    }

    // Reset daily clicks if this is a new day
    let didReset = false;
    if (isNewDay(user.lastClick)) {
      user.dailyClicks = 0;
      didReset = true;
    }

    // Check if user has reached daily limit
    if (user.dailyClicks >= MAX_CLICKS) {
      if (didReset) await user.save(); // Save the reset if it happened
      return res.status(400).json({
        message: 'Click limit reached',
        dailyClicks: user.dailyClicks,
        maxClicks: MAX_CLICKS
      });
    }

    // Record the click
    user.dailyClicks += 1;
    user.balance += CLICK_REWARD;
    user.lastClick = new Date();

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      type: 'click',
      amount: CLICK_REWARD,
      description: `Reward for click #${user.dailyClicks}`,
      status: 'completed',
      metadata: {
        clickNumber: user.dailyClicks
      }
    });

    // Save changes
    await Promise.all([
      user.save(),
      transaction.save()
    ]);

    const dailyEarnings = user.dailyClicks * CLICK_REWARD;
    res.json({
      message: 'Click recorded successfully',
      reward: CLICK_REWARD,
      dailyClicks: user.dailyClicks,
      clicks: user.dailyClicks, // backward-compat
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
    // Defensive fix: ensure dailyClicks is always a number
    if (typeof user.dailyClicks !== 'number') {
      user.dailyClicks = 0;
    }

    // Reset daily clicks if new day
    let didReset = false;
    if (isNewDay(user.lastClick)) {
      user.dailyClicks = 0;
      didReset = true;
      await user.save(); // Save the reset if it happened
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
      dailyClicks: user.dailyClicks,
      maxClicks: MAX_CLICKS,
      remainingClicks: MAX_CLICKS - user.dailyClicks,
      todayEarnings: todayEarnings[0]?.total || 0,
      maxDailyEarnings: MAX_DAILY_EARNINGS
    });
  } catch (error) {
    console.error('Error fetching click stats:', error);
    res.status(500).json({ message: 'Error fetching click statistics' });
  }
}; 