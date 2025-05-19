require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const path = require('path');

// Import route files
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const balanceRoutes = require('./routes/balanceRoutes'); // Import balance routes
const activityRoutes = require('./routes/activityRoutes'); // Import activity routes
const expenseRoutes = require('./routes/expenseRoutes'); // Import expense routes
const friendRoutes = require('./routes/friendRoutes'); // Import friend routes

// Create Express app
const app = express();

// Disable CORS entirely for maximum compatibility
// This creates a wide-open CORS policy which is fine for a development/demo environment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Critical: Global handler for all OPTIONS requests
// This must be placed BEFORE other routes
app.options('*', (req, res) => {
  console.log('Global OPTIONS handler for:', req.url);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.sendStatus(200);
});

// Connect to Database
connectDB();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
); // Security headers (CSP disabled for inline scripts)

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logging

// Middleware to remove CSP header so inline scripts can run
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});

// Mount API routes
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/balance', balanceRoutes); // Mount balance routes
app.use('/api/activity', activityRoutes); // Mount activity routes
app.use('/api/expenses', expenseRoutes); // Mount expense routes
app.use('/api/friends', friendRoutes); // Mount friend routes

// Add health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// In production, we'll use separate frontend/backend services
// Only serve static files if the public directory exists
if (process.env.NODE_ENV === 'production') {
  // Check if public directory exists first
  const publicPath = path.join(__dirname, 'public');
  try {
    if (require('fs').existsSync(publicPath)) {
      app.use(express.static(publicPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
      });
    } else {
      console.log('Public directory not found - running in API-only mode');
    }
  } catch (err) {
    console.log('Error checking for public directory:', err);
  }
}

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('--- ERROR CAUGHT BY GLOBAL HANDLER ---');
    console.error(err);
    // Provide detailed error in development, generic in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ message: 'Something went wrong!' });
    } else {
        res.status(500).json({
            message: err.message || 'Something went wrong!',
            stack: err.stack,
            error: err
        });
    }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
