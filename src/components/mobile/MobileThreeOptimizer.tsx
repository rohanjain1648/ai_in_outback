import React, { useEffect, useRef, useState } from 'react';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface MobileThreeOptimizerProps {
  children: React.ReactNode;
  enableAdaptiveQuality?: boolean;
  enablePerformanceMonitoring?: boolean;
  targetFPS?: number;
  qualityLevels?: QualityLevel[];
}

interface QualityLevel {
  name: string;
  pixelRatio: number;
  shadowMapSize: number;
  antialias: boolean;
  maxLights: number;
  lodDistance: number;
  particleCount: number;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
}

const DEFAULT_QUALITY_LEVELS: QualityLevel[] = [
  {
    name: 'low',
    pixelRatio: 1,
    shadowMapSize: 512,
    antialias: false,
    maxLights: 2,
    lodDistance: 50,
    particleCount: 100
  },
  {
    name: 'medium',
    pixelRatio: 1.5,
    shadowMapSize: 1024,
    antialias: true,
    maxLights: 4,
    lodDistance: 100,
    particleCount: 500
  },
  {
    name: 'high',
    pixelRatio: 2,
    shadowMapSize: 2048,
    antialias: true,
    maxLights: 8,
    lodDistance: 200,
    particleCount: 1000
  }
];

