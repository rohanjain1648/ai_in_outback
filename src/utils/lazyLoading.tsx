/**
 * Lazy Loading Utilities
 * 
 * Provides utilities for code splitting and lazy loading React components
 * to improve initial bundle size and loading performance.
 */

import React, { Suspense, ComponentType } from 'react';

// Loading component for lazy-loaded components
export const LoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  </div>
);

// Error boundary for lazy-loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class LazyLoadErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error }> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
    
    // Report to monitoring service
    if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
      (window as any).performanceMonitor.reportError('lazy_load_error', error);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Failed to load component
            </h3>
            <p className="text-gray-600 mb-4">
              Please try refreshing the page
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  loadingMessage?: string,
  ErrorFallback?: ComponentType<{ error: Error }>
) {
  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoadErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        <Component {...props} ref={ref} />
      </Suspense>
    </LazyLoadErrorBoundary>
  ));
}

// Preload utility for lazy components
export const preloadComponent = (componentImport: () => Promise<any>) => {
  const componentPromise = componentImport();
  return componentPromise;
};

// Intersection Observer based lazy loading for components
export const useLazyComponentLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
};

// Route-based code splitting helper
export const createLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  loadingMessage?: string
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props: any) => (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const bundleInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length,
        memory: (performance as any).memory
      }
    };
    
    console.group('Bundle Analysis');
    console.log('Bundle Info:', bundleInfo);
    console.groupEnd();
    
    return bundleInfo;
  }
};

// Dynamic import with retry logic
export const dynamicImportWithRetry = async (
  importFn: () => Promise<any>,
  retries = 3,
  delay = 1000
): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      console.warn(`Dynamic import failed (attempt ${i + 1}/${retries}):`, error);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Component size monitoring
export const useComponentSizeMonitoring = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Component ${componentName} took ${renderTime.toFixed(2)}ms to render`);
        
        // Report to monitoring
        if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
          (window as any).performanceMonitor.reportMetric('component_render_time', {
            component: componentName,
            renderTime,
            timestamp: Date.now()
          });
        }
      }
    };
  });
};