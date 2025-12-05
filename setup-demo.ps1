# Rural Connect AI - Demo Setup Script
# This script sets up everything you need for the hackathon demo

Write-Host "🌾 Rural Connect AI - Demo Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = $false

try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        $mongoRunning = $true
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  MongoDB not detected" -ForegroundColor Yellow
}

if (-not $mongoRunning) {
    Write-Host ""
    Write-Host "MongoDB is not running. Choose an option:" -ForegroundColor Yellow
    Write-Host "1. Start MongoDB with Docker (recommended)"
    Write-Host "2. I'll start MongoDB manually"
    Write-Host "3. Skip MongoDB (frontend only)"
    $choice = Read-Host "Enter choice (1-3)"
    
    if ($choice -eq "1") {
        Write-Host "🐳 Starting MongoDB with Docker..." -ForegroundColor Yellow
        docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest
        Start-Sleep -Seconds 5
        Write-Host "✅ MongoDB started" -ForegroundColor Green
    } elseif ($choice -eq "2") {
        Write-Host "⏸️  Please start MongoDB and press Enter to continue..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "⚠️  Skipping MongoDB - backend features won't work" -ForegroundColor Yellow
        $skipBackend = $true
    }
}

if (-not $skipBackend) {
    # Seed demo data
    Write-Host ""
    Write-Host "🌱 Seeding demo data..." -ForegroundColor Yellow
    Set-Location backend
    npm run seed:demo
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Demo data seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to seed demo data" -ForegroundColor Red
        Write-Host "   You can try manually: cd backend && npm run seed:demo" -ForegroundColor Yellow
    }
    Set-Location ..
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Start the frontend: npm run dev" -ForegroundColor White
Write-Host "3. Visit: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Demo Login:" -ForegroundColor Cyan
Write-Host "   Email: sarah@demo.com" -ForegroundColor White
Write-Host "   Password: demo123" -ForegroundColor White
Write-Host ""
Write-Host "📖 See DEMO_SETUP_GUIDE.md for full demo script" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to start services now
$startNow = Read-Host "Start backend and frontend now? (y/n)"
if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting services..." -ForegroundColor Green
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
    
    # Wait a bit for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Write-Host "✅ Services starting in new windows" -ForegroundColor Green
    Write-Host "   Backend: http://localhost:3001" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
}

Write-Host ""
Write-Host "Good luck with your demo! 🎬" -ForegroundColor Green
