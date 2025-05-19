const ExpenseShare = require('../models/ExpenseShare');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get user's balance summary (owed, owed to you, net)
// @route   GET /api/balance/summary
// @access  Private
const getBalanceSummary = async (req, res, next) => {
  try {
    // Prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    console.log('getBalanceSummary called for user:', req.user._id);

    const userId = new mongoose.Types.ObjectId(req.user._id);

    let totalOwed = 0;
    let totalOwedToYou = 0;

    // 1. Shares where the current user owes money
    const sharesOwedByUser = await ExpenseShare.find({
      user: userId,
      $or: [
        { isSettled: false },
        { isSettled: null }
      ]
    }).populate('expense', 'paidBy');

    console.log('Debugging sharesOwedByUser:', sharesOwedByUser.length, 'shares found');
    sharesOwedByUser.forEach(share => {
      console.log('Processing share:', {
        shareId: share._id,
        amount: share.shareAmount,
        expenseExists: !!share.expense,
        paidByExists: !!share.expense?.paidBy,
        isPaidByUser: share.expense?.paidBy?.equals(userId)
      });
      if (share.expense && share.expense.paidBy && !share.expense.paidBy.equals(userId)) {
        console.log(`Adding ${share.shareAmount} to totalOwed`);
        totalOwed += share.shareAmount;
      }
    });

    // 2. Shares where others owe the current user
    const expensesPaidByUser = await Expense.find({ paidBy: userId });
    const expenseIdsPaidByUser = expensesPaidByUser.map(exp => exp._id);

    const sharesOwedToUser = await ExpenseShare.find({
      expense: { $in: expenseIdsPaidByUser },
      $or: [
        { isSettled: false },
        { isSettled: null }
      ],
      $or: [
        { user: { $ne: userId } },
        { user: null, unregisteredUserName: { $exists: true } }
      ]
    });

    console.log('Debugging sharesOwedToUser:', sharesOwedToUser.length, 'shares found');
    sharesOwedToUser.forEach(share => {
      console.log(`Adding ${share.shareAmount} to totalOwedToYou from expense ${share.expense}`);
      totalOwedToYou += share.shareAmount;
    });

    totalOwed = parseFloat(totalOwed.toFixed(2));
    totalOwedToYou = parseFloat(totalOwedToYou.toFixed(2));
    const netBalance = parseFloat((totalOwedToYou - totalOwed).toFixed(2));

    console.log('getBalanceSummary result:', { totalOwed, totalOwedToYou, netBalance });

    res.json({ totalOwed, totalOwedToYou, netBalance });
  } catch (err) {
    console.error('Error in getBalanceSummary:', err);
    next(err);
  }
};

module.exports = {
  getBalanceSummary,
};