import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Location, AustralianRegion, Coordinates } from '../types/location';
import { locationService } from '../services/locationService';
import { SpiritTrails } from './three/SpiritTrails';

interface InteractiveMapProps {
  userLocation?: Location;
  nearbyUsers?: Location[];
  regions?: AustralianRegion[];
  events?: Array<{
    id: string;
    title: string;
    type: 'community' | 'emergency' | 'cultural' | 'agricultural';
    priority?: 'low' | 'medium' | 'high';
    coordinates: Coordinates;
  }>;
  onLocationSelect?: (coordinates: Coordinates) => void;
  showUserMarkers?: boolean;
  showRegionBoundaries?: boolean;
  showSpiritTrails?: boolean;
  className?: string;
}

interface MapMarkerProps {
  position: [number, number, number];
  color: string;
  label: string;
  onClick?: () => void;
  isUser?: boolean;
}

const MapMarker: React.FC<MapMarkerProps> = ({ position, color, label, onClick, isUser = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {isUser ? (
          <coneGeometry args={[0.5, 1.5, 8]} />
        ) : (
          <sphereGeometry args={[0.3]} />
        )}
        <meshStandardMaterial color={hovered ? '#ffffff' : color} />
      </mesh>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

interface RegionBoundaryProps {
  region: AustralianRegion;
}

const RegionBoundary: React.FC<RegionBoundaryProps> = ({ region }) => {
  const points = [
    new THREE.Vector3(region.bounds.west, 0, -region.bounds.north),
    new THREE.Vector3(region.bounds.east, 0, -region.bounds.north),
    new THREE.Vector3(region.bounds.east, 0, -region.bounds.south),
    new THREE.Vector3(region.bounds.west, 0, -region.bounds.south),
    new THREE.Vector3(region.bounds.west, 0, -region.bounds.north)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const getRegionColor = (type: string) => {
    switch (type) {
      case 'urban': return '#4ade80';
      case 'rural': return '#fbbf24';
      case 'remote': return '#f87171';
      default: return '#6b7280';
    }
  };

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={getRegionColor(region.type)} linewidth={2} />
    </line>
  );
};

const AustralianTerrain: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Simplified Australian continent shape
  const australiaShape = new THREE.Shape();
  australiaShape.moveTo(113, -44);
  australiaShape.lineTo(154, -44);
  australiaShape.lineTo(154, -10);
  australiaShape.lineTo(129, -10);
  australiaShape.lineTo(113, -26);
  australiaShape.lineTo(113, -44);

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: false
  };

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[133.5, -0.1, 27]}>
      <extrudeGeometry args={[australiaShape, extrudeSettings]} />
      <meshStandardMaterial color="#8b7355" opacity={0.3} transparent />
    </mesh>
  );
};

const MapCamera: React.FC<{ userLocation?: Location }> = ({ userLocation }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (userLocation) {
      // Center camera on user location
      camera.position.set(
        userLocation.coordinates.longitude,
        20,
        -userLocation.coordinates.latitude
      );
      camera.lookAt(
        userLocation.coordinates.longitude,
        0,
        -userLocation.coordinates.latitude
      );
    } else {
      // Default view of Australia
      camera.position.set(133.5, 25, -27);
      camera.lookAt(133.5, 0, -27);
    }
  }, [camera, userLocation]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLocation,
  nearbyUsers = [],
  regions = [],
  events = [],
  onLocationSelect,
  showUserMarkers = true,
  showRegionBoundaries = false,
  showSpiritTrails = true,
  className = ''
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);

  const handleMapClick = (event: THREE.Event) => {
    if (event.point && onLocationSelect) {
      const coordinates: Coordinates = {
        longitude: event.point.x,
        latitude: -event.point.z
      };
      setSelectedLocation(coordinates);
      onLocationSelect(coordinates);
    }
  };

  const convertToMapPosition = (location: Location): [number, number, number] => {
    return [
      location.coordinates.longitude,
      0.5,
      -location.coordinates.latitude
    ];
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [133.5, 25, -27], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        <MapCamera userLocation={userLocation} />

        {/* Australian terrain base */}
        <AustralianTerrain />

        {/* Region boundaries */}
        {showRegionBoundaries && regions.map((region, index) => (
          <RegionBoundary key={index} region={region} />
        ))}

        {/* User location marker */}
        {userLocation && (
          <MapMarker
            position={convertToMapPosition(userLocation)}
            color="#3b82f6"
            label={`You (${userLocation.region.name})`}
            isUser={true}
          />
        )}

        {/* Nearby users markers */}
        {showUserMarkers && nearbyUsers.map((user, index) => (
          <MapMarker
            key={user._id}
            position={convertToMapPosition(user)}
            color={user.region.type === 'urban' ? '#10b981' :
              user.region.type === 'rural' ? '#f59e0b' : '#ef4444'}
            label={`${user.region.name} (${user.region.type})`}
            onClick={() => console.log('User clicked:', user)}
          />
        ))}

        {/* Spirit Trails connecting nearby users and events */}
        {showSpiritTrails && (
          <SpiritTrails
            users={[
              ...(userLocation ? [{
                id: 'current-user',
                position: convertToMapPosition(userLocation),
                isActive: true
              }] : []),
              ...nearbyUsers.map(user => ({
                id: user._id,
                position: convertToMapPosition(user),
                isActive: true
              }))
            ]}
            events={events.map(event => ({
              id: event.id,
              position: [event.coordinates.longitude, 0.5, -event.coordinates.latitude] as [number, number, number],
              title: event.title,
              type: event.type,
              priority: event.priority || 'medium'
            }))}
            maxDistance={30}
            trailColor="#4A90E2"
            beaconColor="#FF6B35"
            enableParticles={true}
            performanceMode="medium"
          />
        )}

        {/* Selected location marker */}
        {selectedLocation && (
          <MapMarker
            position={[selectedLocation.longitude, 0.5, -selectedLocation.latitude]}
            color="#8b5cf6"
            label="Selected Location"
          />
        )}

        {/* Interactive plane for click detection */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[133.5, 0, -27]}
          onClick={handleMapClick}
        >
          <planeGeometry args={[50, 40]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Map legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Map Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Urban Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Rural Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Remote Areas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;