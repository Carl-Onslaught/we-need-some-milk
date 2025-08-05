const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PackageRequest = require('../models/PackageRequest');
const agentController = require('../controllers/agentController');

// Shared Capital Package Request
// Claim matured package
router.post('/claim-package', auth, agentController.claimPackage);

// Shared Capital Package Request
router.post('/shared-capital', auth, async (req, res) => {
  try {
    const { amount, packageId } = req.body;
    const agentId = req.user.id;

    // Validate package ID
    if (![1, 2, 3].includes(packageId)) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }

    // Validate amount based on package
    const minAmount = packageId === 1 ? 100 : packageId === 2 ? 500 : 1000;
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

    // TODO: Notify admin about the new request

    res.status(201).json({
      message: 'Package request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Package request error:', error);
    res.status(500).json({ message: 'Error processing package request' });
  }
});

module.exports = router; 