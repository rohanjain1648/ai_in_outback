import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveElementProps {
  position: [number, number, number];
  type: 'info-point' | 'action-trigger' | 'navigation-marker' | 'resource-node';
  title: string;
  description?: string;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  icon?: string;
  color?: string;
}

// Interactive 3D element that responds to user actions
export const InteractiveElement: React.FC<InteractiveElementProps> = ({
  position,
  type,
  title,
  description,
  onClick,
  onHover,
  icon = '📍',
  color = '#4A90E2'
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const handlePointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  }, [onHover]);
  
  const handlePointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  }, [onHover]);
  
  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setClicked(true);
    onClick?.();
    
    // Reset click state after animation
    setTimeout(() => setClicked(false), 200);
  }, [onClick]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.5;
      
      // Rotation animation
      meshRef.current.rotation.y = time * 0.5;
      
      // Scale animation on hover
      const targetScale = hovered ? 1.3 : clicked ? 0.8 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Pulsing glow effect
      if (hovered) {
        const pulse = Math.sin(time * 8) * 0.2 + 0.8;
        meshRef.current.material.emissive.setHex(parseInt(color.replace('#', '0x')));
        meshRef.current.material.emissiveIntensity = pulse * 0.3;
      } else {
        meshRef.current.material.emissiveIntensity = 0;
      }
    }
  });
  
  const getGeometry = () => {
    switch (type) {
      case 'info-point':
        return <sphereGeometry args={[1, 16, 16]} />;
      case 'action-trigger':
        return <boxGeometry args={[2, 2, 2]} />;
      case 'navigation-marker':
        return <coneGeometry args={[1, 3, 8]} />;
      case 'resource-node':
        return <octahedronGeometry args={[1.5]} />;
      default:
        return <sphereGeometry args={[1, 16, 16]} />;
    }
  };
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Floating label */}
      {hovered && (
        <Html
          position={[0, 3, 0]}
          center
          distanceFactor={10}
          occlude
        >
          <div className="bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{icon}</span>
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            {description && (
              <p className="text-xs text-gray-300">{description}</p>
            )}
          </div>
        </Html>
      )}
      
      {/* Particle effect ring */}
      <ParticleRing
        radius={2}
        count={12}
        color={color}
        active={hovered}
      />
    </group>
  );
};

