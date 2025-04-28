#!/bin/bash

echo "=== MongoDB Connection Test ==="

# Get the connection string from environment variable
URI="$MONGODB_URI"

if [ -z "$URI" ]; then
  echo "❌ ERROR: MONGODB_URI is empty or not set"
  exit 1
fi

# Show masked connection string 
MASKED_URI=$(echo $URI | sed 's/\(mongodb.*:\/\/[^:]*:\)[^@]*\(@.*\)/\1*****\2/')
echo "Connection string (masked): $MASKED_URI"

# Try a simple MongoDB connection using the mongo shell
echo "Testing connection..."

# Extract hostname from connection string
HOST=$(echo $URI | grep -o '[^/]*\.[^/]*\.mongodb.net')

if [ -z "$HOST" ]; then
  echo "❌ ERROR: Could not extract hostname from URI"
  exit 1
fi

echo "Hostname: $HOST"

# Check if shell is available
if ! command -v mongosh &> /dev/null; then
  echo "mongosh not available, using alternative test method..."
  
  # Use curl to test if the hostname is reachable
  echo "Testing if host is reachable..."
  if curl --connect-timeout 5 -s $HOST:27017 > /dev/null; then
    echo "✅ Host is reachable"
  else
    echo "❌ Cannot reach host: $HOST"
    echo "This may indicate network issues or incorrect hostname"
  fi
  
  # Create a simple Node.js script to test the connection
  echo "const mongoose = require('mongoose');
  mongoose.connect('$URI')
    .then(() => console.log('✅ Connected successfully'))
    .catch(e => {
      console.log('❌ Connection failed:', e.message);
      process.exit(1);
    });" > test_conn.js
  
  echo "Running Node.js test..."
  node test_conn.js
  rm test_conn.js
  
  exit 0
fi

# If mongosh is available, use it
echo "Testing with mongosh..."
mongosh "$URI" --eval "db.runCommand({ping:1})" --quiet

if [ $? -eq 0 ]; then
  echo "✅ Connection successful!"
else
  echo "❌ Connection failed"
  echo "Things to check:"
  echo "1. Verify username and password are correct"
  echo "2. Check if the database exists"
  echo "3. Ensure your IP is whitelisted (current Render range should be)"
  echo "4. Make sure the connection string format is correct"
fi 