import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WildlifeSystemProps {
  region: 'outback' | 'coastal' | 'forest' | 'grassland';
  timeOfDay: number; // 0-24 hours
  density?: number; // 0-1
  weatherType?: 'sunny' | 'rainy' | 'cloudy' | 'windy';
}

// Individual animal components
const Kangaroo: React.FC<{
  position: [number, number, number];
  isActive: boolean;
}> = ({ position, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hopPhase, setHopPhase] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      const time = state.clock.elapsedTime;
      
      // Hopping animation
      const hopHeight = Math.max(0, Math.sin(time * 3 + hopPhase)) * 2;
      groupRef.current.position.y = position[1] + hopHeight;
      
      // Subtle forward movement during hops
      if (hopHeight > 0.1) {
        groupRef.current.position.z += Math.sin(time * 3 + hopPhase) * 0.02;
      }
      
      // Ear twitching
      const earTwitch = Math.sin(time * 8) * 0.1;
      groupRef.current.rotation.y = earTwitch;
    }
  });
  
  return (
    <group ref={groupRef} position={position} visible={isActive}>
      {/* Body */}
      <mesh position={[0, 1.5, 0]}>
        <ellipsoidGeometry args={[0.8, 1.2, 0.6]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2.8, 0.3]}>
        <ellipsoidGeometry args={[0.4, 0.5, 0.6]} />
        <meshLambertMaterial color="#CD853F" />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.2, 3.2, 0.1]}>
        <ellipsoidGeometry args={[0.1, 0.4, 0.05]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
      <mesh position={[0.2, 3.2, 0.1]}>
        <ellipsoidGeometry args={[0.1, 0.4, 0.05]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, 0.5, -1.2]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.3, 0.3, 0.2]}>
        <cylinderGeometry args={[0.1, 0.15, 0.8]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
      <mesh position={[0.3, 0.3, 0.2]}>
        <cylinderGeometry args={[0.1, 0.15, 0.8]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
    </group>
  );
};

const Koala: React.FC<{
  position: [number, number, number];
  isActive: boolean;
}> = ({ position, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      const time = state.clock.elapsedTime;
      
      // Gentle swaying motion (koalas are usually sleepy)
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} position={position} visible={isActive}>
      {/* Body */}
      <mesh position={[0, 8, 0]}>
        <ellipsoidGeometry args={[1, 1.5, 0.8]} />
        <meshLambertMaterial color="#808080" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 9.5, 0.2]}>
        <sphereGeometry args={[0.8]} />
        <meshLambertMaterial color="#A9A9A9" />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.5, 10, -0.2]}>
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
      <mesh position={[0.5, 10, -0.2]}>
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 9.3, 0.7]}>
        <sphereGeometry args={[0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
    </group>
  );
};

