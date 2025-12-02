#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Rural Connect AI
 * 
 * Runs all test suites including unit tests, integration tests,
 * end-to-end tests, performance tests, accessibility tests,
 * and mobile device tests.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class TestRunner {
  constructor() {
    this.results = {
      frontend: { passed: 0, failed: 0, skipped: 0 },
      backend: { passed: 0, failed: 0, skipped: 0 },
      integration: { passed: 0, failed: 0, skipped: 0 },
      e2e: { passed: 0, failed: 0, skipped: 0 },
      performance: { passed: 0, failed: 0, skipped: 0 },
      accessibility: { passed: 0, failed: 0, skipped: 0 },
      mobile: { passed: 0, failed: 0, skipped: 0 },
    };
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log(`  ${title}`, 'bright');
    this.log('='.repeat(60), 'cyan');
  }

  async runCommand(command, cwd = process.cwd()) {
    try {
      this.log(`Running: ${command}`, 'blue');
      const output = execSync(command, { 
        cwd, 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 300000 // 5 minutes timeout
      });
      return { success: true, output };
    } catch (error) {
      return { 
        success: false, 
        output: error.stdout || error.message,
        error: error.stderr || error.message
      };
    }
  }

  parseJestOutput(output) {
    const lines = output.split('\n');
    let passed = 0, failed = 0, skipped = 0;

    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/(\d+) passed.*?(\d+) failed.*?(\d+) skipped/);
        if (match) {
          passed = parseInt(match[1]) || 0;
          failed = parseInt(match[2]) || 0;
          skipped = parseInt(match[3]) || 0;
        } else {
          // Try alternative format
          const passedMatch = line.match(/(\d+) passed/);
          const failedMatch = line.match(/(\d+) failed/);
          const skippedMatch = line.match(/(\d+) skipped/);
          
          if (passedMatch) passed = parseInt(passedMatch[1]);
          if (failedMatch) failed = parseInt(failedMatch[1]);
          if (skippedMatch) skipped = parseInt(skippedMatch[1]);
        }
        break;
      }
    }

    return { passed, failed, skipped };
  }

  async runFrontendTests() {
    this.logSection('Frontend Unit Tests');
    
    const result = await this.runCommand('npm test -- --coverage --watchAll=false');
    
    if (result.success) {
      this.log('✅ Frontend tests passed', 'green');
      this.results.frontend = this.parseJestOutput(result.output);
    } else {
      this.log('❌ Frontend tests failed', 'red');
      this.log(result.error, 'red');
      this.results.frontend.failed = 1;
    }

    return result.success;
  }

  async runBackendTests() {
    this.logSection('Backend Unit Tests');
    
    const result = await this.runCommand('npm test -- --coverage --watchAll=false', './backend');
    
    if (result.success) {
      this.log('✅ Backend tests passed', 'green');
      this.results.backend = this.parseJestOutput(result.output);
    } else {
      this.log('❌ Backend tests failed', 'red');
      this.log(result.error, 'red');
      this.results.backend.failed = 1;
    }

    return result.success;
  }

  async runIntegrationTests() {
    this.logSection('Integration Tests');
    
    // Start backend server for integration tests
    this.log('Starting backend server for integration tests...', 'yellow');
    
    const result = await this.runCommand('npm test -- __tests__/integration --watchAll=false');
    
    if (result.success) {
      this.log('✅ Integration tests passed', 'green');
      this.results.integration = this.parseJestOutput(result.output);
    } else {
      this.log('❌ Integration tests failed', 'red');
      this.log(result.error, 'red');
      this.results.integration.failed = 1;
    }

    return result.success;
  }

  async runE2ETests() {
    this.logSection('End-to-End Tests');
    
    // Check if Playwright is installed
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
    } catch (error) {
      this.log('Installing Playwright...', 'yellow');
      await this.runCommand('npm install -D playwright @playwright/test');
      await this.runCommand('npx playwright install');
    }

    const result = await this.runCommand('npm test -- __tests__/e2e --watchAll=false');
    
    if (result.success) {
      this.log('✅ E2E tests passed', 'green');
      this.results.e2e = this.parseJestOutput(result.output);
    } else {
      this.log('❌ E2E tests failed', 'red');
      this.log(result.error, 'red');
      this.results.e2e.failed = 1;
    }

    return result.success;
  }

  async runPerformanceTests() {
    this.logSection('Performance Tests');
    
    const result = await this.runCommand('npm test -- __tests__/performance --watchAll=false');
    
    if (result.success) {
      this.log('✅ Performance tests passed', 'green');
      this.results.performance = this.parseJestOutput(result.output);
    } else {
      this.log('❌ Performance tests failed', 'red');
      this.log(result.error, 'red');
      this.results.performance.failed = 1;
    }

    return result.success;
  }

  async runAccessibilityTests() {
    this.logSection('Accessibility Tests');
    
    // Install jest-axe if not present
    try {
      require.resolve('jest-axe');
    } catch (error) {
      this.log('Installing jest-axe...', 'yellow');
      await this.runCommand('npm install -D jest-axe');
    }

    const result = await this.runCommand('npm test -- __tests__/accessibility --watchAll=false');
    
    if (result.success) {
      this.log('✅ Accessibility tests passed', 'green');
      this.results.accessibility = this.parseJestOutput(result.output);
    } else {
      this.log('❌ Accessibility tests failed', 'red');
      this.log(result.error, 'red');
      this.results.accessibility.failed = 1;
    }

    return result.success;
  }

  async runMobileTests() {
    this.logSection('Mobile Device Tests');
    
    const result = await this.runCommand('npm test -- __tests__/mobile --watchAll=false');
    
    if (result.success) {
      this.log('✅ Mobile tests passed', 'green');
      this.results.mobile = this.parseJestOutput(result.output);
    } else {
      this.log('❌ Mobile tests failed', 'red');
      this.log(result.error, 'red');
      this.results.mobile.failed = 1;
    }

    return result.success;
  }

  generateReport() {
    this.logSection('Test Results Summary');
    
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
    
    for (const [suite, results] of Object.entries(this.results)) {
      const { passed, failed, skipped } = results;
      totalPassed += passed;
      totalFailed += failed;
      totalSkipped += skipped;
      
      const status = failed > 0 ? '❌' : '✅';
      const color = failed > 0 ? 'red' : 'green';
      
      this.log(
        `${status} ${suite.padEnd(15)} | Passed: ${passed.toString().padStart(3)} | Failed: ${failed.toString().padStart(3)} | Skipped: ${skipped.toString().padStart(3)}`,
        color
      );
    }
    
    this.log('\n' + '-'.repeat(60), 'cyan');
    this.log(
      `Total Results        | Passed: ${totalPassed.toString().padStart(3)} | Failed: ${totalFailed.toString().padStart(3)} | Skipped: ${totalSkipped.toString().padStart(3)}`,
      totalFailed > 0 ? 'red' : 'green'
    );
    this.log(`Total Time: ${totalTime}s`, 'blue');
    
    // Generate coverage report
    this.log('\n📊 Generating coverage report...', 'yellow');
    this.runCommand('npm run test:coverage');
    
    // Generate HTML report
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTime: parseFloat(totalTime),
      results: this.results,
      summary: {
        totalPassed,
        totalFailed,
        totalSkipped,
        totalTests: totalPassed + totalFailed + totalSkipped,
        successRate: totalPassed + totalFailed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2) : 0
      }
    };
    
    const reportPath = path.join(process.cwd(), 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    this.log(`📄 Test report saved to: ${reportPath}`, 'blue');
    
    return totalFailed === 0;
  }

  async runAll() {
    this.log('🚀 Starting comprehensive test suite for Rural Connect AI', 'bright');
    this.log(`Started at: ${new Date().toISOString()}`, 'blue');
    
    const testSuites = [
      { name: 'Frontend', fn: () => this.runFrontendTests() },
      { name: 'Backend', fn: () => this.runBackendTests() },
      { name: 'Integration', fn: () => this.runIntegrationTests() },
      { name: 'Performance', fn: () => this.runPerformanceTests() },
      { name: 'Accessibility', fn: () => this.runAccessibilityTests() },
      { name: 'Mobile', fn: () => this.runMobileTests() },
      { name: 'E2E', fn: () => this.runE2ETests() },
    ];
    
    let allPassed = true;
    
    for (const suite of testSuites) {
      try {
        const passed = await suite.fn();
        if (!passed) allPassed = false;
      } catch (error) {
        this.log(`❌ Error running ${suite.name} tests: ${error.message}`, 'red');
        allPassed = false;
      }
    }
    
    const success = this.generateReport();
    
    if (success && allPassed) {
      this.log('\n🎉 All tests passed successfully!', 'green');
      process.exit(0);
    } else {
      this.log('\n💥 Some tests failed. Please check the results above.', 'red');
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const runner = new TestRunner();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Rural Connect AI Test Runner

Usage: node scripts/run-all-tests.js [options]

Options:
  --help, -h          Show this help message
  --frontend          Run only frontend tests
  --backend           Run only backend tests
  --integration       Run only integration tests
  --e2e               Run only end-to-end tests
  --performance       Run only performance tests
  --accessibility     Run only accessibility tests
  --mobile            Run only mobile tests

Examples:
  node scripts/run-all-tests.js                    # Run all tests
  node scripts/run-all-tests.js --frontend         # Run only frontend tests
  node scripts/run-all-tests.js --backend          # Run only backend tests
  `);
  process.exit(0);
}

// Run specific test suites based on arguments
if (args.includes('--frontend')) {
  runner.runFrontendTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--backend')) {
  runner.runBackendTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--integration')) {
  runner.runIntegrationTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--e2e')) {
  runner.runE2ETests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--performance')) {
  runner.runPerformanceTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--accessibility')) {
  runner.runAccessibilityTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--mobile')) {
  runner.runMobileTests().then(success => process.exit(success ? 0 : 1));
} else {
  // Run all tests
  runner.runAll();
}