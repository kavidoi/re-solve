#!/bin/bash

echo "🏗️  Building project for production..."

# Build back-end
echo "📦 Building back-end..."
cd ../../back-end
npm run build

# Build front-end
echo "🌐 Building front-end..."
cd ../front-end
npm run build

echo "✅ Build complete!" 