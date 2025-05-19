import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';

// Helper function to format date/time (optional, adjust as needed)
const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // Example formatting, adjust to your preference
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

const getActivityIcon = (type) => {
    switch (type) {
      case 'expense_paid':
      case 'expense_owed':
      case 'expense': 
        return '💸';
      case 'payment': return '💰';
      case 'group': return '👥';
      default: return '🔔'; // Default icon
    }
};

// Helper to get CSS classes for status badge
const getStatusClasses = (status) => {
    switch (status) {
      case 'Settled':
      case 'Received':
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const RecentActivity = ({ activities, loading, error, onEdit, onActivityDeleted }) => {
  const { t } = useTranslation();
  const [showDeleteButtonFor, setShowDeleteButtonFor] = useState(null); // State to track which item's delete button is visible

  // Delete action
  const handleDelete = async (activityId) => {
    // Hide the delete button immediately for a snappy feel
    setShowDeleteButtonFor(null);
    try {
      await axios.delete(`/api/expenses/${activityId}`);
      // Notify parent component so it can refresh activities & balance
      if (onActivityDeleted) {
        onActivityDeleted(activityId);
      }
      console.log(`Deleted activity ${activityId}`);
    } catch (err) {
      console.error(`Failed to delete activity ${activityId}:`, err.response?.data?.message || err.message);
      // Optionally show a toast / alert here to inform the user
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">{t('dashboard.recentActivity')}</h2>
        {/* Consider making this functional later */}
        <button className="text-primary hover:underline dark:text-indigo-400">{t('dashboard.seeAll')}</button> 
      </div>

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

      {!loading && !error && activities.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
          <p>No recent activity found.</p>
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <ul className="space-y-4">
          {/* Map over activities prop */}
          {activities.map((activity) => {
            // Only allow editing for expense-related activities
            const canEdit = onEdit && activity.type && activity.type.includes('expense');
            const isExpenseType = activity.type && (activity.type.includes('expense') || activity.type === 'payment'); // Define if it's deletable

            const handlers = useSwipeable({
              onSwipedLeft: () => {
                if (isExpenseType) {
                  setShowDeleteButtonFor(activity._id || activity.id);
                }
              },
              onSwipedRight: () => {
                // Optionally, hide delete button on right swipe if it's visible
                if (showDeleteButtonFor === (activity._id || activity.id)) {
                  setShowDeleteButtonFor(null);
                }
              },
              preventScrollOnSwipe: true,
              trackMouse: true // Allows swiping with mouse for easier testing
            });

            return (
              <div key={activity._id || activity.id} className="relative"> {/* Wrapper for swipe and positioning delete button */}
                <div {...(isExpenseType ? handlers : {})} className="transition-transform duration-200 ease-out" style={{ transform: showDeleteButtonFor === (activity._id || activity.id) ? 'translateX(-80px)' : 'translateX(0px)' }}>
                  <li
                    className={`flex items-center justify-between p-3 bg-secondary dark:bg-gray-700 rounded-lg ${canEdit ? 'cursor-pointer hover:bg-secondary/50 dark:hover:bg-gray-600' : ''}`}
                    role={canEdit ? 'button' : undefined}
                    tabIndex={canEdit ? 0 : undefined}
                    onClick={() => {
                      if (showDeleteButtonFor === (activity._id || activity.id)) {
                        // If delete button is visible and user clicks the item, hide delete button
                        setShowDeleteButtonFor(null);
                      } else if (canEdit) {
                        onEdit(activity._id || activity.id, activity.description);
                      }
                    }}
                    onKeyDown={(e) => canEdit && e.key === 'Enter' && onEdit(activity._id || activity.id, activity.description)}
                  >
                    <div className="flex items-start space-x-3 flex-grow">
                      <span className="text-xl mt-1">{getActivityIcon(activity.type)}</span>
                      <div className="flex-grow">
                        <p className="text-sm font-medium dark:text-white">{activity.description || 'Activity'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {/* Display user string from backend for now */}
                          {activity.user ? `${activity.user} • ` : ''}{formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      {/* Use activity.amount directly as formatted in backend */}
                      {typeof activity.amount === 'number' && (
                        <p className={`text-sm font-semibold ${activity.type === 'payment' || activity.type === 'expense_owed' ? 'text-gray-500 dark:text-gray-400' : 'dark:text-white'}`}>
                           {/* Display total amount for now - sign might need adjustment based on context */}
                           {formatCurrency(Math.abs(activity.amount))}
                        </p>
                      )}
                      {activity.status && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClasses(activity.status)}`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </li>
                </div>
                {isExpenseType && showDeleteButtonFor === (activity._id || activity.id) && (
                  <button
                    onClick={() => handleDelete(activity._id || activity.id)}
                    className="absolute top-0 right-0 h-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 flex items-center justify-center rounded-r-lg transition-opacity duration-200 ease-out"
                    style={{ width: '80px' }} // Fixed width for the delete button
                  >
                    {t('common.delete')}
                  </button>
                )}
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity; 