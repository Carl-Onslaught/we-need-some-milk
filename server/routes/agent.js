const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { auth, isActive, protect } = require('../middleware/auth');
const PackageRequest = require('../models/PackageRequest');
const User = require('../models/User');
const Package = require('../models/Package');
const SharedCapitalTransaction = require('../models/sharedCapitalTransaction');
const Transaction = require('../models/Transaction');

// Protected routes - require authentication
router.use(auth);
router.use(isActive);

// Get agent's earnings
router.get('/earnings', agentController.getEarnings);

// Get agent's downlines
router.get('/downlines', agentController.getDownlines);

// Get agent's withdrawal history
router.get('/withdrawals', agentController.getWithdrawals);

// Submit withdrawal request
router.post('/withdraw', async (req, res, next) => {
  try {
    console.log('Withdrawal request received:', {
      body: req.body,
      user: req.user._id
    });
    await agentController.submitWithdrawal(req, res);
  } catch (error) {
    console.error('Withdrawal error:', error);
    next(error);
  }
});

// Record a click
router.post('/click', agentController.recordClick);

// Get agent's team
router.get('/team', agentController.getDownlines);

// Get agent's profile
router.get('/profile', agentController.getProfile);

// Update package earnings (manual trigger)
router.post('/update-earnings', agentController.updatePackageEarnings);

// Change password
router.post('/change-password', agentController.changePassword);

