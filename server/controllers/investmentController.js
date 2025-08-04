const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { getSettings } = require('../utils/settingsService');

// Create new investment
exports.createInvestment = async (req, res) => {
  try {
    const { packageType } = req.body;
    const user = req.user;

    // Validate package type
    if (![1, 2, 3].includes(packageType)) {
      return res.status(400).json({ message: 'Invalid package type' });
    }

    // Create investment
    const investment = new Investment({
      user: user._id,
      packageType
    });

    // Check if user has sufficient balance
    if (user.balance < investment.amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct investment amount from user balance
    user.balance -= investment.amount;

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      type: 'investment',
      amount: -investment.amount,
      description: `Investment in Package ${packageType}`,
      status: 'completed',
      metadata: {
        packageType,
        investmentId: investment._id
      }
    });

    // Process referral commissions
    await processReferralCommissions(user, investment);

    // Save all changes
    await Promise.all([
      investment.save(),
      transaction.save(),
      user.save()
    ]);

    res.status(201).json({
      message: 'Investment created successfully',
      investment,
      balance: user.balance
    });
  } catch (error) {
    console.error('Investment creation error:', error);
    res.status(500).json({ message: 'Error creating investment' });
  }
};

// Process daily interest
exports.processDailyInterest = async (investment) => {
  try {
    const user = await User.findById(investment.user);
    if (!user) return;

    // Calculate interest for today
    const interest = investment.dailyInterest;
    
    // Update investment
    investment.totalInterest += interest;
    investment.lastInterestPayout = new Date();

    // Update user balance
    user.balance += interest;

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      type: 'interest',
      amount: interest,
      description: `Daily interest from Package ${investment.packageType}`,
      status: 'completed',
      metadata: {
        packageType: investment.packageType,
        investmentId: investment._id
      }
    });

    // Check if investment is completed
    const today = new Date();
    if (today >= investment.endDate) {
      investment.status = 'completed';
    }

    // Save all changes
    await Promise.all([
      investment.save(),
      transaction.save(),
      user.save()
    ]);

    return true;
  } catch (error) {
    console.error('Error processing daily interest:', error);
    return false;
  }
};

// Get user investments
exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

// Process referral commissions
const processReferralCommissions = async (user, investment) => {
  try {
    // Fetch the latest referral rate map from settings (fallback to defaults)
    const settings = await getSettings();
    const rates = settings.sharedCapReferralRates || {
      direct: 0.05,
      level2: 0.02,
      level3: 0.02,
      level4: 0.01
    };

    let currentUser = user;
    let level = 1;
    const processedUsers = new Set();

    while (currentUser.referrer && level <= 4 && !processedUsers.has(currentUser.referrer.toString())) {
      const referrer = await User.findById(currentUser.referrer);
      if (!referrer || !referrer.isActive) {
        break;
      }

      // Calculate commission
      let commissionRate;
      if (level === 1) {
        commissionRate = rates.direct;
      } else if (level === 2) {
        commissionRate = rates.level2;
      } else if (level === 3) {
        commissionRate = rates.level3;
      } else {
        commissionRate = rates.level4;
      }

      const commissionAmount = investment.amount * commissionRate;

      // Check if the referred user has activated their clicking task
      // Only give commissions if clicking task is activated
      if (!user.clickingTaskActivated) {
        console.log(`Skipping commission for referrer ${referrer._id} - user ${user._id} has not activated clicking task`);
        processedUsers.add(referrer._id.toString());
        currentUser = referrer;
        level++;
        continue;
      }

      // Create referral transaction
      const transaction = new Transaction({
        user: referrer._id,
        type: 'referral',
        amount: commissionAmount,
        description: `Level ${level} referral commission from investment`,
        status: 'completed',
        relatedUser: user._id,
        metadata: {
          referralLevel: level,
          investmentId: investment._id
        }
      });

      // Update referrer's balance and earnings
      referrer.balance += commissionAmount;
      if (level === 1) {
        referrer.referralEarnings.direct += commissionAmount;
      } else {
        referrer.referralEarnings.indirect += commissionAmount;
      }

      await Promise.all([
        transaction.save(),
        referrer.save()
      ]);

      processedUsers.add(referrer._id.toString());
      currentUser = referrer;
      level++;
    }
  } catch (error) {
    console.error('Error processing referral commissions:', error);
    throw error;
  }
};

// Claim matured investment
exports.claimInvestment = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user._id;

    const investment = await Investment.findOne({ _id: packageId, user: userId });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const now = new Date();
    if (now < investment.endDate) {
      return res.status(400).json({ message: 'Investment has not yet matured' });
    }

    if (investment.status === 'claimed') {
      return res.status(400).json({ message: 'Investment already claimed' });
    }

    const payout = investment.amount + investment.totalEarnings;

    const user = await User.findById(userId);
    user.balance += payout;
    user.sharedEarnings += payout;

    investment.status = 'claimed';

    const transaction = new Transaction({
      user: userId,
      type: 'shared_capital_claim',
      amount: payout,
      description: `Claim of matured package #${investment.packageNumber}`,
      status: 'completed',
      metadata: {
        investmentId: investment._id
      }
    });

    await Promise.all([user.save(), investment.save(), transaction.save()]);

    res.json({ message: 'Package claimed successfully', amount: payout });
  } catch (error) {
    console.error('Claim investment error:', error);
    res.status(500).json({ message: 'Error claiming package' });
  }
};