const MobileThreeOptimizer: React.FC<MobileThreeOptimizerProps> = ({
  children,
  enableAdaptiveQuality = true,
  enablePerformanceMonitoring = true,
  targetFPS = 30,
  qualityLevels = DEFAULT_QUALITY_LEVELS
}) => {
  const deviceInfo = useDeviceDetection();
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>(qualityLevels[0]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const performanceHistoryRef = useRef<number[]>([]);

  // Initialize quality based on device capabilities
  useEffect(() => {
    const initialQuality = determineInitialQuality();
    setCurrentQuality(initialQuality);
    
    // Apply quality settings to global Three.js context if available
    applyQualitySettings(initialQuality);
  }, [deviceInfo]);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    let animationId: number;
    
    const monitorPerformance = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      frameCountRef.current++;
      
      // Calculate FPS every second
      if (deltaTime >= 1000) {
        const fps = (frameCountRef.current * 1000) / deltaTime;
        const frameTime = deltaTime / frameCountRef.current;
        
        // Update performance history
        performanceHistoryRef.current.push(fps);
        if (performanceHistoryRef.current.length > 60) {
          performanceHistoryRef.current.shift();
        }
        
        // Get memory usage if available
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1048576 : 0; // MB
        
        setPerformanceMetrics({
          fps: Math.round(fps),
          frameTime: Math.round(frameTime * 100) / 100,
          memoryUsage: Math.round(memoryUsage),
          drawCalls: 0, // Would need Three.js renderer reference
          triangles: 0  // Would need Three.js renderer reference
        });
        
        // Adaptive quality adjustment
        if (enableAdaptiveQuality && !isOptimizing) {
          adjustQualityBasedOnPerformance(fps);
        }
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationId = requestAnimationFrame(monitorPerformance);
    };
    
    animationId = requestAnimationFrame(monitorPerformance);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enablePerformanceMonitoring, enableAdaptiveQuality, isOptimizing, targetFPS]);

  const determineInitialQuality = (): QualityLevel => {
    const { isMobile, isTablet, screenSize, pixelRatio, connectionType } = deviceInfo;
    
    // Very conservative for mobile devices
    if (isMobile && screenSize === 'xs') {
      return qualityLevels[0]; // Low quality
    }
    
    // Conservative for tablets and larger mobile screens
    if (isMobile || isTablet) {
      return qualityLevels[0]; // Low quality
    }
    
    // Check connection speed
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return qualityLevels[0]; // Low quality
    }
    
    // Desktop with good connection
    if (pixelRatio >= 2 && (connectionType === '4g' || connectionType === '5g')) {
      return qualityLevels[2]; // High quality
    }
    
    return qualityLevels[1]; // Medium quality
  };

  const adjustQualityBasedOnPerformance = async (currentFPS: number) => {
    const currentQualityIndex = qualityLevels.findIndex(q => q.name === currentQuality.name);
    const avgFPS = performanceHistoryRef.current.reduce((a, b) => a + b, 0) / performanceHistoryRef.current.length;
    
    setIsOptimizing(true);
    
    try {
      // If performance is consistently below target, reduce quality
      if (avgFPS < targetFPS * 0.8 && currentQualityIndex > 0) {
        const newQuality = qualityLevels[currentQualityIndex - 1];
        console.log(`Reducing quality to ${newQuality.name} (FPS: ${avgFPS})`);
        setCurrentQuality(newQuality);
        applyQualitySettings(newQuality);
        
        // Clear performance history to give new settings time to stabilize
        performanceHistoryRef.current = [];
      }
      // If performance is consistently above target, increase quality
      else if (avgFPS > targetFPS * 1.2 && currentQualityIndex < qualityLevels.length - 1) {
        const newQuality = qualityLevels[currentQualityIndex + 1];
        console.log(`Increasing quality to ${newQuality.name} (FPS: ${avgFPS})`);
        setCurrentQuality(newQuality);
        applyQualitySettings(newQuality);
        
        // Clear performance history to give new settings time to stabilize
        performanceHistoryRef.current = [];
      }
    } finally {
      // Delay before allowing another quality change
      setTimeout(() => {
        setIsOptimizing(false);
      }, 3000);
    }
  };

  const applyQualitySettings = (quality: QualityLevel) => {
    // This would typically interact with Three.js renderer
    // For now, we'll store the settings in a global context or pass them down
    
    // Example of how this might work:
    if (typeof window !== 'undefined') {
      (window as any).threeQualitySettings = quality;
      
      // Dispatch custom event for Three.js components to listen to
      window.dispatchEvent(new CustomEvent('threeQualityChange', {
        detail: quality
      }));
    }
  };

  const manualQualityChange = (qualityName: string) => {
    const quality = qualityLevels.find(q => q.name === qualityName);
    if (quality) {
      setCurrentQuality(quality);
      applyQualitySettings(quality);
      
      // Reset performance history
      performanceHistoryRef.current = [];
    }
  };

  // Mobile-specific optimizations
  const getMobileOptimizations = () => {
    if (!deviceInfo.isMobile) return {};
    
    return {
      // Reduce update frequency for mobile
      style: {
        willChange: 'transform',
        transform: 'translateZ(0)', // Force hardware acceleration
      },
      // Add touch-action for better touch handling
      touchAction: 'pan-x pan-y',
    };
  };

  return (
    <div className="relative w-full h-full" {...getMobileOptimizations()}>
      {children}
      
      {/* Performance overlay for development */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
          <div>FPS: {performanceMetrics.fps}</div>
          <div>Frame: {performanceMetrics.frameTime}ms</div>
          <div>Memory: {performanceMetrics.memoryUsage}MB</div>
          <div>Quality: {currentQuality.name}</div>
          <div>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>Screen: {deviceInfo.screenSize}</div>
          <div>Connection: {deviceInfo.connectionType || 'Unknown'}</div>
          
          {/* Manual quality controls */}
          <div className="mt-2 space-x-1">
            {qualityLevels.map((quality) => (
              <button
                key={quality.name}
                onClick={() => manualQualityChange(quality.name)}
                className={`px-2 py-1 text-xs rounded ${
                  currentQuality.name === quality.name
                    ? 'bg-blue-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {quality.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance warning for mobile */}
      {deviceInfo.isMobile && performanceMetrics.fps > 0 && performanceMetrics.fps < 20 && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-600 text-white p-3 rounded-lg text-sm z-50">
          <p className="font-semibold">Performance Notice</p>
          <p>3D content may run slowly on this device. Consider switching to 2D mode for better performance.</p>
        </div>
      )}
    </div>
  );
};

// Hook for accessing current quality settings
export const useThreeQuality = () => {
  const [quality, setQuality] = useState<QualityLevel>(DEFAULT_QUALITY_LEVELS[0]);
  
  useEffect(() => {
    const handleQualityChange = (event: CustomEvent<QualityLevel>) => {
      setQuality(event.detail);
    };
    
    window.addEventListener('threeQualityChange', handleQualityChange as EventListener);
    
    // Get initial quality if available
    if ((window as any).threeQualitySettings) {
      setQuality((window as any).threeQualitySettings);
    }
    
    return () => {
      window.removeEventListener('threeQualityChange', handleQualityChange as EventListener);
    };
  }, []);
  
  return quality;
};

export default MobileThreeOptimizer;