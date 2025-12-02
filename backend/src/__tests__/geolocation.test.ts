import { GeolocationService } from '../services/geolocationService';
import { calculateDistance, getRegionByCoordinates, isWithinAustralia } from '../utils/geolocation';
import Location from '../models/Location';

// Mock the Location model
jest.mock('../models/Location');
const MockLocation = Location as jest.Mocked<typeof Location>;

describe('GeolocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserLocation', () => {
    it('should create new location for user', async () => {
      const mockLocation = {
        _id: 'location123',
        userId: 'user123',
        coordinates: { latitude: -33.8688, longitude: 151.2093 },
        region: { name: 'Greater Sydney', state: 'NSW', type: 'urban' },
        isPrivate: false,
        anonymized: false,
        lastUpdated: new Date(),
        source: 'gps',
        accuracy: 10
      };

      MockLocation.findOneAndUpdate.mockResolvedValue(mockLocation as any);

      const result = await GeolocationService.updateUserLocation(
        'user123',
        {
          latitude: -33.8688,
          longitude: 151.2093,
          source: 'gps',
          accuracy: 10
        }
      );

      expect(MockLocation.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user123' },
        expect.objectContaining({
          coordinates: { latitude: -33.8688, longitude: 151.2093 },
          source: 'gps',
          accuracy: 10,
          isPrivate: false,
          anonymized: false
        }),
        { upsert: true, new: true }
      );

      expect(result).toEqual(mockLocation);
    });

    it('should anonymize coordinates when requested', async () => {
      const mockLocation = {
        _id: 'location123',
        userId: 'user123',
        coordinates: { latitude: -33.8, longitude: 151.2 }, // Anonymized
        approximateLocation: { latitude: -33.8688, longitude: 151.2093, radius: 5 },
        region: { name: 'Greater Sydney', state: 'NSW', type: 'urban' },
        isPrivate: false,
        anonymized: true,
        lastUpdated: new Date(),
        source: 'gps'
      };

      MockLocation.findOneAndUpdate.mockResolvedValue(mockLocation as any);

      const result = await GeolocationService.updateUserLocation(
        'user123',
        {
          latitude: -33.8688,
          longitude: 151.2093,
          source: 'gps'
        },
        { isPrivate: false, anonymized: true }
      );

      expect(MockLocation.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user123' },
        expect.objectContaining({
          anonymized: true,
          approximateLocation: expect.objectContaining({
            radius: 5
          })
        }),
        { upsert: true, new: true }
      );

      expect(result.anonymized).toBe(true);
    });
  });

  describe('getUserLocation', () => {
    it('should return location for owner', async () => {
      const mockLocation = {
        _id: 'location123',
        userId: 'user123',
        coordinates: { latitude: -33.8688, longitude: 151.2093 },
        isPrivate: false,
        anonymized: false,
        toObject: () => mockLocation
      };

      MockLocation.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockLocation)
      } as any);

      const result = await GeolocationService.getUserLocation('user123', 'user123');

      expect(result).toEqual(mockLocation);
    });

    it('should return null for private location when not owner', async () => {
      const mockLocation = {
        _id: 'location123',
        userId: 'user123',
        isPrivate: true,
        anonymized: false
      };

      MockLocation.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockLocation)
      } as any);

      const result = await GeolocationService.getUserLocation('user123', 'user456');

      expect(result).toBeNull();
    });

    it('should return anonymized location when not owner', async () => {
      const mockLocation = {
        _id: 'location123',
        userId: 'user123',
        coordinates: { latitude: -33.8688, longitude: 151.2093 },
        approximateLocation: { latitude: -33.8, longitude: 151.2, radius: 5 },
        address: { street: '123 Test St', suburb: 'Test Suburb', city: 'Sydney', state: 'NSW', postcode: '2000' },
        isPrivate: false,
        anonymized: true,
        toObject: () => mockLocation
      };

      MockLocation.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockLocation)
      } as any);

      const result = await GeolocationService.getUserLocation('user123', 'user456');

      expect(result?.coordinates).toEqual({ latitude: -33.8, longitude: 151.2, radius: 5 });
      expect(result?.address?.street).toBeUndefined();
      expect(result?.address?.suburb).toBeUndefined();
    });
  });

  describe('findNearbyUsers', () => {
    it('should find users within radius', async () => {
      const mockUsers = [
        {
          _id: 'location1',
          userId: 'user1',
          coordinates: { latitude: -33.87, longitude: 151.21 },
          isPrivate: false
        },
        {
          _id: 'location2',
          userId: 'user2',
          coordinates: { latitude: -33.86, longitude: 151.20 },
          isPrivate: false
        }
      ];

      MockLocation.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockUsers)
        })
      } as any);

      const result = await GeolocationService.findNearbyUsers(-33.8688, 151.2093, 10, 'user123');

      expect(MockLocation.find).toHaveBeenCalledWith({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [151.2093, -33.8688]
            },
            $maxDistance: 10000
          }
        },
        isPrivate: false,
        userId: { $ne: 'user123' }
      });

      expect(result).toEqual(mockUsers);
    });

    it('should apply state filter', async () => {
      MockLocation.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      } as any);

      await GeolocationService.findNearbyUsers(
        -33.8688, 
        151.2093, 
        10, 
        'user123',
        { state: 'NSW' }
      );

      expect(MockLocation.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'region.state': 'NSW'
        })
      );
    });
  });

  describe('calculateUserDistance', () => {
    it('should calculate distance between two users', async () => {
      const location1 = {
        userId: 'user1',
        coordinates: { latitude: -33.8688, longitude: 151.2093 }
      };
      const location2 = {
        userId: 'user2',
        coordinates: { latitude: -37.8136, longitude: 144.9631 }
      };

      MockLocation.findOne
        .mockResolvedValueOnce(location1 as any)
        .mockResolvedValueOnce(location2 as any);

      const result = await GeolocationService.calculateUserDistance('user1', 'user2');

      // Distance between Sydney and Melbourne is approximately 713 km
      expect(result).toBeCloseTo(713, 0);
    });

    it('should return null when user location not found', async () => {
      MockLocation.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await GeolocationService.calculateUserDistance('user1', 'user2');

      expect(result).toBeNull();
    });
  });
});

