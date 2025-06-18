# This script builds and deploys the backend to Fly.io

$ErrorActionPreference = "Stop"

Write-Host "Starting RealTaste Backend Deployment to Fly.io..." -ForegroundColor Green

# Check if fly CLI is installed
try {
    fly version | Out-Null
} catch {
    Write-Host "Fly CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   PowerShell: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    Write-Host "   Or visit: https://fly.io/docs/getting-started/installing-flyctl/" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the backend directory
if (-not (Test-Path "fly.toml")) {
    Write-Host "fly.toml not found. Please run this script from the backend directory." -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Blue
Set-Location ..
npm run build:shared
npm run build:backend
Set-Location backend

# Deploy to Fly.io
Write-Host "Deploying to Fly.io..." -ForegroundColor Blue
fly deploy

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Your API should be available at: https://realtaste-api.fly.dev" -ForegroundColor Cyan
Write-Host "Health check: https://realtaste-api.fly.dev/health" -ForegroundColor Cyan

# Check deployment status
Write-Host "Checking deployment status..." -ForegroundColor Blue
fly status

Write-Host "RealTaste Backend is now live!" -ForegroundColor Green
