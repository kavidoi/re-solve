const express = require('express');
const { getBalanceSummary } = require('../controllers/balanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/balance/summary
router.get('/summary_v2', protect, getBalanceSummary);

module.exports = router; 