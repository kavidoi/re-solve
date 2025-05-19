const cors = require('cors');

// Custom CORS middleware with less restrictive settings
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://resolve-frontend-n6tj.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Pre-flight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
};

module.exports = corsMiddleware;
