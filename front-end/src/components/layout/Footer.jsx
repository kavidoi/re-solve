import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-accent dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {currentYear} Re:solve. All rights reserved.
        </p>
        {/* Optionally add more links or info here */}
      </div>
    </footer>
  );
};

export default Footer; 