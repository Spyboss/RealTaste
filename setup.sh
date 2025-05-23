#!/bin/bash

# RealTaste Setup Script

echo "🚀 Setting up RealTaste..."

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Install shared package dependencies
echo "📦 Installing shared package dependencies..."
cd shared
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install shared dependencies"
    exit 1
fi

# Build shared package
echo "🔨 Building shared package..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build shared package"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy backend/.env.example to backend/.env and configure your Supabase credentials"
echo "2. Copy frontend/.env.example to frontend/.env and configure your settings"
echo "3. Set up your Supabase database using supabase/schema.sql"
echo "4. Add sample data using supabase/seed.sql"
echo "5. Run 'npm run dev' to start development servers"
echo ""
echo "📚 See docs/SETUP.md for detailed instructions"
