const express = require('express');
const { sendFriendRequest, listFriends, listIncomingRequests, acceptRequest, rejectRequest } = require('../controllers/friendController');
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

// GET /api/friends/requests - List pending incoming friend requests
router.get('/requests', protect, listIncomingRequests);

// PUT /api/friends/request/:id/accept - Accept a friend request
router.put('/request/:id/accept', protect, acceptRequest);

// PUT /api/friends/request/:id/reject - Reject a friend request
router.put('/request/:id/reject', protect, rejectRequest);

// Add other routes later:
// DELETE /:id - remove a friend

module.exports = router; 