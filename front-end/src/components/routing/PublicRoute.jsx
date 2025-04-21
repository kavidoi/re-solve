import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optional: Show a loading spinner while auth status is being checked
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is authenticated, redirect away from public pages (e.g., to dashboard)
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render the public child component (Login, Register, Landing, etc.)
  return children;
};

export default PublicRoute; 