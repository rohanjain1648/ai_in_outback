import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count: number;
  type: 'rain' | 'dust' | 'leaves' | 'embers' | 'pollen' | 'snow';
  intensity?: number; // 0-1
  windDirection?: [number, number, number];
  windStrength?: number;
  area?: [number, number, number]; // [width, height, depth]
}

// Enhanced particle system with multiple effect types
export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count,
  type,
  intensity = 0.7,
  windDirection = [1, 0, 0],
  windStrength = 0.5,
  area = [200, 100, 200]
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>();
  const lifetimesRef = useRef<Float32Array>();
  
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    
    const particleConfigs = {
      rain: {
        color: [0.3, 0.5, 0.8],
        sizeRange: [0.1, 0.3],
        velocityRange: { x: [-2, 2], y: [-25, -15], z: [-2, 2] },
        lifetime: [5, 10]
      },
      dust: {
        color: [0.8, 0.7, 0.5],
        sizeRange: [0.5, 1.5],
        velocityRange: { x: [-5, 5], y: [-1, 3], z: [-5, 5] },
        lifetime: [10, 20]
      },
      leaves: {
        color: [0.2, 0.6, 0.1],
        sizeRange: [0.8, 2.0],
        velocityRange: { x: [-3, 3], y: [-8, -2], z: [-3, 3] },
        lifetime: [8, 15]
      },
      embers: {
        color: [1.0, 0.3, 0.1],
        sizeRange: [0.3, 0.8],
        velocityRange: { x: [-2, 2], y: [2, 8], z: [-2, 2] },
        lifetime: [3, 8]
      },
      pollen: {
        color: [1.0, 1.0, 0.6],
        sizeRange: [0.2, 0.5],
        velocityRange: { x: [-1, 1], y: [-0.5, 0.5], z: [-1, 1] },
        lifetime: [15, 30]
      },
      snow: {
        color: [0.9, 0.9, 1.0],
        sizeRange: [0.5, 1.2],
        velocityRange: { x: [-1, 1], y: [-5, -2], z: [-1, 1] },
        lifetime: [10, 20]
      }
    };
    
    const config = particleConfigs[type];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random position within area
      positions[i3] = (Math.random() - 0.5) * area[0];
      positions[i3 + 1] = Math.random() * area[1];
      positions[i3 + 2] = (Math.random() - 0.5) * area[2];
      
      // Color with variation
      const colorVariation = 0.2;
      colors[i3] = config.color[0] + (Math.random() - 0.5) * colorVariation;
      colors[i3 + 1] = config.color[1] + (Math.random() - 0.5) * colorVariation;
      colors[i3 + 2] = config.color[2] + (Math.random() - 0.5) * colorVariation;
      
      // Size
      sizes[i] = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
      
      // Velocity
      velocities[i3] = config.velocityRange.x[0] + Math.random() * (config.velocityRange.x[1] - config.velocityRange.x[0]);
      velocities[i3 + 1] = config.velocityRange.y[0] + Math.random() * (config.velocityRange.y[1] - config.velocityRange.y[0]);
      velocities[i3 + 2] = config.velocityRange.z[0] + Math.random() * (config.velocityRange.z[1] - config.velocityRange.z[0]);
      
      // Lifetime
      lifetimes[i] = config.lifetime[0] + Math.random() * (config.lifetime[1] - config.lifetime[0]);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    velocitiesRef.current = velocities;
    lifetimesRef.current = lifetimes;
    
    // Material based on particle type
    let material;
    if (type === 'embers') {
      material = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
    } else {
      material = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });
    }
    
    return { geometry, material };
  }, [count, type, area]);
  
  useFrame((state, delta) => {
    if (particlesRef.current && velocitiesRef.current && lifetimesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = velocitiesRef.current;
      const lifetimes = lifetimesRef.current;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Apply wind effect
        const windEffect = windStrength * intensity;
        velocities[i3] += windDirection[0] * windEffect * delta;
        velocities[i3 + 1] += windDirection[1] * windEffect * delta;
        velocities[i3 + 2] += windDirection[2] * windEffect * delta;
        
        // Update positions
        positions[i3] += velocities[i3] * delta * intensity;
        positions[i3 + 1] += velocities[i3 + 1] * delta * intensity;
        positions[i3 + 2] += velocities[i3 + 2] * delta * intensity;
        
        // Update lifetime
        lifetimes[i] -= delta;
        
        // Reset particle if it's out of bounds or lifetime expired
        const outOfBounds = 
          Math.abs(positions[i3]) > area[0] / 2 ||
          positions[i3 + 1] < 0 || positions[i3 + 1] > area[1] ||
          Math.abs(positions[i3 + 2]) > area[2] / 2 ||
          lifetimes[i] <= 0;
        
        if (outOfBounds) {
          // Reset position
          positions[i3] = (Math.random() - 0.5) * area[0];
          positions[i3 + 1] = area[1];
          positions[i3 + 2] = (Math.random() - 0.5) * area[2];
          
          // Reset lifetime
          lifetimes[i] = 5 + Math.random() * 15;
          
          // Reset velocity with some variation
          const baseVel = velocitiesRef.current;
          velocities[i3] = baseVel[i3] + (Math.random() - 0.5) * 2;
          velocities[i3 + 1] = baseVel[i3 + 1] + (Math.random() - 0.5) * 2;
          velocities[i3 + 2] = baseVel[i3 + 2] + (Math.random() - 0.5) * 2;
        }
        
        // Special behaviors for different particle types
        if (type === 'leaves') {
          // Add tumbling motion for leaves
          const tumble = Math.sin(state.clock.elapsedTime * 2 + i) * 0.5;
          velocities[i3] += tumble * delta;
          velocities[i3 + 2] += Math.cos(state.clock.elapsedTime * 1.5 + i) * 0.3 * delta;
        } else if (type === 'embers') {
          // Add upward drift and flickering for embers
          velocities[i3 + 1] += Math.sin(state.clock.elapsedTime * 5 + i) * 2 * delta;
        } else if (type === 'pollen') {
          // Add floating motion for pollen
          positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 3 + i) * 0.1 * delta;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
};

// Weather-based particle effects
export const WeatherParticles: React.FC<{
  weatherType: 'sunny' | 'rainy' | 'cloudy' | 'windy' | 'stormy';
  intensity?: number;
  region: 'outback' | 'coastal' | 'forest' | 'grassland';
}> = ({ weatherType, intensity = 0.7, region }) => {
  const getParticleEffects = () => {
    const effects = [];
    
    switch (weatherType) {
      case 'rainy':
        effects.push(
          <ParticleSystem
            key="rain"
            count={Math.floor(intensity * 1000)}
            type="rain"
            intensity={intensity}
            windDirection={[0.2, 0, 0.1]}
            windStrength={0.3}
          />
        );
        break;
        
      case 'windy':
        if (region === 'outback') {
          effects.push(
            <ParticleSystem
              key="dust"
              count={Math.floor(intensity * 300)}
              type="dust"
              intensity={intensity}
              windDirection={[1, 0.1, 0]}
              windStrength={0.8}
            />
          );
        } else {
          effects.push(
            <ParticleSystem
              key="leaves"
              count={Math.floor(intensity * 150)}
              type="leaves"
              intensity={intensity}
              windDirection={[0.8, -0.2, 0.3]}
              windStrength={0.6}
            />
          );
        }
        break;
        
      case 'sunny':
        if (region === 'forest' || region === 'grassland') {
          effects.push(
            <ParticleSystem
              key="pollen"
              count={Math.floor(intensity * 100)}
              type="pollen"
              intensity={intensity * 0.5}
              windDirection={[0.1, 0.05, 0.1]}
              windStrength={0.2}
            />
          );
        }
        break;
        
      case 'stormy':
        effects.push(
          <ParticleSystem
            key="storm-rain"
            count={Math.floor(intensity * 1500)}
            type="rain"
            intensity={intensity}
            windDirection={[0.8, 0, 0.3]}
            windStrength={1.0}
          />
        );
        break;
    }
    
    return effects;
  };
  
  return <>{getParticleEffects()}</>;
};

// Magical/atmospheric particle effects for special moments
export const AtmosphericEffects: React.FC<{
  type: 'fireflies' | 'sparkles' | 'aurora' | 'floating-lights';
  intensity?: number;
  color?: [number, number, number];
}> = ({ type, intensity = 0.5, color = [1, 1, 0.8] }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const count = Math.floor(intensity * 200);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute particles in a sphere for fireflies/sparkles
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = Math.random() * 30 + 5;
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Color variation
      colors[i3] = color[0] + (Math.random() - 0.5) * 0.3;
      colors[i3 + 1] = color[1] + (Math.random() - 0.5) * 0.3;
      colors[i3 + 2] = color[2] + (Math.random() - 0.5) * 0.3;
      
      sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    return { geometry, material };
  }, [intensity, color]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        
        // Floating motion
        positions[i + 1] += Math.sin(time * 2 + index) * 0.02;
        
        // Twinkling effect
        sizes[index] = (0.5 + Math.sin(time * 5 + index) * 0.5) * (1 + Math.random() * 0.5);
        
        // Gentle drift
        positions[i] += Math.sin(time * 0.5 + index) * 0.01;
        positions[i + 2] += Math.cos(time * 0.3 + index) * 0.01;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
};