import React from 'react';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useTranslation } from 'react-i18next';

const BalanceOverview = ({ balanceData, loading, error }) => {
  const { t } = useTranslation();

  // Create default data if balanceData is null or undefined
  const safeData = balanceData || { totalOwed: 0, totalOwedToYou: 0, netBalance: 0 };
  
  // Calculate percentages only if data is available
  const total = safeData.totalOwed + safeData.totalOwedToYou;
  const owedPercentage = total > 0 ? (safeData.totalOwed / total) * 100 : 0;
  const owedToYouPercentage = total > 0 ? (safeData.totalOwedToYou / total) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 min-h-[150px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">{t('dashboard.balanceOverview')}</h2>
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

      {/* Show loading state */}
      {loading && (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Show error state */}
      {!loading && error && (
        <div className="text-center text-red-500 dark:text-red-400 mt-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Refresh page
          </button>
        </div>
      )}
      
      {/* Show data (always show something, even if it's zeros) */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Balance (Net) */}
            <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 animate-shimmer bg-shimmer-gradient bg-[length:200%_100%] bg-no-repeat">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalBalance')}</h3>
              <p className={`text-2xl font-semibold ${safeData.netBalance >= 0 ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}`}>
                {safeData.netBalance >= 0 ? '+' : '-'}${Math.abs(safeData.netBalance).toFixed(2)}
              </p>
            </div>
            {/* You Owe */}
            <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 animate-shimmer bg-shimmer-gradient bg-[length:200%_100%] bg-no-repeat">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">{t('dashboard.youOwe')}</h3>
              <p className="text-2xl font-semibold text-red-700 dark:text-red-500">${safeData.totalOwed.toFixed(2)}</p>
            </div>
            {/* You Are Owed */}
            <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 animate-shimmer bg-shimmer-gradient bg-[length:200%_100%] bg-no-repeat">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">{t('dashboard.youAreOwed')}</h3>
              <p className="text-2xl font-semibold text-green-700 dark:text-green-500">${safeData.totalOwedToYou.toFixed(2)}</p>
            </div>
          </div>

          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Add a small blend area in the middle to create a smooth transition */}
            {total > 0 && (
              <>
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-primary rounded-full" 
                  style={{
                    width: `${Math.min(100, owedPercentage + 0.5)}%`,
                    zIndex: 1
                  }}
                ></div>
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-primary to-green-500 rounded-full" 
                  style={{
                    width: `${Math.min(100, owedToYouPercentage + 0.5)}%`, 
                    left: `${Math.max(0, owedPercentage - 0.5)}%`,
                    zIndex: 2,
                    opacity: 0.9 // Slight transparency for blend effect
                  }}
                ></div>
              </>
            )}
          </div>
          
          {/* Show a message if there's no activity */}
          {total === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
              <p>{t('dashboard.noBalanceActivity')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BalanceOverview; 