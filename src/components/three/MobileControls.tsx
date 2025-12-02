import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface MobileControlsProps {
  enableTouch?: boolean;
  enableGyroscope?: boolean;
  enableGestures?: boolean;
  onGesture?: (gesture: GestureType) => void;
}

type GestureType = 'tap' | 'double-tap' | 'pinch' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  enableTouch = true,
  enableGyroscope = true,
  enableGestures = true,
  onGesture
}) => {
  const { camera, gl, size } = useThree();
  const [touches, setTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [lastTap, setLastTap] = useState(0);
  const [gyroData, setGyroData] = useState({ alpha: 0, beta: 0, gamma: 0 });
  
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());
  const initialCameraPosition = useRef(new THREE.Vector3());
  
  // Initialize camera references
  useEffect(() => {
    cameraPosition.current.copy(camera.position);
    cameraTarget.current.set(0, 0, 0);
    initialCameraPosition.current.copy(camera.position);
  }, [camera]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enableTouch) return;
    
    event.preventDefault();
    const newTouches = new Map(touches);
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      newTouches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now()
      });
    }
    
    setTouches(newTouches);
  }, [touches, enableTouch]);
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enableTouch) return;
    
    event.preventDefault();
    const newTouches = new Map(touches);
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const existingTouch = newTouches.get(touch.identifier);
      
      if (existingTouch) {
        newTouches.set(touch.identifier, {
          ...existingTouch,
          x: touch.clientX,
          y: touch.clientY
        });
      }
    }
    
    setTouches(newTouches);
    
    // Handle camera movement based on touch
    if (newTouches.size === 1) {
      // Single touch - rotate camera
      const touch = Array.from(newTouches.values())[0];
      const deltaX = touch.x - touch.startX;
      const deltaY = touch.y - touch.startY;
      
      // Convert touch movement to camera rotation
      const rotationSpeed = 0.005;
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(cameraPosition.current.clone().sub(cameraTarget.current));
      
      spherical.theta -= deltaX * rotationSpeed;
      spherical.phi += deltaY * rotationSpeed;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      cameraPosition.current.setFromSpherical(spherical).add(cameraTarget.current);
    } else if (newTouches.size === 2) {
      // Two touches - zoom and pan
      const touchArray = Array.from(newTouches.values());
      const touch1 = touchArray[0];
      const touch2 = touchArray[1];
      
      // Calculate current distance between touches
      const currentDistance = Math.sqrt(
        Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
      );
      
      // Calculate initial distance
      const initialDistance = Math.sqrt(
        Math.pow(touch2.startX - touch1.startX, 2) + Math.pow(touch2.startY - touch1.startY, 2)
      );
      
      // Zoom based on pinch gesture
      if (initialDistance > 0) {
        const zoomFactor = currentDistance / initialDistance;
        const distance = cameraPosition.current.distanceTo(cameraTarget.current);
        const newDistance = Math.max(5, Math.min(200, distance / zoomFactor));
        
        const direction = cameraPosition.current.clone().sub(cameraTarget.current).normalize();
        cameraPosition.current.copy(cameraTarget.current).add(direction.multiplyScalar(newDistance));
      }
    }
  }, [touches, enableTouch]);
  
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enableTouch) return;
    
    event.preventDefault();
    const newTouches = new Map(touches);
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = newTouches.get(touch.identifier);
      
      if (touchData && enableGestures) {
        const deltaX = touch.clientX - touchData.startX;
        const deltaY = touch.clientY - touchData.startY;
        const deltaTime = Date.now() - touchData.startTime;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Detect gestures
        if (deltaTime < 300 && distance < 10) {
          // Tap gesture
          const now = Date.now();
          if (now - lastTap < 300) {
            onGesture?.('double-tap');
          } else {
            onGesture?.('tap');
          }
          setLastTap(now);
        } else if (distance > 50 && deltaTime < 500) {
          // Swipe gesture
          const angle = Math.atan2(deltaY, deltaX);
          const absAngle = Math.abs(angle);
          
          if (absAngle < Math.PI / 4) {
            onGesture?.('swipe-right');
          } else if (absAngle > 3 * Math.PI / 4) {
            onGesture?.('swipe-left');
          } else if (angle > 0) {
            onGesture?.('swipe-down');
          } else {
            onGesture?.('swipe-up');
          }
        }
      }
      
      newTouches.delete(touch.identifier);
    }
    
    setTouches(newTouches);
  }, [touches, enableTouch, enableGestures, onGesture, lastTap]);
  
  // Gyroscope/device orientation handler
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!enableGyroscope) return;
    
    const alpha = event.alpha || 0; // Z axis rotation
    const beta = event.beta || 0;   // X axis rotation
    const gamma = event.gamma || 0; // Y axis rotation
    
    setGyroData({ alpha, beta, gamma });
    
    // Apply gyroscope data to camera (subtle effect)
    const gyroInfluence = 0.002;
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(cameraPosition.current.clone().sub(cameraTarget.current));
    
    spherical.theta += (gamma - gyroData.gamma) * gyroInfluence;
    spherical.phi += (beta - gyroData.beta) * gyroInfluence * 0.5;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    
    cameraPosition.current.setFromSpherical(spherical).add(cameraTarget.current);
  }, [enableGyroscope, gyroData]);
  
  // Set up event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    
    if (enableTouch) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    if (enableGyroscope && 'DeviceOrientationEvent' in window) {
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    }
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [gl.domElement, enableTouch, enableGyroscope, handleTouchStart, handleTouchMove, handleTouchEnd, handleDeviceOrientation]);
  
  // Apply camera updates
  useFrame(() => {
    camera.position.lerp(cameraPosition.current, 0.1);
    camera.lookAt(cameraTarget.current);
  });
  
  return null;
};

