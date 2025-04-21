const express = require('express');
const { getRecentActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/activity/recent
router.get('/recent', protect, getRecentActivity);

module.exports = router; 