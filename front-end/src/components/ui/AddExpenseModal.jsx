import React, { useState, useEffect, useMemo } from 'react';
import ExpenseSplitCake from './ExpenseSplitCake';

const AddExpenseModal = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1); // Step 1: Basic Info, Step 2: Split Visualization
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    paidBy: 'You',
    splits: [
      { user: 'You', percentage: 50 },
      { user: 'Sarah', percentage: 25 },
      { user: 'Mike', percentage: 25 }
    ]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCakeVisualization, setUseCakeVisualization] = useState(true);

  // Calculate total percentage using useMemo for efficiency
  const totalPercentage = useMemo(() => {
    return expenseData.splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
  }, [expenseData.splits]);

  const isPercentageValid = totalPercentage === 100;

  // Reset the modal state when it's opened or closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
    }
  }, [isOpen]);

  // Listen for the custom event to open the modal
  useEffect(() => {
    const handleOpenModal = () => {
      document.getElementById('expenseModal').classList.remove('hidden');
      document.getElementById('expenseModal').classList.add('flex');
    };

    window.addEventListener('openAddExpenseModal', handleOpenModal);

    return () => {
      window.removeEventListener('openAddExpenseModal', handleOpenModal);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSplitChange = (index, value) => {
    const newSplits = [...expenseData.splits];
    // Ensure value is treated as number, default to 0 if invalid or empty
    const numValue = value === '' ? 0 : parseInt(value, 10);
    newSplits[index].percentage = isNaN(numValue) ? 0 : numValue; 
    setExpenseData(prev => ({
      ...prev,
      splits: newSplits
    }));
    if (error) setError(''); // Clear potential previous submit errors
  };

  // Handle the cake visualization's split changes
  const handleCakeSplitChange = (shares) => {
    // Convert from cake visualization format to our splits format
    const newSplits = shares.map(share => ({
      user: share.name,
      percentage: share.included ? share.percentage : 0
    }));
    
    setExpenseData(prev => ({
      ...prev,
      splits: newSplits
    }));
    
    if (error) setError(''); // Clear potential previous submit errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (step === 1) {
      // Validate first step
      if (!expenseData.description.trim()) {
        setError('Please provide a description');
        return;
      }
      
      if (!expenseData.amount || isNaN(parseFloat(expenseData.amount)) || parseFloat(expenseData.amount) <= 0) {
        setError('Please provide a valid amount');
        return;
      }
      
      // Move to step 2
      setStep(2);
      return;
    }

    // Frontend validation before submitting
    if (!isPercentageValid) {
      setError(`Percentages must add up to 100%, currently ${totalPercentage.toFixed(1)}%.`);
      return;
    }

    setLoading(true);
    try {
      await onSave(expenseData); // Call the handler passed from Dashboard
      // Success - let Dashboard handle closing modal
    } catch (err) {
      // If there's an error that the Dashboard didn't handle, show it here
      setError(err.message || 'Failed to save expense');
      setLoading(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  // Format participants for the cake visualization
  const cakeParticipants = useMemo(() => {
    return expenseData.splits.map((split, index) => ({
      id: index.toString(),
      name: split.user
    }));
  }, [expenseData.splits]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleOutsideClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {step === 1 ? 'Add New Expense' : 'Split Expense'}
          </h2>
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        {/* Step indicator */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              1
            </div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} mx-2`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              2
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {step} of 2
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            /* Step 1: Basic expense information */
            <>
              <div className="mb-4">
                <label className="block text-gray-500 dark:text-gray-400 mb-2">Description</label>
                <input 
                  type="text" 
                  name="description"
                  value={expenseData.description}
                  onChange={handleChange}
                  className="w-full bg-secondary dark:bg-gray-700 border border-accent dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-500 dark:text-gray-400 mb-2">Amount ($)</label>
                <input 
                  type="number" 
                  name="amount"
                  value={expenseData.amount}
                  onChange={handleChange}
                  className="w-full bg-secondary dark:bg-gray-700 border border-accent dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  required
                  step="0.01"
                  min="0.01"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-500 dark:text-gray-400 mb-2">Paid by</label>
                <select 
                  name="paidBy"
                  value={expenseData.paidBy}
                  onChange={handleChange}
                  className="w-full bg-secondary dark:bg-gray-700 border border-accent dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                >
                  <option>You</option>
                  <option>Sarah</option>
                  <option>Mike</option>
                  <option>Emma</option>
                </select>
              </div>
            </>
          ) : (
            /* Step 2: Split visualization */
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-500 dark:text-gray-400">Split between</label>
                {/* Toggle between visualization styles */}
                <button
                  type="button"
                  onClick={() => setUseCakeVisualization(!useCakeVisualization)}
                  className="text-xs text-primary dark:text-indigo-400 hover:underline focus:outline-none"
                >
                  {useCakeVisualization ? 'Switch to Simple View' : 'Switch to Cake Visualization'}
                </button>
              </div>
              
              {/* Compact expense details display */}
              <div className="bg-secondary dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
                 <div>
                   <span className="text-gray-500 dark:text-gray-400">Desc: </span>
                   <span className="font-medium dark:text-white truncate max-w-[100px]" title={expenseData.description}>{expenseData.description}</span>
                 </div>
                 <div>
                   <span className="text-gray-500 dark:text-gray-400">Amount: </span>
                   <span className="font-medium dark:text-white">${parseFloat(expenseData.amount).toFixed(2)}</span>
                 </div>
                 <div>
                   <span className="text-gray-500 dark:text-gray-400">Paid by: </span>
                   <span className="font-medium dark:text-white">{expenseData.paidBy}</span>
                 </div>
              </div>
              
              {useCakeVisualization ? (
                /* Cake Visualization */
                <div className="p-4 bg-secondary dark:bg-gray-700 rounded-lg">
                  <ExpenseSplitCake
                    participants={cakeParticipants}
                    totalAmount={parseFloat(expenseData.amount) || 0}
                    onSplitChange={handleCakeSplitChange}
                  />
                </div>
              ) : (
                /* Simple Percentage Inputs */
                <div className="space-y-2 p-4 bg-secondary dark:bg-gray-700 rounded-lg">
                  {expenseData.splits.map((split, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="dark:text-white">{split.user}</span>
                      <div className="w-16">
                        <input 
                          type="number" 
                          value={expenseData.splits[index].percentage} 
                          onChange={(e) => handleSplitChange(index, e.target.value)}
                          className="w-full bg-white dark:bg-gray-600 border border-accent dark:border-gray-600 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Total percentage indicator */}
              <div className={`text-sm mt-3 ${isPercentageValid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                Total: {totalPercentage.toFixed(1)}%
                {!isPercentageValid && ' (Must be 100%)'}
              </div>
            </div>
          )}
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <div className="flex space-x-3">
            {step === 1 ? (
              <>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn btn-primary bg-primary hover:bg-indigo-700 text-white rounded-lg py-2 transition"
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="flex-1 bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 transition"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn btn-primary bg-primary hover:bg-indigo-700 text-white rounded-lg py-2 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading || !isPercentageValid}
                >
                  {loading ? 'Saving...' : 'Save Expense'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal; 