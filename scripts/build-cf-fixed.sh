#!/bin/bash

# Cloudflare Pages build script with workaround for missing manifest file

echo "🔧 Starting Cloudflare build..."

# Clean previous builds
rm -rf .next .open-next

# Run Next.js build
npm run build

# Create missing manifest files if they don't exist
MANIFEST_DIR=".next/standalone/.next/server/app/(dashboard)"
MANIFEST_FILE="$MANIFEST_DIR/page_client-reference-manifest.js"
PAGES_MANIFEST_FILE=".next/standalone/.next/server/pages-manifest.json"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "⚠️  Creating missing page manifest file..."
  mkdir -p "$MANIFEST_DIR"
  echo '{}' > "$MANIFEST_FILE"
fi

if [ ! -f "$PAGES_MANIFEST_FILE" ]; then
  echo "⚠️  Creating missing pages manifest file..."
  mkdir -p "$(dirname "$PAGES_MANIFEST_FILE")"
  echo '{}' > "$PAGES_MANIFEST_FILE"
fi

# Run OpenNext Cloudflare build (skip Next.js build since we already did it)
npx opennextjs-cloudflare build --skipBuild

echo "✅ Build complete!"

