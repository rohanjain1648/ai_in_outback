import Location, { ILocation } from '../models/Location';
import { australianRegions, getRegionByCoordinates, calculateDistance } from '../utils/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: {
    street?: string;
    suburb?: string;
    city: string;
    state: string;
    postcode: string;
  };
  source: 'gps' | 'manual' | 'ip' | 'postcode';
  accuracy?: number;
}

export interface LocationFilter {
  state?: string;
  regionType?: 'urban' | 'rural' | 'remote';
  maxDistance?: number;
  centerPoint?: {
    latitude: number;
    longitude: number;
  };
}

export class GeolocationService {
  /**
   * Update user location with privacy controls
   */
  static async updateUserLocation(
    userId: string,
    locationData: LocationData,
    privacySettings: { isPrivate: boolean; anonymized: boolean } = { isPrivate: false, anonymized: false }
  ): Promise<ILocation> {
    const region = getRegionByCoordinates(locationData.latitude, locationData.longitude);
    
    let coordinates = {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };

    let approximateLocation;
    
    // Apply anonymization if requested
    if (privacySettings.anonymized) {
      const anonymizedCoords = this.anonymizeCoordinates(
        locationData.latitude,
        locationData.longitude,
        5 // 5km radius for anonymization
      );
      approximateLocation = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius: 5
      };
      coordinates = anonymizedCoords;
    }

    const locationDoc = await Location.findOneAndUpdate(
      { userId },
      {
        coordinates,
        address: locationData.address,
        region,
        isPrivate: privacySettings.isPrivate,
        anonymized: privacySettings.anonymized,
        approximateLocation,
        lastUpdated: new Date(),
        source: locationData.source,
        accuracy: locationData.accuracy
      },
      { upsert: true, new: true }
    );

    return locationDoc;
  }

  /**
   * Get user location with privacy controls
   */
  static async getUserLocation(userId: string, requesterId?: string): Promise<ILocation | null> {
    const location = await Location.findOne({ userId }).populate('userId', 'username');
    
    if (!location) return null;

    // If location is private and requester is not the owner, return null
    if (location.isPrivate && requesterId !== userId) {
      return null;
    }

    // If location is anonymized and requester is not the owner, return anonymized version
    if (location.anonymized && requesterId !== userId) {
      const locationObj = location.toObject();
      return {
        ...locationObj,
        coordinates: location.approximateLocation || location.coordinates,
        address: {
          ...locationObj.address,
          street: undefined,
          suburb: undefined
        }
      } as any;
    }

    return location;
  }

  /**
   * Find nearby users within specified radius
   */
  static async findNearbyUsers(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    excludeUserId?: string,
    filters?: LocationFilter
  ): Promise<ILocation[]> {
    const query: any = {
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [centerLng, centerLat]
          },
          $maxDistance: radiusKm * 1000 // Convert km to meters
        }
      },
      isPrivate: false
    };

    if (excludeUserId) {
      query.userId = { $ne: excludeUserId };
    }

    if (filters?.state) {
      query['region.state'] = filters.state;
    }

    if (filters?.regionType) {
      query['region.type'] = filters.regionType;
    }

    const locations = await Location.find(query)
      .populate('userId', 'username email')
      .limit(50);

    return locations;
  }

  /**
   * Get locations by region filter
   */
  static async getLocationsByRegion(filters: LocationFilter): Promise<ILocation[]> {
    const query: any = { isPrivate: false };

    if (filters.state) {
      query['region.state'] = filters.state;
    }

    if (filters.regionType) {
      query['region.type'] = filters.regionType;
    }

    let locations = await Location.find(query)
      .populate('userId', 'username email')
      .limit(100);

    // Apply distance filter if center point is provided
    if (filters.centerPoint && filters.maxDistance) {
      locations = locations.filter(location => {
        const distance = calculateDistance(
          filters.centerPoint!.latitude,
          filters.centerPoint!.longitude,
          location.coordinates.latitude,
          location.coordinates.longitude
        );
        return distance <= filters.maxDistance!;
      });
    }

    return locations;
  }

  /**
   * Calculate distance between two users
   */
  static async calculateUserDistance(userId1: string, userId2: string): Promise<number | null> {
    const [location1, location2] = await Promise.all([
      Location.findOne({ userId: userId1 }),
      Location.findOne({ userId: userId2 })
    ]);

    if (!location1 || !location2) return null;

    return calculateDistance(
      location1.coordinates.latitude,
      location1.coordinates.longitude,
      location2.coordinates.latitude,
      location2.coordinates.longitude
    );
  }

  /**
   * Anonymize coordinates by adding random offset within radius
   */
  private static anonymizeCoordinates(lat: number, lng: number, radiusKm: number) {
    const earthRadius = 6371; // Earth's radius in km
    
    // Generate random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusKm;
    
    // Convert distance to angular distance
    const angularDistance = distance / earthRadius;
    
    // Calculate new coordinates
    const newLat = Math.asin(
      Math.sin(lat * Math.PI / 180) * Math.cos(angularDistance) +
      Math.cos(lat * Math.PI / 180) * Math.sin(angularDistance) * Math.cos(angle)
    ) * 180 / Math.PI;
    
    const newLng = lng + Math.atan2(
      Math.sin(angle) * Math.sin(angularDistance) * Math.cos(lat * Math.PI / 180),
      Math.cos(angularDistance) - Math.sin(lat * Math.PI / 180) * Math.sin(newLat * Math.PI / 180)
    ) * 180 / Math.PI;
    
    return { latitude: newLat, longitude: newLng };
  }

  /**
   * Get regional statistics
   */
  static async getRegionalStats() {
    const stats = await Location.aggregate([
      {
        $match: { isPrivate: false }
      },
      {
        $group: {
          _id: {
            state: '$region.state',
            type: '$region.type'
          },
          count: { $sum: 1 },
          lastActivity: { $max: '$lastUpdated' }
        }
      },
      {
        $group: {
          _id: '$_id.state',
          regions: {
            $push: {
              type: '$_id.type',
              count: '$count',
              lastActivity: '$lastActivity'
            }
          },
          totalUsers: { $sum: '$count' }
        }
      }
    ]);

    return stats;
  }
}