#!/usr/bin/env node

/**
 * Rural Connect AI - Final Integration Test Suite
 * Comprehensive testing for Task 22: Final Integration and User Acceptance Testing
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FinalIntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`, 'info');
      const result = await testFunction();
      
      if (result.success) {
        this.testResults.passed++;
        this.log(`✅ ${testName} - PASSED`, 'success');
      } else {
        this.testResults.failed++;
        this.log(`❌ ${testName} - FAILED: ${result.message}`, 'error');
      }
      
      this.testResults.details.push({
        name: testName,
        success: result.success,
        message: result.message,
        details: result.details || []
      });
      
    } catch (error) {
      this.testResults.failed++;
      this.log(`❌ ${testName} - ERROR: ${error.message}`, 'error');
      this.testResults.details.push({
        name: testName,
        success: false,
        message: error.message
      });
    }
  }

  // Test 1: Project Structure Validation
  async testProjectStructure() {
    const requiredFiles = [
      'package.json',
      'src/App.tsx',
      'backend/package.json',
      'backend/src/server.ts',
      'docker-compose.yml',
      'docker-compose.dev.yml',
      '.env.development',
      'backend/.env'
    ];

    const requiredDirectories = [
      'src/components',
      'src/services',
      'backend/src/routes',
      'backend/src/models',
      'backend/src/services',
      '__tests__'
    ];

    const missing = [];
    
    // Check files
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        missing.push(`File: ${file}`);
      }
    }
    
    // Check directories
    for (const dir of requiredDirectories) {
      if (!fs.existsSync(dir)) {
        missing.push(`Directory: ${dir}`);
      }
    }

    return {
      success: missing.length === 0,
      message: missing.length === 0 ? 'All required files and directories present' : `Missing: ${missing.join(', ')}`,
      details: missing
    };
  }

  // Test 2: Dependencies Check
  async testDependencies() {
    try {
      // Check frontend dependencies
      const frontendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredFrontendDeps = [
        'react', 'react-dom', 'three', '@react-three/fiber', 
        '@react-three/drei', 'framer-motion', 'tailwindcss'
      ];

      // Check backend dependencies
      const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
      const requiredBackendDeps = [
        'express', 'mongoose', 'socket.io', 'jsonwebtoken', 
        'bcryptjs', 'cors', 'helmet'
      ];

      const missingDeps = [];
      
      for (const dep of requiredFrontendDeps) {
        if (!frontendPackage.dependencies[dep] && !frontendPackage.devDependencies[dep]) {
          missingDeps.push(`Frontend: ${dep}`);
        }
      }
      
      for (const dep of requiredBackendDeps) {
        if (!backendPackage.dependencies[dep] && !backendPackage.devDependencies[dep]) {
          missingDeps.push(`Backend: ${dep}`);
        }
      }

      return {
        success: missingDeps.length === 0,
        message: missingDeps.length === 0 ? 'All required dependencies present' : `Missing dependencies: ${missingDeps.join(', ')}`,
        details: missingDeps
      };
    } catch (error) {
      return {
        success: false,
        message: `Error checking dependencies: ${error.message}`
      };
    }
  }

  // Test 3: TypeScript Compilation
  async testTypeScriptCompilation() {
    try {
      // Test frontend TypeScript compilation
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
      
      // Test backend TypeScript compilation
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: path.join(process.cwd(), 'backend') });
      
      return {
        success: true,
        message: 'TypeScript compilation successful for both frontend and backend'
      };
    } catch (error) {
      return {
        success: false,
        message: `TypeScript compilation failed: ${error.message}`
      };
    }
  }

  // Test 4: Linting Check
  async testLinting() {
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      return {
        success: true,
        message: 'Linting passed'
      };
    } catch (error) {
      return {
        success: false,
        message: `Linting failed: ${error.message}`
      };
    }
  }

  // Test 5: Build Process
  async testBuild() {
    try {
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check if build artifacts exist
      const buildExists = fs.existsSync('dist');
      
      return {
        success: buildExists,
        message: buildExists ? 'Build process completed successfully' : 'Build artifacts not found'
      };
    } catch (error) {
      return {
        success: false,
        message: `Build failed: ${error.message}`
      };
    }
  }

  // Test 6: Unit Tests
  async testUnitTests() {
    try {
      execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
      return {
        success: true,
        message: 'Unit tests passed'
      };
    } catch (error) {
      return {
        success: false,
        message: `Unit tests failed: ${error.message}`
      };
    }
  }

  // Test 7: Component Integration
  async testComponentIntegration() {
    const components = [
      'src/components/three/LandscapeDemo.tsx',
      'src/components/AgriculturalDashboard.tsx',
      'src/components/BusinessDirectory.tsx',
      'src/components/CulturalHeritageDashboard.tsx',
      'src/components/WellbeingDashboard.tsx',
      'src/components/chat/ChatList.tsx',
      'src/components/admin/AdminDashboard.tsx',
      'src/components/onboarding/OnboardingFlow.tsx'
    ];

    const missingComponents = components.filter(comp => !fs.existsSync(comp));
    
    return {
      success: missingComponents.length === 0,
      message: missingComponents.length === 0 ? 'All major components present' : `Missing components: ${missingComponents.join(', ')}`,
      details: missingComponents
    };
  }

  // Test 8: API Routes Check
  async testAPIRoutes() {
    const routes = [
      'backend/src/routes/auth.ts',
      'backend/src/routes/users.ts',
      'backend/src/routes/chat.ts',
      'backend/src/routes/emergency.ts',
      'backend/src/routes/business.ts',
      'backend/src/routes/agriculture.ts'
    ];

    const missingRoutes = routes.filter(route => !fs.existsSync(route));
    
    return {
      success: missingRoutes.length === 0,
      message: missingRoutes.length === 0 ? 'All API routes present' : `Missing routes: ${missingRoutes.join(', ')}`,
      details: missingRoutes
    };
  }

  // Test 9: Environment Configuration
  async testEnvironmentConfig() {
    const issues = [];
    
    // Check backend .env
    if (!fs.existsSync('backend/.env')) {
      issues.push('Backend .env file missing');
    } else {
      const backendEnv = fs.readFileSync('backend/.env', 'utf8');
      if (!backendEnv.includes('JWT_SECRET')) issues.push('JWT_SECRET not configured');
      if (!backendEnv.includes('MONGODB_URI')) issues.push('MONGODB_URI not configured');
    }
    
    // Check frontend .env
    if (!fs.existsSync('.env.development')) {
      issues.push('Frontend .env.development file missing');
    }

    return {
      success: issues.length === 0,
      message: issues.length === 0 ? 'Environment configuration complete' : `Issues: ${issues.join(', ')}`,
      details: issues
    };
  }

  // Test 10: Docker Configuration
  async testDockerConfig() {
    const dockerFiles = [
      'Dockerfile',
      'Dockerfile.dev',
      'backend/Dockerfile',
      'backend/Dockerfile.dev',
      'docker-compose.yml',
      'docker-compose.dev.yml'
    ];

    const missingFiles = dockerFiles.filter(file => !fs.existsSync(file));
    
    return {
      success: missingFiles.length === 0,
      message: missingFiles.length === 0 ? 'Docker configuration complete' : `Missing Docker files: ${missingFiles.join(', ')}`,
      details: missingFiles
    };
  }

  // Generate final report
  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('FINAL INTEGRATION TEST REPORT', 'info');
    this.log('='.repeat(60), 'info');
    
    this.log(`✅ Tests Passed: ${this.testResults.passed}`, 'success');
    this.log(`❌ Tests Failed: ${this.testResults.failed}`, 'error');
    this.log(`⚠️  Warnings: ${this.testResults.warnings}`, 'warning');
    
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? ((this.testResults.passed / totalTests) * 100).toFixed(1) : 0;
    
    this.log(`📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
    
    if (this.testResults.failed > 0) {
      this.log('\nFAILED TESTS:', 'error');
      this.testResults.details
        .filter(test => !test.success)
        .forEach(test => {
          this.log(`  ❌ ${test.name}: ${test.message}`, 'error');
        });
    }
    
    this.log('\n' + '='.repeat(60), 'info');
    
    return {
      success: this.testResults.failed === 0,
      successRate: parseFloat(successRate),
      totalTests,
      passed: this.testResults.passed,
      failed: this.testResults.failed
    };
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting Final Integration Test Suite for Rural Connect AI', 'info');
    this.log('Task 22: Final Integration and User Acceptance Testing\n', 'info');

    await this.runTest('Project Structure Validation', () => this.testProjectStructure());
    await this.runTest('Dependencies Check', () => this.testDependencies());
    await this.runTest('TypeScript Compilation', () => this.testTypeScriptCompilation());
    await this.runTest('Linting Check', () => this.testLinting());
    await this.runTest('Build Process', () => this.testBuild());
    await this.runTest('Unit Tests', () => this.testUnitTests());
    await this.runTest('Component Integration', () => this.testComponentIntegration());
    await this.runTest('API Routes Check', () => this.testAPIRoutes());
    await this.runTest('Environment Configuration', () => this.testEnvironmentConfig());
    await this.runTest('Docker Configuration', () => this.testDockerConfig());

    return this.generateReport();
  }
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FinalIntegrationTester();
  tester.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

export default FinalIntegrationTester;