describe('Geolocation Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance correctly', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
      expect(distance).toBeCloseTo(713, 0);
    });
  });

  describe('getRegionByCoordinates', () => {
    it('should return Greater Sydney for Sydney coordinates', () => {
      const region = getRegionByCoordinates(-33.8688, 151.2093);
      expect(region.name).toBe('Greater Sydney');
      expect(region.state).toBe('NSW');
      expect(region.type).toBe('urban');
    });

    it('should return Greater Melbourne for Melbourne coordinates', () => {
      const region = getRegionByCoordinates(-37.8136, 144.9631);
      expect(region.name).toBe('Greater Melbourne');
      expect(region.state).toBe('VIC');
      expect(region.type).toBe('urban');
    });

    it('should return remote for unknown coordinates', () => {
      const region = getRegionByCoordinates(-25.0, 130.0);
      expect(region.name).toBe('Central Australia');
      expect(region.state).toBe('NT');
      expect(region.type).toBe('remote');
    });
  });

  describe('isWithinAustralia', () => {
    it('should return true for Australian coordinates', () => {
      expect(isWithinAustralia(-33.8688, 151.2093)).toBe(true);
      expect(isWithinAustralia(-37.8136, 144.9631)).toBe(true);
      expect(isWithinAustralia(-12.4634, 130.8456)).toBe(true);
    });

    it('should return false for non-Australian coordinates', () => {
      expect(isWithinAustralia(40.7128, -74.0060)).toBe(false); // New York
      expect(isWithinAustralia(51.5074, -0.1278)).toBe(false);  // London
      expect(isWithinAustralia(35.6762, 139.6503)).toBe(false); // Tokyo
    });
  });
});