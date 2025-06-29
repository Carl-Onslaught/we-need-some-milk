const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const Agent = require('../models/Agent');
const Package = require('../models/Package');
const catchAsync = require('../utils/catchAsync');

// Get agent's earnings and stats
exports.getEarnings = async (req, res) => {
    try {
        console.log('Calculating earnings for user:', req.user.username);
        const user = await User.findById(req.user._id);
        
        // Get all packages
        const packages = await Package.find({
            user: req.user._id,
            status: 'active'
        });
        
        console.log('Found packages:', packages.length);
        let sharedEarnings = 0;
        let pendingEarnings = 0;
        let immatureAmount = 0;
        let immaturePackages = 0;
        const now = new Date();

        // Calculate earnings for each package
        for (const pkg of packages) {
            const startDate = new Date(pkg.startDate);
            const endDate = new Date(pkg.endDate);
            const totalDays = pkg.packageType === 1 ? 12 : 20;
            
            // For stats cards: Only include if package has matured
            if (now >= endDate) {
                // Package has matured - include in stats with total earnings
                const totalEarnings = pkg.amount + (pkg.dailyIncome * totalDays);
                if (!pkg.claimed) {
                    pendingEarnings += totalEarnings;
                } else {
                    sharedEarnings += totalEarnings;
                }
            } else {
                // Not matured - track amount but don't show in stats
                immatureAmount += pkg.amount;
                immaturePackages++;
            }
        }

        // Calculate actual available wallet balance (excluding immature amounts)
        const availableWallet = Math.max(0, (user.wallet || 0));

        console.log('Final earnings calculation:', {
            availableWallet,
            totalWallet: user.wallet,
            immatureAmount,
            immaturePackages,
            directReferral: user.referralEarnings?.direct || 0,
            indirectReferral: user.referralEarnings?.indirect || 0,
            totalClicks: user.clickEarnings || 0,
            sharedEarnings,
            pendingEarnings
        });

        res.json({
            wallet: availableWallet,
            directReferral: user.referralEarnings?.direct || 0,
            indirectReferral: user.referralEarnings?.indirect || 0,
            totalClicks: user.clickEarnings || 0,
            sharedEarnings: sharedEarnings,
            pendingEarnings: pendingEarnings,
            immaturePackages: immaturePackages,
            immatureAmount: immatureAmount,
            totalWithdraw: user.totalWithdraw || 0
        });
    } catch (error) {
        console.error('Error calculating earnings:', error);
        res.status(500).json({ message: 'Error calculating earnings' });
    }
};

// Get agent's downlines
exports.getDownlines = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get direct downlines (level 1)
        const directDownlines = await User.find({ 
            referrer: userId
        })
            .select('username email referralCode createdAt wallet referralEarnings status isActive')
            .lean();

        // Get indirect downlines (level 2)
        const directDownlineIds = directDownlines.map(user => user._id);
        const indirectDownlines = await User.find({ 
            referrer: { $in: directDownlineIds }
        })
            .select('username email referralCode createdAt wallet referralEarnings referrer status isActive')
            .lean();

        // Add level information and format dates
        const formattedDirectDownlines = directDownlines.map(user => ({
            ...user,
            level: 1,
            createdAt: user.createdAt.toLocaleDateString(),
            totalEarnings: (user.wallet || 0) + 
                         (user.referralEarnings?.direct || 0) + 
                         (user.referralEarnings?.indirect || 0)
        }));

        const formattedIndirectDownlines = indirectDownlines.map(user => ({
            ...user,
            level: 2,
            createdAt: user.createdAt.toLocaleDateString(),
            totalEarnings: (user.wallet || 0) + 
                         (user.referralEarnings?.direct || 0) + 
                         (user.referralEarnings?.indirect || 0),
            upline: directDownlines.find(d => d._id.toString() === user.referrer.toString())?.username
        }));

        res.json({
            directDownlines: formattedDirectDownlines,
            indirectDownlines: formattedIndirectDownlines,
            stats: {
                totalDirectDownlines: formattedDirectDownlines.length,
                totalIndirectDownlines: formattedIndirectDownlines.length,
                totalDownlines: formattedDirectDownlines.length + formattedIndirectDownlines.length
            }
        });
    } catch (error) {
        console.error('Error fetching downlines:', error);
        res.status(500).json({ message: 'Error fetching downlines' });
    }
};

