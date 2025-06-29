const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select('wallet clickEarnings dailyClicks dailyClickEarnings referralCode referralEarnings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      wallet: user.wallet || 0,
      clickEarnings: user.clickEarnings || 0,
      dailyClicks: user.dailyClicks || 0,
      dailyClickEarnings: user.dailyClickEarnings || 0,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings || { direct: 0, indirect: 0 }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

module.exports = router; 