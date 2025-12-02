/**
 * Performance Monitoring and Analytics System
 * 
 * Provides comprehensive performance monitoring, metrics collection,
 * and analytics for the Rural Connect AI platform.
 */

import React from 'react';

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

// Performance event interface
interface PerformanceEvent {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

// Core Performance Monitor class
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private events: PerformanceEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled = true;
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds
  private endpoint = '/api/v1/analytics/performance';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;
    
    // Monitor page load performance
    this.monitorPageLoad();
    
    // Monitor navigation performance
    this.monitorNavigation();
    
    // Monitor resource loading
    this.monitorResourceLoading();
    
    // Monitor user interactions
    this.monitorUserInteractions();
    
    // Monitor errors
    this.monitorErrors();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network conditions
    this.monitorNetworkConditions();
  }

  private monitorPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.recordMetric('first_paint', this.getFirstPaint());
          this.recordMetric('first_contentful_paint', this.getFirstContentfulPaint());
        }
      }, 0);
    });
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private monitorNavigation() {
    if (typeof window === 'undefined') return;

    // Monitor route changes (for SPA)
    let currentPath = window.location.pathname;
    
    const checkRouteChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        const navigationTime = performance.now();
        this.recordEvent('route_change', {
          from: currentPath,
          to: newPath,
          navigationTime
        });
        currentPath = newPath;
      }
    };

    // Check for route changes
    setInterval(checkRouteChange, 100);
    
    // Monitor back/forward navigation
    window.addEventListener('popstate', () => {
      this.recordEvent('navigation', {
        type: 'popstate',
        path: window.location.pathname
      });
    });
  }

  private monitorResourceLoading() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        this.recordMetric('resource_load_time', resource.responseEnd - resource.fetchStart, {
          resource_type: resource.initiatorType,
          resource_name: resource.name.split('/').pop() || 'unknown'
        });
        
        // Track slow resources
        const loadTime = resource.responseEnd - resource.fetchStart;
        if (loadTime > 1000) { // Slower than 1 second
          this.recordEvent('slow_resource', {
            name: resource.name,
            loadTime,
            size: resource.transferSize
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private monitorUserInteractions() {
    if (typeof window === 'undefined') return;

    // Track click interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;
      
      this.recordEvent('user_interaction', {
        type: 'click',
        element: tagName,
        className,
        id,
        timestamp: Date.now()
      });
    }, { passive: true });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      
      this.recordEvent('user_interaction', {
        type: 'form_submit',
        formId: form.id,
        formAction: form.action,
        timestamp: Date.now()
      });
    }, { passive: true });

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordMetric('scroll_depth', Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100));
      }, 150);
    }, { passive: true });
  }

  private monitorErrors() {
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordEvent('unhandled_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Resource loading errors
    document.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target !== window) {
        this.recordEvent('resource_error', {
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
          message: 'Failed to load resource'
        });
      }
    }, true);
  }

  private monitorMemoryUsage() {
    if (typeof window === 'undefined') return;

    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize);
        this.recordMetric('memory_total', memory.totalJSHeapSize);
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit);
      }
    };

    // Check memory usage every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  private monitorNetworkConditions() {
    if (typeof window === 'undefined') return;

    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const recordConnectionInfo = () => {
        this.recordMetric('network_downlink', connection.downlink);
        this.recordMetric('network_rtt', connection.rtt);
        this.recordEvent('network_change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
      };

      connection.addEventListener('change', recordConnectionInfo);
      recordConnectionInfo(); // Initial recording
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.recordEvent('network_status', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.recordEvent('network_status', { status: 'offline' });
    });
  }

  // Public methods
  recordMetric(name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
      metadata
    });

    // Auto-flush if batch size reached
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }

  recordEvent(type: string, data: any) {
    if (!this.isEnabled) return;

    this.events.push({
      type,
      data,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    });

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  async flush() {
    if (this.metrics.length === 0 && this.events.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      metrics: [...this.metrics],
      events: [...this.events],
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    };

    // Clear local arrays
    this.metrics = [];
    this.events = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn('Failed to send performance data:', error);
      // Could implement retry logic here
    }
  }

  private startPeriodicFlush() {
    if (typeof window === 'undefined') return;
    
    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  // Get current performance stats
  getStats() {
    if (typeof window === 'undefined') return null;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    
    return {
      session: {
        id: this.sessionId,
        userId: this.userId,
        startTime: navigation?.fetchStart || 0
      },
      timing: {
        pageLoad: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      },
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null,
      metrics: {
        pending: this.metrics.length,
        events: this.events.length
      }
    };
  }

  // Performance budget checking
  checkPerformanceBudget(budgets: Record<string, number>): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const stats = this.getStats();

    if (!stats) return { passed: true, violations: [] };

    if (budgets.pageLoad && stats.timing.pageLoad > budgets.pageLoad) {
      violations.push(`Page load time (${stats.timing.pageLoad}ms) exceeds budget (${budgets.pageLoad}ms)`);
    }

    if (budgets.firstContentfulPaint && stats.timing.firstContentfulPaint > budgets.firstContentfulPaint) {
      violations.push(`First Contentful Paint (${stats.timing.firstContentfulPaint}ms) exceeds budget (${budgets.firstContentfulPaint}ms)`);
    }

    if (budgets.memoryUsage && stats.memory && stats.memory.used > budgets.memoryUsage) {
      violations.push(`Memory usage (${stats.memory.used} bytes) exceeds budget (${budgets.memoryUsage} bytes)`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [stats, setStats] = React.useState<any>(null);
  const [monitor] = React.useState(() => new PerformanceMonitor());

  React.useEffect(() => {
    const updateStats = () => {
      setStats(monitor.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [monitor]);

  return {
    monitor,
    stats,
    recordMetric: (name: string, value: number, tags?: Record<string, string>) => 
      monitor.recordMetric(name, value, tags),
    recordEvent: (type: string, data: any) => monitor.recordEvent(type, data),
    flush: () => monitor.flush()
  };
}

// Component performance tracker
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    const { monitor } = usePerformanceMonitoring();
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        monitor.recordMetric('component_render_time', renderTime, {
          component: componentName
        });
        
        if (renderTime > 16) { // More than one frame at 60fps
          monitor.recordEvent('slow_component_render', {
            component: componentName,
            renderTime
          });
        }
      };
    });

    return <Component {...props} ref={ref} />;
  });
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = globalPerformanceMonitor;
}