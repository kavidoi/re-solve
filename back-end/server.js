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

// Connect to Database
connectDB();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
); // Security headers (CSP disabled for inline scripts)

// CORS configuration: allow all origins in development, restrict to CORS_ORIGIN in production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    // In production, only allow requests from the specified origin
    if (origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    callback(new Error('CORS policy violation: ' + origin));
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  credentials: true,
};
app.use(cors(corsOptions)); // Enable CORS with options

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

// Serve React build (SPA) for all other routes
app.use(express.static(path.join(__dirname, '../front-end/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../front-end/dist', 'index.html'));
});

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
