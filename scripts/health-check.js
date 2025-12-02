#!/usr/bin/env node

/**
 * Rural Connect AI - Health Check Script
 * Task 22: Final validation that the application is running correctly
 */

const http = require('http');
const https = require('https');

class HealthChecker {
  constructor() {
    this.checks = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async checkEndpoint(name, url, expectedStatus = 200) {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, (res) => {
        const success = res.statusCode === expectedStatus;
        resolve({
          name,
          success,
          status: res.statusCode,
          message: success ? 'OK' : `Expected ${expectedStatus}, got ${res.statusCode}`
        });
      });

      req.on('error', (error) => {
        resolve({
          name,
          success: false,
          status: 'ERROR',
          message: error.message
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          name,
          success: false,
          status: 'TIMEOUT',
          message: 'Request timed out'
        });
      });
    });
  }

  async runHealthChecks() {
    this.log('🏥 Running Health Checks for Rural Connect AI', 'info');
    this.log('Task 22: Final Integration Validation\n', 'info');

    const checks = [
      { name: 'Backend API Health', url: 'http://localhost:3001/health' },
      { name: 'Backend API Base', url: 'http://localhost:3001/api/v1' },
      { name: 'Frontend Development Server', url: 'http://localhost:5173' }
    ];

    const results = [];
    
    for (const check of checks) {
      this.log(`Checking ${check.name}...`, 'info');
      const result = await this.checkEndpoint(check.name, check.url);
      results.push(result);
      
      if (result.success) {
        this.log(`✅ ${check.name}: ${result.message}`, 'success');
      } else {
        this.log(`❌ ${check.name}: ${result.message}`, 'error');
      }
    }

    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    this.log(`\n📊 Health Check Summary: ${passed}/${total} checks passed`, 
      passed === total ? 'success' : 'warning');
    
    if (passed === total) {
      this.log('🎉 All systems operational! Rural Connect AI is ready for use.', 'success');
      this.log('🌐 Access the application at: http://localhost:5173', 'info');
    } else {
      this.log('⚠️  Some services may not be running. Check the logs above.', 'warning');
    }

    return { passed, total, success: passed === total };
  }
}

// Run health checks if this script is executed directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runHealthChecks()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = HealthChecker;