import React from 'react';
import DarkModeToggle from '../ui/DarkModeToggle';

const BalanceOverview = ({ balanceData, loading, error }) => {

  // Calculate percentages only if data is available
  const total = (balanceData?.totalOwed || 0) + (balanceData?.totalOwedToYou || 0);
  const owedPercentage = total > 0 ? ((balanceData?.totalOwed || 0) / total) * 100 : 0;
  const owedToYouPercentage = total > 0 ? ((balanceData?.totalOwedToYou || 0) / total) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 min-h-[150px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Balance Overview</h2>
        <DarkModeToggle />
      </div>

      {/* Use props for conditional rendering */}
      {loading && (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 dark:text-red-400 mt-4">
          <p>{error}</p>
        </div>
      )}

      {/* Ensure balanceData exists before trying to access its properties */}
      {!loading && !error && balanceData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Balance (Net) */}
            <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 animate-shimmer bg-shimmer-gradient bg-[length:200%_100%] bg-no-repeat">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</h3>
              {/* Use balanceData prop */}
              <p className={`text-2xl font-semibold ${balanceData.netBalance >= 0 ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}`}>
                {balanceData.netBalance >= 0 ? '+' : '-'}${Math.abs(balanceData.netBalance).toFixed(2)}
              </p>
            </div>
            {/* You Owe */}
            <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 animate-shimmer bg-shimmer-gradient bg-[length:200%_100%] bg-no-repeat">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">You Owe</h3>
              {/* Use balanceData prop */}
              <p className="text-2xl font-semibold text-red-700 dark:text-red-500">${(balanceData.totalOwed || 0).toFixed(2)}</p>
            </div>
            {/* You Are Owed */}
            <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 animate-shimmer bg-shimmer-gradient bg-[length:200%_100%] bg-no-repeat">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">You Are Owed</h3>
              {/* Use balanceData prop */}
              <p className="text-2xl font-semibold text-green-700 dark:text-green-500">${(balanceData.totalOwedToYou || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-primary rounded-full" 
              style={{width: `${owedPercentage}%`}} // Uses calculated value
            ></div>
            <div 
              className="absolute top-0 h-full bg-gradient-to-r from-primary to-green-500 rounded-full" 
              style={{width: `${owedToYouPercentage}%`, left: `${owedPercentage}%`}} // Offset green segment after red portion
            ></div>
          </div>
        </>
      )}
      {!loading && !error && !balanceData && (
         <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
            <p>No balance data available.</p>
          </div>
      )} 
    </div>
  );
};

export default BalanceOverview; 