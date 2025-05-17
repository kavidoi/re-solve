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
  if (!description || amount === undefined || !paidBy || !splits || !Array.isArray(splits) || splits.length === 0) {
    return res.status(400).json({ message: 'Missing required expense fields (description, amount, paidBy, splits)' });
  }
  
  // Ensure amount is a number
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
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
  if (splitType === 'percentage' && Math.abs(totalSplitPercentage - 100) > 0.001) {
    return res.status(400).json({ message: `Split percentages must add up to 100%, currently ${totalSplitPercentage.toFixed(2)}%` });
  } 
  // Use tolerance for floating point comparison
  if (splitType === 'amount' && Math.abs(calculatedSplitTotal - numAmount) > 0.001) {
    return res.status(400).json({ message: `Split amounts must add up to the total expense amount ($${numAmount.toFixed(2)}), currently $${calculatedSplitTotal.toFixed(2)}` });
  }

  // --- Advanced Validation --- 
  // Validate group or 1:1 context
  if (groupId) {
    // Check group exists
    const group = await Group.findById(groupId).populate('members', '_id name');
    if (!group) {
      return res.status(400).json({ message: 'Group not found' });
    }
    // All splits and paidBy must be group members
    const memberIds = group.members.map(m => m._id.toString());
    const memberNames = group.members.map(m => m.name);
    // PaidBy must be in group (if registered)
    if (paidBy !== 'You' && mongoose.Types.ObjectId.isValid(paidBy)) {
      if (!memberIds.includes(paidBy)) {
        return res.status(400).json({ message: 'Payer is not a member of the selected group' });
      }
    }
    // All splits must be group members (by name or id)
    for (const split of splits) {
      if (split.user !== 'You' && !memberNames.includes(split.user) && !memberIds.includes(split.user)) {
        return res.status(400).json({ message: `Split participant ${split.user} is not a member of the selected group` });
      }
    }
  } else {
    // 1:1: must be exactly two participants: logged-in user and friend
    if (splits.length !== 2) {
      return res.status(400).json({ message: '1:1 expenses must be between exactly two people' });
    }
    // One must be logged-in user, other must be a friend (by name or id)
    const splitNames = splits.map(s => s.user);
    if (!splitNames.includes('You')) {
      return res.status(400).json({ message: 'You must be one of the participants in a 1:1 expense' });
    }
    // Optionally: check that the other is a valid friend (could be improved)
  }

  // --- Map user identifiers to ObjectIds OR keep name for unregistered --- 
  let mappedSplits = [];
  let paidByUserId = null;
  let unregisteredPayerName = null;
  try {
    // Determine payer: map to ID or keep unregistered name
    if (paidBy === 'You') {
      paidByUserId = loggedInUserId;
    } else if (mongoose.Types.ObjectId.isValid(paidBy)) {
      paidByUserId = paidBy;
    } else {
      const payerDoc = await User.findOne({ name: paidBy });
      if (payerDoc) {
        paidByUserId = payerDoc._id;
      } else {
        unregisteredPayerName = paidBy;
      }
    }
    mappedSplits = await Promise.all(splits.map(async (split) => {
      let userId = null;
      let unregisteredName = null;
      
      if (split.user === 'You') {
        userId = loggedInUserId;
      } else {
        // Try to find registered user
        let userDoc;
        if (mongoose.Types.ObjectId.isValid(split.user)) {
          userId = split.user;
        } else {
          userDoc = await User.findOne({ name: split.user }); 
          if (userDoc) {
            userId = userDoc._id; // Found registered user by name
          } else {
            unregisteredName = split.user; // Keep name for unregistered participant
          }
        }
      }

      let shareAmount;
      if (splitType === 'percentage') {
        shareAmount = (numAmount * split.percentage) / 100;
      } else { 
        shareAmount = split.shareAmount;
      }
      
      // Determine if this share belongs to the person who paid
      const isPayerShare =
        (userId && paidByUserId && userId.toString() === paidByUserId.toString()) ||
        (unregisteredName && unregisteredPayerName && unregisteredName === unregisteredPayerName);
       
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
    // Use the resolved paidByUserId and parsed amount
    const expense = new Expense({
      description,
      amount: numAmount,
      paidBy: paidByUserId,
      unregisteredPayerName: unregisteredPayerName,
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

// @desc    Update an existing expense's description
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { description },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  updateExpense,
};