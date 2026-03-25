#!/bin/bash
# Start local development environment

set -e

echo "🚀 Starting Niche CRM Local Test Environment"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "📝 Creating .env from template..."
  cp .env.example .env
  echo "⚠️  Please update .env with your real API keys!"
  echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check if running on non-standard port
PORT=${PORT:-5173}

echo "✅ Environment ready!"
echo ""
echo "📍 Starting development server on http://localhost:$PORT"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev          - Start dev server"
echo "   npm test             - Run tests"
echo "   npm run test:ui      - Interactive test UI"
echo "   npm run build        - Production build"
echo ""
echo "🌐 Visit: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the dev server
npm run dev
