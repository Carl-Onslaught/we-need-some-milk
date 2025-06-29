const User = require('../models/User');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const Withdrawal = require('../models/Withdrawal');
const Package = require('../models/Package');
const SharedCapitalTransaction = require('../models/sharedCapitalTransaction');

exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        // Only allow admin role updates
        if (!['admin', 'agent'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Error updating user role' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.countDocuments({ role: 'agent' });

        // Get total investments
        const investmentStats = await Investment.aggregate([
            {
                $group: {
                    _id: null,
                    totalInvestments: { $sum: '$amount' }
                }
            }
        ]);
        const totalInvestments = investmentStats[0]?.totalInvestments || 0;

        // Get total withdrawals
        const totalWithdrawals = await Withdrawal.aggregate([
            { 
                $match: { status: 'completed' } 
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Get pending withdrawals
        const pendingWithdrawals = await Withdrawal.aggregate([
            { 
                $match: { status: 'pending' } 
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            totalUsers,
            totalInvestments,
            totalWithdrawals: totalWithdrawals[0]?.total || 0,
            pendingWithdrawals: pendingWithdrawals[0]?.total || 0
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

exports.loadRegistration = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create transaction
        await new Transaction({
            user: userId,
            type: 'registration_load',
            amount: amount,
            description: 'Registration load by admin',
            status: 'completed'
        }).save();

        // Update user wallet
        await User.findByIdAndUpdate(userId, {
            $inc: { wallet: amount }
        });

        res.json({ message: 'Registration load successful' });
    } catch (error) {
        console.error('Error loading registration:', error);
        res.status(500).json({ message: 'Error loading registration' });
    }
};

exports.loadSharedCapital = async (req, res) => {
    try {
        const { userId, amount, packageType } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create investment
        await new Investment({
            user: userId,
            amount: amount,
            package: packageType,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + (packageType === 1 ? 12 : 20) * 24 * 60 * 60 * 1000)
        }).save();

        res.json({ message: 'Shared capital loaded successfully' });
    } catch (error) {
        console.error('Error loading shared capital:', error);
        res.status(500).json({ message: 'Error loading shared capital' });
    }
};

exports.getEarningsTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            type: { $in: ['commission', 'click', 'referral'] } 
        })
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Get earnings transactions error:', error);
        res.status(500).json({ message: 'Error fetching earnings transactions' });
    }
};

exports.getEarningsWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ type: 'earnings' })
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        console.error('Get earnings withdrawals error:', error);
        res.status(500).json({ message: 'Error fetching earnings withdrawals' });
    }
};

exports.approveEarningsWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        withdrawal.status = 'completed';
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        res.json({ message: 'Withdrawal approved successfully' });
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        res.status(500).json({ message: 'Error approving withdrawal' });
    }
};

exports.rejectEarningsWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        withdrawal.status = 'rejected';
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        // Return amount to user's wallet
        await User.findByIdAndUpdate(withdrawal.user, {
            $inc: { wallet: withdrawal.amount }
        });

        res.json({ message: 'Withdrawal rejected successfully' });
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        res.status(500).json({ message: 'Error rejecting withdrawal' });
    }
};

exports.getSharedTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ type: 'shared' })
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Get shared transactions error:', error);
        res.status(500).json({ message: 'Error fetching shared transactions' });
    }
};

