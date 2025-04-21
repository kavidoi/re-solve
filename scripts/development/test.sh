#!/bin/bash

echo "🧪 Running tests..."

# Run back-end tests
echo "📡 Running back-end tests..."
cd ../../back-end
npm test

# Run front-end tests
echo "🌐 Running front-end tests..."
cd ../front-end
npm test

echo "✅ Tests complete!" 