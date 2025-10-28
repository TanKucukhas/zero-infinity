#!/bin/bash

# Cloudflare Pages Build Script
# This script ensures proper build for Cloudflare Pages with OpenNext adapter

echo "🚀 Starting Cloudflare Pages build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf .open-next

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build with OpenNext Cloudflare adapter
echo "🔨 Building with OpenNext Cloudflare adapter..."
npx opennextjs-cloudflare build

echo "✅ Build completed successfully!"
