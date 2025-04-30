import React from 'react';
import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-secondary to-accent dark:from-gray-900 dark:via-gray-800 dark:to-black text-center relative overflow-hidden">
      
      {/* Logo and Title */}
      <div className="mb-8 flex flex-col items-center">
        <Handshake className="h-20 w-20 text-primary dark:text-indigo-400 mb-4" />
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Re:solve</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Modern Expense Sharing, Simplified.</p>
      </div>

      {/* Feature Highlights (Optional) */}
      <div className="max-w-2xl mb-12 text-gray-700 dark:text-gray-400">
        <p>Split bills with friends, track shared expenses, and settle up easily. Re:solve makes group finances transparent and stress-free.</p>
        {/* Add more feature points if desired */}
      </div>

      {/* Call to Action Buttons */}
      <div className="flex space-x-4">
        <Link 
          to="/login"
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
        >
          Login
        </Link>
        <Link 
          to="/register"
          className="bg-white dark:bg-gray-700 text-primary dark:text-white font-bold py-3 px-6 rounded-lg border border-primary dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-md transition duration-150 ease-in-out text-lg"
        >
          Register
        </Link>
      </div>

      {/* Footer/Copyright */}
      <div className="absolute bottom-4 left-0 w-full text-center text-sm text-gray-500 dark:text-gray-500 z-10">
        &copy; {new Date().getFullYear()} Re:solve
      </div>
    </div>
  );
};

export default LandingPage; 