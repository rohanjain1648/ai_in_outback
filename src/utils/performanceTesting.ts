/**
 * Automated Performance Testing and Alerting
 * 
 * Provides automated performance testing, monitoring, and alerting
 * to ensure optimal application performance.
 */

// Performance test configuration
interface PerformanceTestConfig {
  name: string;
  url: string;
  thresholds: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  device: 'desktop' | 'mobile';
  network: 'fast3g' | 'slow3g' | 'wifi';
}

// Performance test result
interface PerformanceTestResult {
  testId: string;
  config: PerformanceTestConfig;
  timestamp: number;
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
    totalBlockingTime: number;
  };
  passed: boolean;
  violations: string[];
  score: number;
}

// Alert configuration
interface AlertConfig {
  type: 'email' | 'slack' | 'webhook';
  threshold: number;
  recipients: string[];
  enabled: boolean;
}

export class PerformanceTester {
  private testConfigs: PerformanceTestConfig[] = [];
  private testResults: PerformanceTestResult[] = [];
  private alertConfigs: AlertConfig[] = [];
  private isRunning = false;

  constructor() {
    this.setupDefaultTests();
    this.setupDefaultAlerts();
  }

  private setupDefaultTests() {
    // Define default performance tests
    this.testConfigs = [
      {
        name: 'Homepage Desktop',
        url: '/',
        thresholds: {
          loadTime: 3000,
          firstContentfulPaint: 1500,
          largestContentfulPaint: 2500,
          cumulativeLayoutShift: 0.1,
          firstInputDelay: 100
        },
        device: 'desktop',
        network: 'wifi'
      },
      {
        name: 'Homepage Mobile',
        url: '/',
        thresholds: {
          loadTime: 5000,
          firstContentfulPaint: 2000,
          largestContentfulPaint: 4000,
          cumulativeLayoutShift: 0.1,
          firstInputDelay: 100
        },
        device: 'mobile',
        network: 'fast3g'
      },
      {
        name: 'Dashboard Desktop',
        url: '/dashboard',
        thresholds: {
          loadTime: 4000,
          firstContentfulPaint: 2000,
          largestContentfulPaint: 3000,
          cumulativeLayoutShift: 0.1,
          firstInputDelay: 100
        },
        device: 'desktop',
        network: 'wifi'
      },
      {
        name: 'Resource Search Mobile',
        url: '/resources',
        thresholds: {
          loadTime: 6000,
          firstContentfulPaint: 2500,
          largestContentfulPaint: 4500,
          cumulativeLayoutShift: 0.1,
          firstInputDelay: 100
        },
        device: 'mobile',
        network: 'fast3g'
      }
    ];
  }

  private setupDefaultAlerts() {
    this.alertConfigs = [
      {
        type: 'email',
        threshold: 70, // Alert if performance score drops below 70
        recipients: ['dev-team@ruralconnect.ai'],
        enabled: true
      },
      {
        type: 'slack',
        threshold: 60, // Critical alert if score drops below 60
        recipients: ['#performance-alerts'],
        enabled: true
      }
    ];
  }

  // Add custom test configuration
  addTest(config: PerformanceTestConfig) {
    this.testConfigs.push(config);
  }

  // Run all performance tests
  async runAllTests(): Promise<PerformanceTestResult[]> {
    if (this.isRunning) {
      throw new Error('Performance tests are already running');
    }

    this.isRunning = true;
    const results: PerformanceTestResult[] = [];

    try {
      for (const config of this.testConfigs) {
        const result = await this.runSingleTest(config);
        results.push(result);
        this.testResults.push(result);
        
        // Check if alerts should be triggered
        await this.checkAlerts(result);
      }
    } finally {
      this.isRunning = false;
    }

    // Keep only recent results (last 100)
    if (this.testResults.length > 100) {
      this.testResults = this.testResults.slice(-100);
    }

    return results;
  }

  // Run a single performance test
  private async runSingleTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Simulate performance test (in real implementation, this would use Lighthouse or similar)
      const metrics = await this.measurePerformance(config);
      
      // Check thresholds
      const violations: string[] = [];
      let passed = true;

      if (metrics.loadTime > config.thresholds.loadTime) {
        violations.push(`Load time (${metrics.loadTime}ms) exceeds threshold (${config.thresholds.loadTime}ms)`);
        passed = false;
      }

      if (metrics.firstContentfulPaint > config.thresholds.firstContentfulPaint) {
        violations.push(`FCP (${metrics.firstContentfulPaint}ms) exceeds threshold (${config.thresholds.firstContentfulPaint}ms)`);
        passed = false;
      }

      if (metrics.largestContentfulPaint > config.thresholds.largestContentfulPaint) {
        violations.push(`LCP (${metrics.largestContentfulPaint}ms) exceeds threshold (${config.thresholds.largestContentfulPaint}ms)`);
        passed = false;
      }

