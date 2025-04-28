import React, { useState, useEffect, useCallback } from 'react';
import UserSummary from '../components/dashboard/UserSummary';
import QuickActions from '../components/dashboard/QuickActions';
import BalanceOverview from '../components/dashboard/BalanceOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import GroupsList from '../components/dashboard/GroupsList';
import FriendsList from '../components/dashboard/FriendsList';
import PendingRequestsList from '../components/dashboard/PendingRequestsList';
import AddExpenseModal from '../components/ui/AddExpenseModal';
import AddFriendModal from '../components/ui/AddFriendModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: null, type: null });
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState({ message: null, type: null });
  
  // Lifted state
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(null);

  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(null);

  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);

  // Get user for mapping 'You' if needed (optional, backend handles it now)
  const { user } = useAuth();

  // --- Fetching Functions --- 
  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      setGroupsError(null);
      const response = await axios.get('/api/groups');
      setGroups(response.data || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroupsError('Failed to load groups.');
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const response = await axios.get('/api/balance/summary');
      setBalanceData(response.data);
    } catch (err) {
      console.error("Error fetching balance summary:", err);
      setBalanceError('Failed to load balance summary.');
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      setActivityLoading(true);
      setActivityError(null);
      const response = await axios.get('/api/activity/recent');
      setActivities(response.data || []);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      setActivityError('Failed to load recent activity.');
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Fetch all data on initial mount
  useEffect(() => {
    fetchGroups();
    fetchBalance();
    fetchActivity();
    // Add fetchFriends if/when implemented
  }, [fetchGroups, fetchBalance, fetchActivity]); // Add fetch functions as dependencies

  // Effect to toggle body overflow
  useEffect(() => {
    if (isExpenseModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup function to remove the class if the component unmounts while modal is open
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isExpenseModalOpen]);
  
  const handleAddExpense = () => {
    setIsExpenseModalOpen(true);
    setSaveStatus({ message: null, type: null });
  };
  
  const handleCloseModal = () => {
    setIsExpenseModalOpen(false);
  };
  
  const handleSaveExpense = async (expenseData) => {
    setSaveStatus({ message: 'Saving...', type: 'loading' });
    try {
      const apiPayload = { 
        ...expenseData,
        amount: parseFloat(expenseData.amount), // Convert amount string to number
        // Backend now handles mapping 'You' and user names to IDs
      };
      
      if (isNaN(apiPayload.amount) || apiPayload.amount <= 0) {
          setSaveStatus({ message: 'Invalid amount entered.', type: 'error' });
          return; // Stop submission if amount is invalid after conversion
      }

      const response = await axios.post('/api/expenses', apiPayload);
      
      console.log('Expense saved successfully:', response.data);
      setSaveStatus({ message: 'Expense saved!', type: 'success' });

      // --- REFETCH DATA ---
      fetchBalance(); 
      fetchActivity();
      // Optionally refetch groups if needed
      // fetchGroups(); 

      setTimeout(() => {
        handleCloseModal();
      }, 1500);

    } catch (err) {
      console.error('Error saving expense:', err.response?.data?.message || err.message);
      setSaveStatus({ message: err.response?.data?.message || 'Failed to save expense.', type: 'error' });
    }
  };

  const handleAddFriendClick = () => {
    setIsAddFriendModalOpen(true);
    setFriendRequestStatus({ message: null, type: null }); // Clear status
  };

  const handleCloseAddFriendModal = () => {
    setIsAddFriendModalOpen(false);
  };

  // Updated function to send friend request API call
  const handleSendFriendRequest = async (identifier) => {
    console.log('Attempting to add friend with identifier:', identifier);
    setFriendRequestStatus({ message: 'Sending request...', type: 'loading' });

    try {
      // Make the actual API Call
      const response = await axios.post('/api/friends/request', { identifier });
      
      console.log('Friend request sent successfully:', response.data);
      setFriendRequestStatus({ message: response.data.message || 'Friend request sent!', type: 'success' });

      // Close modal after delay
      setTimeout(() => {
        handleCloseAddFriendModal();
      }, 1500);

    } catch (err) {
      console.error('Error sending friend request:', err.response?.data?.message || err.message);
      // Display the specific error from the backend
      setFriendRequestStatus({ message: err.response?.data?.message || 'Failed to send request.', type: 'error' });
      // Keep modal open on error to allow correction or inform user
    }
    // No final setLoading here as it's handled by status message change
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Sidebar */}
      <aside className="w-full md:w-1/4 space-y-6">
        <UserSummary />
        <QuickActions 
          onAddExpense={handleAddExpense}
          onCreateGroup={() => console.log('Create group clicked')}
          onAddFriend={handleAddFriendClick}
        />
        <GroupsList 
           groups={groups}
           loading={groupsLoading}
           error={groupsError}
        />
      </aside>
      
      {/* Main Dashboard */}
      <div className="w-full md:w-3/4 space-y-6">
        <BalanceOverview 
          balanceData={balanceData}
          loading={balanceLoading}
          error={balanceError}
        />
        <RecentActivity 
          activities={activities}
          loading={activityLoading}
          error={activityError}
        />
        <PendingRequestsList />
        <FriendsList />
      </div>
      
      {/* Modals */}
      <AddExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
      />
      <AddFriendModal 
        isOpen={isAddFriendModalOpen}
        onClose={handleCloseAddFriendModal}
        onSendRequest={handleSendFriendRequest}
        status={friendRequestStatus}
      />
    </div>
  );
};

export default Dashboard; 