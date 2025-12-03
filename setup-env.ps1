# Rural Connect AI - Environment Setup Script
# Creates necessary .env files for local development

Write-Host "🔧 Setting up environment files..." -ForegroundColor Green

# Check if backend .env exists
if (!(Test-Path "backend/.env")) {
    Write-Host "📝 Creating backend/.env file..." -ForegroundColor Yellow
    
    $backendEnv = @"
# Backend Environment Configuration for Rural Connect AI
# Development environment

# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rural-connect-ai
MONGODB_TEST_URI=mongodb://localhost:27017/rural-connect-ai-test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=dev-secret-key-$(Get-Random -Maximum 99999)
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev-refresh-secret-key-$(Get-Random -Maximum 99999)
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_SALT_ROUNDS=12

# External APIs (Optional - leave empty if not using)
OPENAI_API_KEY=
WEATHER_API_KEY=
ELASTICSEARCH_URL=http://localhost:9200
"@
    
    $backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env already exists" -ForegroundColor Green
}

# Check if frontend .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    
    $frontendEnv = @"
# Frontend Environment Configuration
# Local development overrides

VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
NODE_ENV=development
"@
    
    $frontendEnv | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Note: The backend requires MongoDB to be running." -ForegroundColor Yellow
Write-Host "   You have two options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Option 1 (Recommended): Run without database services" -ForegroundColor Cyan
Write-Host "   - The frontend will work fine for testing the voice interface" -ForegroundColor Cyan
Write-Host "   - Backend will show connection errors but won't crash" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Option 2: Install and run MongoDB locally" -ForegroundColor Cyan
Write-Host "   - Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
Write-Host "   - Or use Docker: docker run -d -p 27017:27017 mongo:6.0" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to start! Run: .\start-local.ps1" -ForegroundColor Green