      if (metrics.cumulativeLayoutShift > config.thresholds.cumulativeLayoutShift) {
        violations.push(`CLS (${metrics.cumulativeLayoutShift}) exceeds threshold (${config.thresholds.cumulativeLayoutShift})`);
        passed = false;
      }

      if (metrics.firstInputDelay > config.thresholds.firstInputDelay) {
        violations.push(`FID (${metrics.firstInputDelay}ms) exceeds threshold (${config.thresholds.firstInputDelay}ms)`);
        passed = false;
      }

      // Calculate performance score (0-100)
      const score = this.calculatePerformanceScore(metrics, config.thresholds);

      return {
        testId,
        config,
        timestamp: Date.now(),
        metrics,
        passed,
        violations,
        score
      };
    } catch (error) {
      console.error(`Performance test failed for ${config.name}:`, error);
      
      return {
        testId,
        config,
        timestamp: Date.now(),
        metrics: {
          loadTime: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          timeToInteractive: 0,
          totalBlockingTime: 0
        },
        passed: false,
        violations: [`Test execution failed: ${error.message}`],
        score: 0
      };
    }
  }

  // Measure performance metrics (simplified simulation)
  private async measurePerformance(config: PerformanceTestConfig): Promise<PerformanceTestResult['metrics']> {
    // In a real implementation, this would use tools like Lighthouse, Puppeteer, or Playwright
    // For now, we'll simulate realistic metrics based on device and network conditions
    
    const baseMetrics = {
      loadTime: 2000,
      firstContentfulPaint: 1200,
      largestContentfulPaint: 2200,
      cumulativeLayoutShift: 0.05,
      firstInputDelay: 50,
      timeToInteractive: 2500,
      totalBlockingTime: 150
    };

    // Adjust metrics based on device
    const deviceMultiplier = config.device === 'mobile' ? 1.5 : 1.0;
    
    // Adjust metrics based on network
    const networkMultiplier = config.network === 'slow3g' ? 2.0 : 
                             config.network === 'fast3g' ? 1.3 : 1.0;

    const multiplier = deviceMultiplier * networkMultiplier;

    // Add some randomness to simulate real-world variance
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120%

    return {
      loadTime: Math.round(baseMetrics.loadTime * multiplier * variance),
      firstContentfulPaint: Math.round(baseMetrics.firstContentfulPaint * multiplier * variance),
      largestContentfulPaint: Math.round(baseMetrics.largestContentfulPaint * multiplier * variance),
      cumulativeLayoutShift: Math.round(baseMetrics.cumulativeLayoutShift * variance * 1000) / 1000,
      firstInputDelay: Math.round(baseMetrics.firstInputDelay * multiplier * variance),
      timeToInteractive: Math.round(baseMetrics.timeToInteractive * multiplier * variance),
      totalBlockingTime: Math.round(baseMetrics.totalBlockingTime * multiplier * variance)
    };
  }

  // Calculate performance score based on metrics
  private calculatePerformanceScore(metrics: PerformanceTestResult['metrics'], thresholds: PerformanceTestConfig['thresholds']): number {
    const scores = [
      Math.max(0, 100 - (metrics.loadTime / thresholds.loadTime) * 100),
      Math.max(0, 100 - (metrics.firstContentfulPaint / thresholds.firstContentfulPaint) * 100),
      Math.max(0, 100 - (metrics.largestContentfulPaint / thresholds.largestContentfulPaint) * 100),
      Math.max(0, 100 - (metrics.cumulativeLayoutShift / thresholds.cumulativeLayoutShift) * 100),
      Math.max(0, 100 - (metrics.firstInputDelay / thresholds.firstInputDelay) * 100)
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  // Check if alerts should be triggered
  private async checkAlerts(result: PerformanceTestResult) {
    for (const alertConfig of this.alertConfigs) {
      if (!alertConfig.enabled) continue;
      
      if (result.score < alertConfig.threshold) {
        await this.sendAlert(alertConfig, result);
      }
    }
  }

  // Send performance alert
  private async sendAlert(alertConfig: AlertConfig, result: PerformanceTestResult) {
    const alertData = {
      type: 'performance_degradation',
      severity: result.score < 50 ? 'critical' : 'warning',
      test: result.config.name,
      score: result.score,
      threshold: alertConfig.threshold,
      violations: result.violations,
      timestamp: new Date(result.timestamp).toISOString(),
      url: result.config.url
    };

    try {
      switch (alertConfig.type) {
        case 'email':
          await this.sendEmailAlert(alertConfig.recipients, alertData);
          break;
        case 'slack':
          await this.sendSlackAlert(alertConfig.recipients, alertData);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alertConfig.recipients, alertData);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${alertConfig.type} alert:`, error);
    }
  }

  private async sendEmailAlert(recipients: string[], alertData: any) {
    // Implementation would integrate with email service
    console.log('Email alert sent to:', recipients, alertData);
  }

  private async sendSlackAlert(channels: string[], alertData: any) {
    // Implementation would integrate with Slack API
    console.log('Slack alert sent to:', channels, alertData);
  }

  private async sendWebhookAlert(webhooks: string[], alertData: any) {
    const promises = webhooks.map(webhook =>
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      })
    );

    await Promise.allSettled(promises);
  }

  // Get performance trends
  getPerformanceTrends(testName?: string, days: number = 7): any {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let filteredResults = this.testResults.filter(result => 
      result.timestamp > cutoffTime &&
      (!testName || result.config.name === testName)
    );

    if (filteredResults.length === 0) return null;

    // Group by day
    const dailyStats = filteredResults.reduce((stats, result) => {
      const day = new Date(result.timestamp).toDateString();
      
      if (!stats[day]) {
        stats[day] = { scores: [], loadTimes: [], violations: 0 };
      }
      
      stats[day].scores.push(result.score);
      stats[day].loadTimes.push(result.metrics.loadTime);
      stats[day].violations += result.violations.length;
      
      return stats;
    }, {} as Record<string, { scores: number[]; loadTimes: number[]; violations: number }>);

    // Calculate daily averages
    const trends = Object.entries(dailyStats).map(([day, stats]) => ({
      date: day,
      avgScore: stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length,
      avgLoadTime: stats.loadTimes.reduce((sum, time) => sum + time, 0) / stats.loadTimes.length,
      violations: stats.violations,
      testCount: stats.scores.length
    }));

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get current performance status
  getCurrentStatus(): any {
    const recentResults = this.testResults.slice(-this.testConfigs.length);
    
    if (recentResults.length === 0) {
      return { status: 'no_data', message: 'No recent test results available' };
    }

    const avgScore = recentResults.reduce((sum, result) => sum + result.score, 0) / recentResults.length;
    const failedTests = recentResults.filter(result => !result.passed).length;
    
    let status: string;
    let message: string;

    if (avgScore >= 80 && failedTests === 0) {
      status = 'excellent';
      message = 'All performance tests passing with excellent scores';
    } else if (avgScore >= 70 && failedTests <= 1) {
      status = 'good';
      message = 'Performance is good with minor issues';
    } else if (avgScore >= 50) {
      status = 'warning';
      message = 'Performance issues detected, optimization recommended';
    } else {
      status = 'critical';
      message = 'Critical performance issues require immediate attention';
    }

    return {
      status,
      message,
      avgScore: Math.round(avgScore),
      failedTests,
      totalTests: recentResults.length,
      lastRun: Math.max(...recentResults.map(r => r.timestamp))
    };
  }

  // Schedule automated testing
  scheduleTests(intervalMinutes: number = 60) {
    setInterval(async () => {
      try {
        console.log('Running scheduled performance tests...');
        await this.runAllTests();
        console.log('Scheduled performance tests completed');
      } catch (error) {
        console.error('Scheduled performance tests failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Export test results
  exportResults(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.testResults, null, 2);
    } else {
      // CSV export
      const headers = [
        'Test Name', 'Timestamp', 'Score', 'Load Time', 'FCP', 'LCP', 'CLS', 'FID', 'Passed', 'Violations'
      ];
      
      const rows = this.testResults.map(result => [
        result.config.name,
        new Date(result.timestamp).toISOString(),
        result.score,
        result.metrics.loadTime,
        result.metrics.firstContentfulPaint,
        result.metrics.largestContentfulPaint,
        result.metrics.cumulativeLayoutShift,
        result.metrics.firstInputDelay,
        result.passed,
        result.violations.join('; ')
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }
}

// React hook for performance testing
export function usePerformanceTesting() {
  const [tester] = React.useState(() => new PerformanceTester());
  const [isRunning, setIsRunning] = React.useState(false);
  const [results, setResults] = React.useState<PerformanceTestResult[]>([]);
  const [status, setStatus] = React.useState<any>(null);

  const runTests = React.useCallback(async () => {
    setIsRunning(true);
    try {
      const testResults = await tester.runAllTests();
      setResults(testResults);
      setStatus(tester.getCurrentStatus());
    } catch (error) {
      console.error('Performance tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [tester]);

  const getTrends = React.useCallback((testName?: string, days?: number) => {
    return tester.getPerformanceTrends(testName, days);
  }, [tester]);

  React.useEffect(() => {
    setStatus(tester.getCurrentStatus());
  }, [tester]);

  return {
    runTests,
    getTrends,
    exportResults: (format?: 'json' | 'csv') => tester.exportResults(format),
    isRunning,
    results,
    status,
    tester
  };
}

// Global performance tester instance
export const globalPerformanceTester = new PerformanceTester();

// Initialize automated performance testing
export function initializePerformanceTesting(intervalMinutes: number = 60) {
  globalPerformanceTester.scheduleTests(intervalMinutes);
  console.log(`Performance testing scheduled to run every ${intervalMinutes} minutes`);
  
  return globalPerformanceTester;
}