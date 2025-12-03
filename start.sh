#!/bin/bash

echo "================================"
echo "🚀 Starting CTF War"
echo "================================"

# Ensure uploads directory exists
mkdir -p /tmp/uploads

# Create admin user if not exists
echo "🔑 Setting up admin user..."
npx tsx api/src/scripts/createAdmin.ts || echo "Admin user already exists or setup skipped"

# Start the server
echo "🌐 Starting server..."
exec npm start