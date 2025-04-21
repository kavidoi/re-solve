import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import GroupsPage from './pages/GroupsPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicRoute from './components/routing/PublicRoute';
import DarkModeToggle from './components/ui/DarkModeToggle';

// Add CSS for animation classes
import './index.css';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      {isAuthenticated && <Header />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/friends" element={<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"><h1 className="text-2xl font-bold dark:text-white">Friends</h1><p className="dark:text-gray-300">Friends page coming soon</p></div>} />
          <Route path="/activity" element={<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"><h1 className="text-2xl font-bold dark:text-white">Activity</h1><p className="dark:text-gray-300">Activity page coming soon</p></div>} />

          {/* Fallback for authenticated users */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      {isAuthenticated && <Footer />}
      <div className="fixed bottom-4 right-4 z-50">
        <DarkModeToggle />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 