exports.approveSharedWithdrawal = async (req, res) => {
    try {
        console.log('Starting shared withdrawal approval process...');
        const { id } = req.params;
        console.log('Withdrawal ID:', id);

        const withdrawal = await Withdrawal.findById(id).populate('agentId');
        console.log('Found withdrawal:', withdrawal);
        
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        console.log('Creating shared capital transaction record...');
        // Create shared capital transaction record
        const transaction = await SharedCapitalTransaction.create({
            user: withdrawal.agentId._id,
            type: 'withdrawal',
            amount: withdrawal.amount,
            package: `Package ${withdrawal.package || 1}`,
            status: 'completed',
            description: `Shared Capital withdrawal of ₱${withdrawal.amount.toLocaleString()} processed via ${withdrawal.method}`,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Created transaction:', transaction);

        // Update withdrawal status
        console.log('Updating withdrawal status...');
        withdrawal.status = 'completed';
        withdrawal.processedAt = new Date();
        await withdrawal.save();
        console.log('Withdrawal updated successfully');

        // Verify the transaction was created
        const verifyTransaction = await SharedCapitalTransaction.findById(transaction._id);
        console.log('Verified transaction exists:', verifyTransaction);

        res.json({ message: 'Shared withdrawal approved successfully' });
    } catch (error) {
        console.error('Error approving shared withdrawal:', error);
        res.status(500).json({ message: 'Error approving shared withdrawal' });
    }
};

exports.rejectSharedWithdrawal = async (req, res) => {
    try {
        console.log('Starting withdrawal rejection process...');
        const { id } = req.params;
        console.log('Withdrawal ID:', id);

        // Get withdrawal with populated user data
        const withdrawal = await Withdrawal.findById(id).populate('agentId');
        console.log('Found withdrawal:', withdrawal);
        
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: 'Withdrawal is not in pending status' });
        }

        // Get fresh user data to ensure we have the latest balances
        const user = await User.findById(withdrawal.agentId._id);
        console.log('Found user:', user?.username);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Restore balance based on withdrawal source
        if (withdrawal.source === 'direct_indirect') {
            // Split the amount between direct and indirect referrals
            const halfAmount = withdrawal.amount / 2;
            if (!user.referralEarnings) {
                user.referralEarnings = { direct: 0, indirect: 0 };
            }
            user.referralEarnings.direct = Number(user.referralEarnings.direct || 0) + halfAmount;
            user.referralEarnings.indirect = Number(user.referralEarnings.indirect || 0) + halfAmount;
            console.log('Restored referral earnings:', user.referralEarnings);
        } 
        else if (withdrawal.source === 'click_earnings') {
            // Restore click earnings
            const currentClickEarnings = Number(user.clickEarnings || 0);
            const newClickEarnings = parseFloat((currentClickEarnings + withdrawal.amount).toFixed(2));
            user.clickEarnings = newClickEarnings;
            console.log('Restored click earnings:', user.clickEarnings);
        }
        else if (withdrawal.source === 'shared_capital') {
            // Get user's packages
            const packages = await Package.find({
                user: user._id,
                status: { $in: ['active', 'completed'] }
            }).sort({ amount: 1 });

            // Add the rejected amount back to the first available package
            if (packages.length > 0) {
                const pkg = packages[0];
                pkg.amount = (pkg.amount || 0) + withdrawal.amount;
                await pkg.save();
                console.log('Restored amount to package:', {
                    packageId: pkg._id,
                    previousAmount: pkg.amount - withdrawal.amount,
                    restoredAmount: withdrawal.amount,
                    newAmount: pkg.amount
                });
            } else {
                // If no package found, create a new one
                const newPackage = await Package.create({
                    user: user._id,
                    amount: withdrawal.amount,
                    status: 'active',
                    startDate: new Date(),
                    dailyIncome: withdrawal.amount * 0.01 // 1% daily income
                });
                console.log('Created new package with restored amount:', newPackage);
            }
        }
        
        // Update withdrawal status
        withdrawal.status = 'rejected';
        withdrawal.processedAt = new Date();
        await withdrawal.save();
        console.log('Updated withdrawal status to rejected');

        // Reduce total withdraw amount
        user.totalWithdraw = Math.max(0, (user.totalWithdraw || 0) - withdrawal.amount);
        await user.save();
        console.log('Updated user total withdraw amount');

        // Get updated user data to send in response
        const updatedUser = await User.findById(user._id).populate('packages');
        
        // Calculate current shared earnings
        const sharedEarnings = updatedUser.packages.reduce((total, pkg) => {
            if (pkg.status === 'completed') {
                return total + (pkg.totalEarnings || 0);
            } else {
                const now = new Date();
                const lastUpdate = pkg.lastUpdated || pkg.startDate;
                const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
                const currentEarnings = (pkg.dailyIncome || 0) * daysSinceUpdate;
                return total + (pkg.amount || 0) + currentEarnings;
            }
        }, 0);

        // Notify the agent via WebSocket
        if (global.io) {
            global.io.emit('withdrawal_status_update', {
                type: 'withdrawal_status_update',
                agentId: user._id,
                status: 'rejected',
                source: withdrawal.source,
                amount: withdrawal.amount,
                updatedBalances: {
                    referralEarnings: updatedUser.referralEarnings,
                    clickEarnings: updatedUser.clickEarnings,
                    totalWithdraw: updatedUser.totalWithdraw,
                    sharedEarnings: sharedEarnings
                }
            });
        }

        res.json({
            message: 'Withdrawal rejected and balance restored successfully',
            updatedBalances: {
                referralEarnings: updatedUser.referralEarnings,
                clickEarnings: updatedUser.clickEarnings,
                totalWithdraw: updatedUser.totalWithdraw,
                sharedEarnings: sharedEarnings
            }
        });
    } catch (error) {
        console.error('Reject shared withdrawal error:', error);
        res.status(500).json({ message: 'Error rejecting withdrawal' });
    }
};

