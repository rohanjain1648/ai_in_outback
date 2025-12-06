import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { SpiritTrails } from './SpiritTrails';
import { TerrainSystem } from './TerrainSystem';
import { LightingSystem } from './LightingSystem';

interface DemoUser {
    id: string;
    position: [number, number, number];
    isActive: boolean;
}

interface DemoEvent {
    id: string;
    position: [number, number, number];
    title: string;
    type: 'community' | 'emergency' | 'cultural' | 'agricultural';
    priority: 'low' | 'medium' | 'high';
}

export const SpiritTrailsDemo: React.FC = () => {
    const [users, setUsers] = useState<DemoUser[]>([]);
    const [events, setEvents] = useState<DemoEvent[]>([]);
    const [settings, setSettings] = useState({
        maxDistance: 50,
        trailColor: '#4A90E2',
        beaconColor: '#FF6B35',
        enableParticles: true,
        enableAR: false,
        performanceMode: 'medium' as 'low' | 'medium' | 'high',
        userCount: 10,
        eventCount: 5,
        animateUsers: true
    });

    // Generate random users
    useEffect(() => {
        const generateUsers = () => {
            const newUsers: DemoUser[] = [];
            for (let i = 0; i < settings.userCount; i++) {
                newUsers.push({
                    id: `user-${i}`,
                    position: [
                        (Math.random() - 0.5) * 100,
                        Math.random() * 5 + 2,
                        (Math.random() - 0.5) * 100
                    ],
                    isActive: Math.random() > 0.3
                });
            }
            setUsers(newUsers);
        };

        generateUsers();
    }, [settings.userCount]);

    // Generate random events
    useEffect(() => {
        const generateEvents = () => {
            const eventTypes: Array<'community' | 'emergency' | 'cultural' | 'agricultural'> = [
                'community', 'emergency', 'cultural', 'agricultural'
            ];
            const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

            const newEvents: DemoEvent[] = [];
            for (let i = 0; i < settings.eventCount; i++) {
                const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                newEvents.push({
                    id: `event-${i}`,
                    position: [
                        (Math.random() - 0.5) * 80,
                        Math.random() * 10 + 5,
                        (Math.random() - 0.5) * 80
                    ],
                    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Event ${i + 1}`,
                    type,
                    priority: priorities[Math.floor(Math.random() * priorities.length)]
                });
            }
            setEvents(newEvents);
        };

        generateEvents();
    }, [settings.eventCount]);

    // Animate users moving around
    useEffect(() => {
        if (!settings.animateUsers) return;

        const interval = setInterval(() => {
            setUsers(prevUsers =>
                prevUsers.map(user => ({
                    ...user,
                    position: [
                        user.position[0] + (Math.random() - 0.5) * 2,
                        user.position[1],
                        user.position[2] + (Math.random() - 0.5) * 2
                    ] as [number, number, number]
                }))
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [settings.animateUsers]);

    return (
        <div className="w-full h-screen relative">
            <Canvas
                camera={{ position: [0, 80, 120], fov: 60 }}
                shadows
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance'
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#0a0a1a');
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = THREE.PCFSoftShadowMap;
                }}
            >
                <Stats />

                {/* Lighting */}
                <LightingSystem timeOfDay={20} weatherType="sunny" />
                <ambientLight intensity={0.3} />

                {/* Terrain */}
                <TerrainSystem region="grassland" />

                {/* Spirit Trails */}
                <SpiritTrails
                    users={users}
                    events={events}
                    maxDistance={settings.maxDistance}
                    trailColor={settings.trailColor}
                    beaconColor={settings.beaconColor}
                    enableParticles={settings.enableParticles}
                    enableAR={settings.enableAR}
                    performanceMode={settings.performanceMode}
                />

                {/* User markers */}
                {users.map((user) => (
                    <mesh key={user.id} position={user.position}>
                        <sphereGeometry args={[0.8, 16, 16]} />
                        <meshStandardMaterial
                            color={user.isActive ? '#00ff88' : '#888888'}
                            emissive={user.isActive ? '#00ff88' : '#444444'}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                ))}

                {/* Sky */}
                <Sky
                    distance={450000}
                    sunPosition={[100, 20, 100]}
                    inclination={0}
                    azimuth={0.25}
                />

                <Environment preset="night" />

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={20}
                    maxDistance={300}
                    maxPolarAngle={Math.PI / 2.1}
                />
            </Canvas>

            {/* Control Panel */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Spirit Trails Demo</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">User Count: {settings.userCount}</label>
                        <input
                            type="range"
                            min="2"
                            max="30"
                            value={settings.userCount}
                            onChange={(e) => setSettings(prev => ({ ...prev, userCount: parseInt(e.target.value) }))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Event Count: {settings.eventCount}</label>
                        <input
                            type="range"
                            min="0"
                            max="15"
                            value={settings.eventCount}
                            onChange={(e) => setSettings(prev => ({ ...prev, eventCount: parseInt(e.target.value) }))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Max Distance: {settings.maxDistance}</label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={settings.maxDistance}
                            onChange={(e) => setSettings(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Trail Color</label>
                        <input
                            type="color"
                            value={settings.trailColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, trailColor: e.target.value }))}
                            className="w-full h-8 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Beacon Color</label>
                        <input
                            type="color"
                            value={settings.beaconColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, beaconColor: e.target.value }))}
                            className="w-full h-8 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Performance Mode</label>
                        <select
                            value={settings.performanceMode}
                            onChange={(e) => setSettings(prev => ({ ...prev, performanceMode: e.target.value as 'low' | 'medium' | 'high' }))}
                            className="w-full bg-gray-800 text-white p-2 rounded"
                        >
                            <option value="low">Low (Mobile)</option>
                            <option value="medium">Medium</option>
                            <option value="high">High (Desktop)</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enableParticles"
                            checked={settings.enableParticles}
                            onChange={(e) => setSettings(prev => ({ ...prev, enableParticles: e.target.checked }))}
                            className="rounded"
                        />
                        <label htmlFor="enableParticles" className="text-sm">Enable Particles</label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="animateUsers"
                            checked={settings.animateUsers}
                            onChange={(e) => setSettings(prev => ({ ...prev, animateUsers: e.target.checked }))}
                            className="rounded"
                        />
                        <label htmlFor="animateUsers" className="text-sm">Animate Users</label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enableAR"
                            checked={settings.enableAR}
                            onChange={(e) => setSettings(prev => ({ ...prev, enableAR: e.target.checked }))}
                            className="rounded"
                            disabled
                        />
                        <label htmlFor="enableAR" className="text-sm text-gray-400">Enable AR (Coming Soon)</label>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="text-xs space-y-1 text-gray-300">
                        <li>✓ Animated spirit trails between nearby users</li>
                        <li>✓ Glowing beacon markers for events</li>
                        <li>✓ Particle systems with custom shaders</li>
                        <li>✓ Dynamic LOD based on performance</li>
                        <li>✓ Frustum culling optimization</li>
                        <li>✓ Fading effects on trails</li>
                        <li>✓ Pulsing animations on beacons</li>
                    </ul>
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-semibold mb-2">Stats</h3>
                    <div className="text-xs space-y-1 text-gray-300">
                        <div>Active Users: {users.filter(u => u.isActive).length}</div>
                        <div>Total Events: {events.length}</div>
                        <div>Possible Connections: {(users.length * (users.length - 1)) / 2}</div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2">Legend</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span>Active User</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span>Inactive User</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.trailColor }}></div>
                        <span>Spirit Trail</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.beaconColor }}></div>
                        <span>Event Beacon</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-xs">
                <h3 className="font-semibold mb-2">Controls</h3>
                <ul className="text-xs space-y-1 text-gray-300">
                    <li>• Left click + drag: Rotate camera</li>
                    <li>• Right click + drag: Pan camera</li>
                    <li>• Scroll: Zoom in/out</li>
                    <li>• Adjust settings in right panel</li>
                </ul>
            </div>
        </div>
    );
};

export default SpiritTrailsDemo;