const Wombat: React.FC<{
  position: [number, number, number];
  isActive: boolean;
}> = ({ position, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      const time = state.clock.elapsedTime;
      
      // Slow, steady movement (wombats are sturdy and slow)
      groupRef.current.position.x = position[0] + Math.sin(time * 0.2) * 2;
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.3;
    }
  });
  
  return (
    <group ref={groupRef} position={position} visible={isActive}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <ellipsoidGeometry args={[1.2, 0.8, 0.8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2, 1]}>
        <ellipsoidGeometry args={[0.6, 0.5, 0.8]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      
      {/* Legs */}
      {[-0.6, 0.6].map((x, i) => (
        <React.Fragment key={i}>
          <mesh position={[x, 0.2, 0.4]}>
            <cylinderGeometry args={[0.15, 0.2, 0.4]} />
            <meshLambertMaterial color="#654321" />
          </mesh>
          <mesh position={[x, 0.2, -0.4]}>
            <cylinderGeometry args={[0.15, 0.2, 0.4]} />
            <meshLambertMaterial color="#654321" />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
};

const Emu: React.FC<{
  position: [number, number, number];
  isActive: boolean;
}> = ({ position, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [walkPhase, setWalkPhase] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      const time = state.clock.elapsedTime;
      
      // Walking animation
      const walkCycle = time * 2 + walkPhase;
      groupRef.current.position.z = position[2] + Math.sin(walkCycle * 0.1) * 10;
      
      // Head bobbing
      groupRef.current.children[1].position.y = 4 + Math.sin(walkCycle * 4) * 0.2;
      
      // Neck swaying
      groupRef.current.children[1].rotation.z = Math.sin(walkCycle * 2) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef} position={position} visible={isActive}>
      {/* Body */}
      <mesh position={[0, 2, 0]}>
        <ellipsoidGeometry args={[1, 1.5, 0.8]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Neck and Head */}
      <mesh position={[0, 4, 0.5]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 5.5, 0.8]}>
        <ellipsoidGeometry args={[0.3, 0.4, 0.5]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.4, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1.6]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
      <mesh position={[0.4, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1.6]} />
        <meshLambertMaterial color="#D2691E" />
      </mesh>
    </group>
  );
};

const Bird: React.FC<{
  position: [number, number, number];
  isActive: boolean;
  species: 'kookaburra' | 'cockatoo' | 'magpie';
}> = ({ position, isActive, species }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [flightPath, setFlightPath] = useState(Math.random() * Math.PI * 2);
  
  const speciesConfig = {
    kookaburra: { color: '#8B4513', size: 0.3, sound: true },
    cockatoo: { color: '#FFFFFF', size: 0.4, crest: true },
    magpie: { color: '#000000', size: 0.25, aggressive: true }
  };
  
  const config = speciesConfig[species];
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      const time = state.clock.elapsedTime;
      
      // Flying motion
      const flightRadius = 15;
      const flightSpeed = 0.5;
      const height = position[1] + Math.sin(time * 2) * 2;
      
      groupRef.current.position.x = position[0] + Math.cos(time * flightSpeed + flightPath) * flightRadius;
      groupRef.current.position.y = height;
      groupRef.current.position.z = position[2] + Math.sin(time * flightSpeed + flightPath) * flightRadius;
      
      // Wing flapping
      groupRef.current.rotation.z = Math.sin(time * 8) * 0.3;
      
      // Face direction of movement
      groupRef.current.rotation.y = time * flightSpeed + flightPath + Math.PI / 2;
    }
  });
  
  return (
    <group ref={groupRef} position={position} visible={isActive}>
      {/* Body */}
      <mesh>
        <ellipsoidGeometry args={[config.size, config.size * 0.8, config.size * 1.2]} />
        <meshLambertMaterial color={config.color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, config.size * 0.6, config.size * 0.8]}>
        <sphereGeometry args={[config.size * 0.6]} />
        <meshLambertMaterial color={config.color} />
      </mesh>
      
      {/* Beak */}
      <mesh position={[0, config.size * 0.4, config.size * 1.3]}>
        <coneGeometry args={[config.size * 0.1, config.size * 0.4]} />
        <meshLambertMaterial color="#FFA500" />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-config.size * 0.8, 0, 0]} rotation={[0, 0, -0.3]}>
        <ellipsoidGeometry args={[config.size * 0.6, config.size * 0.1, config.size * 0.8]} />
        <meshLambertMaterial color={config.color} />
      </mesh>
      <mesh position={[config.size * 0.8, 0, 0]} rotation={[0, 0, 0.3]}>
        <ellipsoidGeometry args={[config.size * 0.6, config.size * 0.1, config.size * 0.8]} />
        <meshLambertMaterial color={config.color} />
      </mesh>
      
      {/* Cockatoo crest */}
      {config.crest && (
        <mesh position={[0, config.size * 1.2, config.size * 0.5]}>
          <coneGeometry args={[config.size * 0.2, config.size * 0.6]} />
          <meshLambertMaterial color="#FFFF00" />
        </mesh>
      )}
    </group>
  );
};

