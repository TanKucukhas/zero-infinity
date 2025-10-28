#!/bin/bash

# Cloudflare Pages build script with workaround for missing manifest file

echo "🔧 Starting Cloudflare build..."

# Clean previous builds
rm -rf .next .open-next

# Run Next.js build
npm run build

# Create missing manifest file if it doesn't exist
MANIFEST_DIR=".next/standalone/.next/server/app/(dashboard)"
MANIFEST_FILE="$MANIFEST_DIR/page_client-reference-manifest.js"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "⚠️  Creating missing manifest file..."
  mkdir -p "$MANIFEST_DIR"
  echo '{}' > "$MANIFEST_FILE"
fi

# Run OpenNext Cloudflare build (skip Next.js build since we already did it)
npx opennextjs-cloudflare build --skipBuild

echo "✅ Build complete!"

