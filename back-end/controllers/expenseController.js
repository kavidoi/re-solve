const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const Group = require('../models/Group'); // Needed potentially for validation
const User = require('../models/User');   // Needed potentially for validation

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  const { description, amount, paidBy, splits, groupId } = req.body;
  const loggedInUserId = req.user.id; // User creating the expense

  // --- Basic Validation --- 
  if (!description || !amount || !paidBy || !splits || !Array.isArray(splits) || splits.length === 0) {
    return res.status(400).json({ message: 'Missing required expense fields (description, amount, paidBy, splits)' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  // Validate splits data structure and calculate total split amount
  let totalSplitPercentage = 0;
  let calculatedSplitTotal = 0;
  let splitType = 'percentage'; // Default or detect based on input
  
  for (const split of splits) {
    if (!split.user || (!split.percentage && !split.shareAmount)) {
      return res.status(400).json({ message: 'Invalid split data: Each split needs user and percentage/shareAmount' });
    }
    if (split.percentage) {
      totalSplitPercentage += split.percentage;
      splitType = 'percentage';
    } else if (split.shareAmount) {
        calculatedSplitTotal += split.shareAmount;
        splitType = 'amount';
    } else {
        // This case is already covered by the check above, but good practice
        return res.status(400).json({ message: 'Invalid split data: Split needs percentage or shareAmount' });
    }
  }

  // Validate split totals
  if (splitType === 'percentage' && totalSplitPercentage !== 100) {
    return res.status(400).json({ message: `Split percentages must add up to 100%, currently ${totalSplitPercentage}%` });
  } 
  // Use tolerance for floating point comparison
  if (splitType === 'amount' && Math.abs(calculatedSplitTotal - amount) > 0.001) {
    return res.status(400).json({ message: `Split amounts must add up to the total expense amount ($${amount}), currently $${calculatedSplitTotal}` });
  }

  // --- Advanced Validation (Optional but recommended) --- 
  // TODO: Validate that paidBy user exists
  // TODO: Validate that all users in splits exist
  // TODO: If groupId is provided, validate that the group exists and all involved users (paidBy, splits) are members

  // --- Map user identifiers to ObjectIds OR keep name for unregistered --- 
  let mappedSplits = [];
  try {
    // Convert paidBy identifier to ObjectId if it's not 'You'
    const paidByUserId = paidBy === 'You' ? loggedInUserId : (await User.findOne({ name: paidBy }))?._id;
    if (!paidByUserId) {
        throw new Error(`Payer with name "${paidBy}" not found.`);
    }

    mappedSplits = await Promise.all(splits.map(async (split) => {
      let userId = null;
      let unregisteredName = null;
      
      if (split.user === 'You') {
        userId = loggedInUserId;
      } else {
        // Try to find registered user
        const userDoc = await User.findOne({ name: split.user }); 
        if (userDoc) {
          userId = userDoc._id; // Found registered user
        } else {
          unregisteredName = split.user; // Keep name for unregistered participant
        }
      }

      let shareAmount;
      if (splitType === 'percentage') {
        shareAmount = (amount * split.percentage) / 100;
      } else { 
        shareAmount = split.shareAmount;
      }
      
      // Determine if this share belongs to the person who paid
      const isPayerShare = userId ? userId.toString() === paidByUserId.toString() : false; // Unregistered users cannot be the payer via this logic
      
      return { 
        user: userId,                // ObjectId or null
        unregisteredUserName: unregisteredName, // String or null
        shareAmount: parseFloat(shareAmount.toFixed(2)),
        isSettled: isPayerShare     // Mark payer's share as settled
      };
    }));
  } catch (mappingError) {
     console.error('Error mapping split users:', mappingError);
     return res.status(400).json({ message: mappingError.message || 'Invalid user in splits.' });
  }

  // --- Database Operations --- 
  try {
    // Use the resolved paidByUserId
    const expense = new Expense({
      description,
      amount,
      paidBy: paidByUserId, 
      createdBy: loggedInUserId,
      group: groupId || null, 
      date: new Date(),
    });
    const savedExpense = await expense.save(); 

    // Create ExpenseShare documents using mappedSplits
    const expenseSharesData = mappedSplits.map(split => ({
        expense: savedExpense._id,
        user: split.user,                   // ObjectId or null
        unregisteredUserName: split.unregisteredUserName, // String or null
        shareAmount: split.shareAmount,
        isSettled: split.isSettled
    }));
    
    const savedShares = await ExpenseShare.insertMany(expenseSharesData);
    
    res.status(201).json({ expense: savedExpense, shares: savedShares });

  } catch (error) {
    console.error('Error creating expense:', error);
    next(error); 
  } 
};

module.exports = {
  createExpense,
  // Add other expense-related controllers here (getExpense, updateExpense, deleteExpense)
}; 