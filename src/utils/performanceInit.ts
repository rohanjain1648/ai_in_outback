/**
 * Performance Optimization Initialization
 * 
 * Initializes all performance optimization features for the application.
 */

import { globalPerformanceMonitor } from './performanceMonitoring';
import { cacheManager } from './caching';
import { initializeCDN } from './cdnIntegration';
import { globalPerformanceTester, initializePerformanceTesting } from './performanceTesting';

// Performance configuration
export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableCaching: boolean;
  enableCDN: boolean;
  enableAutomatedTesting: boolean;
  testingInterval: number; // minutes
}

// Default configuration
const defaultConfig: PerformanceConfig = {
  enableMonitoring: true,
  enableCaching: true,
  enableCDN: import.meta.env.MODE === 'production',
  enableAutomatedTesting: import.meta.env.MODE === 'production',
  testingInterval: 60 // 1 hour
};

// Initialize all performance optimizations
export async function initializePerformanceOptimizations(config: Partial<PerformanceConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  console.log('🚀 Initializing performance optimizations...', finalConfig);

  try {
    // Initialize performance monitoring
    if (finalConfig.enableMonitoring) {
      console.log('📊 Performance monitoring enabled');
      globalPerformanceMonitor.recordEvent('performance_init_start', {
        config: finalConfig,
        timestamp: Date.now()
      });
    }

    // Initialize caching
    if (finalConfig.enableCaching) {
      console.log('💾 Cache management enabled');
      await cacheManager.preloadCriticalResources();
      await cacheManager.warmAPICache();
    }

    // Initialize CDN
    if (finalConfig.enableCDN) {
      console.log('🌐 CDN integration enabled');
      initializeCDN();
    }

    // Initialize automated performance testing
    if (finalConfig.enableAutomatedTesting) {
      console.log('🧪 Automated performance testing enabled');
      initializePerformanceTesting(finalConfig.testingInterval);
    }

    // Record successful initialization
    if (finalConfig.enableMonitoring) {
      globalPerformanceMonitor.recordEvent('performance_init_complete', {
        success: true,
        timestamp: Date.now()
      });
    }

    console.log('✅ Performance optimizations initialized successfully');

    return {
      monitor: globalPerformanceMonitor,
      cache: cacheManager,
      tester: globalPerformanceTester
    };

  } catch (error) {
    console.error('❌ Failed to initialize performance optimizations:', error);

    if (finalConfig.enableMonitoring) {
      globalPerformanceMonitor.recordEvent('performance_init_error', {
        error: error.message,
        timestamp: Date.now()
      });
    }

    throw error;
  }
}

// Performance budget configuration
export const performanceBudgets = {
  pageLoad: 3000, // 3 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  largestContentfulPaint: 2500, // 2.5 seconds
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100, // 100ms
  memoryUsage: 50 * 1024 * 1024 // 50MB
};

// Check performance budget compliance
export function checkPerformanceBudget() {
  const budgetCheck = globalPerformanceMonitor.checkPerformanceBudget(performanceBudgets);

  if (!budgetCheck.passed) {
    console.warn('⚠️ Performance budget violations detected:', budgetCheck.violations);

    globalPerformanceMonitor.recordEvent('performance_budget_violation', {
      violations: budgetCheck.violations,
      timestamp: Date.now()
    });
  }

  return budgetCheck;
}

// Get performance summary
export function getPerformanceSummary() {
  const monitorStats = globalPerformanceMonitor.getStats();
  const cacheStats = cacheManager.getCacheStats();
  const testerStatus = globalPerformanceTester.getCurrentStatus();

  return {
    monitoring: monitorStats,
    caching: cacheStats,
    testing: testerStatus,
    budgetCompliance: checkPerformanceBudget(),
    timestamp: Date.now()
  };
}

// React hook for performance optimization status
export function usePerformanceOptimizations() {
  const [summary, setSummary] = React.useState<any>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        await initializePerformanceOptimizations();
        setIsInitialized(true);

        // Update summary periodically
        const updateSummary = () => {
          setSummary(getPerformanceSummary());
        };

        updateSummary();
        const interval = setInterval(updateSummary, 30000); // Every 30 seconds

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Failed to initialize performance optimizations:', error);
      }
    };

    initialize();
  }, []);

  return {
    isInitialized,
    summary,
    checkBudget: checkPerformanceBudget,
    getSummary: getPerformanceSummary
  };
}