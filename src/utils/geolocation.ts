import { Coordinates, GeolocationError, GeolocationOptions } from '../types/location';

/**
 * Browser geolocation utilities for detecting user location
 */
export class GeolocationUtils {
  /**
   * Get current position using browser geolocation API
   */
  static getCurrentPosition(options?: GeolocationOptions): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const defaultOptions: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          const geolocationError: GeolocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code)
          };
          reject(geolocationError);
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch position changes
   */
  static watchPosition(
    onSuccess: (coordinates: Coordinates) => void,
    onError: (error: GeolocationError) => void,
    options?: GeolocationOptions
  ): number | null {
    if (!navigator.geolocation) {
      onError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return null;
    }

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute for watch
      ...options
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        onError({
          code: error.code,
          message: this.getErrorMessage(error.code)
        });
      },
      defaultOptions
    );
  }

  /**
   * Clear position watch
   */
  static clearWatch(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Check if geolocation is available
   */
  static isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request permission for geolocation (for browsers that support it)
   */
  static async requestPermission(): Promise<PermissionState> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.warn('Permission API not supported:', error);
        return 'prompt';
      }
    }
    return 'prompt';
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location information unavailable';
      case 3:
        return 'Location request timed out';
      default:
        return 'An unknown error occurred while retrieving location';
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLng = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if coordinates are within Australia bounds
   */
  static isWithinAustralia(coordinates: Coordinates): boolean {
    const australiaBounds = {
      north: -10.0,
      south: -44.0,
      east: 154.0,
      west: 113.0
    };
    
    return (
      coordinates.latitude <= australiaBounds.north &&
      coordinates.latitude >= australiaBounds.south &&
      coordinates.longitude <= australiaBounds.east &&
      coordinates.longitude >= australiaBounds.west
    );
  }

  /**
   * Get approximate location from IP (fallback method)
   */
  static async getLocationFromIP(): Promise<Coordinates> {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const coordinates: Coordinates = {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        };
        
        // Verify it's within Australia
        if (this.isWithinAustralia(coordinates)) {
          return coordinates;
        }
      }
      
      throw new Error('IP location not within Australia or unavailable');
    } catch (error) {
      console.error('IP geolocation failed:', error);
      throw new Error('Failed to get location from IP');
    }
  }

  /**
   * Get location with fallback methods
   */
  static async getLocationWithFallback(options?: GeolocationOptions): Promise<{
    coordinates: Coordinates;
    source: 'gps' | 'ip';
    accuracy?: number;
  }> {
    try {
      // Try GPS first
      const coordinates = await this.getCurrentPosition(options);
      
      if (!this.isWithinAustralia(coordinates)) {
        throw new Error('Location not within Australia');
      }
      
      return {
        coordinates,
        source: 'gps',
        accuracy: 10 // Assume good accuracy for GPS
      };
    } catch (gpsError) {
      console.warn('GPS location failed, trying IP fallback:', gpsError);
      
      try {
        // Fallback to IP location
        const coordinates = await this.getLocationFromIP();
        return {
          coordinates,
          source: 'ip',
          accuracy: 10000 // IP location is less accurate
        };
      } catch (ipError) {
        console.error('All location methods failed:', ipError);
        throw new Error('Unable to determine location');
      }
    }
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(coordinates: Coordinates, precision: number = 4): string {
    const lat = coordinates.latitude.toFixed(precision);
    const lng = coordinates.longitude.toFixed(precision);
    const latDir = coordinates.latitude >= 0 ? 'N' : 'S';
    const lngDir = coordinates.longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(parseFloat(lat))}°${latDir}, ${Math.abs(parseFloat(lng))}°${lngDir}`;
  }

  /**
   * Get region type based on population density heuristics
   */
  static estimateRegionType(coordinates: Coordinates): 'urban' | 'rural' | 'remote' {
    // Major Australian cities (simplified)
    const majorCities = [
      { name: 'Sydney', lat: -33.8688, lng: 151.2093, radius: 50 },
      { name: 'Melbourne', lat: -37.8136, lng: 144.9631, radius: 50 },
      { name: 'Brisbane', lat: -27.4698, lng: 153.0251, radius: 40 },
      { name: 'Perth', lat: -31.9505, lng: 115.8605, radius: 40 },
      { name: 'Adelaide', lat: -34.9285, lng: 138.6007, radius: 30 },
      { name: 'Canberra', lat: -35.2809, lng: 149.1300, radius: 25 },
      { name: 'Darwin', lat: -12.4634, lng: 130.8456, radius: 20 },
      { name: 'Hobart', lat: -42.8821, lng: 147.3272, radius: 20 }
    ];

    // Check if within major city radius
    for (const city of majorCities) {
      const distance = this.calculateDistance(coordinates, {
        latitude: city.lat,
        longitude: city.lng
      });
      
      if (distance <= city.radius) {
        return 'urban';
      }
    }

    // Check if in very remote areas (simplified)
    const remoteAreas = [
      { lat: -23.7, lng: 133.9, radius: 500 }, // Central Australia
      { lat: -20.0, lng: 119.0, radius: 300 }, // Pilbara
      { lat: -17.0, lng: 125.0, radius: 400 }, // Kimberley
    ];

    for (const area of remoteAreas) {
      const distance = this.calculateDistance(coordinates, {
        latitude: area.lat,
        longitude: area.lng
      });
      
      if (distance <= area.radius) {
        return 'remote';
      }
    }

    // Default to rural for everything else
    return 'rural';
  }
}

export default GeolocationUtils;