import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableKeyboardControls?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enableKeyboardControls = true
}) => {
  const { camera, gl } = useThree();
  const keysPressed = useRef<Set<string>>(new Set());
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  
  // Initialize target positions
  useEffect(() => {
    targetPosition.current.copy(camera.position);
    targetLookAt.current.set(0, 0, 0);
    currentLookAt.current.set(0, 0, 0);
  }, [camera]);
  
  // Keyboard event handlers
  useEffect(() => {
    if (!enableKeyboardControls) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.code);
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.code);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableKeyboardControls]);
  
  // Predefined camera positions for different views
  const cameraPresets = {
    overview: { position: [0, 80, 120], lookAt: [0, 0, 0] },
    ground: { position: [0, 5, 20], lookAt: [0, 5, 0] },
    aerial: { position: [50, 100, 50], lookAt: [0, 0, 0] },
    forest: { position: [20, 15, 30], lookAt: [0, 10, 0] },
    sunset: { position: [-80, 30, 40], lookAt: [0, 0, 0] }
  };
  
  // Smooth camera transition function
  const transitionToPreset = (presetName: keyof typeof cameraPresets) => {
    const preset = cameraPresets[presetName];
    targetPosition.current.set(...preset.position);
    targetLookAt.current.set(...preset.lookAt);
  };
  
  // Handle keyboard controls
  const handleKeyboardControls = (delta: number) => {
    if (!enableKeyboardControls) return;
    
    const moveSpeed = 30 * delta;
    const rotateSpeed = 2 * delta;
    
    // Movement controls
    if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      targetPosition.current.add(forward.multiplyScalar(moveSpeed));
    }
    
    if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
      const backward = new THREE.Vector3(0, 0, 1);
      backward.applyQuaternion(camera.quaternion);
      targetPosition.current.add(backward.multiplyScalar(moveSpeed));
    }
    
    if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(camera.quaternion);
      targetPosition.current.add(left.multiplyScalar(moveSpeed));
    }
    
    if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      targetPosition.current.add(right.multiplyScalar(moveSpeed));
    }
    
    // Vertical movement
    if (keysPressed.current.has('KeyQ')) {
      targetPosition.current.y += moveSpeed;
    }
    
    if (keysPressed.current.has('KeyE')) {
      targetPosition.current.y -= moveSpeed;
    }
    
    // Preset camera positions
    if (keysPressed.current.has('Digit1')) {
      transitionToPreset('overview');
      keysPressed.current.delete('Digit1');
    }
    
    if (keysPressed.current.has('Digit2')) {
      transitionToPreset('ground');
      keysPressed.current.delete('Digit2');
    }
    
    if (keysPressed.current.has('Digit3')) {
      transitionToPreset('aerial');
      keysPressed.current.delete('Digit3');
    }
    
    if (keysPressed.current.has('Digit4')) {
      transitionToPreset('forest');
      keysPressed.current.delete('Digit4');
    }
    
    if (keysPressed.current.has('Digit5')) {
      transitionToPreset('sunset');
      keysPressed.current.delete('Digit5');
    }
    
    // Constrain camera position to reasonable bounds
    targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, -200, 200);
    targetPosition.current.y = THREE.MathUtils.clamp(targetPosition.current.y, 2, 150);
    targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -200, 200);
  };
  
  // Auto-rotation logic
  const handleAutoRotation = (delta: number) => {
    if (!autoRotate) return;
    
    const radius = targetPosition.current.distanceTo(targetLookAt.current);
    const angle = Date.now() * 0.001 * autoRotateSpeed;
    
    targetPosition.current.x = Math.cos(angle) * radius;
    targetPosition.current.z = Math.sin(angle) * radius;
  };
  
  useFrame((state, delta) => {
    // Handle controls
    handleKeyboardControls(delta);
    handleAutoRotation(delta);
    
    // Smooth camera position interpolation
    camera.position.lerp(targetPosition.current, delta * 2);
    
    // Smooth look-at interpolation
    currentLookAt.current.lerp(targetLookAt.current, delta * 2);
    camera.lookAt(currentLookAt.current);
    
    // Update camera matrix
    camera.updateMatrixWorld();
  });
  
  // Expose control functions for external use
  useEffect(() => {
    // Add methods to window for debugging/external control
    (window as any).cameraControls = {
      setPreset: transitionToPreset,
      setPosition: (x: number, y: number, z: number) => {
        targetPosition.current.set(x, y, z);
      },
      setLookAt: (x: number, y: number, z: number) => {
        targetLookAt.current.set(x, y, z);
      },
      getCurrentPosition: () => camera.position.clone(),
      getAvailablePresets: () => Object.keys(cameraPresets)
    };
    
    return () => {
      delete (window as any).cameraControls;
    };
  }, [camera]);
  
  return null; // This component doesn't render anything visible
};