// Main wildlife system component
export const AustralianWildlife: React.FC<WildlifeSystemProps> = ({
  region,
  timeOfDay,
  density = 0.3,
  weatherType = 'sunny'
}) => {
  const wildlifeData = useMemo(() => {
    const animals = [];
    const animalCount = Math.floor(density * 15);
    
    // Define which animals appear in which regions
    const regionAnimals = {
      outback: ['kangaroo', 'emu', 'wombat'],
      coastal: ['kangaroo', 'bird'],
      forest: ['koala', 'wombat', 'bird'],
      grassland: ['kangaroo', 'emu', 'bird']
    };
    
    const availableAnimals = regionAnimals[region] || regionAnimals.outback;
    
    for (let i = 0; i < animalCount; i++) {
      const animalType = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 150,
        0,
        (Math.random() - 0.5) * 150
      ];
      
      // Determine if animal should be active based on time and weather
      let isActive = true;
      
      // Some animals are less active during certain times
      if (animalType === 'koala' && (timeOfDay < 6 || timeOfDay > 20)) {
        isActive = Math.random() > 0.7; // Koalas sleep a lot
      }
      
      if (animalType === 'kangaroo' && timeOfDay > 11 && timeOfDay < 16) {
        isActive = Math.random() > 0.5; // Less active during hot midday
      }
      
      // Weather affects activity
      if (weatherType === 'rainy') {
        isActive = isActive && Math.random() > 0.6; // Animals seek shelter
      }
      
      animals.push({
        type: animalType,
        position,
        isActive,
        id: `${animalType}-${i}`
      });
    }
    
    return animals;
  }, [region, timeOfDay, density, weatherType]);
  
  return (
    <group>
      {wildlifeData.map((animal) => {
        switch (animal.type) {
          case 'kangaroo':
            return (
              <Kangaroo
                key={animal.id}
                position={animal.position}
                isActive={animal.isActive}
              />
            );
          case 'koala':
            return (
              <Koala
                key={animal.id}
                position={animal.position}
                isActive={animal.isActive}
              />
            );
          case 'wombat':
            return (
              <Wombat
                key={animal.id}
                position={animal.position}
                isActive={animal.isActive}
              />
            );
          case 'emu':
            return (
              <Emu
                key={animal.id}
                position={animal.position}
                isActive={animal.isActive}
              />
            );
          case 'bird':
            const birdSpecies = ['kookaburra', 'cockatoo', 'magpie'][Math.floor(Math.random() * 3)] as 'kookaburra' | 'cockatoo' | 'magpie';
            return (
              <Bird
                key={animal.id}
                position={[animal.position[0], animal.position[1] + 10 + Math.random() * 20, animal.position[2]]}
                isActive={animal.isActive}
                species={birdSpecies}
              />
            );
          default:
            return null;
        }
      })}
    </group>
  );
};

// Wildlife sound effects (placeholder for future audio integration)
export const WildlifeSounds: React.FC<{
  region: string;
  timeOfDay: number;
  animals: string[];
}> = ({ region, timeOfDay, animals }) => {
  // This would integrate with Web Audio API for ambient wildlife sounds
  // For now, it's a placeholder that could trigger sound effects
  
  React.useEffect(() => {
    // Dawn chorus (5-7 AM)
    if (timeOfDay >= 5 && timeOfDay <= 7) {
      console.log('🎵 Dawn chorus - birds singing');
    }
    
    // Dusk sounds (6-8 PM)
    if (timeOfDay >= 18 && timeOfDay <= 20) {
      console.log('🎵 Dusk sounds - evening wildlife');
    }
    
    // Night sounds (8 PM - 5 AM)
    if (timeOfDay >= 20 || timeOfDay <= 5) {
      console.log('🎵 Night sounds - nocturnal animals');
    }
  }, [timeOfDay, region, animals]);
  
  return null;
};