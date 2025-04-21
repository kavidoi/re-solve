import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // For linking to individual group pages later
import { Plus } from 'lucide-react'; // Replace heroicons with lucide-react

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/groups');
        setGroups(response.data || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError('Failed to load groups. Please try again later.');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Groups</h1>
        <button 
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
          onClick={() => console.log('Create new group clicked')} // Placeholder for modal/navigation
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Group
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No Groups Yet!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start collaborating by creating a new group.</p>
          <button 
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg inline-flex items-center transition duration-150 ease-in-out"
            onClick={() => console.log('Create new group clicked')} // Placeholder
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Group
          </button>
        </div>
      )}

      {/* Groups List */}
      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link 
              key={group._id}
              to={`/groups/${group._id}`} // Link to group detail page (to be created)
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-accent dark:border-gray-700"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-primary dark:text-indigo-400 truncate">{group.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 truncate h-10">{group.description || 'No description available.'}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                  <span>{group.memberCount} Member{group.memberCount !== 1 ? 's' : ''}</span>
                  <span>Created by {group.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage; 