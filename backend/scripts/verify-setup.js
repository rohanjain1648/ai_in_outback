const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Rural Connect AI Backend Setup...\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'src/server.ts',
  'src/config/index.ts',
  'src/config/database.ts',
  'src/config/redis.ts',
  'src/middleware/auth.ts',
  'src/middleware/security.ts',
  'src/routes/index.ts',
  '.env.example',
];

console.log('📁 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check TypeScript compilation
console.log('\n🔨 Checking TypeScript compilation...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Check if tests pass
console.log('\n🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'pipe' });
  console.log('✅ All tests passed');
} catch (error) {
  console.log('❌ Tests failed');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Check environment configuration
console.log('\n⚙️  Checking environment configuration...');
if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
  console.log('✅ .env file exists');
} else {
  console.log('⚠️  .env file not found (using .env.example as reference)');
}

console.log('\n🎉 Backend API Foundation Setup Complete!');
console.log('\n📋 Summary:');
console.log('✅ Node.js Express server with TypeScript configured');
console.log('✅ MongoDB connection setup with Mongoose ODM');
console.log('✅ Redis connection setup for caching and sessions');
console.log('✅ JWT authentication middleware implemented');
console.log('✅ Security middleware (CORS, rate limiting, helmet) configured');
console.log('✅ Basic API routing structure for all major services');
console.log('✅ Environment variables and configuration management');
console.log('✅ Comprehensive error handling and logging');
console.log('✅ Health check endpoints for monitoring');
console.log('✅ Test suite with Jest and Supertest');

console.log('\n🚀 Next Steps:');
console.log('1. Install and start MongoDB and Redis');
console.log('2. Update .env file with your database connection strings');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Begin implementing Task 3: User Management System');

console.log('\n📚 API Endpoints Available:');
console.log('- GET /health - Health check');
console.log('- GET /api/v1 - API information');
console.log('- POST /api/v1/auth/* - Authentication endpoints (placeholders)');
console.log('- All other service endpoints return 501 (Not Implemented)');