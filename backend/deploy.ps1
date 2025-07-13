# =============================================================================
# REALTASTE BACKEND DEPLOYMENT SCRIPT
# =============================================================================
# Automated deployment script for RealTaste backend to Fly.io
# This script handles the complete deployment process with validation

param(
    [switch]$SkipHealthCheck,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Progress = "Blue"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    
    if ($Prefix) {
        Write-Host "$Prefix " -NoNewline -ForegroundColor $Color
    }
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "Checking deployment prerequisites..." $Colors.Progress "🔍"
    
    # Check Fly CLI installation
    if (!(Get-Command "fly" -ErrorAction SilentlyContinue)) {
        Write-ColorOutput "Fly CLI not found!" $Colors.Error "❌"
        Write-ColorOutput "Install from: https://fly.io/docs/getting-started/installing-flyctl/" $Colors.Warning
        throw "Missing Fly CLI"
    }
    
    # Check authentication
    try {
        $flyAuth = fly auth whoami 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Not authenticated"
        }
        Write-ColorOutput "Authenticated as: $flyAuth" $Colors.Success "✅"
    } catch {
        Write-ColorOutput "Not logged in to Fly.io" $Colors.Error "❌"
        Write-ColorOutput "Please run: fly auth login" $Colors.Warning
        throw "Authentication required"
    }
    
    # Verify project structure
    $requiredFiles = @("fly.toml", "backend/Dockerfile", "backend/package.json")
    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            Write-ColorOutput "Required file missing: $file" $Colors.Error "❌"
            throw "Invalid project structure"
        }
    }
    
    Write-ColorOutput "All prerequisites satisfied" $Colors.Success "✅"
}

function Start-Deployment {
    Write-ColorOutput "Starting deployment to Fly.io..." $Colors.Progress "🚀"
    
    # Navigate to project root
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    $projectRoot = Split-Path -Parent $scriptPath
    Set-Location $projectRoot
    
    if ($Verbose) {
        Write-ColorOutput "Working directory: $(Get-Location)" $Colors.Info "📁"
    }
    
    # Deploy application
    Write-ColorOutput "Building and deploying application..." $Colors.Progress "🔨"
    
    if ($Verbose) {
        fly deploy --verbose
    } else {
        fly deploy
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment failed"
    }
    
    Write-ColorOutput "Deployment completed successfully" $Colors.Success "✅"
}

function Test-Deployment {
    if ($SkipHealthCheck) {
        Write-ColorOutput "Skipping health check as requested" $Colors.Warning "⏭️"
        return
    }
    
    Write-ColorOutput "Validating deployment..." $Colors.Progress "🔍"
    
    # Check application status
    Write-ColorOutput "Checking application status..." $Colors.Info "📊"
    fly status
    
    # Test health endpoint
    Write-ColorOutput "Testing health endpoint..." $Colors.Info "🏥"
    
    $maxRetries = 3
    $retryDelay = 5
    
    for ($i = 1; $i -le $maxRetries; $i++) {
        try {
            $response = Invoke-RestMethod -Uri "https://realtaste.fly.dev/health" -Method Get -TimeoutSec 15
            Write-ColorOutput "Health check passed" $Colors.Success "✅"
            
            if ($Verbose -and $response) {
                Write-ColorOutput "Response: $($response | ConvertTo-Json -Compress)" $Colors.Info
            }
            return
        } catch {
            if ($i -eq $maxRetries) {
                Write-ColorOutput "Health check failed after $maxRetries attempts" $Colors.Error "❌"
                Write-ColorOutput "Error: $($_.Exception.Message)" $Colors.Warning
                throw "Health check failed"
            } else {
                Write-ColorOutput "Health check attempt $i failed, retrying in $retryDelay seconds..." $Colors.Warning "⚠️"
                Start-Sleep -Seconds $retryDelay
            }
        }
    }
}

function Show-DeploymentSummary {
    Write-ColorOutput "Deployment Summary" $Colors.Success "🎉"
    Write-Host ""
    Write-ColorOutput "Backend API: https://realtaste.fly.dev" $Colors.Info "🌐"
    Write-ColorOutput "Health Check: https://realtaste.fly.dev/health" $Colors.Info "🏥"
    Write-ColorOutput "Fly Dashboard: https://fly.io/apps/realtaste" $Colors.Info "📊"
    Write-Host ""
    Write-ColorOutput "Next steps:" $Colors.Info "📋"
    Write-ColorOutput "  1. Update frontend VITE_API_URL to point to the deployed backend" $Colors.Info
    Write-ColorOutput "  2. Deploy frontend to Cloudflare Pages" $Colors.Info
    Write-ColorOutput "  3. Test end-to-end functionality" $Colors.Info
}

# Main execution
try {
    Write-ColorOutput "RealTaste Backend Deployment" $Colors.Success "🚀"
    Write-Host "" 
    
    Test-Prerequisites
    Start-Deployment
    Test-Deployment
    Show-DeploymentSummary
    
    Write-ColorOutput "Deployment process completed successfully!" $Colors.Success "🎉"
    
} catch {
    Write-ColorOutput "Deployment failed: $($_.Exception.Message)" $Colors.Error "❌"
    Write-ColorOutput "Check the logs above for more details" $Colors.Warning
    exit 1
}

# Usage examples:
# .\backend\deploy.ps1                    # Standard deployment
# .\backend\deploy.ps1 -Verbose           # Verbose output
# .\backend\deploy.ps1 -SkipHealthCheck   # Skip health validation
