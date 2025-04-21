const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const mongoose = require('mongoose');

// @desc    Get user's balance summary (owed, owed to you, net)
// @route   GET /api/balance/summary
// @access  Private
const getBalanceSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userName = req.user.name; // Get logged-in user's name for comparison if needed

    let totalOwed = 0;
    let totalOwedToYou = 0;

    // --- Calculate total YOU OWE to others --- 
    // Find UNSETTLED expense shares assigned to the logged-in user (always via user field)
    // where the expense was paid by someone ELSE.
    const sharesOwedByUser = await ExpenseShare.find({ 
        user: userId, 
        isSettled: false 
      })
      .populate('expense', 'paidBy'); 
                                               
    sharesOwedByUser.forEach(share => {
      if (share.expense && share.expense.paidBy && !share.expense.paidBy.equals(userId)) {
        totalOwed += share.shareAmount;
      }
    });

    // --- Calculate total OTHERS (Registered & Unregistered) OWE to you --- 
    // Find expenses paid by the user
    const expensesPaidByUser = await Expense.find({ paidBy: userId });
    const expenseIdsPaidByUser = expensesPaidByUser.map(exp => exp._id);

    // Find UNSETTLED expense shares linked to those expenses,
    // where the share is assigned to someone ELSE (registered or unregistered)
    const sharesOwedToUser = await ExpenseShare.find({
      expense: { $in: expenseIdsPaidByUser },
      isSettled: false,
      $or: [
        { user: { $ne: userId } }, // EITHER a different registered user owes
        { user: null, unregisteredUserName: { $exists: true } } // OR an unregistered user owes
      ]
    });

    sharesOwedToUser.forEach(share => {
      totalOwedToYou += share.shareAmount;
    });

    // --- Calculate Net Balance --- 
    const netBalance = totalOwedToYou - totalOwed;

    const summary = {
      totalOwed: parseFloat(totalOwed.toFixed(2)),
      totalOwedToYou: parseFloat(totalOwedToYou.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2))
    };

    res.status(200).json(summary);

  } catch (error) {
    console.error('Error in getBalanceSummary:', error);
    next(error); // Pass error to global error handler
  }
};

module.exports = {
  getBalanceSummary,
}; 