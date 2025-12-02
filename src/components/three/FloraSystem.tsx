import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloraSystemProps {
  region: 'outback' | 'coastal' | 'forest' | 'grassland';
  density?: number; // 0-1
  windStrength?: number; // 0-1
}

// Eucalyptus tree component
const EucalyptusTree: React.FC<{
  position: [number, number, number];
  scale: number;
  windStrength: number;
}> = ({ position, scale, windStrength }) => {
  const treeRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (treeRef.current && windStrength > 0) {
      const time = state.clock.elapsedTime;
      const sway = Math.sin(time * 2 + position[0]) * windStrength * 0.1;
      treeRef.current.rotation.z = sway;
    }
    
    if (leavesRef.current && windStrength > 0) {
      const time = state.clock.elapsedTime;
      const leafSway = Math.sin(time * 3 + position[2]) * windStrength * 0.05;
      leavesRef.current.rotation.y = leafSway;
    }
  });
  
  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 16, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Leaves */}
      <mesh ref={leavesRef} position={[0, 14, 0]} castShadow>
        <sphereGeometry args={[4, 8, 6]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      
      {/* Additional foliage clusters */}
      <mesh position={[1, 12, 1]} castShadow>
        <sphereGeometry args={[2, 6, 4]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
      <mesh position={[-1, 13, -1]} castShadow>
        <sphereGeometry args={[1.5, 6, 4]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  );
};

// Wattle tree component
const WattleTree: React.FC<{
  position: [number, number, number];
  scale: number;
  windStrength: number;
}> = ({ position, scale, windStrength }) => {
  const treeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (treeRef.current && windStrength > 0) {
      const time = state.clock.elapsedTime;
      const sway = Math.sin(time * 1.5 + position[0] * 0.1) * windStrength * 0.08;
      treeRef.current.rotation.z = sway;
    }
  });
  
  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8, 6]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Golden wattle flowers */}
      <mesh position={[0, 7, 0]} castShadow>
        <sphereGeometry args={[2.5, 8, 6]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      
      {/* Green foliage */}
      <mesh position={[0.5, 6.5, 0.5]} castShadow>
        <sphereGeometry args={[1.5, 6, 4]} />
        <meshLambertMaterial color="#9ACD32" />
      </mesh>
    </group>
  );
};

// Grass system
const GrassSystem: React.FC<{
  count: number;
  region: string;
  windStrength: number;
}> = ({ count, region, windStrength }) => {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  
  const { positions, colors } = useMemo(() => {
    const positions = [];
    const colors = [];
    
    const regionGrassColors = {
      outback: ['#DAA520', '#B8860B', '#CD853F'], // Golden, dry grass
      coastal: ['#32CD32', '#228B22', '#9ACD32'], // Lush green
      forest: ['#228B22', '#006400', '#2E8B57'], // Deep forest greens
      grassland: ['#9ACD32', '#ADFF2F', '#7CFC00'] // Bright grassland
    };
    
    const grassColors = regionGrassColors[region as keyof typeof regionGrassColors] || regionGrassColors.grassland;
    
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * 180,
        0,
        (Math.random() - 0.5) * 180
      ]);
      
      colors.push(grassColors[Math.floor(Math.random() * grassColors.length)]);
    }
    
    return { positions, colors };
  }, [count, region]);
  
  useFrame((state) => {
    if (grassRef.current && windStrength > 0) {
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const matrix = new THREE.Matrix4();
        const position = positions[i];
        const sway = Math.sin(time * 2 + position[0] * 0.1) * windStrength * 0.3;
        
        matrix.makeRotationZ(sway);
        matrix.setPosition(position[0], position[1], position[2]);
        grassRef.current.setMatrixAt(i, matrix);
      }
      
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={grassRef} args={[undefined, undefined, count]} castShadow>
      <coneGeometry args={[0.1, 2, 4]} />
      <meshLambertMaterial color="#32CD32" />
    </instancedMesh>
  );
};

// Bush/shrub component
const AustralianBush: React.FC<{
  position: [number, number, number];
  scale: number;
  type: 'saltbush' | 'mallee' | 'banksia';
}> = ({ position, scale, type }) => {
  const bushColors = {
    saltbush: '#9ACD32',
    mallee: '#228B22',
    banksia: '#DAA520'
  };
  
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshLambertMaterial color={bushColors[type]} />
      </mesh>
      {type === 'banksia' && (
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1, 6]} />
          <meshLambertMaterial color="#FF6347" />
        </mesh>
      )}
    </group>
  );
};

export const FloraSystem: React.FC<FloraSystemProps> = ({
  region,
  density = 0.3,
  windStrength = 0.5
}) => {
  const floraData = useMemo(() => {
    const treeCount = Math.floor(density * 20);
    const bushCount = Math.floor(density * 40);
    const grassCount = Math.floor(density * 200);
    
    const trees = [];
    const bushes = [];
    
    // Generate trees based on region
    for (let i = 0; i < treeCount; i++) {
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 160,
        0,
        (Math.random() - 0.5) * 160
      ];
      
      const scale = Math.random() * 0.5 + 0.5;
      const treeType = region === 'forest' ? 'eucalyptus' : 
                      region === 'coastal' ? (Math.random() > 0.5 ? 'eucalyptus' : 'wattle') :
                      region === 'grassland' ? 'wattle' : 'eucalyptus';
      
      trees.push({ position, scale, type: treeType });
    }
    
    // Generate bushes
    for (let i = 0; i < bushCount; i++) {
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 180,
        0,
        (Math.random() - 0.5) * 180
      ];
      
      const scale = Math.random() * 0.3 + 0.4;
      const bushTypes = {
        outback: ['saltbush', 'mallee'],
        coastal: ['banksia', 'mallee'],
        forest: ['mallee', 'banksia'],
        grassland: ['saltbush', 'banksia']
      };
      
      const availableTypes = bushTypes[region] || bushTypes.outback;
      const bushType = availableTypes[Math.floor(Math.random() * availableTypes.length)] as 'saltbush' | 'mallee' | 'banksia';
      
      bushes.push({ position, scale, type: bushType });
    }
    
    return { trees, bushes, grassCount };
  }, [region, density]);
  
  return (
    <group>
      {/* Trees */}
      {floraData.trees.map((tree, index) => (
        tree.type === 'eucalyptus' ? (
          <EucalyptusTree
            key={`eucalyptus-${index}`}
            position={tree.position}
            scale={tree.scale}
            windStrength={windStrength}
          />
        ) : (
          <WattleTree
            key={`wattle-${index}`}
            position={tree.position}
            scale={tree.scale}
            windStrength={windStrength}
          />
        )
      ))}
      
      {/* Bushes */}
      {floraData.bushes.map((bush, index) => (
        <AustralianBush
          key={`bush-${index}`}
          position={bush.position}
          scale={bush.scale}
          type={bush.type}
        />
      ))}
      
      {/* Grass */}
      <GrassSystem
        count={floraData.grassCount}
        region={region}
        windStrength={windStrength}
      />
    </group>
  );
};