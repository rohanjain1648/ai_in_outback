import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TerrainSystem } from './TerrainSystem';
import { LightingSystem } from './LightingSystem';
import { WeatherSystem } from './WeatherSystem';
import { FloraSystem } from './FloraSystem';
import { CameraController } from './CameraController';

interface AustralianLandscapeProps {
  timeOfDay?: number; // 0-24 hours
  weatherType?: 'sunny' | 'rainy' | 'cloudy' | 'windy';
  region?: 'outback' | 'coastal' | 'forest' | 'grassland';
}

const LandscapeScene: React.FC<AustralianLandscapeProps> = ({
  timeOfDay = 12,
  weatherType = 'sunny',
  region = 'outback'
}) => {
  const sceneRef = useRef<THREE.Group>(null);

  return (
    <group ref={sceneRef}>
      {/* Lighting System */}
      <LightingSystem timeOfDay={timeOfDay} weatherType={weatherType} />
      
      {/* Terrain System */}
      <TerrainSystem region={region} />
      
      {/* Weather Effects */}
      <WeatherSystem type={weatherType} />
      
      {/* Australian Flora */}
      <FloraSystem region={region} density={0.3} />
      
      {/* Sky and Environment */}
      <Sky
        distance={450000}
        sunPosition={[
          Math.cos((timeOfDay / 24) * Math.PI * 2) * 100,
          Math.sin((timeOfDay / 24) * Math.PI * 2) * 100,
          0
        ]}
        inclination={0}
        azimuth={0.25}
      />
    </group>
  );
};

export const AustralianLandscape: React.FC<AustralianLandscapeProps> = (props) => {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        shadows
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#87CEEB'); // Sky blue background
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <LandscapeScene {...props} />
        <CameraController />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={500}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
};