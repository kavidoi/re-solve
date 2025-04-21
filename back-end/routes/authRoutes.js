const express = require('express');
const {
  registerUser,
  loginUser,
} = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

// Input validation rules
const registerValidation = [
  body('name', 'Name is required').not().isEmpty().trim(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

const loginValidation = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists(),
];

// Define routes with validation
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

module.exports = router; 