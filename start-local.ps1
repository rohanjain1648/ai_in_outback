# Rural Connect AI - Local Development Startup Script

Write-Host "🌏 Starting Rural Connect AI Platform..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

Write-Host "🏗️ Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    Write-Host "🚀 Starting development servers..." -ForegroundColor Yellow
    
    # Start backend in background
    Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-Command", "cd backend; npm run dev" -WindowStyle Normal
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend
    Write-Host "🎨 Starting frontend development server..." -ForegroundColor Cyan
    Write-Host "📱 The application will be available at: http://localhost:5173" -ForegroundColor Green
    Write-Host "🔧 Backend API will be available at: http://localhost:3001" -ForegroundColor Green
    Write-Host "" 
    Write-Host "🎉 Rural Connect AI is starting up!" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
    
    npm run dev
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}