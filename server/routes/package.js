const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Get all packages for a user
router.get('/my-packages', auth, async (req, res) => {
  try {
    const packages = await Package.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Error fetching packages' });
  }
});

// Create a new package request
router.post('/request', auth, async (req, res) => {
  try {
    const { packageType, amount } = req.body;
    
    // Validate package type and amount
    if (![1, 2].includes(packageType)) {
      return res.status(400).json({ message: 'Invalid package type' });
    }

    // Validate amount based on package type
    if ((packageType === 1 && amount !== 100) || 
        (packageType === 2 && amount !== 500)) {
      return res.status(400).json({ 
        message: packageType === 1 
          ? 'Package 1 amount must be ₱100' 
          : 'Package 2 amount must be ₱500' 
      });
    }
    
    // Check if user already has an active package of this type
    const existingPackage = await Package.findOne({
      user: req.user.id,
      packageType,
      status: 'active',
      $or: [
        { claimed: { $exists: false } },
        { claimed: false }
      ]
    });
    
    if (existingPackage) {
      return res.status(400).json({ 
        message: `You already have an active Package ${packageType}` 
      });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has sufficient wallet balance
    if (user.wallet < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Calculate package details
    const startDate = new Date();
    const endDate = new Date(startDate);
    const duration = packageType === 1 ? 12 : 20; // 12 or 20 days
    endDate.setDate(endDate.getDate() + duration);
    
    // Calculate total interest and daily income
    const totalInterest = packageType === 1 
      ? amount * 0.20  // 20% for Package 1
      : amount * 0.50; // 50% for Package 2
    const dailyIncome = totalInterest / duration;
    
    const package = new Package({
      user: req.user.id,
      packageType,
      amount,
      status: 'active',
      startDate,
      endDate,
      dailyIncome
    });
    
    // Deduct amount from user's wallet
    user.wallet -= amount;
    
    // Save both the package and updated user
    await Promise.all([
      package.save(),
      user.save()
    ]);

    // === BEGIN REFERRAL COMMISSION LOGIC ===
    // Multi-level: Traverse up the referral chain, credit commission based on level
    let currentUser = user;
    let level = 1;
    const commissionRates = { 1: 0.05, 2: 0.02, 3: 0.02, 4: 0.01 };
    const maxLevels = 4;
    const processedUsers = new Set();
    const Transaction = require('../models/Transaction');
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
            packageId: package._id,
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

    res.status(201).json({
      message: 'Package activated successfully',
      package,
      walletBalance: user.wallet
    });
  } catch (error) {
    console.error('Error creating package request:', error);
    res.status(500).json({ message: 'Error creating package request' });
  }
});

// Admin routes
router.get('/pending', auth, isAdmin, async (req, res) => {
  try {
    const packages = await Package.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching pending packages:', error);
    res.status(500).json({ message: 'Error fetching pending packages' });
  }
});

router.put('/approve/:id', auth, isAdmin, async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (package.status !== 'pending') {
      return res.status(400).json({ message: 'Package is not pending' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + package.duration);

    package.status = 'active';
    package.startDate = startDate;
    package.endDate = endDate;
    
    await package.save();

    // Update user's package
    await User.findByIdAndUpdate(package.user, {
      package: package._id
    });

    res.json(package);
  } catch (error) {
    console.error('Error approving package:', error);
    res.status(500).json({ message: 'Error approving package' });
  }
});

router.put('/reject/:id', auth, isAdmin, async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (package.status !== 'pending') {
      return res.status(400).json({ message: 'Package is not pending' });
    }

    package.status = 'rejected';
    await package.save();

    res.json(package);
  } catch (error) {
    console.error('Error rejecting package:', error);
    res.status(500).json({ message: 'Error rejecting package' });
  }
});

module.exports = router; 