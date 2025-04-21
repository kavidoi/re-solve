const mongoose = require('mongoose');

const expenseShareSchema = new mongoose.Schema({
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // User is not required if unregisteredUserName is present
  },
  unregisteredUserName: { // New field for non-user participants
    type: String,
    trim: true,
  },
  shareAmount: {
    type: Number,
    required: true,
  },
  // Optional: Track if this share has been settled
  isSettled: {
    type: Boolean,
    default: false,
  }
  // No timestamps needed here typically
});

// Add compound index for efficiency if often querying by user and expense
// Consider adding unregisteredUserName to index if querying by it
expenseShareSchema.index({ user: 1, expense: 1 });
expenseShareSchema.index({ unregisteredUserName: 1, expense: 1 });

// Validation to ensure either user or unregisteredUserName exists
expenseShareSchema.pre('validate', function(next) {
  if (!this.user && !this.unregisteredUserName) {
    next(new Error('ExpenseShare must have either a registered user or an unregistered user name.'));
  } else if (this.user && this.unregisteredUserName) {
      next(new Error('ExpenseShare cannot have both a registered user and an unregistered user name.'));
  } else {
    next();
  }
});

const ExpenseShare = mongoose.model('ExpenseShare', expenseShareSchema);

module.exports = ExpenseShare; 