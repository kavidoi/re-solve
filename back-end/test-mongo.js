require('dotenv').config();
const mongoose = require('mongoose');

// Get the connection string from environment variable
const uri = process.env.MONGODB_URI;

console.log('=== MongoDB Connection Test ===');
console.log(`Connection string (partially masked): ${maskConnectionString(uri)}`);

// Attempt connection with basic options and detailed error logging
mongoose.connect(uri, {})
  .then(() => {
    console.log('✅ CONNECTED SUCCESSFULLY');
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
    
    // Check if URI format is valid
    try {
      const parsedUri = new URL(uri);
      console.log('URI format valid');
      console.log('Protocol:', parsedUri.protocol);
      console.log('Hostname:', parsedUri.hostname);
      console.log('Database:', parsedUri.pathname.substring(1));
      
      // Check for auth info
      if (parsedUri.username) {
        console.log('Username present in URI');
      } else {
        console.log('WARNING: No username in URI');
      }
      
      if (parsedUri.password) {
        console.log('Password present in URI (masked)');
      } else {
        console.log('WARNING: No password in URI');
      }
    } catch (parseErr) {
      console.log('URI format is invalid:', parseErr.message);
    }
    
    process.exit(1);
  });

// Helper function to mask the password in the connection string for logging
function maskConnectionString(uri) {
  if (!uri) return 'undefined/null';
  
  try {
    // Basic masking for mongodb+srv://user:pass@cluster...
    return uri.replace(/(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$4');
  } catch (e) {
    return 'Could not mask - invalid format';
  }
} 