// Get agent's withdrawal history
exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ agentId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawal history' });
  }
};

// Submit withdrawal request
exports.submitWithdrawal = async (req, res) => {
  console.log('Starting withdrawal process...');
  try {
    const { amount, method, accountNumber, accountName, source } = req.body;
    const requestedAmount = parseFloat(amount);

    // Basic validation
    if (requestedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    if (!['direct_indirect', 'click_earnings', 'shared_capital'].includes(source)) {
      return res.status(400).json({ message: 'Invalid withdrawal source' });
    }

    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active and completed packages
    const packages = await Package.find({
      user: user._id,
      status: { $in: ['active', 'completed'] }
    });

    // Calculate available balance
    let availableBalance = 0;
    const now = new Date();

    if (source === 'shared_capital') {
      // Calculate earnings for each package
      for (const pkg of packages) {
        if (pkg.status === 'completed') {
          availableBalance += pkg.totalEarnings || 0;
          continue;
        }

        // For active packages
        const startDate = new Date(pkg.startDate);
        const daysSinceStart = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
        const currentEarnings = (pkg.dailyIncome || 0) * daysSinceStart;
        
        console.log(`Package ${pkg._id}:`, {
          amount: pkg.amount,
          dailyIncome: pkg.dailyIncome,
          days: daysSinceStart,
          earnings: currentEarnings
        });

        availableBalance += pkg.amount + currentEarnings;
      }
    } else if (source === 'direct_indirect') {
      availableBalance = (user.referralEarnings?.direct || 0) + (user.referralEarnings?.indirect || 0);
    } else {
      availableBalance = user.clickEarnings || 0;
    }

    console.log('Balance check:', {
      source,
      available: availableBalance,
      requested: requestedAmount
    });

    // Check if enough balance
    if (availableBalance < requestedAmount) {
      console.log('Insufficient balance:', { availableBalance, requestedAmount });
      return res.status(400).json({
        message: `Insufficient balance. Available: ₱${availableBalance.toLocaleString()}, Requested: ₱${requestedAmount.toLocaleString()}`
      });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      agentId: req.user._id,
      amount: requestedAmount,
      method,
      accountNumber,
      accountName,
      source,
      status: 'pending'
    });

    await withdrawal.save();
    console.log('Withdrawal record created:', withdrawal);

    // Update user's balance and add to total withdrawals
    if (source === 'direct_indirect') {
      // For referral earnings, we zero out both direct and indirect
      const totalReferral = (user.referralEarnings.direct || 0) + (user.referralEarnings.indirect || 0);
      console.log('Deducting referral earnings:', {
        before: { direct: user.referralEarnings.direct, indirect: user.referralEarnings.indirect },
        requested: requestedAmount,
        total: totalReferral
      });
      user.referralEarnings.direct = 0;
      user.referralEarnings.indirect = 0;
      user.totalWithdraw = (user.totalWithdraw || 0) + requestedAmount;
    } else if (source === 'click_earnings') {
      // For click earnings, we deduct the exact amount
      console.log('Deducting click earnings:', {
        before: user.clickEarnings,
        deducting: requestedAmount,
        after: user.clickEarnings - requestedAmount
      });
      user.clickEarnings = Math.max(0, (user.clickEarnings || 0) - requestedAmount);
      user.totalWithdraw = (user.totalWithdraw || 0) + requestedAmount;
    } else if (source === 'shared_capital') {
      // For shared capital, we need to deduct from packages
      let remainingAmount = requestedAmount;
      
      // First try to deduct from completed packages
      for (const pkg of packages) {
        if (pkg.status === 'completed' && remainingAmount > 0) {
          const deduction = Math.min(pkg.totalEarnings || 0, remainingAmount);
          pkg.totalEarnings = (pkg.totalEarnings || 0) - deduction;
          remainingAmount -= deduction;
          await pkg.save();
        }
      }

      // Then deduct from active packages if needed
      if (remainingAmount > 0) {
        for (const pkg of packages) {
          if (pkg.status === 'active' && remainingAmount > 0) {
            const startDate = new Date(pkg.startDate);
            const daysSinceStart = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
            const currentEarnings = (pkg.dailyIncome || 0) * daysSinceStart;
            
            // Calculate how much we can deduct from this package
            const packageTotal = pkg.amount + currentEarnings;
            const deduction = Math.min(packageTotal, remainingAmount);
            
            // Update package
            pkg.amount = Math.max(0, packageTotal - deduction);
            pkg.lastUpdated = now;
            remainingAmount -= deduction;
            await pkg.save();
          }
        }
      }
      
      // Update total withdrawals for shared capital
      user.totalWithdraw = (user.totalWithdraw || 0) + requestedAmount;
      console.log('Updated total withdrawals:', {
        before: user.totalWithdraw - requestedAmount,
        added: requestedAmount,
        after: user.totalWithdraw
      });
    }

    await user.save();

    res.status(201).json(withdrawal);
} catch (error) {
    console.error('Error in submitWithdrawal:', error);
    res.status(500).json({
    message: 'Failed to process withdrawal request',
    error: error.message
    });
}
};

