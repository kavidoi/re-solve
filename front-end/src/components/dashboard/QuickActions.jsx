import React from 'react';

const QuickActions = ({ onAddExpense, onCreateGroup, onAddFriend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold mb-4 text-lg dark:text-white">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          onClick={onAddExpense}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 transition"
        >
          <i className="fas fa-plus-circle text-primary"></i>
          <span className="dark:text-white">Add Expense</span>
        </button>
        <button 
          onClick={onCreateGroup}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 transition"
        >
          <i className="fas fa-users text-primary"></i>
          <span className="dark:text-white">Create Group</span>
        </button>
        <button 
          onClick={onAddFriend}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 transition"
        >
          <i className="fas fa-user-plus text-primary"></i>
          <span className="dark:text-white">Add Friend</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions; 