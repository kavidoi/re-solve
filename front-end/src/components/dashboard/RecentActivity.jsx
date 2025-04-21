import React from 'react';

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

const RecentActivity = ({ activities, loading, error }) => {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Recent Activity</h2>
        {/* Consider making this functional later */}
        <button className="text-primary hover:underline dark:text-indigo-400">See All</button> 
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
          {activities.map((activity) => (
            <li key={activity._id || activity.id} className="flex items-center justify-between p-3 bg-secondary dark:bg-gray-700 rounded-lg">
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
                     ${Math.abs(activity.amount).toFixed(2)} 
                  </p>
                )}
                {activity.status && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClasses(activity.status)}`}>
                    {activity.status}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity; 