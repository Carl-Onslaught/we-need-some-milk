const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { auth, isActive } = require('../middleware/auth');

// All routes require authentication and active account
router.use(auth, isActive);

// Create new investment
router.post('/', investmentController.createInvestment);

// Get user's investments
router.get('/', investmentController.getUserInvestments);

module.exports = router; 