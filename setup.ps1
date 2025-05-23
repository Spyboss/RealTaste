# RealTaste Setup Script for Windows PowerShell

Write-Host "🚀 Setting up RealTaste..." -ForegroundColor Green

# Check Node.js version
Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install shared package dependencies
Write-Host "📦 Installing shared package dependencies..." -ForegroundColor Yellow
Set-Location shared
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install shared dependencies" -ForegroundColor Red
    exit 1
}

# Build shared package
Write-Host "🔨 Building shared package..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build shared package" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location ../backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Go back to root
Set-Location ..

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy backend/.env.example to backend/.env and configure your Supabase credentials"
Write-Host "2. Copy frontend/.env.example to frontend/.env and configure your settings"
Write-Host "3. Set up your Supabase database using supabase/schema.sql"
Write-Host "4. Add sample data using supabase/seed.sql"
Write-Host "5. Run 'npm run dev' to start development servers"
Write-Host ""
Write-Host "📚 See docs/SETUP.md for detailed instructions" -ForegroundColor Yellow
