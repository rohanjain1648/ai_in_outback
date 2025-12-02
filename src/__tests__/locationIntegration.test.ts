import { GeolocationUtils } from '../utils/geolocation';
import { PostcodeUtils } from '../utils/postcodeUtils';

describe('Location Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Postcode to Location Integration', () => {
    it('should convert postcode to coordinates and validate within Australia', () => {
      // Look up Sydney postcode
      const postcodeInfo = PostcodeUtils.lookupPostcode('2000');
      
      expect(postcodeInfo).not.toBeNull();
      expect(postcodeInfo!.coordinates).toBeDefined();
      
      // Verify coordinates are within Australia
      const isWithinAustralia = GeolocationUtils.isWithinAustralia(postcodeInfo!.coordinates);
      expect(isWithinAustralia).toBe(true);
      
      // Verify region type estimation matches postcode data
      const estimatedRegion = GeolocationUtils.estimateRegionType(postcodeInfo!.coordinates);
      expect(estimatedRegion).toBe(postcodeInfo!.regionType);
    });

    it('should handle rural postcode correctly', () => {
      // Look up Orange, NSW postcode
      const postcodeInfo = PostcodeUtils.lookupPostcode('2800');
      
      expect(postcodeInfo).not.toBeNull();
      expect(postcodeInfo!.regionType).toBe('rural');
      
      // Verify coordinates are within Australia
      const isWithinAustralia = GeolocationUtils.isWithinAustralia(postcodeInfo!.coordinates);
      expect(isWithinAustralia).toBe(true);
    });

    it('should handle remote postcode correctly', () => {
      // Look up Broken Hill, NSW postcode
      const postcodeInfo = PostcodeUtils.lookupPostcode('2880');
      
      expect(postcodeInfo).not.toBeNull();
      expect(postcodeInfo!.regionType).toBe('remote');
      
      // Verify coordinates are within Australia
      const isWithinAustralia = GeolocationUtils.isWithinAustralia(postcodeInfo!.coordinates);
      expect(isWithinAustralia).toBe(true);
    });
  });

  describe('Distance Calculations', () => {
    it('should calculate distances between major cities correctly', () => {
      const sydney = PostcodeUtils.lookupPostcode('2000');
      const melbourne = PostcodeUtils.lookupPostcode('3000');
      
      expect(sydney).not.toBeNull();
      expect(melbourne).not.toBeNull();
      
      const distance = GeolocationUtils.calculateDistance(
        sydney!.coordinates,
        melbourne!.coordinates
      );
      
      // Distance between Sydney and Melbourne should be approximately 713km
      expect(distance).toBeCloseTo(713, 0);
    });

    it('should find nearest postcodes correctly', () => {
      const sydneyCoords = { latitude: -33.8688, longitude: 151.2093 };
      const nearest = PostcodeUtils.findNearestPostcodes(sydneyCoords, 3);
      
      expect(nearest).toHaveLength(3);
      expect(nearest[0].distance).toBeLessThan(1); // Should be very close to Sydney
      
      // Results should be sorted by distance
      for (let i = 1; i < nearest.length; i++) {
        expect(nearest[i].distance).toBeGreaterThanOrEqual(nearest[i - 1].distance);
      }
    });
  });

  describe('Search and Suggestions', () => {
    it('should provide relevant suggestions for partial input', () => {
      // Test postcode suggestions
      const postcodeSuggestions = PostcodeUtils.getSuggestions('20', 5);
      expect(postcodeSuggestions.length).toBeGreaterThan(0);
      expect(postcodeSuggestions.every(s => s.postcode.startsWith('20'))).toBe(true);
      
      // Test suburb suggestions
      const suburbSuggestions = PostcodeUtils.getSuggestions('Syd', 5);
      expect(suburbSuggestions.length).toBeGreaterThan(0);
      expect(suburbSuggestions.some(s => s.suburb.toLowerCase().includes('syd'))).toBe(true);
    });

    it('should handle state-based filtering', () => {
      const nswPostcodes = PostcodeUtils.getPostcodesByState('NSW');
      const vicPostcodes = PostcodeUtils.getPostcodesByState('VIC');
      
      expect(nswPostcodes.length).toBeGreaterThan(0);
      expect(vicPostcodes.length).toBeGreaterThan(0);
      
      expect(nswPostcodes.every(p => p.state === 'NSW')).toBe(true);
      expect(vicPostcodes.every(p => p.state === 'VIC')).toBe(true);
    });

    it('should handle region type filtering', () => {
      const urbanPostcodes = PostcodeUtils.getPostcodesByRegionType('urban');
      const ruralPostcodes = PostcodeUtils.getPostcodesByRegionType('rural');
      const remotePostcodes = PostcodeUtils.getPostcodesByRegionType('remote');
      
      expect(urbanPostcodes.length).toBeGreaterThan(0);
      expect(ruralPostcodes.length).toBeGreaterThan(0);
      expect(remotePostcodes.length).toBeGreaterThan(0);
      
      expect(urbanPostcodes.every(p => p.regionType === 'urban')).toBe(true);
      expect(ruralPostcodes.every(p => p.regionType === 'rural')).toBe(true);
      expect(remotePostcodes.every(p => p.regionType === 'remote')).toBe(true);
    });
  });

  describe('Address Conversion', () => {
    it('should convert postcode info to proper address format', () => {
      const postcodeInfo = PostcodeUtils.lookupPostcode('2000');
      expect(postcodeInfo).not.toBeNull();
      
      const address = PostcodeUtils.getAddressFromPostcodeInfo(postcodeInfo!);
      
      expect(address).toEqual({
        suburb: 'Sydney',
        city: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        country: 'Australia'
      });
    });
  });

  describe('Coordinate Formatting', () => {
    it('should format coordinates correctly for display', () => {
      const sydney = { latitude: -33.8688, longitude: 151.2093 };
      
      const formatted = GeolocationUtils.formatCoordinates(sydney);
      expect(formatted).toBe('33.8688°S, 151.2093°E');
      
      const formattedPrecision = GeolocationUtils.formatCoordinates(sydney, 2);
      expect(formattedPrecision).toBe('33.87°S, 151.21°E');
    });

    it('should handle northern and western coordinates', () => {
      const coords = { latitude: 12.4634, longitude: -130.8456 };
      
      const formatted = GeolocationUtils.formatCoordinates(coords);
      expect(formatted).toBe('12.4634°N, 130.8456°W');
    });
  });

  describe('Validation', () => {
    it('should validate postcode formats correctly', () => {
      expect(PostcodeUtils.isValidPostcode('2000')).toBe(true);
      expect(PostcodeUtils.isValidPostcode('0800')).toBe(true);
      expect(PostcodeUtils.isValidPostcode('200')).toBe(false);
      expect(PostcodeUtils.isValidPostcode('20000')).toBe(false);
      expect(PostcodeUtils.isValidPostcode('abcd')).toBe(false);
    });

    it('should validate Australian coordinates', () => {
      // Valid Australian coordinates
      expect(GeolocationUtils.isWithinAustralia({ latitude: -33.8688, longitude: 151.2093 })).toBe(true);
      expect(GeolocationUtils.isWithinAustralia({ latitude: -37.8136, longitude: 144.9631 })).toBe(true);
      
      // Invalid coordinates (outside Australia)
      expect(GeolocationUtils.isWithinAustralia({ latitude: 40.7128, longitude: -74.0060 })).toBe(false);
      expect(GeolocationUtils.isWithinAustralia({ latitude: 51.5074, longitude: -0.1278 })).toBe(false);
    });
  });
});