#!/bin/bash

echo "🔄 Restarting development server..."

# Ensure dev env
export NODE_ENV=development

# Detect and log database target (local safety)
DB_URL="${DEV_SQLITE_PATH:-./.data/dev.sqlite}"
# Strip leading file: if present (aligns with src/server/db/client.ts)
DB_FILE="${DB_URL#file:}"
if command -v realpath >/dev/null 2>&1; then
  DB_FILE_ABS="$(realpath "$DB_FILE" 2>/dev/null || echo "$DB_FILE")"
else
  DB_FILE_ABS="$DB_FILE"
fi
echo "🗄️  Database target: Local SQLite ($DB_FILE_ABS)"
if [ -f "$DB_FILE" ]; then
  SIZE="$(du -h "$DB_FILE" 2>/dev/null | cut -f1)"
  echo "   - Exists: yes (${SIZE:-unknown size})"
else
  echo "   - Exists: no (will be created on first write)"
fi
if env | grep -q '^DB=' >/dev/null 2>&1; then
  echo "⚠️  Warning: DB env var is set in this shell; dev server uses local SQLite unless Cloudflare env is injected."
fi

# Kill all Node.js processes
echo "⏹️  Killing all Node.js processes..."
pkill -f "node"
pkill -f "next"
pkill -f "npm"
pkill -f "drizzle" 2>/dev/null || true

# Kill processes on common development ports
echo "🔌 Killing processes on ports 3000, 3001, 3002, 3003, 4996..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true
lsof -ti:4996 | xargs kill -9 2>/dev/null || true

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next

# Clean node_modules cache
echo "🧹 Cleaning node_modules cache..."
rm -rf node_modules/.cache

# Wait a moment
echo "⏳ Waiting 2 seconds..."
sleep 2

# Always run local DB inspect (non-fatal)
echo "🔎 Inspecting local database (.data/dev.sqlite)..."
npm run db:inspect:local || true

# Start Drizzle Studio on fixed port and open browser
echo "🛠️  Starting Drizzle Studio on port 4996..."
nohup npx drizzle-kit studio --port 4996 >/dev/null 2>&1 &

echo "🌐 Opening Drizzle Studio in browser..."
# Use macOS 'open' to launch default browser; ignore errors on other OSes
sleep 1
open "https://local.drizzle.studio/?port=4996" 2>/dev/null || true

# Auto-open app once dev server is ready
echo "🌐 Will open http://localhost:3000 when ready..."
(
  # wait up to ~30s for port 3000 to be in use
  for i in {1..60}; do
    if lsof -ti:3000 >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
  open "http://localhost:3000" 2>/dev/null || true
) &

# Start development server
echo "🚀 Starting development server..."
npm run dev



