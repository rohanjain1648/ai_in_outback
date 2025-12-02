import React, { useState, useEffect } from 'react';
import { Location, NearbyUsersResponse, AustralianRegion } from '../types/location';
import { RelevantContent } from '../services/contentDeliveryService';
import { locationService } from '../services/locationService';
import { contentDeliveryService } from '../services/contentDeliveryService';
import LocationManager from './LocationManager';
import InteractiveMap from './InteractiveMap';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationDashboardProps {
  className?: string;
}

export const LocationDashboard: React.FC<LocationDashboardProps> = ({ className = '' }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<Location[]>([]);
  const [relevantContent, setRelevantContent] = useState<RelevantContent[]>([]);
  const [regions, setRegions] = useState<AustralianRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'location' | 'map' | 'nearby' | 'content'>('location');
  const [searchRadius, setSearchRadius] = useState(25);

  const { coordinates: detectedCoordinates } = useGeolocation({
    immediate: true,
    fallbackToIP: true
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load current location
        const location = await locationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
          await loadLocationBasedData(location);
        }

        // Load regions for the map
        if (location?.region.state) {
          const stateRegions = await locationService.getRegionsByState(location.region.state);
          setRegions(stateRegions);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadLocationBasedData = async (location: Location) => {
    try {
      // Load nearby users
      const nearbyResponse = await locationService.findNearbyUsers({
        coordinates: location.coordinates,
        radius: searchRadius,
        filters: {
          state: location.region.state
        }
      });
      setNearbyUsers(nearbyResponse.users);

      // Load relevant content
      const content = await contentDeliveryService.getRelevantContent({
        userLocation: location,
        maxDistance: searchRadius * 2,
        includeRegionalContent: true,
        includeStateWideContent: true,
        limit: 20
      });
      setRelevantContent(content);
    } catch (error) {
      console.error('Failed to load location-based data:', error);
    }
  };

  const handleLocationUpdate = async (location: Location) => {
    setCurrentLocation(location);
    await loadLocationBasedData(location);
  };

  const handleRadiusChange = async (newRadius: number) => {
    setSearchRadius(newRadius);
    if (currentLocation) {
      await loadLocationBasedData(currentLocation);
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800',
      agricultural: 'bg-green-100 text-green-800',
      resource: 'bg-blue-100 text-blue-800',
      business: 'bg-purple-100 text-purple-800',
      event: 'bg-yellow-100 text-yellow-800',
      cultural: 'bg-indigo-100 text-indigo-800',
      health: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'location', label: 'Location Settings', icon: '📍' },
            { id: 'map', label: 'Interactive Map', icon: '🗺️' },
            { id: 'nearby', label: 'Nearby Users', icon: '👥' },
            { id: 'content', label: 'Local Content', icon: '📰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'location' && (
          <LocationManager
            onLocationUpdate={handleLocationUpdate}
            showPrivacyControls={true}
            autoDetect={false}
          />
        )}

        {activeTab === 'map' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Interactive Map</h2>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">
                  Search Radius:
                  <select
                    value={searchRadius}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                  </select>
                </label>
              </div>
            </div>
            
            <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
              <InteractiveMap
                userLocation={currentLocation || undefined}
                nearbyUsers={nearbyUsers}
                regions={regions}
                showUserMarkers={true}
                showRegionBoundaries={false}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Nearby Users ({nearbyUsers.length})
              </h2>
              <span className="text-sm text-gray-600">
                Within {searchRadius}km radius
              </span>
            </div>

            {nearbyUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No nearby users found within {searchRadius}km</p>
                <p className="text-sm mt-2">Try increasing the search radius</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {nearbyUsers.map((user) => (
                  <div key={user._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {user.region.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.region.type === 'urban' ? 'bg-green-100 text-green-800' :
                        user.region.type === 'rural' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.region.type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>State:</strong> {user.region.state}</p>
                      <p><strong>Last Updated:</strong> {new Date(user.lastUpdated).toLocaleDateString()}</p>
                      {user.anonymized && (
                        <p className="text-orange-600 text-xs">📍 Approximate location</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Local Content ({relevantContent.length})
              </h2>
              <div className="text-sm text-gray-600">
                Based on your location and preferences
              </div>
            </div>

            {relevantContent.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No relevant content found for your area</p>
                <p className="text-sm mt-2">Content will appear based on your location and local events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {relevantContent.map((item) => (
                  <div key={item.content.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPriorityIcon(item.content.priority)}</span>
                        <h3 className="font-medium text-gray-900">
                          {item.content.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getContentTypeColor(item.content.type)}`}>
                          {item.content.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.distance}km away
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{item.content.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Relevance: {item.reason}</span>
                      <span>Score: {item.relevanceScore}</span>
                    </div>

                    {item.content.validUntil && (
                      <div className="mt-2 text-xs text-orange-600">
                        Valid until: {new Date(item.content.validUntil).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDashboard;