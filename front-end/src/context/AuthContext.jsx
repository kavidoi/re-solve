import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create Context
const AuthContext = createContext(null);

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state for initial check

  // Check for existing user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set axios default header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (e) {
        console.error("Error parsing stored user info:", e);
        localStorage.removeItem('userInfo'); // Clear corrupted data
      }
    }
    setLoading(false); // Finished initial check
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Value provided to consuming components
  const value = {
    user,
    isAuthenticated: !!user,
    loading, // Provide loading state
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
}; 