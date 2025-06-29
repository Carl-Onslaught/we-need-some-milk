const express = require('express');
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');
const SharedCapitalTransaction = require('../models/sharedCapitalTransaction');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');

const router = express.Router();

// Protected admin routes
router.use(auth);
router.use(adminAuth);

// Activate all users
router.post('/activate-all-users', async (req, res) => {
    try {
        await User.updateMany({}, {
            $set: {
                isActive: true,
                status: 'approved',
                approvedAt: new Date()
            }
        });
        res.json({ message: 'All users activated successfully' });
    } catch (error) {
        console.error('Error activating users:', error);
        res.status(500).json({ message: 'Error activating users' });
    }
});

// Protected admin routes
router.use(auth);
router.use(adminAuth);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Referral data
router.get('/referral', adminController.getReferralData);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/role', adminController.updateUserRole);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

// Registration management
router.get('/registrations/pending', adminController.getPendingRegistrations);
router.post('/registrations/:id/approve', adminController.approveRegistration);
router.post('/registrations/:id/reject', adminController.rejectRegistration);
router.post('/registration/load', adminController.loadRegistration);

// Shared capital
router.post('/shared/load', adminController.loadSharedCapital);

// Package requests management
router.get('/packages/pending', adminController.getPendingPackages);
router.put('/packages/:id/approve', adminController.approvePackage);
router.put('/packages/:id/reject', adminController.rejectPackage);

// Investments management
router.get('/investments/pending', adminController.getPendingInvestments);
router.post('/investments/:id/approve', adminController.approveInvestment);
router.post('/investments/:id/reject', adminController.rejectInvestment);

