import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/friends');
        setFriends(response.data || []);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError('Failed to load friends.');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700 min-h-[200px]">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Friends</h3>

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

      {!loading && !error && friends.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
          <p>No friends added yet.</p>
        </div>
      )}

      {!loading && !error && friends.length > 0 && (
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li key={friend._id} className="flex items-center justify-between p-3 bg-secondary dark:bg-gray-700 rounded-lg hover:bg-accent dark:hover:bg-gray-600 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                {/* Basic Avatar Placeholder */}
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600">
                  <span className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300">{friend.name?.charAt(0).toUpperCase() || '?'}</span>
                </span>
                <div>
                  <p className="font-medium dark:text-white">{friend.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                </div>
              </div>
               {/* Add actions later (e.g., view profile, remove friend) */}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
               </svg>
            </li>
          ))}
        </ul>
      )}

       {/* Optional: Add button or link */}
       {!loading && !error && (
        <button className="mt-4 w-full text-center text-sm text-primary hover:underline dark:text-indigo-400">
          View all friends
        </button>
      )}
    </div>
  );
};

export default FriendsList; 