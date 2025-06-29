const express = require('express');
const router = express.Router();
const clickController = require('../controllers/clickController');
const { auth, isActive } = require('../middleware/auth');

// All routes require authentication and active account
router.use(auth, isActive);

// Record a click
router.post('/', clickController.recordClick);

// Get click statistics
router.get('/stats', clickController.getClickStats);

module.exports = router; 