import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a dark mode preference in localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage when dark mode changes
    localStorage.setItem('darkMode', isDarkMode);
    
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-500 dark:text-gray-400">Dark Mode</span>
      <label className="inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="hidden" 
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
        <div className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default DarkModeToggle; 