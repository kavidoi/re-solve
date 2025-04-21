#!/bin/bash

echo "🚀 Starting development servers..."

# Start back-end server
echo "📡 Starting back-end server..."
cd ../../back-end
npm run dev &

# Start front-end server
echo "🌐 Starting front-end server..."
cd ../front-end
npm run dev &

# Wait for both processes
wait 