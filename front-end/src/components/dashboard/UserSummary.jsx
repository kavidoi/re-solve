import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const UserSummary = () => {
  const { user, loading } = useAuth(); // Get user and loading state from context

  // Optional: Show loading state if context is still initializing
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where user is somehow null after loading (shouldn't happen if protected route works)
  if (!user) {
    return (
       <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700">
         <p className="text-gray-500 dark:text-gray-400">User not available.</p>
       </div>
    );
  }

  // Display user data from context
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700">
      <div className="flex items-center space-x-4">
        {/* User Avatar Placeholder */} 
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800">
          <span className="text-xl font-medium leading-none text-gray-600 dark:text-gray-300">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
        </span>
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{user.name || 'User'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'No email'}</p>
        </div>
      </div>
      {/* Optional: Add link to profile settings */}
      {/* <button className="mt-4 text-sm text-primary hover:underline">Edit Profile</button> */}
    </div>
  );
};

export default UserSummary; 