// Shared Capital Package Request
router.post('/shared-capital', auth, async (req, res) => {
  try {
    const { amount, packageId } = req.body;
    const agentId = req.user.id;

    // Validate package ID
    if (![1, 2].includes(packageId)) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }

    // Validate amount based on package
    const minAmount = packageId === 1 ? 100 : 500;
    if (amount < minAmount) {
      return res.status(400).json({ message: `Amount must be at least ₱${minAmount}` });
    }

    // Create package request
    const request = await PackageRequest.create({
      agentId,
      packageId,
      amount,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Package request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Package request error:', error);
    res.status(500).json({ message: 'Error processing package request' });
  }
});

// Activate package directly
router.post('/packages/activate', auth, async (req, res) => {
  try {
    const { amount, packageId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || !packageId) {
      return res.status(400).json({ message: 'Amount and package ID are required' });
    }

    // Get user and check balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wallet < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Package configurations
    const packageConfigs = {
      1: { // Package 1
        minimum: 100,
        duration: 12, // days
        incomeRate: 0.20, // 20%
        dailyIncomeRate: 0.20 / 12 // Daily rate for 12 days
      },
      2: { // Package 2
        minimum: 500,
        duration: 20, // days
        incomeRate: 0.50, // 50%
        dailyIncomeRate: 0.50 / 20 // Daily rate for 20 days
      }
    };

    const packageConfig = packageConfigs[packageId];
    if (!packageConfig) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }

    // Validate minimum amount
    if (amount < packageConfig.minimum) {
      return res.status(400).json({ message: `Amount must be at least ₱${packageConfig.minimum}` });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + packageConfig.duration);

    // Calculate daily income (but don't show in total yet)
    const dailyIncome = (amount * packageConfig.incomeRate) / packageConfig.duration;

    // Deduct from wallet
    console.log('Wallet before deduction:', user.wallet, 'Amount to deduct:', amount);
    user.wallet -= amount;
    await user.save();
    console.log('Wallet after deduction:', user.wallet);

    // Create new package with proper initial state
    const newPackage = new Package({
      user: userId,
      packageType: packageId,
      amount: amount,
      status: 'active',
      startDate: startDate,
      endDate: endDate,
      dailyIncome: dailyIncome,
      totalEarnings: 0,
      claimed: false,
      lastUpdated: startDate
    });

    await newPackage.save();

    console.log('Created new package:', {
      packageId,
      amount,
      dailyIncome,
      startDate,
      endDate,
      duration: packageConfig.duration
    });

    // === BEGIN REFERRAL COMMISSION LOGIC ===
    // Multi-level: Traverse up the referral chain, credit commission based on level
    let currentUser = user;
    let level = 1;
    const commissionRates = { 1: 0.05, 2: 0.02, 3: 0.02, 4: 0.01 };
    const maxLevels = 4;
    const processedUsers = new Set();
    while (currentUser.referrer && level <= maxLevels && !processedUsers.has(currentUser.referrer.toString())) {
      const referrer = await User.findById(currentUser.referrer);
      if (!referrer || !referrer.isActive) {
        break;
      }
      const commissionRate = commissionRates[level] || 0;
      if (commissionRate > 0) {
        const commissionAmount = amount * commissionRate;
        if (level === 1) {
          referrer.referralEarnings.direct = (referrer.referralEarnings.direct || 0) + commissionAmount;
        } else {
          referrer.referralEarnings.indirect = (referrer.referralEarnings.indirect || 0) + commissionAmount;
        }
        await referrer.save();
        // Create transaction record
        await Transaction.create({
          user: referrer._id,
          type: 'referral',
          amount: commissionAmount,
          description: `Level ${level} referral commission from downline's package activation`,
          status: 'completed',
          relatedUser: user._id,
          metadata: {
            referralLevel: level,
            packageId: newPackage._id,
            packageAmount: amount
          },
          referralType: level === 1 ? 'direct' : 'indirect'
        });
      }
      processedUsers.add(referrer._id.toString());
      currentUser = referrer;
      level++;
    }
    // === END REFERRAL COMMISSION LOGIC ===

    // Notify via WebSocket
    if (global.io) {
      global.io.emit('package_activated', {
        type: 'package_activated',
        agentId: userId,
        package: {
          id: newPackage._id,
          type: packageId,
          amount: amount,
          dailyIncome: dailyIncome,
          startDate,
          endDate,
          daysRemaining: packageConfig.duration
        }
      });
    }

    res.json({
      message: 'Package activated successfully',
      newBalance: user.wallet,
      package: {
        id: newPackage._id,
        type: packageId,
        amount: amount,
        dailyIncome: dailyIncome,
        startDate,
        endDate,
        daysRemaining: packageConfig.duration
      }
    });
  } catch (error) {
    console.error('Error activating package:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active packages
router.get('/packages/active', [auth, isActive], async (req, res) => {
  try {
    console.log('Fetching active packages for user:', req.user.id);
    
    const packages = await Package.find({
      user: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    console.log('Found packages:', packages);
    
    res.json({ packages });
  } catch (error) {
    console.error('Error fetching active packages:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Claim matured package earnings
router.post('/packages/claim', agentController.claimMaturedPackage);

// Get agent's active packages
router.get('/packages/active', agentController.getActivePackages);

// Get agent stats
router.get('/stats', agentController.getAgentStats);

// Claim matured package
router.post('/claim-package', agentController.claimPackage);

// Claim all matured packages
router.post('/claim-packages', async (req, res) => {
    try {
        const packages = await Package.find({
            user: req.user._id,
            status: 'active',
            claimed: false
        });

        const now = new Date();
        let totalClaimed = 0;

        for (const pkg of packages) {
            const endDate = new Date(pkg.endDate);
            if (now >= endDate) {
                const totalDays = pkg.packageType === 1 ? 12 : 20;
                const totalEarnings = pkg.amount + (pkg.dailyIncome * totalDays);
                
                // Update package
                pkg.claimed = true;
                pkg.claimedAt = now;
                await pkg.save();

                // Add to total claimed
                totalClaimed += totalEarnings;

                // Create transaction record
                await SharedCapitalTransaction.create({
                    user: req.user._id,
                    type: 'earning',
                    amount: totalEarnings,
                    package: `Package ${pkg.packageType}`,
                    status: 'completed',
                    description: `Claimed earnings from Package ${pkg.packageType} (₱${pkg.amount.toLocaleString()} + ₱${(pkg.dailyIncome * totalDays).toLocaleString()} earnings)`,
                    createdAt: now
                });
            }
        }

        // Notify via WebSocket
        if (global.io) {
            global.io.emit('earnings_update', {
                type: 'earnings_update',
                agentId: req.user._id,
                earnings: await agentController.calculateUserEarnings(req.user._id)
            });
        }

        res.json({
            message: 'Successfully claimed all matured packages',
            amount: totalClaimed
        });
    } catch (error) {
        console.error('Error claiming packages:', error);
        res.status(500).json({ message: 'Error claiming packages' });
    }
});

module.exports = router;