// Record a click and update earnings
exports.recordClick = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if daily limit is reached
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastClick = user.lastClick ? new Date(user.lastClick) : null;
        const isNewDay = !lastClick || lastClick < today;

        // Reset daily clicks if it's a new day
        if (isNewDay) {
            user.dailyClicks = 0;
            user.dailyClickEarnings = 0;
        }

        // Check if daily limit is reached (₱10 = 50 clicks)
        if (user.dailyClickEarnings >= 10) {
            return res.status(200).json({ 
                message: 'Daily Click Limit Reached',
                clicks: user.dailyClicks,
                dailyEarnings: user.dailyClickEarnings,
                totalEarnings: user.clickEarnings
            });
        }

        // Calculate earnings for this click
        const clickEarning = 0.20;
        const newDailyEarnings = (user.dailyClickEarnings || 0) + clickEarning;

        // Check if this click would exceed the daily limit
        if (newDailyEarnings > 10) {
            return res.status(200).json({ 
                message: 'Daily Click Limit Reached',
                clicks: user.dailyClicks,
                dailyEarnings: user.dailyClickEarnings,
                totalEarnings: user.clickEarnings
            });
        }

        // Update click counts and earnings
        user.dailyClicks = (user.dailyClicks || 0) + 1;
        user.dailyClickEarnings = newDailyEarnings;
        user.clickEarnings = (user.clickEarnings || 0) + clickEarning;
        user.lastClick = new Date();

        await user.save();

        res.json({
            message: 'Click recorded successfully',
            clicks: user.dailyClicks,
            dailyEarnings: user.dailyClickEarnings,
            totalEarnings: user.clickEarnings
        });
    } catch (error) {
        console.error('Error recording click:', error);
        res.status(500).json({ message: 'Error recording click' });
    }
};

