# Rural Connect AI - Development Startup Script
# Task 22: Final Integration and User Acceptance Testing

Write-Host "🌏 Rural Connect AI - Final Integration Testing" -ForegroundColor Green
Write-Host "Task 22: Starting application for final validation..." -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Running final integration checks..." -ForegroundColor Yellow
node scripts/final-integration-test.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Integration tests passed!" -ForegroundColor Green
    
    Write-Host "🚀 Starting Rural Connect AI application..." -ForegroundColor Yellow
    Write-Host "📱 Frontend will be available at: http://localhost:5173" -ForegroundColor Green
    Write-Host "🔧 Backend API will be available at: http://localhost:3001" -ForegroundColor Green
    Write-Host "" 
    Write-Host "🎉 Application starting - Task 22 completion in progress!" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in background
    Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-Command", "cd backend; npm run dev" -WindowStyle Normal
    
    # Wait for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend
    Write-Host "🎨 Starting frontend development server..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "❌ Integration tests failed. Please check the issues above." -ForegroundColor Red
    exit 1
}