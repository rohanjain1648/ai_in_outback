import { GeolocationUtils } from '../utils/geolocation';
import { Coordinates } from '../types/location';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock fetch for IP geolocation
global.fetch = jest.fn();

describe('GeolocationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentPosition', () => {
    it('should resolve with coordinates when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: -33.8688,
          longitude: 151.2093
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await GeolocationUtils.getCurrentPosition();
      
      expect(result).toEqual({
        latitude: -33.8688,
        longitude: 151.2093
      });
    });

    it('should reject with error when geolocation fails', async () => {
      const mockError = {
        code: 1,
        message: 'User denied geolocation'
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      await expect(GeolocationUtils.getCurrentPosition()).rejects.toMatchObject({
        code: 1,
        message: 'Location access denied by user'
      });
    });

    it('should reject when geolocation is not supported', async () => {
      // Temporarily remove geolocation
      const originalGeolocation = global.navigator.geolocation;
      (global.navigator as any).geolocation = undefined;

      await expect(GeolocationUtils.getCurrentPosition()).rejects.toThrow(
        'Geolocation is not supported by this browser'
      );

      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between Sydney and Melbourne correctly', () => {
      const sydney: Coordinates = { latitude: -33.8688, longitude: 151.2093 };
      const melbourne: Coordinates = { latitude: -37.8136, longitude: 144.9631 };
      
      const distance = GeolocationUtils.calculateDistance(sydney, melbourne);
      
      // Distance between Sydney and Melbourne is approximately 713 km
      expect(distance).toBeCloseTo(713, 1);
    });

    it('should return 0 for same coordinates', () => {
      const coords: Coordinates = { latitude: -33.8688, longitude: 151.2093 };
      
      const distance = GeolocationUtils.calculateDistance(coords, coords);
      
      expect(distance).toBe(0);
    });
  });

  describe('isWithinAustralia', () => {
    it('should return true for Sydney coordinates', () => {
      const sydney: Coordinates = { latitude: -33.8688, longitude: 151.2093 };
      
      expect(GeolocationUtils.isWithinAustralia(sydney)).toBe(true);
    });

    it('should return true for Perth coordinates', () => {
      const perth: Coordinates = { latitude: -31.9505, longitude: 115.8605 };
      
      expect(GeolocationUtils.isWithinAustralia(perth)).toBe(true);
    });

    it('should return false for New York coordinates', () => {
      const newYork: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      expect(GeolocationUtils.isWithinAustralia(newYork)).toBe(false);
    });

    it('should return false for London coordinates', () => {
      const london: Coordinates = { latitude: 51.5074, longitude: -0.1278 };
      
      expect(GeolocationUtils.isWithinAustralia(london)).toBe(false);
    });
  });

  describe('getLocationFromIP', () => {
    it('should return coordinates from IP geolocation service', async () => {
      const mockResponse = {
        latitude: '-33.8688',
        longitude: '151.2093',
        country: 'Australia'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await GeolocationUtils.getLocationFromIP();
      
      expect(result).toEqual({
        latitude: -33.8688,
        longitude: 151.2093
      });
    });

    it('should throw error when IP location is outside Australia', async () => {
      const mockResponse = {
        latitude: '40.7128',
        longitude: '-74.0060',
        country: 'United States'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await expect(GeolocationUtils.getLocationFromIP()).rejects.toThrow(
        'Failed to get location from IP'
      );
    });

    it('should throw error when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(GeolocationUtils.getLocationFromIP()).rejects.toThrow(
        'Failed to get location from IP'
      );
    });
  });

  describe('getLocationWithFallback', () => {
    it('should return GPS location when available', async () => {
      const mockPosition = {
        coords: {
          latitude: -33.8688,
          longitude: 151.2093
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await GeolocationUtils.getLocationWithFallback();
      
      expect(result).toEqual({
        coordinates: { latitude: -33.8688, longitude: 151.2093 },
        source: 'gps',
        accuracy: 10
      });
    });

    it('should fallback to IP when GPS fails', async () => {
      // Mock GPS failure
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'User denied' });
      });

      // Mock IP success
      const mockResponse = {
        latitude: '-33.8688',
        longitude: '151.2093'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await GeolocationUtils.getLocationWithFallback();
      
      expect(result).toEqual({
        coordinates: { latitude: -33.8688, longitude: 151.2093 },
        source: 'ip',
        accuracy: 10000
      });
    });

    it('should throw error when both GPS and IP fail', async () => {
      // Mock GPS failure
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'User denied' });
      });

      // Mock IP failure
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(GeolocationUtils.getLocationWithFallback()).rejects.toThrow(
        'Unable to determine location'
      );
    });
  });

  describe('formatCoordinates', () => {
    it('should format Sydney coordinates correctly', () => {
      const sydney: Coordinates = { latitude: -33.8688, longitude: 151.2093 };
      
      const formatted = GeolocationUtils.formatCoordinates(sydney);
      
      expect(formatted).toBe('33.8688°S, 151.2093°E');
    });

    it('should format coordinates with custom precision', () => {
      const coords: Coordinates = { latitude: -33.868812, longitude: 151.209296 };
      
      const formatted = GeolocationUtils.formatCoordinates(coords, 2);
      
      expect(formatted).toBe('33.87°S, 151.21°E');
    });
  });

  describe('estimateRegionType', () => {
    it('should return urban for Sydney coordinates', () => {
      const sydney: Coordinates = { latitude: -33.8688, longitude: 151.2093 };
      
      const regionType = GeolocationUtils.estimateRegionType(sydney);
      
      expect(regionType).toBe('urban');
    });

    it('should return urban for Melbourne coordinates', () => {
      const melbourne: Coordinates = { latitude: -37.8136, longitude: 144.9631 };
      
      const regionType = GeolocationUtils.estimateRegionType(melbourne);
      
      expect(regionType).toBe('urban');
    });

    it('should return remote for central Australia coordinates', () => {
      const centralAustralia: Coordinates = { latitude: -23.7, longitude: 133.9 };
      
      const regionType = GeolocationUtils.estimateRegionType(centralAustralia);
      
      expect(regionType).toBe('remote');
    });

    it('should return rural for coordinates outside major cities and remote areas', () => {
      const ruralNSW: Coordinates = { latitude: -32.9267, longitude: 151.7789 }; // Newcastle area
      
      const regionType = GeolocationUtils.estimateRegionType(ruralNSW);
      
      expect(regionType).toBe('rural');
    });
  });
});