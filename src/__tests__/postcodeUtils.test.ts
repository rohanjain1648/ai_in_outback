import { PostcodeUtils } from '../utils/postcodeUtils';

describe('PostcodeUtils', () => {
  describe('lookupPostcode', () => {
    it('should find Sydney postcode 2000', () => {
      const result = PostcodeUtils.lookupPostcode('2000');
      
      expect(result).not.toBeNull();
      expect(result?.postcode).toBe('2000');
      expect(result?.suburb).toBe('Sydney');
      expect(result?.state).toBe('NSW');
      expect(result?.regionType).toBe('urban');
    });

    it('should find Melbourne postcode 3000', () => {
      const result = PostcodeUtils.lookupPostcode('3000');
      
      expect(result).not.toBeNull();
      expect(result?.postcode).toBe('3000');
      expect(result?.suburb).toBe('Melbourne');
      expect(result?.state).toBe('VIC');
      expect(result?.regionType).toBe('urban');
    });

    it('should handle padded postcodes', () => {
      const result = PostcodeUtils.lookupPostcode('800'); // Should become 0800
      
      expect(result).not.toBeNull();
      expect(result?.postcode).toBe('0800');
      expect(result?.suburb).toBe('Darwin');
      expect(result?.state).toBe('NT');
    });

    it('should return null for unknown postcode', () => {
      const result = PostcodeUtils.lookupPostcode('9999');
      
      expect(result).toBeNull();
    });
  });

  describe('searchBySuburb', () => {
    it('should find suburbs containing "Sydney"', () => {
      const results = PostcodeUtils.searchBySuburb('Sydney');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.suburb.toLowerCase().includes('sydney'))).toBe(true);
    });

    it('should be case insensitive', () => {
      const results = PostcodeUtils.searchBySuburb('MELBOURNE');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.suburb === 'Melbourne')).toBe(true);
    });

    it('should return empty array for non-existent suburb', () => {
      const results = PostcodeUtils.searchBySuburb('NonExistentSuburb');
      
      expect(results).toEqual([]);
    });
  });

  describe('searchByCity', () => {
    it('should find cities containing "Brisbane"', () => {
      const results = PostcodeUtils.searchByCity('Brisbane');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.city.toLowerCase().includes('brisbane'))).toBe(true);
    });

    it('should find Gold Coast entries', () => {
      const results = PostcodeUtils.searchByCity('Gold Coast');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.city === 'Gold Coast')).toBe(true);
    });
  });

  describe('getPostcodesByState', () => {
    it('should return NSW postcodes', () => {
      const results = PostcodeUtils.getPostcodesByState('NSW');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.state === 'NSW')).toBe(true);
    });

    it('should handle lowercase state codes', () => {
      const results = PostcodeUtils.getPostcodesByState('vic');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.state === 'VIC')).toBe(true);
    });

    it('should return empty array for invalid state', () => {
      const results = PostcodeUtils.getPostcodesByState('XX');
      
      expect(results).toEqual([]);
    });
  });

  describe('getPostcodesByRegionType', () => {
    it('should return urban postcodes', () => {
      const results = PostcodeUtils.getPostcodesByRegionType('urban');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.regionType === 'urban')).toBe(true);
    });

    it('should return rural postcodes', () => {
      const results = PostcodeUtils.getPostcodesByRegionType('rural');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.regionType === 'rural')).toBe(true);
    });

    it('should return remote postcodes', () => {
      const results = PostcodeUtils.getPostcodesByRegionType('remote');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.regionType === 'remote')).toBe(true);
    });
  });

  describe('isValidPostcode', () => {
    it('should validate correct postcodes', () => {
      expect(PostcodeUtils.isValidPostcode('2000')).toBe(true);
      expect(PostcodeUtils.isValidPostcode('3000')).toBe(true);
      expect(PostcodeUtils.isValidPostcode('0800')).toBe(true);
    });

    it('should reject invalid postcodes', () => {
      expect(PostcodeUtils.isValidPostcode('200')).toBe(false);
      expect(PostcodeUtils.isValidPostcode('20000')).toBe(false);
      expect(PostcodeUtils.isValidPostcode('abcd')).toBe(false);
      expect(PostcodeUtils.isValidPostcode('')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(PostcodeUtils.isValidPostcode(' 2000 ')).toBe(true);
    });
  });

  describe('getAddressFromPostcodeInfo', () => {
    it('should convert postcode info to address', () => {
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

  describe('findNearestPostcodes', () => {
    it('should find nearest postcodes to Sydney coordinates', () => {
      const sydneyCoords = { latitude: -33.8688, longitude: 151.2093 };
      const results = PostcodeUtils.findNearestPostcodes(sydneyCoords, 3);
      
      expect(results).toHaveLength(3);
      expect(results[0].distance).toBeLessThanOrEqual(results[1].distance);
      expect(results[1].distance).toBeLessThanOrEqual(results[2].distance);
      
      // First result should be Sydney itself or very close
      expect(results[0].distance).toBeLessThan(5); // Within 5km
    });

    it('should include distance in results', () => {
      const coords = { latitude: -37.8136, longitude: 144.9631 }; // Melbourne
      const results = PostcodeUtils.findNearestPostcodes(coords, 1);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('distance');
      expect(typeof results[0].distance).toBe('number');
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions for postcode input', () => {
      const results = PostcodeUtils.getSuggestions('20', 5);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
      expect(results.every(r => r.postcode.startsWith('20'))).toBe(true);
    });

    it('should return suggestions for suburb input', () => {
      const results = PostcodeUtils.getSuggestions('Syd', 5);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.suburb.toLowerCase().includes('syd'))).toBe(true);
    });

    it('should return suggestions for city input', () => {
      const results = PostcodeUtils.getSuggestions('Melbourne', 5);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.city.toLowerCase().includes('melbourne'))).toBe(true);
    });

    it('should return empty array for empty input', () => {
      const results = PostcodeUtils.getSuggestions('', 5);
      
      expect(results).toEqual([]);
    });

    it('should return empty array for single character input', () => {
      const results = PostcodeUtils.getSuggestions('X', 5); // Use a character that won't match
      
      expect(results).toEqual([]);
    });

    it('should limit results to specified count', () => {
      const results = PostcodeUtils.getSuggestions('2', 3);
      
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });
});