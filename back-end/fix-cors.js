// This file contains a complete Express server that properly handles CORS
// Copy the relevant sections to your server.js file

const express = require('express');
const app = express();

// CORS handling - MUST be the first middleware
app.use((req, res, next) => {
  // Always respond to OPTIONS requests for preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.header('Access-Control-Allow-Origin', 'https://resolve-frontend-n6tj.onrender.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
    return;
  }

  // For non-OPTIONS requests
  res.header('Access-Control-Allow-Origin', 'https://resolve-frontend-n6tj.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Important: Mount routes AFTER the CORS middleware
// app.use('/api/auth', authRoutes);

module.exports = app;
