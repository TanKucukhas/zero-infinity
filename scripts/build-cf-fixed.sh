#!/bin/bash

# Cloudflare Pages build script with proper OpenNext configuration

echo "🔧 Starting Cloudflare build..."

# Clean previous builds
rm -rf .next .open-next

# Run OpenNext Cloudflare build (this handles Next.js build internally)
echo "☁️  Building for Cloudflare with OpenNext..."
npx opennextjs-cloudflare build

# Ensure the assets directory exists and has proper structure
if [ ! -d ".open-next/assets" ]; then
  echo "❌ Assets directory not found!"
  exit 1
fi

# Create a simple index.html if it doesn't exist (fallback)
if [ ! -f ".open-next/assets/index.html" ]; then
  echo "📄 Creating fallback index.html..."
  cat > ".open-next/assets/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Zero Infinity</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div id="__next"></div>
    <script>
        // Redirect to contacts page
        window.location.href = '/contacts';
    </script>
</body>
</html>
EOF
fi

echo "✅ Build complete!"
echo "📁 Assets directory: .open-next/assets"
echo "🚀 Ready for Cloudflare Pages deployment"

