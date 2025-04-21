const express = require('express');
const { getCurrentUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Define routes
// GET /api/users/me
router.get('/me', protect, getCurrentUser);

// Add other user routes here later (e.g., PUT /me for profile update)

module.exports = router; 