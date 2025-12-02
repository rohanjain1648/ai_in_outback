import React, { useState, useEffect } from 'react';
import { Location, LocationUpdate, LocationPrivacy, Coordinates } from '../types/location';
import { locationService } from '../services/locationService';
import { useGeolocation } from '../hooks/useGeolocation';
import { GeolocationUtils } from '../utils/geolocation';
import PostcodeLookup from './PostcodeLookup';

interface LocationManagerProps {
  onLocationUpdate?: (location: Location) => void;
  showPrivacyControls?: boolean;
  autoDetect?: boolean;
  className?: string;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  onLocationUpdate,
  showPrivacyControls = true,
  autoDetect = false,
  className = ''
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [privacy, setPrivacy] = useState<LocationPrivacy>({
    isPrivate: false,
    anonymized: false
  });
  const [manualCoordinates, setManualCoordinates] = useState({
    latitude: '',
    longitude: ''
  });
  const [address, setAddress] = useState({
    city: '',
    state: 'NSW',
    postcode: ''
  });

  const {
    coordinates: detectedCoordinates,
    error: geolocationError,
    loading: detectingLocation,
    source,
    accuracy,
    getCurrentLocation,
    permissionState
  } = useGeolocation({
    immediate: autoDetect,
    fallbackToIP: true,
    enableHighAccuracy: true,
    timeout: 15000
  });

  // Load current location on mount
  useEffect(() => {
    const loadCurrentLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
          setPrivacy({
            isPrivate: location.isPrivate,
            anonymized: location.anonymized
          });
        }
      } catch (error) {
        console.error('Failed to load current location:', error);
      }
    };

    loadCurrentLocation();
  }, []);

  // Auto-update location when detected coordinates change
  useEffect(() => {
    if (detectedCoordinates && autoDetect) {
      handleUpdateLocation(detectedCoordinates, source || 'gps', accuracy);
    }
  }, [detectedCoordinates, autoDetect, source, accuracy]);

  const handleUpdateLocation = async (
    coordinates: Coordinates,
    locationSource: 'gps' | 'manual' | 'ip' | 'postcode',
    locationAccuracy?: number
  ) => {
    if (!GeolocationUtils.isWithinAustralia(coordinates)) {
      alert('Location must be within Australia');
      return;
    }

    setIsUpdating(true);

    try {
      const locationUpdate: LocationUpdate = {
        coordinates,
        source: locationSource,
        accuracy: locationAccuracy,
        privacy,
        ...(address.city && {
          address: {
            city: address.city,
            state: address.state as any,
            postcode: address.postcode,
            country: 'Australia'
          }
        })
      };

      const updatedLocation = await locationService.updateLocation(locationUpdate);
      setCurrentLocation(updatedLocation);
      
      if (onLocationUpdate) {
        onLocationUpdate(updatedLocation);
      }

      // Clear manual input
      setManualCoordinates({ latitude: '', longitude: '' });
    } catch (error) {
      console.error('Failed to update location:', error);
      alert('Failed to update location. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDetectLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Failed to detect location:', error);
    }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lat = parseFloat(manualCoordinates.latitude);
    const lng = parseFloat(manualCoordinates.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    handleUpdateLocation({ latitude: lat, longitude: lng }, 'manual');
  };

  const handlePrivacyChange = async (newPrivacy: LocationPrivacy) => {
    setPrivacy(newPrivacy);
    
    // If we have a current location, update it with new privacy settings
    if (currentLocation) {
      await handleUpdateLocation(
        currentLocation.coordinates,
        currentLocation.source,
        currentLocation.accuracy
      );
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'Unknown';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Location Management</h2>
      
      {/* Current Location Display */}
      {currentLocation && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Current Location</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Region:</strong> {currentLocation.region.name}, {currentLocation.region.state}</p>
            <p><strong>Type:</strong> {currentLocation.region.type}</p>
            <p><strong>Coordinates:</strong> {GeolocationUtils.formatCoordinates(currentLocation.coordinates)}</p>
            <p><strong>Source:</strong> {currentLocation.source}</p>
            <p><strong>Accuracy:</strong> {formatDistance(currentLocation.accuracy)}</p>
            <p><strong>Last Updated:</strong> {new Date(currentLocation.lastUpdated).toLocaleString()}</p>
            {currentLocation.anonymized && (
              <p className="text-orange-600"><strong>Note:</strong> Location is anonymized for privacy</p>
            )}
          </div>
        </div>
      )}

      {/* Auto-detect Location */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Auto-detect Location</h3>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation || isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {detectingLocation ? 'Detecting...' : 'Detect My Location'}
          </button>
          
          {permissionState && (
            <span className={`text-sm px-2 py-1 rounded ${
              permissionState === 'granted' ? 'bg-green-100 text-green-800' :
              permissionState === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              Permission: {permissionState}
            </span>
          )}
        </div>

        {geolocationError && (
          <div className="text-red-600 text-sm mb-3">
            Error: {geolocationError.message}
          </div>
        )}

        {detectedCoordinates && (
          <div className="bg-green-50 p-3 rounded-md mb-3">
            <p className="text-green-800 text-sm">
              <strong>Detected:</strong> {GeolocationUtils.formatCoordinates(detectedCoordinates)}
              {source && <span className="ml-2">({source})</span>}
            </p>
            {!autoDetect && (
              <button
                onClick={() => handleUpdateLocation(detectedCoordinates, source || 'gps', accuracy)}
                disabled={isUpdating}
                className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
              >
                Use This Location
              </button>
            )}
          </div>
        )}
      </div>

      {/* Postcode/Suburb Lookup */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Search by Postcode or Suburb</h3>
        <PostcodeLookup
          onLocationSelect={(coordinates, addressInfo) => {
            setAddress({
              city: addressInfo.city,
              state: addressInfo.state,
              postcode: addressInfo.postcode
            });
            handleUpdateLocation(coordinates, 'postcode');
          }}
          placeholder="Enter postcode or suburb name..."
          className="mb-2"
        />
      </div>

      {/* Manual Location Entry */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Manual Coordinates Entry</h3>
        <form onSubmit={handleManualLocationSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={manualCoordinates.latitude}
                onChange={(e) => setManualCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="-33.8688"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={manualCoordinates.longitude}
                onChange={(e) => setManualCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="151.2093"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Sydney"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={address.state}
                onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="WA">WA</option>
                <option value="SA">SA</option>
                <option value="TAS">TAS</option>
                <option value="NT">NT</option>
                <option value="ACT">ACT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={address.postcode}
                onChange={(e) => setAddress(prev => ({ ...prev, postcode: e.target.value }))}
                placeholder="2000"
                pattern="\d{4}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating || !manualCoordinates.latitude || !manualCoordinates.longitude}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Set Manual Location'}
          </button>
        </form>
      </div>

      {/* Privacy Controls */}
      {showPrivacyControls && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Privacy Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={privacy.isPrivate}
                onChange={(e) => handlePrivacyChange({ ...privacy, isPrivate: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Make my location private (hidden from other users)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={privacy.anonymized}
                onChange={(e) => handlePrivacyChange({ ...privacy, anonymized: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Anonymize my location (show approximate area only)</span>
            </label>
          </div>
          
          <div className="mt-3 text-xs text-gray-600">
            <p>• Private locations are not visible to other users</p>
            <p>• Anonymized locations show your general area (~5km radius) instead of exact coordinates</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManager;