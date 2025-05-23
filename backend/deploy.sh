#!/bin/bash

# RealTaste Backend Deployment Script for Fly.io
# This script builds and deploys the backend to Fly.io

set -e  # Exit on any error

echo "🚀 Starting RealTaste Backend Deployment to Fly.io..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI is not installed. Please install it first:"
    echo "   PowerShell: iwr https://fly.io/install.ps1 -useb | iex"
    echo "   Or visit: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "fly.toml" ]; then
    echo "❌ fly.toml not found. Please run this script from the backend directory."
    exit 1
fi

# Build the project
echo "📦 Building the project..."
cd ..
npm run build:shared
npm run build:backend
cd backend

# Deploy to Fly.io
echo "🚁 Deploying to Fly.io..."
fly deploy

echo "✅ Deployment completed!"
echo "🔗 Your API should be available at: https://realtaste-api.fly.dev"
echo "🏥 Health check: https://realtaste-api.fly.dev/health"

# Check deployment status
echo "📊 Checking deployment status..."
fly status

echo "🎉 RealTaste Backend is now live!"
