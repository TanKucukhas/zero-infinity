#!/bin/bash

echo "🔄 Restarting development server..."

# Kill all Node.js processes
echo "⏹️  Killing all Node.js processes..."
pkill -f "node"
pkill -f "next"
pkill -f "npm"

# Kill processes on common development ports
echo "🔌 Killing processes on ports 3000, 3001, 3002, 3003..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next

# Clean node_modules cache
echo "🧹 Cleaning node_modules cache..."
rm -rf node_modules/.cache

# Wait a moment
echo "⏳ Waiting 2 seconds..."
sleep 2

# Start development server
echo "🚀 Starting development server..."
npm run dev



