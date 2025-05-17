import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Settings, User, Bell, Globe, Shield, CreditCard, Moon, Sun } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Change language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: <User className="h-5 w-5" /> },
    { id: 'account', label: t('settings.account'), icon: <Shield className="h-5 w-5" /> },
    { id: 'notifications', label: t('settings.notifications'), icon: <Bell className="h-5 w-5" /> },
    { id: 'payment', label: t('settings.payment'), icon: <CreditCard className="h-5 w-5" /> },
    { id: 'appearance', label: t('settings.appearance'), icon: <Settings className="h-5 w-5" /> },
    { id: 'language', label: t('settings.language'), icon: <Globe className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary dark:text-indigo-400" />
              {t('settings.title')}
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.profileSettings')}</h3>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-sm hover:bg-primary-dark transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('settings.name')}
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                          defaultValue={user?.name || ''}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('settings.email')}
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                          defaultValue={user?.email || ''}
                        />
                      </div>
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('settings.bio')}
                        </label>
                        <textarea
                          id="bio"
                          rows="3"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                          defaultValue=""
                        />
                      </div>
                      <div className="pt-2">
                        <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          {t('settings.saveChanges')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.accountSettings')}</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{t('settings.changePassword')}</h4>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('settings.currentPassword')}
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('settings.newPassword')}
                        </label>
                        <input
                          type="password"
                          id="new-password"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('settings.confirmPassword')}
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>
                      <div className="pt-2">
                        <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          {t('settings.updatePassword')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-red-600 dark:text-red-400">{t('settings.dangerZone')}</h4>
                    <div className="mt-4">
                      <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        {t('settings.deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.notificationSettings')}</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('settings.emailNotifications')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.emailNotificationsDesc')}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('settings.pushNotifications')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.pushNotificationsDesc')}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('settings.expenseAlerts')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.expenseAlertsDesc')}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.paymentSettings')}</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t('settings.noPaymentMethods')}</p>
                    <button className="mt-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      {t('settings.addPaymentMethod')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.appearanceSettings')}</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('settings.darkMode')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.darkModeDesc')}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.languageSettings')}</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`p-4 rounded-lg border-2 flex items-center ${i18n.language === 'en' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-800 font-medium">EN</span>
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 dark:text-white">English</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">English (US)</p>
                      </div>
                    </button>

                    <button
                      onClick={() => changeLanguage('es')}
                      className={`p-4 rounded-lg border-2 flex items-center ${i18n.language === 'es' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <span className="text-red-800 font-medium">ES</span>
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 dark:text-white">Español</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Spanish</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
