import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  targetFPS?: number;
  enableLOD?: boolean;
  enableFrustumCulling?: boolean;
  enableOcclusion?: boolean;
}

interface PerformanceStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryUsed?: number;
  memoryTotal?: number;
}

// LOD (Level of Detail) system
export const LODSystem: React.FC<{
  position: [number, number, number];
  children: [React.ReactNode, React.ReactNode, React.ReactNode]; // [high, medium, low] detail
  distances?: [number, number]; // [medium, low] distance thresholds
}> = ({ position, children, distances = [50, 100] }) => {
  const lodRef = useRef<THREE.LOD>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (lodRef.current) {
      // Clear existing levels
      while (lodRef.current.children.length > 0) {
        lodRef.current.remove(lodRef.current.children[0]);
      }
      
      // Add LOD levels (this would need to be adapted for React Three Fiber)
      // For now, we'll use a simpler distance-based visibility approach
    }
  }, [children, distances]);
  
  const [currentLOD, setCurrentLOD] = useState(0);
  
  useFrame(() => {
    if (lodRef.current) {
      const distance = camera.position.distanceTo(new THREE.Vector3(...position));
      
      let newLOD = 0;
      if (distance > distances[1]) {
        newLOD = 2; // Low detail
      } else if (distance > distances[0]) {
        newLOD = 1; // Medium detail
      } else {
        newLOD = 0; // High detail
      }
      
      if (newLOD !== currentLOD) {
        setCurrentLOD(newLOD);
      }
    }
  });
  
  return (
    <group ref={lodRef} position={position}>
      {children[currentLOD]}
    </group>
  );
};

// Enhanced performance monitoring component
const PerformanceMonitor: React.FC<{
  onStatsUpdate: (stats: PerformanceStats) => void;
}> = ({ onStatsUpdate }) => {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const memoryUsage = useRef({ used: 0, total: 0 });
  
  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;
    
    if (deltaTime >= 1000) { // Update every second
      const fps = (frameCount.current * 1000) / deltaTime;
      fpsHistory.current.push(fps);
      
      // Keep only last 10 seconds of history
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift();
      }
      
      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage.current = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576) // MB
        };
      }
      
      const stats: PerformanceStats = {
        fps: Math.round(fps),
        frameTime: deltaTime / frameCount.current,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        memoryUsed: memoryUsage.current.used,
        memoryTotal: memoryUsage.current.total
      };
      
      onStatsUpdate(stats);
      
      frameCount.current = 0;
      lastTime.current = currentTime;
      
      // Reset WebGL info for next measurement
      gl.info.reset();
    }
  });
  
  return null;
};

// Adaptive quality system
const AdaptiveQuality: React.FC<{
  stats: PerformanceStats;
  targetFPS: number;
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
}> = ({ stats, targetFPS, onQualityChange }) => {
  const [currentQuality, setCurrentQuality] = useState<'low' | 'medium' | 'high'>('high');
  const qualityChangeTimeout = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Clear existing timeout
    if (qualityChangeTimeout.current) {
      clearTimeout(qualityChangeTimeout.current);
    }
    
    // Debounce quality changes to avoid rapid switching
    qualityChangeTimeout.current = setTimeout(() => {
      let newQuality = currentQuality;
      
      if (stats.fps < targetFPS * 0.8) {
        // Performance is poor, reduce quality
        if (currentQuality === 'high') {
          newQuality = 'medium';
        } else if (currentQuality === 'medium') {
          newQuality = 'low';
        }
      } else if (stats.fps > targetFPS * 1.1) {
        // Performance is good, increase quality
        if (currentQuality === 'low') {
          newQuality = 'medium';
        } else if (currentQuality === 'medium') {
          newQuality = 'high';
        }
      }
      
      if (newQuality !== currentQuality) {
        setCurrentQuality(newQuality);
        onQualityChange(newQuality);
      }
    }, 2000); // Wait 2 seconds before changing quality
    
    return () => {
      if (qualityChangeTimeout.current) {
        clearTimeout(qualityChangeTimeout.current);
      }
    };
  }, [stats.fps, targetFPS, currentQuality, onQualityChange]);
  
  return null;
};

// Frustum culling helper
const FrustumCuller: React.FC<{
  children: React.ReactNode;
  boundingBox: THREE.Box3;
}> = ({ children, boundingBox }) => {
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);
  const frustum = useRef(new THREE.Frustum());
  const matrix = useRef(new THREE.Matrix4());
  
  useFrame(() => {
    // Update frustum from camera
    matrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(matrix.current);
    
    // Check if bounding box intersects with frustum
    const visible = frustum.current.intersectsBox(boundingBox);
    
    if (visible !== isVisible) {
      setIsVisible(visible);
    }
  });
  
  return isVisible ? <>{children}</> : null;
};

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  targetFPS = 60,
  enableLOD = true,
  enableFrustumCulling = true,
  enableOcclusion = false
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0
  });
  
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const { gl } = useThree();
  
  // Configure renderer based on quality
  useEffect(() => {
    const renderer = gl;
    
    switch (quality) {
      case 'low':
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        renderer.shadowMap.enabled = false;
        renderer.antialias = false;
        break;
      case 'medium':
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer.antialias = false;
        break;
      case 'high':
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.antialias = true;
        break;
    }
  }, [quality, gl]);
  
  // Performance debugging overlay (only in development)
  const showDebugOverlay = process.env.NODE_ENV === 'development';
  
  return (
    <>
      <PerformanceMonitor onStatsUpdate={setStats} />
      <AdaptiveQuality
        stats={stats}
        targetFPS={targetFPS}
        onQualityChange={setQuality}
      />
      
      {children}
      
      {/* Debug overlay */}
      {showDebugOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div>FPS: {stats.fps}</div>
          <div>Frame Time: {stats.frameTime.toFixed(2)}ms</div>
          <div>Draw Calls: {stats.drawCalls}</div>
          <div>Triangles: {stats.triangles.toLocaleString()}</div>
          <div>Quality: {quality}</div>
          <div>Geometries: {stats.geometries}</div>
          <div>Textures: {stats.textures}</div>
          {stats.memoryUsed && (
            <div>Memory: {stats.memoryUsed}MB / {stats.memoryTotal}MB</div>
          )}
        </div>
      )}
    </>
  );
};