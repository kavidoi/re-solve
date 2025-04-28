import React from 'react';
import { useTranslation } from 'react-i18next';

const QuickActions = ({ onAddExpense, onCreateGroup, onAddFriend }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold mb-4 text-lg dark:text-white">{t('quickActions.title')}</h3>
      <div className="space-y-3">
        <button 
          onClick={onAddExpense}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 transition"
        >
          <i className="fas fa-plus-circle text-primary"></i>
          <span className="dark:text-white">{t('quickActions.addExpense')}</span>
        </button>
        <button 
          onClick={onCreateGroup}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 transition"
        >
          <i className="fas fa-users text-primary"></i>
          <span className="dark:text-white">{t('quickActions.createGroup')}</span>
        </button>
        <button 
          onClick={onAddFriend}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 transition"
        >
          <i className="fas fa-user-plus text-primary"></i>
          <span className="dark:text-white">{t('quickActions.addFriend')}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions; 