# Rural Connect AI - Frontend Only Startup Script
# Use this if you don't have MongoDB installed and just want to test the voice interface

Write-Host "🌏 Starting Rural Connect AI Frontend..." -ForegroundColor Green
Write-Host "   (Frontend only - no backend services)" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 Starting frontend development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 The application will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "✨ You can test the voice interface features:" -ForegroundColor Cyan
Write-Host "   - Voice commands (search, navigate, help)" -ForegroundColor Cyan
Write-Host "   - Speech-to-text and text-to-speech" -ForegroundColor Cyan
Write-Host "   - Voice settings customization" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Note: Backend features won't work without the backend server" -ForegroundColor Yellow
Write-Host "   To run the full stack, use: .\start-local.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
