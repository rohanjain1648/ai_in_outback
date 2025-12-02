import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TerrainSystemProps {
  region: 'outback' | 'coastal' | 'forest' | 'grassland';
  size?: number;
  resolution?: number;
}

// Noise function for terrain generation
const noise = (x: number, y: number, scale: number = 1): number => {
  return (Math.sin(x * scale) + Math.cos(y * scale) + Math.sin((x + y) * scale * 0.5)) / 3;
};

// Generate height map for Australian terrain
const generateHeightMap = (width: number, height: number, region: string): Float32Array => {
  const size = width * height;
  const data = new Float32Array(size);
  
  const regionConfigs = {
    outback: { amplitude: 15, frequency: 0.02, roughness: 0.8 },
    coastal: { amplitude: 8, frequency: 0.03, roughness: 0.4 },
    forest: { amplitude: 25, frequency: 0.015, roughness: 1.2 },
    grassland: { amplitude: 5, frequency: 0.025, roughness: 0.3 }
  };
  
  const config = regionConfigs[region as keyof typeof regionConfigs] || regionConfigs.outback;
  
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const x = (j - width / 2) * config.frequency;
      const y = (i - height / 2) * config.frequency;
      
      // Multi-octave noise for realistic terrain
      let elevation = 0;
      let amplitude = config.amplitude;
      let frequency = 1;
      
      for (let octave = 0; octave < 4; octave++) {
        elevation += noise(x * frequency, y * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      
      // Add region-specific features
      if (region === 'outback') {
        // Add mesa-like formations
        const mesa = Math.max(0, noise(x * 0.005, y * 0.005) - 0.3) * 30;
        elevation += mesa;
      } else if (region === 'coastal') {
        // Gentle slopes toward water
        const distance = Math.sqrt(x * x + y * y);
        elevation -= Math.max(0, distance * 0.1 - 20);
      }
      
      data[i * width + j] = Math.max(0, elevation * config.roughness);
    }
  }
  
  return data;
};

// Generate terrain texture based on region
const generateTerrainTexture = (region: string): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  const regionColors = {
    outback: ['#D2691E', '#CD853F', '#F4A460', '#DEB887'], // Sandy browns and tans
    coastal: ['#F5DEB3', '#D2B48C', '#BC8F8F', '#A0522D'], // Beach and cliff colors
    forest: ['#228B22', '#32CD32', '#6B8E23', '#556B2F'], // Various greens
    grassland: ['#9ACD32', '#ADFF2F', '#7CFC00', '#32CD32'] // Grass greens
  };
  
  const colors = regionColors[region as keyof typeof regionColors] || regionColors.outback;
  
  // Create gradient texture
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add texture noise
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  
  return texture;
};

export const TerrainSystem: React.FC<TerrainSystemProps> = ({
  region,
  size = 200,
  resolution = 128
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const { geometry, material } = useMemo(() => {
    // Generate terrain geometry
    const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    const heightMap = generateHeightMap(resolution, resolution, region);
    
    // Apply height map to vertices
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      const index = Math.floor(i / 3);
      vertices[i + 2] = heightMap[index] || 0;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Create material with region-appropriate texture
    const texture = generateTerrainTexture(region);
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    
    return { geometry, material };
  }, [region, size, resolution]);
  
  useFrame(() => {
    if (meshRef.current) {
      // Subtle terrain animation for wind effects
      const time = Date.now() * 0.001;
      meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.002;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    />
  );
};