exports.getSharedWithdrawals = async (req, res) => {
    try {
        console.log('Fetching pending shared capital withdrawals...');
        const withdrawals = await Withdrawal.find({
            source: 'shared_capital',
            status: 'pending' // Only get pending withdrawals
        })
        .populate('agentId', 'username email')
        .sort({ createdAt: -1 });

        console.log('Found pending shared capital withdrawals:', withdrawals.length);
        if (withdrawals.length > 0) {
            console.log('Sample withdrawal:', JSON.stringify(withdrawals[0], null, 2));
            console.log('Sample agentId:', withdrawals[0].agentId);
        }
        res.json(withdrawals);
    } catch (error) {
        console.error('Get shared withdrawals error:', error);
        res.status(500).json({ message: 'Error fetching shared withdrawals' });
    }
};

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                clickReward: 1,
                referralBonus: 50,
                minimumWithdrawal: 500,
                sharedEarningPercentage: 0.5,
                paymentMethods: []
            });
        }
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { clickReward, referralBonus, minimumWithdrawal, sharedEarningPercentage, paymentMethods } = req.body;
        
        // Validate payment methods
        if (paymentMethods && !Array.isArray(paymentMethods)) {
            return res.status(400).json({ message: 'Payment methods must be an array' });
        }

        // Ensure each payment method has required fields
        if (paymentMethods) {
            for (const method of paymentMethods) {
                if (!method.name || !method.accountName || !method.accountNumber) {
                    return res.status(400).json({ message: 'Each payment method must have a name, account name, and account number' });
                }
            }
        }

        // Update settings
        const settings = await Settings.findOneAndUpdate(
            {},
            {
                clickReward,
                referralBonus,
                minimumWithdrawal,
                sharedEarningPercentage,
                paymentMethods
            },
            { new: true, upsert: true }
        );

        res.json({
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
};

exports.getPendingInvestments = async (req, res) => {
    try {
        const pendingInvestments = await Investment.find({ status: 'pending' })
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        
        res.json(pendingInvestments);
    } catch (error) {
        console.error('Get pending investments error:', error);
        res.status(500).json({ message: 'Error fetching pending investments' });
    }
};

exports.approveInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const investment = await Investment.findByIdAndUpdate(
            id,
            { status: 'approved', approvedAt: new Date() },
            { new: true }
        ).populate('user', 'username email');

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        // Update user's wallet balance
        await User.findByIdAndUpdate(
            investment.user._id,
            { $inc: { wallet: investment.amount } }
        );

        res.json({
            message: 'Investment approved successfully',
            investment
        });
    } catch (error) {
        console.error('Approve investment error:', error);
        res.status(500).json({ message: 'Error approving investment' });
    }
};

exports.rejectInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const investment = await Investment.findByIdAndUpdate(
            id,
            { status: 'rejected', rejectedAt: new Date() },
            { new: true }
        ).populate('user', 'username email');

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.json({
            message: 'Investment rejected successfully',
            investment
        });
    } catch (error) {
        console.error('Reject investment error:', error);
        res.status(500).json({ message: 'Error rejecting investment' });
    }
};

exports.getPendingWithdrawals = async (req, res) => {
    try {
        const pendingWithdrawals = await Withdrawal.find({ status: 'pending' })
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        
        res.json(pendingWithdrawals);
    } catch (error) {
        console.error('Get pending withdrawals error:', error);
        res.status(500).json({ message: 'Error fetching pending withdrawals' });
    }
};

exports.approveWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal.findByIdAndUpdate(
            id,
            { status: 'approved', approvedAt: new Date() },
            { new: true }
        ).populate('user', 'username email');

        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        // Deduct from user's wallet
        await User.findByIdAndUpdate(
            withdrawal.user._id,
            { $inc: { wallet: -withdrawal.amount } }
        );

        res.json({
            message: 'Withdrawal approved successfully',
            withdrawal
        });
    } catch (error) {
        console.error('Approve withdrawal error:', error);
        res.status(500).json({ message: 'Error approving withdrawal' });
    }
};

