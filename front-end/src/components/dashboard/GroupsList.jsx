import React from 'react'; // Removed useState, useEffect
import { useTranslation } from 'react-i18next';
// Removed axios

const GroupsList = ({ groups, loading, error }) => { // Accept props
  const { t } = useTranslation();
  // State and useEffect removed

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 min-h-[200px]">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Your Groups</h3>

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

      {!loading && !error && groups.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
          <p>No groups found. Try creating one!</p>
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <ul className="space-y-3">
          {/* Map over groups prop */}
          {groups.map((group) => (
             // Use group._id if available (from DB), else group.id (maybe from mock)
             <li key={group._id || group.id} className="flex items-center justify-between p-3 bg-secondary dark:bg-gray-700 rounded-lg hover:bg-accent dark:hover:bg-gray-600 transition cursor-pointer">
               <div className="flex items-center space-x-3">
                 <span className="text-2xl">{group.avatar || '👥'}</span>
                 <div>
                   <p className="font-medium dark:text-white">{group.name}</p>
                   {/* Adjust member count based on actual data structure */}
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     {group.members?.length || group.memberCount || 0} members
                   </p>
                 </div>
               </div>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
               </svg>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && (
        <button className="mt-4 w-full text-center text-sm text-primary hover:underline dark:text-indigo-400">
          View all groups
        </button>
      )}
    </div>
  );
};

export default GroupsList; 