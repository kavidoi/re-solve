import React, { useState, useEffect } from 'react';
import { fetchIncomingRequests, acceptFriendRequest, rejectFriendRequest } from '../../api/friends';

const PendingRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({});

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncomingRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error loading friend requests:', err);
      setError('Failed to load friend requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id) => {
    setActionStatus(prev => ({ ...prev, [id]: { type: 'loading', message: 'Accepting...' } }));
    try {
      await acceptFriendRequest(id);
      setActionStatus(prev => ({ ...prev, [id]: { type: 'success', message: 'Accepted' } }));
      loadRequests();
    } catch (err) {
      console.error('Error accepting request:', err);
      const msg = err.response?.data?.message || 'Failed to accept';
      setActionStatus(prev => ({ ...prev, [id]: { type: 'error', message: msg } }));
    }
  };

  const handleReject = async (id) => {
    setActionStatus(prev => ({ ...prev, [id]: { type: 'loading', message: 'Rejecting...' } }));
    try {
      await rejectFriendRequest(id);
      setActionStatus(prev => ({ ...prev, [id]: { type: 'success', message: 'Rejected' } }));
      loadRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      const msg = err.response?.data?.message || 'Failed to reject';
      setActionStatus(prev => ({ ...prev, [id]: { type: 'error', message: msg } }));
    }
  };

  if (loading) return <div>Loading friend requests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (requests.length === 0) return <div className="text-gray-500 dark:text-gray-400 mt-4">No incoming friend requests.</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-accent dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">Friend Requests</h3>
      <ul className="space-y-3">
        {requests.map(req => (
          <li key={req.requestId} className="flex items-center justify-between p-3 bg-secondary dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600">
                <span className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300">
                  {req.requester.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </span>
              <div>
                <p className="font-medium dark:text-white">{req.requester.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{req.requester.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAccept(req.requestId)}
                disabled={actionStatus[req.requestId]?.type === 'loading'}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
              >
                {actionStatus[req.requestId]?.type === 'loading' ? '...' : 'Accept'}
              </button>
              <button
                onClick={() => handleReject(req.requestId)}
                disabled={actionStatus[req.requestId]?.type === 'loading'}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
              >
                {actionStatus[req.requestId]?.type === 'loading' ? '...' : 'Reject'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingRequestsList;