exports.getAgentStats = catchAsync(async (req, res) => {
  // Get the agent's ID from the authenticated user
  const agentId = req.user._id;

  // Get total downlines (users who have this agent as their referrer)
  const totalDownlines = await User.countDocuments({ referrer: agentId });

  // Get total earnings from transactions
  const earningsResult = await Transaction.aggregate([
    {
      $match: {
        agent: agentId,
        type: 'commission',
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Get active investments count
  const activeInvestments = await Transaction.countDocuments({
    agent: agentId,
    type: 'investment',
    status: 'active'
  });

  // Get total transactions count
  const totalTransactions = await Transaction.countDocuments({
    agent: agentId
  });

  res.status(200).json({
    totalDownlines,
    totalEarnings: earningsResult[0]?.total || 0,
    activeInvestments,
    totalTransactions
  });
});

exports.getTeamMembers = catchAsync(async (req, res) => {
  const agentId = req.user._id;

  const teamMembers = await User.find({ referrer: agentId })
    .select('username email createdAt')
    .sort('-createdAt');

  const formattedTeamMembers = teamMembers.map(member => ({
    name: member.username,
    email: member.email,
    joinedDate: member.createdAt
  }));

  res.status(200).json(formattedTeamMembers);
});

exports.claimMaturedPackage = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user._id;

    // Find the package
    const pkg = await Package.findOne({ _id: packageId, user: userId, status: 'active' });
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found or not active.' });
    }

    // Check if matured
    const now = new Date();
    if (now < pkg.endDate) {
      return res.status(400).json({ message: 'Package has not matured yet.' });
    }

    // Calculate final earnings
    const packageConfig = {
      1: { rate: 0.20, duration: 12 },
      2: { rate: 0.50, duration: 20 }
    }[pkg.packageType];

    // Calculate total earnings (principal + profit)
    const profitAmount = pkg.amount * packageConfig.rate;
    const totalAmount = pkg.amount + profitAmount;

    // Update user sharedEarnings (not wallet)
    const user = await User.findById(userId);
    user.sharedEarnings = (user.sharedEarnings || 0) + totalAmount;
    await user.save();

    // Mark package as completed with final earnings
    pkg.status = 'completed';
    pkg.totalEarnings = totalAmount; // Store the total amount as earnings for completed packages
    await pkg.save();

    res.json({ message: 'Earnings claimed successfully!', totalEarnings });
  } catch (error) {
    console.error('Error claiming matured package:', error);
    res.status(500).json({ message: 'Error claiming matured package.' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password - the User model's pre-save middleware will hash it
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

// Get agent's profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
            .select('username email referralCode wallet referralEarnings')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Update package earnings
exports.updatePackageEarnings = async (req, res) => {
    try {
        const now = new Date();
        
        // Find all active packages
        const activePackages = await Package.find({
            status: 'active',
            endDate: { $gt: now }
        });
        
        let updatedCount = 0;
        
        for (const pkg of activePackages) {
            // Calculate days since last update
            const lastUpdate = pkg.lastUpdated || pkg.startDate;
            const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceUpdate > 0) {
                // Calculate new earnings
                const newEarnings = pkg.dailyIncome * daysSinceUpdate;
                
                // Update package
                await Package.findByIdAndUpdate(pkg._id, {
                    $inc: { totalEarnings: newEarnings },
                    lastUpdated: now
                });
                
                updatedCount++;
            }
        }
        
        if (res) {
            res.json({
                message: `Updated earnings for ${updatedCount} packages`,
                updatedCount
            });
        }
    } catch (error) {
        console.error('Error updating package earnings:', error);
        if (res) {
            res.status(500).json({ message: 'Error updating package earnings' });
        }
    }
};

// Add new endpoint to claim matured package
exports.claimPackage = async (req, res) => {
    try {
        const { packageId } = req.body;
        const now = new Date();

        // Find the package
        const pkg = await Package.findOne({
            _id: packageId,
            user: req.user._id,
            status: 'active'
        });

        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const endDate = new Date(pkg.endDate);
        if (now < endDate) {
            return res.status(400).json({ message: 'Package has not matured yet' });
        }

        if (pkg.claimed) {
            return res.status(400).json({ message: 'Package has already been claimed' });
        }

        // Calculate total earnings
        const totalDays = pkg.packageType === 1 ? 12 : 20;
        const totalEarnings = pkg.amount + (pkg.dailyIncome * totalDays);

        // Update package status
        pkg.claimed = true;
        pkg.claimedAt = now;
        await pkg.save();

        // Update user sharedEarnings (not wallet)
        const user = await User.findById(req.user._id);
        user.sharedEarnings = (user.sharedEarnings || 0) + totalEarnings;
        await user.save();

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

        // Notify via WebSocket
        if (global.io) {
            global.io.emit('earnings_update', {
                type: 'earnings_update',
                agentId: req.user._id,
                earnings: await calculateUserEarnings(req.user._id)
            });
        }

        res.json({
            message: 'Package claimed successfully',
            amount: totalEarnings
        });
    } catch (error) {
        console.error('Error claiming package:', error);
        res.status(500).json({ message: 'Error claiming package' });
    }
};

// Get active packages with normal display
exports.getActivePackages = async (req, res) => {
    try {
        const packages = await Package.find({
            user: req.user._id,
            status: 'active'
        });

        const now = new Date();
        const formattedPackages = packages.map(pkg => {
            const startDate = new Date(pkg.startDate);
            const endDate = new Date(pkg.endDate);
            const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            const totalDays = pkg.packageType === 1 ? 12 : 20;
            const daysRemaining = Math.max(0, totalDays - daysSinceStart);
            const isMatured = now >= endDate;

            return {
                _id: pkg._id,
                packageType: pkg.packageType,
                amount: pkg.amount,
                status: pkg.status,
                dailyIncome: pkg.dailyIncome,
                daysRemaining,
                isMatured,
                totalEarnings: isMatured ? (pkg.amount + (pkg.dailyIncome * totalDays)) : 0,
                claimed: pkg.claimed
            };
        });

        res.json(formattedPackages);
    } catch (error) {
        console.error('Error fetching active packages:', error);
        res.status(500).json({ message: 'Error fetching active packages' });
    }
};

module.exports = exports;
