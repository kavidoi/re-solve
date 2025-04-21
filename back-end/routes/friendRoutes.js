const express = require('express');
const { sendFriendRequest, listFriends } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// Validation for the identifier
const requestValidation = [
    body('identifier', 'Identifier (email or username) is required').not().isEmpty().trim(),
];

// POST /api/friends/request
router.post('/request', protect, requestValidation, sendFriendRequest);

// GET /api/friends - List accepted friends
router.get('/', protect, listFriends);

// Add other routes later:
// GET /requests - list pending incoming requests
// PUT /request/:id/accept - accept a request
// PUT /request/:id/reject - reject a request
// DELETE /:id - remove a friend

module.exports = router; 