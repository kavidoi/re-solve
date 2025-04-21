// We don't strictly need the User model here if protect middleware always runs first,
// but it can be good practice or needed for other user-related functions.
// const User = require('../models/User');

// @desc    Get current logged-in user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  // The protect middleware has already fetched the user and attached it to req.user
  // We just need to return it.
  try {
    // req.user should contain the user document excluding the password
    if (req.user) {
      res.status(200).json(req.user);
    } else {
      // This case should technically be handled by protect middleware already
      res.status(404).json({ message: 'User not found' }); 
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    next(error);
  }
};

// Add other user-related controller functions here later (e.g., updateUserProfile)

module.exports = {
  getCurrentUser,
}; 