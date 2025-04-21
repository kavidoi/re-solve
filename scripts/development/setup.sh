#!/bin/bash

echo "🚀 Setting up development environment..."

# Install back-end dependencies
echo "📦 Installing back-end dependencies..."
cd ../../back-end
npm install

# Install front-end dependencies
echo "📦 Installing front-end dependencies..."
cd ../front-end
npm install

echo "✅ Setup complete!" 