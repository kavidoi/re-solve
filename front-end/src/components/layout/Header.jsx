import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../ui/DarkModeToggle';
import { Handshake, LogOut, UserCircle, Users, LayoutDashboard, Activity, UserPlus, Settings, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out" 
                  id="user-menu-button" 
                  aria-expanded={dropdownOpen} 
                  aria-haspopup="true"
                >
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 ring-1 ring-gray-300 dark:ring-gray-700 mr-1">
                    <span className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                  </span>
                  <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">{user?.name || 'User'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
                
                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition transform ease-out duration-100 scale-in"
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.signedInAs')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      role="menuitem"
                    >
                      <UserCircle className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      {t('profile.yourProfile')}
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      role="menuitem"
                    >
                      <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      {t('profile.settings')}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      role="menuitem"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
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