import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Location } from '../../types/location';

interface SpiritTrailsProps {
    users: Array<{
        id: string;
        position: [number, number, number];
        location?: Location;
        isActive?: boolean;
    }>;
    events?: Array<{
        id: string;
        position: [number, number, number];
        title: string;
        type: 'community' | 'emergency' | 'cultural' | 'agricultural';
        priority?: 'low' | 'medium' | 'high';
    }>;
    maxDistance?: number;
    trailColor?: string;
    beaconColor?: string;
    enableParticles?: boolean;
    enableAR?: boolean;
    performanceMode?: 'low' | 'medium' | 'high';
}

// Custom shader for glowing trails with fading effect
const trailVertexShader = `
  uniform float time;
  uniform float fadeDistance;
  varying float vAlpha;
  varying vec3 vPosition;
  
  void main() {
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Calculate fade based on distance from start
    float distanceFromStart = length(position);
    vAlpha = 1.0 - smoothstep(0.0, fadeDistance, distanceFromStart);
    
    // Add pulsing effect
    vAlpha *= 0.5 + 0.5 * sin(time * 2.0 + distanceFromStart * 0.5);
  }
`;

const trailFragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  varying float vAlpha;
  
  void main() {
    vec3 glowColor = color;
    float alpha = vAlpha * opacity;
    
    // Add ethereal glow
    gl_FragColor = vec4(glowColor, alpha);
  }