// Withdrawals management
router.get('/withdrawals/pending', adminController.getPendingWithdrawals);
router.post('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// Earnings management
router.get('/transactions/earnings', adminController.getEarningsTransactions);
router.get('/earnings/withdrawals', adminController.getEarningsWithdrawals);
router.post('/earnings/withdrawals/:id/approve', adminController.approveEarningsWithdrawal);
router.post('/earnings/withdrawals/:id/reject', adminController.rejectEarningsWithdrawal);

router.get('/earnings/direct-referral', async (req, res) => {
  try {
    const earnings = await Transaction.find({ 
      type: 'referral',
      'referralType': 'direct'
    })
    .populate('user', 'username')
    .populate({
      path: 'withdrawal',
      select: 'method accountNumber accountName'
    })
    .sort({ createdAt: -1 });
    
    res.json(earnings);
  } catch (error) {
    console.error('Error fetching direct referral earnings:', error);
    res.status(500).json({ message: 'Error fetching direct referral earnings' });
  }
});

router.get('/earnings/indirect-referral', async (req, res) => {
  try {
    const earnings = await Transaction.find({ 
      type: 'referral',
      'referralType': 'indirect'
    })
    .populate('user', 'username')
    .populate({
      path: 'withdrawal',
      select: 'method accountNumber accountName'
    })
    .sort({ createdAt: -1 });
    
    res.json(earnings);
  } catch (error) {
    console.error('Error fetching indirect referral earnings:', error);
    res.status(500).json({ message: 'Error fetching indirect referral earnings' });
  }
});

router.get('/earnings/clicks', async (req, res) => {
  try {
    const earnings = await Transaction.find({ 
      type: 'click'
    })
    .populate('user', 'username')
    .populate({
      path: 'withdrawal',
      select: 'method accountNumber accountName'
    })
    .sort({ createdAt: -1 });
    
    res.json(earnings);
  } catch (error) {
    console.error('Error fetching click earnings:', error);
    res.status(500).json({ message: 'Error fetching click earnings' });
  }
});

// Shared Capital Withdrawals
router.get('/sharedWithdrawals', adminController.getSharedWithdrawals);
router.post('/sharedWithdrawals/:id/approve', adminController.approveSharedWithdrawal);
router.post('/sharedWithdrawals/:id/reject', adminController.rejectSharedWithdrawal);

// Shared Capital History
router.get('/shared-capital/history', [auth, adminAuth], async (req, res) => {
  try {
    const transactions = await SharedCapitalTransaction.find({ type: 'deposit' })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching shared capital load history:', error);
    res.status(500).json({ message: 'Error fetching shared capital load history' });
  }
});

router.get('/earnings/shared-capital', async (req, res) => {
  try {
    const earnings = await Transaction.find({ 
      type: 'shared'
    })
    .populate('user', 'username')
    .populate({
      path: 'withdrawal',
      select: 'method accountNumber accountName'
    })
    .sort({ createdAt: -1 });
    
    res.json(earnings);
  } catch (error) {
    console.error('Error fetching shared capital earnings:', error);
    res.status(500).json({ message: 'Error fetching shared capital earnings' });
  }
});

// Shared capital management
router.get('/transactions/shared', adminController.getSharedTransactions);
router.get('/withdrawals/shared', adminController.getSharedWithdrawals);
router.post('/withdrawals/shared/:id/approve', adminController.approveSharedWithdrawal);
router.post('/withdrawals/shared/:id/reject', adminController.rejectSharedWithdrawal);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Load shared capital to agent account
router.post('/load-capital', [auth, adminAuth], async (req, res) => {
  try {
    const { username, amount } = req.body;

    // Validate input
    if (!username || !amount || amount < 100) {
      return res.status(400).json({ message: 'Invalid input. Amount must be at least 100 points.' });
    }

    // Find the agent by username
    const agent = await User.findOne({ username });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Update agent's wallet
    agent.wallet += amount;
    await agent.save();

    // Log the transaction
    await SharedCapitalTransaction.create({
      user: agent._id,
      type: 'deposit',
      amount,
      package: 'N/A',
      description: `Admin loaded ${amount} points to agent (${agent.username})`,
      status: 'completed'
    });

    res.json({ message: 'Shared capital loaded successfully', newBalance: agent.wallet });
  } catch (error) {
    console.error('Error loading shared capital:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total shared capital sent to agents
router.get('/load-capital/total-sent', [auth, adminAuth], async (req, res) => {
  try {
    // Aggregate all agents' wallet increases from shared capital loading
    // For now, sum all positive registration transactions of type 'registration' or 'shared_capital_load' if tracked
    // But since /load-capital only updates wallet, we need to sum all loads
    // If you want to track only loads via this endpoint, you should also log a Transaction or similar
    // For now, let's sum all wallet increases for agents (not ideal, but matches current logic)
    // If you want to be precise, you should log a Transaction in /load-capital POST as well

    // Option 1: If you want to sum all wallet increases, you can sum all agents' wallet fields
    // const agents = await User.find({ role: 'agent' });
    // const totalSent = agents.reduce((sum, agent) => sum + (agent.wallet || 0), 0);

    // Option 2: If you want to sum all loads, you should log a Transaction in /load-capital POST and sum those
    // For now, let's sum all agents' wallet fields
    const agents = await require('../models/User').find({ role: 'agent' });
    const totalSent = agents.reduce((sum, agent) => sum + (agent.wallet || 0), 0);
    res.json({ totalSent });
  } catch (error) {
    console.error('Error fetching total shared capital sent:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending registrations
router.get('/pending-registrations', auth, adminAuth, async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      role: 'agent',
      status: 'pending'
    }).select('-password');

    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    res.status(500).json({ message: 'Error fetching pending registrations' });
  }
});

// Approve or reject registration
router.post('/approve-registration/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'approve') {
      user.status = 'approved';
      user.isActive = true;
      user.approvedAt = new Date();

      // Create registration transaction
      await new Transaction({
        user: user._id,
        type: 'registration',
        amount: -100, // Registration fee
        description: 'Registration fee',
        status: 'completed'
      }).save();

      // Handle referral bonus if applicable
      if (user.referrer) {
        const referralAmount = 10; // 10% of registration fee
        await new Transaction({
          user: user.referrer,
          type: 'referral',
          amount: referralAmount,
          description: 'Registration referral bonus',
          status: 'completed',
          relatedUser: user._id
        }).save();

        // Update referrer's earnings
        await User.findByIdAndUpdate(user.referrer, {
          $inc: { 'referralEarnings.direct': referralAmount }
        });
      }
    } else if (action === 'reject') {
      user.status = 'rejected';
      user.rejectedAt = new Date();
    }

    await user.save();
    res.json({ message: `Registration ${action}ed successfully` });
  } catch (error) {
    console.error('Error processing registration:', error);
    res.status(500).json({ message: 'Error processing registration' });
  }
});

// Revert a shared capital load
router.post('/shared-capital/revert/:id', async (req, res) => {
  try {
    const tx = await SharedCapitalTransaction.findById(req.params.id).populate('user');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (tx.type !== 'deposit') return res.status(400).json({ message: 'Only deposit transactions can be reverted' });
    if (tx.status === 'failed') return res.status(400).json({ message: 'Transaction already reverted' });

    // Subtract the amount from the agent's wallet
    const agent = await User.findById(tx.user._id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if ((agent.wallet || 0) < tx.amount) return res.status(400).json({ message: 'Agent wallet does not have enough points to revert' });
    agent.wallet -= tx.amount;
    await agent.save();

    // Mark the transaction as reverted
    tx.status = 'failed';
    tx.description += ' (reverted)';
    await tx.save();

    res.json({ message: 'Load reverted and agent wallet updated.' });
  } catch (error) {
    console.error('Error reverting shared capital load:', error);
    res.status(500).json({ message: 'Error reverting shared capital load' });
  }
});

module.exports = router;
