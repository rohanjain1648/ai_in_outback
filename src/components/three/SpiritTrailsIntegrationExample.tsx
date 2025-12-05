import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '../InteractiveMap';
import { Location } from '../../types/location';
import { Coordinates } from '../../types/location';

/**
 * Example integration of Spirit Trails with InteractiveMap
 * This demonstrates how to use the Spirit Trails feature in a real application
 */
export const SpiritTrailsIntegrationExample: React.FC = () => {
    const [userLocation, setUserLocation] = useState<Location | undefined>();
    const [nearbyUsers, setNearbyUsers] = useState<Location[]>([]);
    const [events, setEvents] = useState<Array<{
        id: string;
        title: string;
        type: 'community' | 'emergency' | 'cultural' | 'agricultural';
        priority: 'low' | 'medium' | 'high';
        coordinates: Coordinates;
    }>>([]);

    // Simulate loading user location
    useEffect(() => {
        const mockUserLocation: Location = {
            _id: 'current-user',
            userId: 'user-123',
            coordinates: {
                latitude: -33.8688,
                longitude: 151.2093
            },
            region: {
                name: 'Sydney',
                state: 'NSW',
                type: 'urban'
            },
            isPrivate: false,
            anonymized: false,
            lastUpdated: new Date().toISOString(),
            source: 'gps'
        };

        setUserLocation(mockUserLocation);
    }, []);

    // Simulate loading nearby users
    useEffect(() => {
        const mockNearbyUsers: Location[] = [
            {
                _id: 'user-1',
                userId: 'user-456',
                coordinates: {
                    latitude: -33.8700,
                    longitude: 151.2100
                },
                region: {
                    name: 'Sydney',
                    state: 'NSW',
                    type: 'urban'
                },
                isPrivate: false,
                anonymized: false,
                lastUpdated: new Date().toISOString(),
                source: 'gps'
            },
            {
                _id: 'user-2',
                userId: 'user-789',
                coordinates: {
                    latitude: -33.8680,
                    longitude: 151.2080
                },
                region: {
                    name: 'Sydney',
                    state: 'NSW',
                    type: 'urban'
                },
                isPrivate: false,
                anonymized: false,
                lastUpdated: new Date().toISOString(),
                source: 'gps'
            },
            {
                _id: 'user-3',
                userId: 'user-101',
                coordinates: {
                    latitude: -33.8695,
                    longitude: 151.2110
                },
                region: {
                    name: 'Sydney',
                    state: 'NSW',
                    type: 'urban'
                },
                isPrivate: false,
                anonymized: false,
                lastUpdated: new Date().toISOString(),
                source: 'gps'
            }
        ];

        setNearbyUsers(mockNearbyUsers);
    }, []);

    // Simulate loading events
    useEffect(() => {
        const mockEvents = [
            {
                id: 'event-1',
                title: 'Community Gathering',
                type: 'community' as const,
                priority: 'high' as const,
                coordinates: {
                    latitude: -33.8690,
                    longitude: 151.2095
                }
            },
            {
                id: 'event-2',
                title: 'Cultural Festival',
                type: 'cultural' as const,
                priority: 'medium' as const,
                coordinates: {
                    latitude: -33.8685,
                    longitude: 151.2105
                }
            },
            {
                id: 'event-3',
                title: 'Emergency Alert',
                type: 'emergency' as const,
                priority: 'high' as const,
                coordinates: {
                    latitude: -33.8692,
                    longitude: 151.2088
                }
            }
        ];

        setEvents(mockEvents);
    }, []);

    const handleLocationSelect = (coordinates: Coordinates) => {
        console.log('Location selected:', coordinates);
    };

    return (
        <div className="w-full h-screen">
            <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg max-w-sm">
                <h2 className="text-xl font-bold mb-2">Spirit Trails Integration</h2>
                <p className="text-sm text-gray-600 mb-4">
                    This example shows Spirit Trails connecting nearby users and highlighting events
                    on the interactive map.
                </p>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Your Location:</span>
                        <span className="text-gray-600">
                            {userLocation ? userLocation.region.name : 'Loading...'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-medium">Nearby Users:</span>
                        <span className="text-gray-600">{nearbyUsers.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-medium">Active Events:</span>
                        <span className="text-gray-600">{events.length}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold mb-2 text-sm">Features Active:</h3>
                    <ul className="text-xs space-y-1 text-gray-600">
                        <li>✓ Spirit trails between users</li>
                        <li>✓ Glowing event beacons</li>
                        <li>✓ Particle effects</li>
                        <li>✓ Dynamic LOD</li>
                        <li>✓ Frustum culling</li>
                    </ul>
                </div>
            </div>

            <InteractiveMap
                userLocation={userLocation}
                nearbyUsers={nearbyUsers}
                events={events}
                onLocationSelect={handleLocationSelect}
                showUserMarkers={true}
                showRegionBoundaries={false}
                showSpiritTrails={true}
                className="w-full h-full"
            />
        </div>
    );
};

export default SpiritTrailsIntegrationExample;
