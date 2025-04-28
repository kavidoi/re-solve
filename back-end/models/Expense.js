const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Expense description is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  unregisteredPayerName: {
    type: String,
    trim: true,
    default: null,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group', 
    // Expense might not belong to a group (direct friend expense)
    // required: true, 
  },
  // We might store split details directly or reference ExpenseShare documents
  // For simplicity here, let's assume ExpenseShare holds the details.
}, {
  timestamps: true, // Adds createdAt, updatedAt
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 