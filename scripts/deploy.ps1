# PowerShell Deployment Script for Rural Connect AI
# Windows-compatible version of the deployment script

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ErrorActionPreference = "Stop"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    try {
        docker --version | Out-Null
        docker info | Out-Null
        Write-Success "Docker is available and running"
    }
    catch {
        Write-Error "Docker is not installed or not running"
        exit 1
    }
    
    # Check Docker Compose
    try {
        docker-compose --version | Out-Null
        Write-Success "Docker Compose is available"
    }
    catch {
        Write-Error "Docker Compose is not installed"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Load environment variables
function Import-Environment {
    $envFile = Join-Path $ProjectRoot ".env.$Environment"
    
    if (Test-Path $envFile) {
        Write-Info "Loading environment variables from $envFile"
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
    else {
        Write-Warning "Environment file $envFile not found"
        if ($Environment -eq "production") {
            Write-Error "Production environment file is required"
            exit 1
        }
    }
}

# Build Docker images
function Build-Images {
    Write-Info "Building Docker images..."
    
    Set-Location $ProjectRoot
    
    try {
        if ($Environment -eq "development") {
            docker-compose -f docker-compose.dev.yml build
        }
        else {
            docker-compose build
        }
        Write-Success "Images built successfully"
    }
    catch {
        Write-Error "Failed to build images: $_"
        exit 1
    }
}

# Deploy services
function Deploy-Services {
    Write-Info "Deploying services..."
    
    Set-Location $ProjectRoot
    
    try {
        if ($Environment -eq "development") {
            docker-compose -f docker-compose.dev.yml up -d
        }
        else {
            docker-compose up -d
        }
        Write-Success "Services deployed successfully"
    }
    catch {
        Write-Error "Failed to deploy services: $_"
        exit 1
    }
}

# Health check
function Test-Health {
    Write-Info "Performing health checks..."
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        Write-Info "Health check attempt $attempt/$maxAttempts"
        
        $frontendHealthy = $false
        $backendHealthy = $false
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "Frontend is healthy"
                $frontendHealthy = $true
            }
        }
        catch {
            Write-Info "Frontend health check failed"
        }
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "Backend is healthy"
                $backendHealthy = $true
            }
        }
        catch {
            Write-Info "Backend health check failed"
        }
        
        if ($frontendHealthy -and $backendHealthy) {
            Write-Success "All services are healthy"
            return $true
        }
        
        Start-Sleep -Seconds 10
        $attempt++
    }
    
    Write-Error "Health check failed after $maxAttempts attempts"
    return $false
}

# Cleanup old images
function Remove-OldImages {
    Write-Info "Cleaning up old Docker images..."
    
    try {
        # Remove dangling images
        docker image prune -f
        Write-Success "Cleanup completed"
    }
    catch {
        Write-Warning "Cleanup failed: $_"
    }
}

# Main deployment function
function Start-Deployment {
    Write-Info "Starting deployment of Rural Connect AI"
    Write-Info "Environment: $Environment"
    Write-Info "Version: $Version"
    
    Test-Prerequisites
    Import-Environment
    Build-Images
    Deploy-Services
    
    if (Test-Health) {
        Write-Success "Deployment completed successfully!"
        Remove-OldImages
    }
    else {
        Write-Error "Deployment failed health check"
        exit 1
    }
}

# Run deployment
try {
    Start-Deployment
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}