exports.rejectWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal.findByIdAndUpdate(
            id,
            { status: 'rejected', rejectedAt: new Date() },
            { new: true }
        ).populate('user', 'username email');

        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        res.json({
            message: 'Withdrawal rejected successfully',
            withdrawal
        });
    } catch (error) {
        console.error('Reject withdrawal error:', error);
        res.status(500).json({ message: 'Error rejecting withdrawal' });
    }
};

exports.getPendingRegistrations = async (req, res) => {
    try {
        const pendingRegistrations = await User.find({ 
            status: 'pending'
        })
        .populate('referrer', 'username')
        .select('-password')
        .sort({ createdAt: -1 });
        
        res.json(pendingRegistrations);
    } catch (error) {
        console.error('Get pending registrations error:', error);
        res.status(500).json({ message: 'Error fetching pending registrations' });
    }
};

exports.approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        // First find the user to get their current data
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user status and activate them
        user.status = 'approved';
        user.approvedAt = new Date();
        user.isActive = true;

        // Save the updated user
        await user.save();

        // If user has a referrer, make sure they're active too
        if (user.referrer) {
            await User.findByIdAndUpdate(user.referrer, {
                status: 'approved',
                isActive: true,
                approvedAt: new Date()
            });
        }

        res.json({
            message: 'Registration approved successfully',
            user: user.toObject({ getters: true, versionKey: false })
        });
    } catch (error) {
        console.error('Approve registration error:', error);
        res.status(500).json({ message: 'Error approving registration' });
    }
};

exports.rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(
            id,
            { 
                status: 'rejected',
                rejectedAt: new Date(),
                isActive: false
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Registration rejected successfully',
            user
        });
    } catch (error) {
        console.error('Reject registration error:', error);
        res.status(500).json({ message: 'Error rejecting registration' });
    }
};

const generateReferralCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existingUser = await User.findOne({ referralCode: code });
    if (existingUser) {
        return generateReferralCode(); // Try again if code exists
    }
    return code;
};

exports.getReferralData = async (req, res) => {
    try {
        // Get admin's referral data
        const admin = await User.findById(req.user._id);
        
        // Generate referral code if missing
        if (!admin.referralCode) {
            admin.referralCode = await generateReferralCode();
            await admin.save();
        }
        
        // Get total referrals (all users who used this referral code)
        const totalReferrals = await User.countDocuments({ referrer: req.user._id });
        
        // Get active referrals (approved and active users)
        const activeReferrals = await User.countDocuments({ 
            referrer: req.user._id,
            isActive: true,
            status: 'approved'
        });

        // Calculate total commission from completed referral transactions
        const completedCommission = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    type: 'referral',
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

        // Get pending commission
        const pendingCommission = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    type: 'referral',
                    status: 'pending'
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
            referralCode: admin.referralCode,
            totalReferrals,
            activeReferrals,
            completedCommission: completedCommission[0]?.total || 0,
            pendingCommission: pendingCommission[0]?.total || 0
        });
    } catch (error) {
        console.error('Get referral data error:', error);
        res.status(500).json({ message: 'Error fetching referral data' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the isActive status
        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ message: 'Error toggling user status' });
    }
};

// Package requests management
exports.getPendingPackages = async (req, res) => {
  try {
    const packages = await Package.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(packages);
  } catch (error) {
    console.error('Error fetching pending packages:', error);
    res.status(500).json({ message: 'Error fetching pending packages' });
  }
};

exports.approvePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (package.status !== 'pending') {
      return res.status(400).json({ message: 'Package is not pending approval' });
    }

    // Update package status and dates
    package.status = 'active';
    package.startDate = new Date();
    package.endDate = new Date(Date.now() + package.duration * 24 * 60 * 60 * 1000);
    await package.save();

    // Update user's package
    const user = await User.findById(package.user);
    user.package = package._id;
    await user.save();

    res.json({ message: 'Package approved successfully', package });
  } catch (error) {
    console.error('Error approving package:', error);
    res.status(500).json({ message: 'Error approving package' });
  }
};

exports.rejectPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (package.status !== 'pending') {
      return res.status(400).json({ message: 'Package is not pending approval' });
    }

    // Update package status
    package.status = 'rejected';
    await package.save();

    res.json({ message: 'Package rejected successfully', package });
  } catch (error) {
    console.error('Error rejecting package:', error);
    res.status(500).json({ message: 'Error rejecting package' });
  }
};
