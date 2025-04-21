import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/animations.css';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';

// Set axios base URL for production (Render) or leave undefined for dev proxy
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Ensure dark mode is set immediately before render to prevent flashing
const savedMode = localStorage.getItem('darkMode');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedMode === 'true' || (savedMode === null && prefersDarkMode)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 