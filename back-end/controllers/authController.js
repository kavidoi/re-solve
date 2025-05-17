const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dev_default_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    console.log(`[${new Date().toISOString()}] Attempting to find user by email: ${email}`);
    const userExists = await User.findOne({ email });
    console.log(`[${new Date().toISOString()}] User.findOne completed. User exists: ${!!userExists}`);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by pre-save middleware in User model
    });

    if (user) {
      // Generate token and send response (excluding password)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    next(error); // Pass error to global error handler
  }
};

// @desc    Authenticate user & get token (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`loginUser invoked with email: ${email}`);

  try {
    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', !!user);

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      console.log('Password verified');
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in loginUser:', error.stack || error);
    return res.status(500).json({ message: error.message || 'Something went wrong during login.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};