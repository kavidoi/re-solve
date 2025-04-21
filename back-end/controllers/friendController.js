const User = require('../models/User');
const Friendship = require('../models/Friendship');
const mongoose = require('mongoose');

// @desc    Send a friend request
// @route   POST /api/friends/request
// @access  Private
const sendFriendRequest = async (req, res, next) => {
    const { identifier } = req.body; // email or username of the recipient
    const requesterId = new mongoose.Types.ObjectId(req.user.id);

    if (!identifier) {
        return res.status(400).json({ message: 'Identifier (email or username) is required' });
    }

    try {
        // Find the potential friend by email or name (adjust field if needed)
        // Using $or to search multiple fields
        const recipient = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { name: identifier }]
        });

        if (!recipient) {
            return res.status(404).json({ message: 'User not found with that identifier' });
        }

        const recipientId = recipient._id;

        // Check if user is trying to friend themselves
        if (requesterId.equals(recipientId)) {
            return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
        }

        // Check if a friendship record already exists between these two users (in either direction)
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existingFriendship) {
            // Handle based on status
            if (existingFriendship.status === 'accepted') {
                return res.status(400).json({ message: 'You are already friends with this user' });
            } else if (existingFriendship.status === 'pending') {
                // If the current user was the recipient of a previous pending request
                if (existingFriendship.recipient.equals(requesterId)) {
                    return res.status(400).json({ message: 'This user has already sent you a friend request. Accept it instead.' });
                } else {
                    return res.status(400).json({ message: 'Friend request already pending' });
                }
            } else if (existingFriendship.status === 'rejected' || existingFriendship.status === 'blocked') {
                 // Decide policy: allow re-request? block? For now, inform user.
                return res.status(400).json({ message: `Cannot send request due to previous interaction status: ${existingFriendship.status}` });
            }
        }

        // Create new friendship record with 'pending' status
        const newFriendship = await Friendship.create({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending',
        });

        // TODO: Optionally emit a notification to the recipient user via websockets

        res.status(201).json({ message: 'Friend request sent successfully', friendship: newFriendship });

    } catch (error) {
        console.error("Error sending friend request:", error);
        next(error);
    }
};

// @desc    Get accepted friends for the logged-in user
// @route   GET /api/friends
// @access  Private
const listFriends = async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    try {
        // Find friendships where the user is either requester or recipient AND status is 'accepted'
        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted'
        })
        // Populate the user details we need from the *other* person in the friendship
        .populate({
            path: 'requester',
            match: { _id: { $ne: userId } }, // Populate only if NOT the current user
            select: 'name email' // Select fields to return
        })
        .populate({
            path: 'recipient',
            match: { _id: { $ne: userId } }, // Populate only if NOT the current user
            select: 'name email'
        });

        // Extract the friend details from the populated documents
        const friends = friendships.map(friendship => {
            // Determine which field holds the friend's details
            const friendDetails = friendship.requester ? friendship.requester : friendship.recipient;
            // Check if friendDetails actually got populated (due to match condition)
            if (!friendDetails) return null; 
            return {
                friendshipId: friendship._id, // ID of the friendship document itself
                _id: friendDetails._id,       // ID of the friend user
                name: friendDetails.name,
                email: friendDetails.email,
                // Add other relevant friend details if needed
            };
        }).filter(friend => friend); // Filter out nulls where population didn't match

        res.status(200).json(friends);

    } catch (error) {
        console.error("Error listing friends:", error);
        next(error);
    }
};

// @desc    List incoming pending friend requests for the logged-in user
// @route   GET /api/friends/requests
// @access  Private
const listIncomingRequests = async (req, res, next) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    try {
        // Find friendships where the user is the recipient AND status is 'pending'
        const requests = await Friendship.find({
            recipient: userId,
            status: 'pending'
        })
        .populate('requester', 'name email'); // Populate the requester's details

        // Format the response to include relevant info
        const formattedRequests = requests.map(request => ({
            requestId: request._id, // ID of the friendship document
            requester: {
                _id: request.requester._id,
                name: request.requester.name,
                email: request.requester.email,
            },
            createdAt: request.createdAt, // Include timestamp if needed
        }));

        res.status(200).json(formattedRequests);

    } catch (error) {
        console.error("Error listing friend requests:", error);
        next(error);
    }
};

module.exports = {
    sendFriendRequest,
    listFriends,
    listIncomingRequests,
    // Add other friend-related controllers here (acceptRequest, rejectRequest, listFriends, etc.)
}; 