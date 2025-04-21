require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

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
app.use(cors()); // Enable CORS
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../front-end/dist')));
// Catch-all: serve index.html for any route not starting with /api
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
