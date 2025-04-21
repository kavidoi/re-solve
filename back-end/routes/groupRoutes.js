const express = require('express');
const { listUserGroups } = require('../controllers/groupController'); // Only import listUserGroups
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/groups - List groups for the logged-in user
router.get('/', protect, listUserGroups);

// Future routes:
// POST /api/groups - Create a new group
// GET /api/groups/:id - Get details for a specific group
// PUT /api/groups/:id - Update a group
// DELETE /api/groups/:id - Delete a group
// POST /api/groups/:id/members - Add a member to a group
// DELETE /api/groups/:id/members/:memberId - Remove a member from a group

module.exports = router; 