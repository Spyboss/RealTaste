# RealTaste Complete Deployment Script
# This script helps deploy both frontend and backend

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All,
    [switch]$Check
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param($Message)
    Write-Host "`n🔄 $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Check prerequisites
function Check-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    } catch {
        Write-Error "Node.js is not installed or not in PATH"
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    } catch {
        Write-Error "npm is not installed or not in PATH"
        return $false
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Success "Git version: $gitVersion"
    } catch {
        Write-Error "Git is not installed or not in PATH"
        return $false
    }
    
    return $true
}

# Build the project
function Build-Project {
    Write-Step "Building the project..."
    
    try {
        npm run build
        Write-Success "Project built successfully"
    } catch {
        Write-Error "Build failed"
        throw
    }
}

# Deploy backend to Fly.io
function Deploy-Backend {
    Write-Step "Deploying backend to Fly.io..."
    
    # Check if fly CLI is installed
    try {
        fly version | Out-Null
        Write-Success "Fly CLI is installed"
    } catch {
        Write-Error "Fly CLI is not installed. Please install it first:"
        Write-Info "PowerShell: iwr https://fly.io/install.ps1 -useb | iex"
        return $false
    }
    
    # Check if we're authenticated
    try {
        fly auth whoami | Out-Null
        Write-Success "Authenticated with Fly.io"
    } catch {
        Write-Error "Not authenticated with Fly.io. Please run: fly auth login"
        return $false
    }
    
    # Deploy
    Set-Location backend
    try {
        fly deploy
        Write-Success "Backend deployed successfully"
        Write-Info "Backend URL: https://realtaste-api.fly.dev"
    } catch {
        Write-Error "Backend deployment failed"
        Set-Location ..
        return $false
    }
    Set-Location ..
    return $true
}

# Instructions for frontend deployment
function Deploy-Frontend {
    Write-Step "Frontend deployment instructions..."
    
    Write-Info "Frontend deployment is done through Cloudflare Pages:"
    Write-Host ""
    Write-Host "1. Push your code to GitHub:" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'Deploy to production'" -ForegroundColor Gray
    Write-Host "   git push origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Go to Cloudflare Pages dashboard:" -ForegroundColor Yellow
    Write-Host "   https://dash.cloudflare.com/pages" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Connect your GitHub repository" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Configure build settings:" -ForegroundColor Yellow
    Write-Host "   - Framework: Vite" -ForegroundColor Gray
    Write-Host "   - Build command: npm run build:frontend" -ForegroundColor Gray
    Write-Host "   - Build output: frontend/dist" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Set environment variables in Cloudflare Pages" -ForegroundColor Yellow
    Write-Host ""
    Write-Success "Check DEPLOYMENT.md for detailed instructions"
}

# Main execution
Write-Host "🚀 RealTaste Deployment Helper" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

if ($Check -or $All) {
    if (-not (Check-Prerequisites)) {
        exit 1
    }
}

if ($All -or $Backend -or $Frontend) {
    Build-Project
}

if ($All -or $Backend) {
    if (-not (Deploy-Backend)) {
        Write-Error "Backend deployment failed"
        exit 1
    }
}

if ($All -or $Frontend) {
    Deploy-Frontend
}

if ($All) {
    Write-Host ""
    Write-Success "Deployment process completed!"
    Write-Info "Next steps:"
    Write-Host "1. Complete frontend deployment via Cloudflare Pages" -ForegroundColor Yellow
    Write-Host "2. Test your application end-to-end" -ForegroundColor Yellow
    Write-Host "3. Monitor logs and performance" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔗 Useful links:" -ForegroundColor Cyan
    Write-Host "   Backend: https://realtaste-api.fly.dev/health" -ForegroundColor Gray
    Write-Host "   Fly.io Dashboard: https://fly.io/dashboard" -ForegroundColor Gray
    Write-Host "   Cloudflare Pages: https://dash.cloudflare.com/pages" -ForegroundColor Gray
}

if (-not ($Backend -or $Frontend -or $All -or $Check)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy-all.ps1 -All        # Deploy everything" -ForegroundColor Gray
    Write-Host "  .\deploy-all.ps1 -Backend    # Deploy backend only" -ForegroundColor Gray
    Write-Host "  .\deploy-all.ps1 -Frontend   # Show frontend instructions" -ForegroundColor Gray
    Write-Host "  .\deploy-all.ps1 -Check      # Check prerequisites only" -ForegroundColor Gray
}
