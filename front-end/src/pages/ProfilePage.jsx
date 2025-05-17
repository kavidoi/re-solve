import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, CreditCard } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 h-32 flex items-end p-6">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 border-4 border-white flex items-center justify-center text-2xl font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-indigo-100">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('profile.information')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.name')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.memberSince')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('profile.stats')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.totalExpenses')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">$0.00</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.totalGroups')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.totalFriends')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.settledExpenses')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('profile.paymentMethods')}</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-600 dark:text-gray-300">{t('profile.noPaymentMethods')}</p>
              </div>
              
              <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                {t('profile.addMethod')}
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-colors">
              {t('profile.editProfile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
