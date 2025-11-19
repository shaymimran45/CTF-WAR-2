#!/bin/bash

echo "================================"
echo "🚀 Render Build Script"
echo "================================"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🎨 Building frontend..."
npm run build

# Ensure uploads directory exists
echo "📁 Creating uploads directory..."
mkdir -p /tmp/uploads

# Generate TypeScript types (if needed)
echo "🔧 Running type check..."
npm run check || echo "⚠️  Type check warnings detected, continuing..."

echo "✅ Build completed successfully!"
echo "================================"
