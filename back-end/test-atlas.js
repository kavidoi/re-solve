const mongoose = require('mongoose');

// Use the connection string directly (for testing only)
// Note: Don't put credentials directly in code for production
const uri = "mongodb+srv://kavidoi:dOgCIqLhm6gfZJi7@resolve.x0ktxul.mongodb.net/resolve?retryWrites=true&w=majority&appName=Resolve";

console.log('=== MongoDB Atlas Connection Test ===');
console.log('Testing connection to Atlas cluster...');

// Attempt connection with basic options
mongoose.connect(uri, {})
  .then(() => {
    console.log('✅ CONNECTED SUCCESSFULLY TO ATLAS!');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ CONNECTION FAILED');
    console.log('Error type:', err.name);
    console.log('Error message:', err.message);
    
    // Try to get more detailed authentication error info
    if (err.name === 'MongoServerError' && err.code === 18) {
      console.log('Authentication failed - check username and password');
    }
    
    process.exit(1);
  }); 