import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/animations.css';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';
import { Auth0Provider } from '@auth0/auth0-react';
import './i18n';

// Set axios base URL for production (Render) or leave undefined for dev proxy
// Base URL: use VITE_API_URL if provided, otherwise use current origin
const apiBaseUrl = import.meta.env.VITE_API_URL ?? window.location.origin;
axios.defaults.baseURL = apiBaseUrl;

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
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
); 