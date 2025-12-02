import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

interface SceneTransitionsProps {
  currentSection: 'agriculture' | 'community' | 'emergency' | 'wellbeing' | 'business' | 'culture' | 'skills';
  onTransitionComplete?: () => void;
}

interface SectionConfig {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  environmentSettings: {
    timeOfDay: number;
    weatherType: 'sunny' | 'rainy' | 'cloudy' | 'windy';
    region: 'outback' | 'coastal' | 'forest' | 'grassland';
  };
  ambientColor: string;
  fogSettings?: {
    color: string;
    near: number;
    far: number;
  };
}

const sectionConfigs: Record<string, SectionConfig> = {
  agriculture: {
    cameraPosition: [30, 25, 50],
    cameraTarget: [0, 0, 0],
    environmentSettings: {
      timeOfDay: 14, // Afternoon for farming
      weatherType: 'sunny',
      region: 'grassland'
    },
    ambientColor: '#FFF8DC',
    fogSettings: {
      color: '#87CEEB',
      near: 100,
      far: 300
    }
  },
  community: {
    cameraPosition: [0, 40, 80],
    cameraTarget: [0, 0, 0],
    environmentSettings: {
      timeOfDay: 12, // Midday for community gathering
      weatherType: 'sunny',
      region: 'grassland'
    },
    ambientColor: '#F0F8FF'
  },
  emergency: {
    cameraPosition: [60, 35, 60],
    cameraTarget: [0, 0, 0],
    environmentSettings: {
      timeOfDay: 18, // Evening for emergency scenarios
      weatherType: 'windy',
      region: 'outback'
    },
    ambientColor: '#FF6347',
    fogSettings: {
      color: '#CD853F',
      near: 50,
      far: 200
    }
  },
  wellbeing: {
    cameraPosition: [20, 15, 40],
    cameraTarget: [0, 5, 0],
    environmentSettings: {
      timeOfDay: 8, // Morning for peaceful wellbeing
      weatherType: 'sunny',
      region: 'forest'
    },
    ambientColor: '#E6E6FA'
  },
  business: {
    cameraPosition: [45, 30, 45],
    cameraTarget: [0, 0, 0],
    environmentSettings: {
      timeOfDay: 10, // Business hours
      weatherType: 'sunny',
      region: 'coastal'
    },
    ambientColor: '#F5F5DC'
  },
  culture: {
    cameraPosition: [-40, 20, 60],
    cameraTarget: [0, 0, 0],
    environmentSettings: {
      timeOfDay: 19, // Golden hour for storytelling
      weatherType: 'sunny',
      region: 'outback'
    },
    ambientColor: '#FFD700'
  },
  skills: {
    cameraPosition: [25, 20, 35],
    cameraTarget: [0, 0, 0],
    environmentSettings: {
      timeOfDay: 16, // Afternoon workshop time
      weatherType: 'sunny',
      region: 'forest'
    },
    ambientColor: '#DDA0DD'
  }
};

export const SceneTransitions: React.FC<SceneTransitionsProps> = ({
  currentSection,
  onTransitionComplete
}) => {
  const { camera, scene } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousSection, setPreviousSection] = useState<string | null>(null);
  
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  
  // Transition duration in seconds
  const transitionDuration = 2.5;
  const transitionProgress = useRef(0);
  
  useEffect(() => {
    if (previousSection !== currentSection) {
      setIsTransitioning(true);
      transitionProgress.current = 0;
      
      const config = sectionConfigs[currentSection];
      if (config) {
        targetPosition.current.set(...config.cameraPosition);
        targetLookAt.current.set(...config.cameraTarget);
        
        // Update scene fog if specified
        if (config.fogSettings) {
          scene.fog = new THREE.Fog(
            config.fogSettings.color,
            config.fogSettings.near,
            config.fogSettings.far
          );
        } else {
          scene.fog = null;
        }
      }
      
      setPreviousSection(currentSection);
    }
  }, [currentSection, previousSection, scene]);
  
  useFrame((state, delta) => {
    if (isTransitioning) {
      transitionProgress.current += delta / transitionDuration;
      
      if (transitionProgress.current >= 1) {
        transitionProgress.current = 1;
        setIsTransitioning(false);
        onTransitionComplete?.();
      }
      
      // Smooth easing function (ease-in-out cubic)
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      const easedProgress = easeInOutCubic(transitionProgress.current);
      
      // Smooth camera position transition
      camera.position.lerp(targetPosition.current, easedProgress * 0.1);
      
      // Smooth look-at transition
      currentLookAt.current.lerp(targetLookAt.current, easedProgress * 0.1);
      camera.lookAt(currentLookAt.current);
      
      // Add subtle camera shake during transition for dynamic feel
      if (transitionProgress.current < 0.8) {
        const shakeIntensity = (1 - transitionProgress.current) * 0.5;
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.5;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity;
      }
    }
  });
  
  return null; // This component manages transitions but doesn't render anything
};

// Smooth section transition hook for external use
export const useSectionTransition = () => {
  const [currentSection, setCurrentSection] = useState<string>('community');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const transitionToSection = (section: string) => {
    if (section !== currentSection && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSection(section);
    }
  };
  
  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };
  
  return {
    currentSection,
    isTransitioning,
    transitionToSection,
    handleTransitionComplete,
    sectionConfig: sectionConfigs[currentSection]
  };
};

// Animated environment elements that respond to section changes
export const ResponsiveEnvironment: React.FC<{
  section: string;
  children: React.ReactNode;
}> = ({ section, children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const config = sectionConfigs[section];
  
  useFrame((state) => {
    if (groupRef.current && config) {
      const time = state.clock.elapsedTime;
      
      // Subtle environment animation based on section
      switch (section) {
        case 'agriculture':
          // Gentle swaying for farming environment
          groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.02;
          break;
        case 'emergency':
          // More dramatic movement for emergency scenarios
          groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
          groupRef.current.position.y = Math.sin(time * 2) * 0.5;
          break;
        case 'wellbeing':
          // Calm, peaceful movement
          groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.01;
          groupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
          break;
        case 'culture':
          // Mystical, storytelling atmosphere
          groupRef.current.rotation.y = Math.sin(time * 0.15) * 0.03;
          break;
        default:
          // Default gentle movement
          groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.01;
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};