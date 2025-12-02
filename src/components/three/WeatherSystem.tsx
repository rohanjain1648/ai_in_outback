import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeatherSystemProps {
  type: 'sunny' | 'rainy' | 'cloudy' | 'windy';
  intensity?: number; // 0-1
}

// Rain particle system
const RainSystem: React.FC<{ intensity: number }> = ({ intensity }) => {
  const rainRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>();
  
  const { geometry, material } = useMemo(() => {
    const particleCount = Math.floor(intensity * 2000);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocitiesArray = new Float32Array(particleCount * 3);
    
    // Initialize rain particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200; // x
      positions[i3 + 1] = Math.random() * 100 + 50; // y (height)
      positions[i3 + 2] = (Math.random() - 0.5) * 200; // z
      
      velocitiesArray[i3] = (Math.random() - 0.5) * 2; // x velocity (wind)
      velocitiesArray[i3 + 1] = -Math.random() * 20 - 10; // y velocity (falling)
      velocitiesArray[i3 + 2] = (Math.random() - 0.5) * 2; // z velocity (wind)
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    velocities.current = velocitiesArray;
    
    const material = new THREE.PointsMaterial({
      color: '#4682B4',
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });
    
    return { geometry, material };
  }, [intensity]);
  
  useFrame((state, delta) => {
    if (rainRef.current && velocities.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      const vels = velocities.current;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Update positions
        positions[i] += vels[i] * delta;
        positions[i + 1] += vels[i + 1] * delta;
        positions[i + 2] += vels[i + 2] * delta;
        
        // Reset particles that fall below ground
        if (positions[i + 1] < 0) {
          positions[i] = (Math.random() - 0.5) * 200;
          positions[i + 1] = Math.random() * 50 + 50;
          positions[i + 2] = (Math.random() - 0.5) * 200;
        }
        
        // Wrap particles horizontally
        if (Math.abs(positions[i]) > 100) {
          positions[i] = -positions[i];
        }
        if (Math.abs(positions[i + 2]) > 100) {
          positions[i + 2] = -positions[i + 2];
        }
      }
      
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return <points ref={rainRef} geometry={geometry} material={material} />;
};

// Cloud system
const CloudSystem: React.FC<{ intensity: number }> = ({ intensity }) => {
  const cloudsRef = useRef<THREE.Group>(null);
  
  const clouds = useMemo(() => {
    const cloudCount = Math.floor(intensity * 8);
    const cloudData = [];
    
    for (let i = 0; i < cloudCount; i++) {
      cloudData.push({
        position: [
          (Math.random() - 0.5) * 300,
          Math.random() * 30 + 40,
          (Math.random() - 0.5) * 300
        ] as [number, number, number],
        scale: Math.random() * 15 + 10,
        opacity: Math.random() * 0.4 + 0.3,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    
    return cloudData;
  }, [intensity]);
  
  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud, index) => {
        cloud.position.x += clouds[index].speed * delta;
        
        // Wrap clouds around
        if (cloud.position.x > 150) {
          cloud.position.x = -150;
        }
      });
    }
  });
  
  return (
    <group ref={cloudsRef}>
      {clouds.map((cloud, index) => (
        <mesh key={index} position={cloud.position}>
          <sphereGeometry args={[cloud.scale, 16, 16]} />
          <meshLambertMaterial
            color="#ffffff"
            transparent
            opacity={cloud.opacity}
          />
        </mesh>
      ))}
    </group>
  );
};

// Wind effect system
const WindSystem: React.FC<{ intensity: number }> = ({ intensity }) => {
  const windRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>();
  
  const { geometry, material } = useMemo(() => {
    const particleCount = Math.floor(intensity * 500);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocitiesArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 20 + 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;
      
      velocitiesArray[i3] = Math.random() * 10 + 5; // Strong horizontal wind
      velocitiesArray[i3 + 1] = (Math.random() - 0.5) * 2;
      velocitiesArray[i3 + 2] = (Math.random() - 0.5) * 3;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    velocities.current = velocitiesArray;
    
    const material = new THREE.PointsMaterial({
      color: '#F5DEB3',
      size: 1,
      transparent: true,
      opacity: 0.3
    });
    
    return { geometry, material };
  }, [intensity]);
  
  useFrame((state, delta) => {
    if (windRef.current && velocities.current) {
      const positions = windRef.current.geometry.attributes.position.array as Float32Array;
      const vels = velocities.current;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += vels[i] * delta;
        positions[i + 1] += vels[i + 1] * delta;
        positions[i + 2] += vels[i + 2] * delta;
        
        // Reset particles that move too far
        if (positions[i] > 100) {
          positions[i] = -100;
        }
        if (Math.abs(positions[i + 2]) > 100) {
          positions[i + 2] = (Math.random() - 0.5) * 200;
        }
      }
      
      windRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return <points ref={windRef} geometry={geometry} material={material} />;
};

export const WeatherSystem: React.FC<WeatherSystemProps> = ({
  type,
  intensity = 0.7
}) => {
  return (
    <group>
      {type === 'rainy' && <RainSystem intensity={intensity} />}
      {(type === 'cloudy' || type === 'rainy') && <CloudSystem intensity={intensity} />}
      {type === 'windy' && <WindSystem intensity={intensity} />}
      
      {/* Fog for atmospheric effect */}
      {(type === 'rainy' || type === 'cloudy') && (
        <fog attach="fog" args={['#ffffff', 50, 200]} />
      )}
    </group>
  );
};