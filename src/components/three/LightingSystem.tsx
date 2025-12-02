import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightingSystemProps {
  timeOfDay: number; // 0-24 hours
  weatherType: 'sunny' | 'rainy' | 'cloudy' | 'windy';
}

export const LightingSystem: React.FC<LightingSystemProps> = ({
  timeOfDay,
  weatherType
}) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemisphereRef = useRef<THREE.HemisphereLight>(null);
  
  // Calculate sun position based on time of day
  const sunPosition = useMemo(() => {
    const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2; // Start at sunrise
    const elevation = Math.sin(angle) * 0.8 + 0.2; // Keep sun above horizon
    const azimuth = Math.cos(angle);
    
    return new THREE.Vector3(
      azimuth * 100,
      Math.max(5, elevation * 80), // Minimum height of 5
      Math.sin(angle * 0.5) * 50
    );
  }, [timeOfDay]);
  
  // Calculate lighting colors based on time and weather
  const lightingConfig = useMemo(() => {
    const isDaytime = timeOfDay >= 6 && timeOfDay <= 18;
    const isGoldenHour = (timeOfDay >= 5 && timeOfDay <= 7) || (timeOfDay >= 17 && timeOfDay <= 19);
    const isNight = timeOfDay < 6 || timeOfDay > 18;
    
    let sunColor = '#ffffff';
    let sunIntensity = 1;
    let ambientIntensity = 0.4;
    let skyColor = '#87CEEB';
    let groundColor = '#8B4513';
    
    // Time-based lighting
    if (isNight) {
      sunColor = '#4169E1'; // Moonlight blue
      sunIntensity = 0.2;
      ambientIntensity = 0.1;
      skyColor = '#191970'; // Midnight blue
      groundColor = '#2F4F4F'; // Dark slate gray
    } else if (isGoldenHour) {
      sunColor = '#FFD700'; // Golden
      sunIntensity = 0.8;
      ambientIntensity = 0.3;
      skyColor = '#FF6347'; // Tomato/orange sky
      groundColor = '#CD853F'; // Peru brown
    } else if (isDaytime) {
      sunColor = '#FFF8DC'; // Cornsilk - warm daylight
      sunIntensity = 1.2;
      ambientIntensity = 0.5;
      skyColor = '#87CEEB'; // Sky blue
      groundColor = '#DEB887'; // Burlywood
    }
    
    // Weather modifications
    switch (weatherType) {
      case 'rainy':
        sunIntensity *= 0.3;
        ambientIntensity *= 0.6;
        skyColor = '#708090'; // Slate gray
        break;
      case 'cloudy':
        sunIntensity *= 0.5;
        ambientIntensity *= 0.8;
        skyColor = '#B0C4DE'; // Light steel blue
        break;
      case 'windy':
        // Slightly more dramatic lighting for windy conditions
        sunIntensity *= 0.9;
        break;
    }
    
    return {
      sunColor,
      sunIntensity,
      ambientIntensity,
      skyColor,
      groundColor
    };
  }, [timeOfDay, weatherType]);
  
  // Animate lighting changes
  useFrame((state, delta) => {
    if (sunRef.current) {
      // Smooth sun position updates
      sunRef.current.position.lerp(sunPosition, delta * 2);
      sunRef.current.color.setHex(parseInt(lightingConfig.sunColor.replace('#', '0x')));
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        lightingConfig.sunIntensity,
        delta * 2
      );
      
      // Update shadow camera for better coverage
      sunRef.current.shadow.camera.left = -100;
      sunRef.current.shadow.camera.right = 100;
      sunRef.current.shadow.camera.top = 100;
      sunRef.current.shadow.camera.bottom = -100;
      sunRef.current.shadow.camera.near = 0.1;
      sunRef.current.shadow.camera.far = 200;
      sunRef.current.shadow.mapSize.width = 2048;
      sunRef.current.shadow.mapSize.height = 2048;
    }
    
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        lightingConfig.ambientIntensity,
        delta * 2
      );
    }
    
    if (hemisphereRef.current) {
      hemisphereRef.current.color.setHex(parseInt(lightingConfig.skyColor.replace('#', '0x')));
      hemisphereRef.current.groundColor.setHex(parseInt(lightingConfig.groundColor.replace('#', '0x')));
    }
  });
  
  return (
    <>
      {/* Main sun/moon light */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        intensity={lightingConfig.sunIntensity}
        color={lightingConfig.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Ambient lighting for overall scene illumination */}
      <ambientLight
        ref={ambientRef}
        intensity={lightingConfig.ambientIntensity}
        color="#ffffff"
      />
      
      {/* Hemisphere light for sky/ground color variation */}
      <hemisphereLight
        ref={hemisphereRef}
        color={lightingConfig.skyColor}
        groundColor={lightingConfig.groundColor}
        intensity={0.6}
      />
      
      {/* Additional fill light for Australian harsh sun conditions */}
      {timeOfDay >= 10 && timeOfDay <= 16 && weatherType === 'sunny' && (
        <directionalLight
          position={[50, 30, 50]}
          intensity={0.3}
          color="#FFF8DC"
        />
      )}
    </>
  );
};