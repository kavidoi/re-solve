import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../ui/DarkModeToggle';
import { Handshake, LogOut, UserCircle, Users, LayoutDashboard, Activity, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeClassName = "text-primary dark:text-indigo-400 font-semibold";
  const inactiveClassName = "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-indigo-400";

  const navLinkClasses = ({ isActive }) => 
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out 
    ${isActive 
      ? 'bg-primary text-white' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 border-b border-accent dark:border-gray-700">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Handshake className="h-8 w-8 text-primary dark:text-indigo-400" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">{t('app.title')}</span>
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/dashboard" className={navLinkClasses}>
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              {t('nav.dashboard')}
            </NavLink>
            <NavLink to="/groups" className={navLinkClasses}>
              <Users className="h-4 w-4 mr-1.5" />
              {t('nav.groups')}
            </NavLink>
            <NavLink to="/friends" className={navLinkClasses}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              {t('nav.friends')}
            </NavLink>
            <NavLink to="/activity" className={navLinkClasses}>
              <Activity className="h-4 w-4 mr-1.5" />
              {t('nav.activity')}
            </NavLink>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <select
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="bg-secondary dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded py-1 px-2"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <DarkModeToggle />

          {isAuthenticated ? (
            <>
              <button className="hidden sm:inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out">
                {t('action.addExpense')}
              </button>
              <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                <span className="sr-only">Open user menu</span>
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 ring-1 ring-gray-300 dark:ring-gray-700">
                  <span className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-1 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                title={t('auth.logout')}
              >
                <LogOut className="h-6 w-6" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                {t('auth.login')}
              </Link>
              <Link to="/register" className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150 ease-in-out">
                {t('auth.register')}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header; 