// Particle ring effect for interactive elements
const ParticleRing: React.FC<{
  radius: number;
  count: number;
  color: string;
  active: boolean;
}> = ({ radius, count, color, active }) => {
  const particlesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      
      particlesRef.current.children.forEach((particle, index) => {
        const angle = (index / count) * Math.PI * 2 + time;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(time * 3 + index) * 0.5;
        
        particle.position.set(x, y, z);
        particle.scale.setScalar(active ? 1 : 0);
      });
      
      particlesRef.current.rotation.y = time * 0.5;
    }
  });
  
  return (
    <group ref={particlesRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Interactive hotspot manager
export const InteractiveHotspots: React.FC<{
  section: string;
  onInteraction?: (type: string, data: any) => void;
}> = ({ section, onInteraction }) => {
  const hotspots = getHotspotsForSection(section);
  
  return (
    <>
      {hotspots.map((hotspot, index) => (
        <InteractiveElement
          key={`${section}-${index}`}
          position={hotspot.position}
          type={hotspot.type}
          title={hotspot.title}
          description={hotspot.description}
          icon={hotspot.icon}
          color={hotspot.color}
          onClick={() => onInteraction?.(hotspot.type, hotspot.data)}
        />
      ))}
    </>
  );
};

// Define hotspots for each section
const getHotspotsForSection = (section: string) => {
  const hotspotConfigs: Record<string, any[]> = {
    agriculture: [
      {
        position: [20, 5, 10],
        type: 'info-point',
        title: 'Crop Monitoring',
        description: 'AI-powered crop health analysis and recommendations',
        icon: '🌾',
        color: '#4CAF50',
        data: { action: 'open-crop-analysis' }
      },
      {
        position: [-15, 3, 20],
        type: 'resource-node',
        title: 'Weather Station',
        description: 'Real-time weather data and forecasts',
        icon: '🌤️',
        color: '#2196F3',
        data: { action: 'open-weather-dashboard' }
      },
      {
        position: [0, 2, -25],
        type: 'action-trigger',
        title: 'Market Prices',
        description: 'Current commodity prices and market trends',
        icon: '💰',
        color: '#FF9800',
        data: { action: 'open-market-data' }
      }
    ],
    community: [
      {
        position: [0, 8, 0],
        type: 'navigation-marker',
        title: 'Community Hub',
        description: 'Connect with local community members',
        icon: '🏘️',
        color: '#9C27B0',
        data: { action: 'open-community-dashboard' }
      },
      {
        position: [30, 5, -20],
        type: 'info-point',
        title: 'Local Events',
        description: 'Upcoming community events and gatherings',
        icon: '📅',
        color: '#E91E63',
        data: { action: 'open-events' }
      }
    ],
    emergency: [
      {
        position: [0, 10, 0],
        type: 'action-trigger',
        title: 'Emergency Alert',
        description: 'Report or view emergency situations',
        icon: '🚨',
        color: '#F44336',
        data: { action: 'open-emergency-dashboard' }
      },
      {
        position: [25, 5, 15],
        type: 'resource-node',
        title: 'Emergency Services',
        description: 'Contact emergency services and view response times',
        icon: '🚑',
        color: '#FF5722',
        data: { action: 'contact-emergency' }
      }
    ],
    wellbeing: [
      {
        position: [10, 3, 10],
        type: 'info-point',
        title: 'Wellbeing Check-in',
        description: 'Track your mental health and wellbeing',
        icon: '💚',
        color: '#4CAF50',
        data: { action: 'open-wellbeing-checkin' }
      },
      {
        position: [-20, 4, 5],
        type: 'resource-node',
        title: 'Support Network',
        description: 'Connect with peer support and resources',
        icon: '🤝',
        color: '#2196F3',
        data: { action: 'open-support-network' }
      }
    ],
    business: [
      {
        position: [15, 6, -10],
        type: 'action-trigger',
        title: 'Business Directory',
        description: 'Discover local businesses and services',
        icon: '🏢',
        color: '#607D8B',
        data: { action: 'open-business-directory' }
      },
      {
        position: [-10, 4, 20],
        type: 'info-point',
        title: 'Economic Opportunities',
        description: 'Find business opportunities and partnerships',
        icon: '💼',
        color: '#795548',
        data: { action: 'open-opportunities' }
      }
    ],
    culture: [
      {
        position: [0, 5, 0],
        type: 'navigation-marker',
        title: 'Story Circle',
        description: 'Share and discover cultural stories',
        icon: '📖',
        color: '#FF6B35',
        data: { action: 'open-story-circle' }
      },
      {
        position: [20, 3, -15],
        type: 'resource-node',
        title: 'Heritage Site',
        description: 'Explore local cultural heritage',
        icon: '🏛️',
        color: '#8E24AA',
        data: { action: 'open-heritage' }
      }
    ],
    skills: [
      {
        position: [12, 4, 8],
        type: 'info-point',
        title: 'Skills Exchange',
        description: 'Share and learn new skills',
        icon: '🎓',
        color: '#3F51B5',
        data: { action: 'open-skills-exchange' }
      },
      {
        position: [-18, 3, -12],
        type: 'action-trigger',
        title: 'Learning Sessions',
        description: 'Join or create learning sessions',
        icon: '👨‍🏫',
        color: '#009688',
        data: { action: 'open-learning-sessions' }
      }
    ]
  };
  
  return hotspotConfigs[section] || [];
};

// Animated connection lines between interactive elements
export const ConnectionLines: React.FC<{
  elements: Array<{ position: [number, number, number] }>;
  color?: string;
  animated?: boolean;
}> = ({ elements, color = '#4A90E2', animated = true }) => {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (linesRef.current && animated) {
      const time = state.clock.elapsedTime;
      linesRef.current.children.forEach((line, index) => {
        const material = (line as THREE.Line).material as THREE.LineBasicMaterial;
        material.opacity = (Math.sin(time * 2 + index) + 1) * 0.3 + 0.2;
      });
    }
  });
  
  return (
    <group ref={linesRef}>
      {elements.map((element, index) => {
        if (index === elements.length - 1) return null;
        
        const start = new THREE.Vector3(...element.position);
        const end = new THREE.Vector3(...elements[index + 1].position);
        const points = [start, end];
        
        return (
          <line key={index}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={points.length}
                array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={0.5} />
          </line>
        );
      })}
    </group>
  );
};