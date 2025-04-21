const express = require('express');
const { createExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// Validation rules for creating an expense
const createExpenseValidation = [
  body('description', 'Description is required').not().isEmpty().trim(),
  body('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
  body('paidBy', 'Paid By user ID is required').not().isEmpty(), // Or validate based on 'You' or ObjectId
  body('splits', 'Splits array is required').isArray({ min: 1 }),
  body('splits.*.user', 'Each split must have a user').not().isEmpty(),
  // Conditional validation depending on split type (percentage or shareAmount)
  body('splits.*.percentage', 'Split percentage must be a number between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
  body('splits.*.shareAmount', 'Split share amount must be a positive number').optional().isFloat({ gt: 0 }),
  body('groupId', 'Group ID must be a valid MongoDB ObjectId').optional().isMongoId(),
];

// Define routes
// POST /api/expenses
router.post('/', protect, createExpenseValidation, createExpense);

// Add other expense routes here later (GET /, GET /:id, PUT /:id, DELETE /:id)

module.exports = router; 