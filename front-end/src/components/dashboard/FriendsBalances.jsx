import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const FriendCard = ({ friend }) => {
  const getBgColor = () => {
    switch (friend.color) {
      case 'purple':
        return 'bg-purple-500';
      case 'blue':
        return 'bg-blue-500';
      case 'pink':
        return 'bg-pink-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-primary';
    }
  };
  
  return (
    <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg border border-accent dark:border-gray-600 transition hover:border-primary dark:hover:border-primary card-hover">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-12 h-12 rounded-full ${getBgColor()} flex items-center justify-center`}>
          <i className="fas fa-user text-white text-xl"></i>
        </div>
        <div>
          <p className="font-bold dark:text-white">{friend.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {friend.balance < 0 ? 'you owe' : 'owes you'}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className={`font-bold ${friend.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
          {formatCurrency(Math.abs(friend.balance))}
        </p>
        <div className="flex space-x-2">
          <button className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary hover:bg-opacity-20 transition">
            <i className="fas fa-comment-alt text-xs"></i>
          </button>
          <button className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary hover:bg-opacity-20 transition">
            <i className="fas fa-exchange-alt text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const FriendsBalances = ({ friends }) => {
  // Default friends data if none provided
  const defaultFriends = [
    {
      id: 1,
      name: 'Sarah Miller',
      balance: 15.00,
      color: 'purple'
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      balance: -50.00,
      color: 'blue'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      balance: 27.50,
      color: 'pink'
    }
  ];
  
  // Use provided friends or defaults
  const friendsData = friends || defaultFriends;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-accent dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Friends Balances</h2>
        <button className="text-primary hover:underline">All Friends</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friendsData.map(friend => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  );
};

export default FriendsBalances; 