`;

// Beacon vertex shader with pulsing animation
const beaconVertexShader = `
  uniform float time;
  uniform float pulseSpeed;
  uniform float pulseIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Pulsing scale effect
    float pulse = 1.0 + pulseIntensity * sin(time * pulseSpeed);
    vec3 scaledPosition = position * pulse;
    
    vec4 mvPosition = modelViewMatrix * vec4(scaledPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const beaconFragmentShader = `
  uniform vec3 color;
  uniform float time;
  uniform float glowIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect for glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
    
    // Pulsing glow
    float pulse = 0.5 + 0.5 * sin(time * 3.0);
    float glow = fresnel * glowIntensity * pulse;
    
    vec3 finalColor = color + vec3(glow);
    float alpha = 0.7 + glow * 0.3;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Spirit Trail Line Component
const SpiritTrailLine: React.FC<{
    start: [number, number, number];
    end: [number, number, number];
    color: string;
    fadeDistance: number;
    performanceMode: 'low' | 'medium' | 'high';
}> = ({ start, end, color, fadeDistance, performanceMode }) => {
    const lineRef = useRef<THREE.Line>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Create curved path between points
    const curve = useMemo(() => {
        const startVec = new THREE.Vector3(...start);
        const endVec = new THREE.Vector3(...end);
        const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);

        // Add height to create arc
        const distance = startVec.distanceTo(endVec);
        midPoint.y += distance * 0.2;

        return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
    }, [start, end]);

    // Generate points along curve
    const points = useMemo(() => {
        const segments = performanceMode === 'high' ? 50 : performanceMode === 'medium' ? 30 : 15;
        return curve.getPoints(segments);
    }, [curve, performanceMode]);

    const geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        opacity: { value: 0.6 },
        fadeDistance: { value: fadeDistance }
    }), [color, fadeDistance]);

    useFrame((state) => {
        if (materialRef.current?.uniforms?.['time']) {
            materialRef.current.uniforms['time'].value = state.clock.elapsedTime;
        }
    });

    return (
        <primitive object={new THREE.Line(geometry)} ref={lineRef}>
            <shaderMaterial
                ref={materialRef}
                vertexShader={trailVertexShader}
                fragmentShader={trailFragmentShader}
                uniforms={uniforms}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                attach="material"
            />
        </primitive>
    );
};

// Glowing Beacon Marker for Events
const GlowingBeacon: React.FC<{
    position: [number, number, number];
    color: string;
    priority: 'low' | 'medium' | 'high';
    title: string;
    type: string;
    performanceMode: 'low' | 'medium' | 'high';
}> = ({ position, color, priority, performanceMode }) => {
    const beaconRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [hovered, setHovered] = useState(false);

    const pulseSpeed = priority === 'high' ? 4 : priority === 'medium' ? 2.5 : 1.5;
    const pulseIntensity = priority === 'high' ? 0.3 : priority === 'medium' ? 0.2 : 0.1;

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        pulseSpeed: { value: pulseSpeed },
        pulseIntensity: { value: pulseIntensity },
        glowIntensity: { value: 1.0 }
    }), [color, pulseSpeed, pulseIntensity]);

    useFrame((state) => {
        if (materialRef.current?.uniforms?.['time'] && materialRef.current?.uniforms?.['glowIntensity']) {
            materialRef.current.uniforms['time'].value = state.clock.elapsedTime;
            materialRef.current.uniforms['glowIntensity'].value = hovered ? 1.5 : 1.0;
        }

        if (beaconRef.current) {
            // Floating animation
            beaconRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={beaconRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[1.5, performanceMode === 'high' ? 32 : 16, performanceMode === 'high' ? 32 : 16]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={beaconVertexShader}
                    fragmentShader={beaconFragmentShader}
                    uniforms={uniforms}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer glow ring */}
            <mesh position={[0, 0, 0]}>
                <ringGeometry args={[2, 2.5, performanceMode === 'high' ? 32 : 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>

            {hovered && (
                <sprite position={[0, 3, 0]} scale={[4, 2, 1]}>
                    <spriteMaterial color="#000000" opacity={0.7} />
                </sprite>
            )}
        </group>
    );
};

// Trail Particle System
const TrailParticles: React.FC<{
    start: [number, number, number];
    end: [number, number, number];
    color: string;
    count: number;
}> = ({ start, end, color, count }) => {
    const particlesRef = useRef<THREE.Points>(null);

    const { positions, velocities } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const x = start[0] + (end[0] - start[0]) * t;
            const y = start[1] + (end[1] - start[1]) * t;
            const z = start[2] + (end[2] - start[2]) * t;

            positions[i * 3] = x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = y + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = z + (Math.random() - 0.5) * 2;

            velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = Math.random() * 0.1;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }

        return { positions, velocities };
    }, [start, end, count]);

    useFrame(() => {
        if (particlesRef.current) {
            const positionAttribute = particlesRef.current.geometry.attributes['position'];
            if (!positionAttribute) return;

            const array = positionAttribute.array as Float32Array;

            for (let i = 0; i < count; i++) {
                const vx = velocities[i * 3];
                const vy = velocities[i * 3 + 1];
                const vz = velocities[i * 3 + 2];

                const currentX = array[i * 3];
                const currentY = array[i * 3 + 1];
                const currentZ = array[i * 3 + 2];

                if (vx !== undefined && currentX !== undefined) array[i * 3] = currentX + vx;
                if (vy !== undefined && currentY !== undefined) array[i * 3 + 1] = currentY + vy;
                if (vz !== undefined && currentZ !== undefined) array[i * 3 + 2] = currentZ + vz;

                // Reset particles that drift too far
                const px = array[i * 3];
                const py = array[i * 3 + 1];
                const pz = array[i * 3 + 2];

                if (px === undefined || py === undefined || pz === undefined) continue;

                const dx = px - start[0];
                const dy = py - start[1];
                const dz = pz - start[2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance > 50) {
                    const t = Math.random();
                    array[i * 3] = start[0] + (end[0] - start[0]) * t;
                    array[i * 3 + 1] = start[1] + (end[1] - start[1]) * t;
                    array[i * 3 + 2] = start[2] + (end[2] - start[2]) * t;
                }
            }

            positionAttribute.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.2}
                color={color}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

// Main Spirit Trails Component
export const SpiritTrails: React.FC<SpiritTrailsProps> = ({
    users,
    events = [],
    maxDistance = 50,
    trailColor = '#4A90E2',
    beaconColor = '#FF6B35',
    enableParticles = true,
    enableAR = false,
    performanceMode = 'medium'
}) => {
    const { camera } = useThree();
    const [visibleConnections, setVisibleConnections] = useState<Array<[number, number]>>([]);
    const [devicePerformance, setDevicePerformance] = useState<'low' | 'medium' | 'high'>(performanceMode);

    // Detect device performance
    useEffect(() => {
        const detectPerformance = () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const hasGoodGPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 4;

            if (isMobile) {
                setDevicePerformance('low');
            } else if (hasGoodGPU) {
                setDevicePerformance('high');
            } else {
                setDevicePerformance('medium');
            }
        };

        detectPerformance();
    }, []);

    // Calculate connections between nearby users (LOD based on distance)
    useEffect(() => {
        const connections: Array<[number, number]> = [];

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const user1 = users[i];
                const user2 = users[j];

                if (!user1 || !user2) continue;

                const dx = user1.position[0] - user2.position[0];
                const dy = user1.position[1] - user2.position[1];
                const dz = user1.position[2] - user2.position[2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance <= maxDistance) {
                    connections.push([i, j]);
                }
            }
        }

        setVisibleConnections(connections);
    }, [users, maxDistance]);

    // Frustum culling - only render visible trails
    const visibleTrails = useMemo(() => {
        const frustum = new THREE.Frustum();
        const cameraViewProjectionMatrix = new THREE.Matrix4();
        cameraViewProjectionMatrix.multiplyMatrices(
            camera.projectionMatrix,
            camera.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

        return visibleConnections.filter(([i, j]) => {
            const user1 = users[i];
            const user2 = users[j];

            if (!user1 || !user2) return false;

            const midPoint = new THREE.Vector3(
                (user1.position[0] + user2.position[0]) / 2,
                (user1.position[1] + user2.position[1]) / 2,
                (user1.position[2] + user2.position[2]) / 2
            );

            return frustum.containsPoint(midPoint);
        });
    }, [visibleConnections, users, camera]);

    // Particle count based on performance mode
    const particleCount = devicePerformance === 'high' ? 30 : devicePerformance === 'medium' ? 15 : 5;

    return (
        <group>
            {/* Spirit trail lines between nearby users */}
            {visibleTrails.map(([i, j]) => {
                const user1 = users[i];
                const user2 = users[j];

                if (!user1 || !user2) return null;

                return (
                    <React.Fragment key={`trail-${i}-${j}`}>
                        <SpiritTrailLine
                            start={user1.position}
                            end={user2.position}
                            color={trailColor}
                            fadeDistance={maxDistance}
                            performanceMode={devicePerformance}
                        />

                        {/* Trail particles */}
                        {enableParticles && devicePerformance !== 'low' && (
                            <TrailParticles
                                start={user1.position}
                                end={user2.position}
                                color={trailColor}
                                count={particleCount}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {/* Glowing beacons for events */}
            {events.map((event) => (
                <GlowingBeacon
                    key={event.id}
                    position={event.position}
                    color={beaconColor}
                    priority={event.priority || 'medium'}
                    title={event.title}
                    type={event.type}
                    performanceMode={devicePerformance}
                />
            ))}

            {/* AR overlay mode (placeholder for WebXR implementation) */}
            {enableAR && (
                <group>
                    {/* AR markers would be rendered here using WebXR API */}
                    {/* This requires additional WebXR setup and device support */}
                </group>
            )}
        </group>
    );
};

export default SpiritTrails;
