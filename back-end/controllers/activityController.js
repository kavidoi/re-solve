const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const User = require('../models/User'); // Import User model
const mongoose = require('mongoose');

// @desc    Get recent activity for the logged-in user
// @route   GET /api/activity/recent
// @access  Private
const getRecentActivity = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); 
    const limit = 20; // Limit the number of activities

    // Find expenses paid by the user
    const expensesPaidByUser = await Expense.find({ paidBy: userId })
      .sort({ date: -1 })
      .limit(limit)
      .populate('paidBy', 'name') // Populate payer name
      // .populate('group', 'name'); // Optional: populate group name

    // Find unsettled shares involving the user (registered)
    const unsettledSharesOfUser = await ExpenseShare.find({ user: userId, isSettled: false })
                                                .select('expense shareAmount') 
                                                .limit(limit * 2);
    const expenseIdsOwedByUser = unsettledSharesOfUser.map(s => s.expense);
    // Create a map for quick lookup of share amount
    const shareAmountMap = unsettledSharesOfUser.reduce((map, share) => {
        map[share.expense.toString()] = share.shareAmount;
        return map;
    }, {});
    
    const expensesOwedByUser = await Expense.find({ 
        _id: { $in: expenseIdsOwedByUser },
        paidBy: { $ne: userId } // Paid by someone else
      })
      .sort({ date: -1 })
      .limit(limit)
      .populate('paidBy', 'name'); // Populate payer name
      // .populate('group', 'name'); // Optional

    // Combine and format activities (simple version)
    // In a real app, you might want more sophisticated merging and formatting
    let combinedActivities = [
        ...expensesPaidByUser.map(exp => ({ 
            id: exp._id,
            type: 'expense_paid', // Custom type for clarity
            description: exp.description,
            amount: exp.amount, 
            user: `You paid ${exp.paidBy?.name || '...'}`, // Clarify who was paid if needed?
            timestamp: exp.date || exp.createdAt,
            status: 'Paid' // Placeholder status
        })),
        ...expensesOwedByUser.map(exp => ({ 
            id: exp._id, 
            type: 'expense_owed', // Custom type
            description: exp.description,
            // Show the user's share amount for this activity item
            amount: shareAmountMap[exp._id.toString()] || exp.amount, // Fallback to total if map fails
            user: `${exp.paidBy?.name || 'Someone'} paid`, 
            timestamp: exp.date || exp.createdAt,
            status: 'Pending' // Since we queried for isSettled: false
        }))
    ];

    // Sort combined activities by timestamp (most recent first)
    combinedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit the final combined list
    const recentActivities = combinedActivities.slice(0, limit);

    res.status(200).json(recentActivities);

  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    next(error); 
  }
};

module.exports = {
  getRecentActivity,
}; 