// Touch-friendly UI overlay for mobile devices
export const MobileUI: React.FC<{
  onCameraReset?: () => void;
  onSectionChange?: (section: string) => void;
  currentSection?: string;
}> = ({ onCameraReset, onSectionChange, currentSection }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  
  const sections = [
    { id: 'agriculture', name: 'Farm', icon: '🌾' },
    { id: 'community', name: 'Community', icon: '🏘️' },
    { id: 'emergency', name: 'Emergency', icon: '🚨' },
    { id: 'wellbeing', name: 'Wellbeing', icon: '💚' },
    { id: 'business', name: 'Business', icon: '🏢' },
    { id: 'culture', name: 'Culture', icon: '📖' },
    { id: 'skills', name: 'Skills', icon: '🎓' }
  ];
  
  // Auto-hide UI after inactivity
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleTouch = () => {
    setIsVisible(true);
  };
  
  return (
    <div 
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-30'
      }`}
      onTouchStart={handleTouch}
    >
      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
        <button
          className="bg-black bg-opacity-50 text-white p-3 rounded-full backdrop-blur-sm"
          onClick={() => setShowSectionMenu(!showSectionMenu)}
        >
          <span className="text-xl">☰</span>
        </button>
        
        <button
          className="bg-black bg-opacity-50 text-white p-3 rounded-full backdrop-blur-sm"
          onClick={onCameraReset}
        >
          <span className="text-xl">🎯</span>
        </button>
      </div>
      
      {/* Section menu */}
      {showSectionMenu && (
        <div className="absolute top-16 left-4 bg-black bg-opacity-80 rounded-lg p-2 pointer-events-auto backdrop-blur-sm">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`block w-full text-left p-3 rounded text-white hover:bg-white hover:bg-opacity-20 transition-colors ${
                currentSection === section.id ? 'bg-blue-500 bg-opacity-50' : ''
              }`}
              onClick={() => {
                onSectionChange?.(section.id);
                setShowSectionMenu(false);
              }}
            >
              <span className="mr-2">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Bottom instructions */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
        <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg backdrop-blur-sm text-center">
          <p className="text-sm mb-2">Touch Controls:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>👆 Drag to rotate</div>
            <div>🤏 Pinch to zoom</div>
            <div>👆👆 Double tap to focus</div>
            <div>📱 Tilt device to look around</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Haptic feedback for mobile interactions
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);
  
  return { triggerHaptic };
};