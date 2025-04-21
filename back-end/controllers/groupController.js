const Group = require('../models/Group'); // Assuming you have a Group model
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all groups the current user is a member of
// @route   GET /api/groups
// @access  Private
const listUserGroups = async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    try {
        const groups = await Group.find({ members: userId })
            .populate('members', 'name email') // Populate member details
            .populate('createdBy', 'name')   // Populate creator details
            .sort({ name: 1 }); // Sort alphabetically by name

        // Format the response for the list view
        const formattedGroups = groups.map(group => ({
            _id: group._id,
            name: group.name,
            description: group.description,
            createdAt: group.createdAt,
            createdBy: group.createdBy ? { _id: group.createdBy._id, name: group.createdBy.name } : null, // Handle potential null creator
            memberCount: group.members.length,
        }));

        res.status(200).json(formattedGroups);

    } catch (error) {
        console.error("Error listing user groups:", error);
        next(error); // Pass error to the error handling middleware
    }
};

// Future controllers: getGroupDetails, createGroup, addMember, removeMember, deleteGroup etc.

module.exports = {
    listUserGroups,
    // Export other controllers as they are added
}; 