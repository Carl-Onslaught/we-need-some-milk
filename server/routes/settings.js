const express = require('express');
const router = express.Router();

const { getSettings } = require('../controllers/adminController');

// Public endpoint to retrieve application settings for client use.
// Does not expose sensitive admin-only mutation operations.
router.get('/', async (req, res, next) => {
  try {
    await getSettings(req, res); // reuse existing controller logic
  } catch (err) {
    next(err);
  }
});

module.exports = router;
