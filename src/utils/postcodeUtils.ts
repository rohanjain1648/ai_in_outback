import { Coordinates, Address } from '../types/location';

export interface PostcodeInfo {
  postcode: string;
  suburb: string;
  city: string;
  state: string;
  coordinates: Coordinates;
  regionType: 'urban' | 'rural' | 'remote';
}

/**
 * Australian postcode lookup utility
 * In a real application, this would connect to Australia Post API or similar service
 */
export class PostcodeUtils {
  // Mock data for demonstration - in production, this would be a comprehensive database
  private static readonly POSTCODE_DATA: PostcodeInfo[] = [
    // NSW
    { postcode: '2000', suburb: 'Sydney', city: 'Sydney', state: 'NSW', coordinates: { latitude: -33.8688, longitude: 151.2093 }, regionType: 'urban' },
    { postcode: '2001', suburb: 'Sydney', city: 'Sydney', state: 'NSW', coordinates: { latitude: -33.8688, longitude: 151.2093 }, regionType: 'urban' },
    { postcode: '2010', suburb: 'Surry Hills', city: 'Sydney', state: 'NSW', coordinates: { latitude: -33.8886, longitude: 151.2094 }, regionType: 'urban' },
    { postcode: '2150', suburb: 'Parramatta', city: 'Sydney', state: 'NSW', coordinates: { latitude: -33.8150, longitude: 151.0000 }, regionType: 'urban' },
    { postcode: '2300', suburb: 'Newcastle', city: 'Newcastle', state: 'NSW', coordinates: { latitude: -32.9267, longitude: 151.7789 }, regionType: 'rural' },
    { postcode: '2800', suburb: 'Orange', city: 'Orange', state: 'NSW', coordinates: { latitude: -33.2839, longitude: 149.0999 }, regionType: 'rural' },
    { postcode: '2880', suburb: 'Broken Hill', city: 'Broken Hill', state: 'NSW', coordinates: { latitude: -31.9590, longitude: 141.4650 }, regionType: 'remote' },

    // VIC
    { postcode: '3000', suburb: 'Melbourne', city: 'Melbourne', state: 'VIC', coordinates: { latitude: -37.8136, longitude: 144.9631 }, regionType: 'urban' },
    { postcode: '3001', suburb: 'Melbourne', city: 'Melbourne', state: 'VIC', coordinates: { latitude: -37.8136, longitude: 144.9631 }, regionType: 'urban' },
    { postcode: '3141', suburb: 'South Yarra', city: 'Melbourne', state: 'VIC', coordinates: { latitude: -37.8397, longitude: 144.9966 }, regionType: 'urban' },
    { postcode: '3220', suburb: 'Geelong', city: 'Geelong', state: 'VIC', coordinates: { latitude: -38.1499, longitude: 144.3617 }, regionType: 'rural' },
    { postcode: '3350', suburb: 'Ballarat', city: 'Ballarat', state: 'VIC', coordinates: { latitude: -37.5622, longitude: 143.8503 }, regionType: 'rural' },
    { postcode: '3500', suburb: 'Mildura', city: 'Mildura', state: 'VIC', coordinates: { latitude: -34.1872, longitude: 142.1540 }, regionType: 'remote' },

    // QLD
    { postcode: '4000', suburb: 'Brisbane', city: 'Brisbane', state: 'QLD', coordinates: { latitude: -27.4698, longitude: 153.0251 }, regionType: 'urban' },
    { postcode: '4001', suburb: 'Brisbane', city: 'Brisbane', state: 'QLD', coordinates: { latitude: -27.4698, longitude: 153.0251 }, regionType: 'urban' },
    { postcode: '4217', suburb: 'Surfers Paradise', city: 'Gold Coast', state: 'QLD', coordinates: { latitude: -28.0023, longitude: 153.4145 }, regionType: 'urban' },
    { postcode: '4350', suburb: 'Toowoomba', city: 'Toowoomba', state: 'QLD', coordinates: { latitude: -27.5598, longitude: 151.9507 }, regionType: 'rural' },
    { postcode: '4700', suburb: 'Rockhampton', city: 'Rockhampton', state: 'QLD', coordinates: { latitude: -23.3781, longitude: 150.5069 }, regionType: 'rural' },
    { postcode: '4825', suburb: 'Mount Isa', city: 'Mount Isa', state: 'QLD', coordinates: { latitude: -20.7256, longitude: 139.4927 }, regionType: 'remote' },

    // WA
    { postcode: '6000', suburb: 'Perth', city: 'Perth', state: 'WA', coordinates: { latitude: -31.9505, longitude: 115.8605 }, regionType: 'urban' },
    { postcode: '6001', suburb: 'Perth', city: 'Perth', state: 'WA', coordinates: { latitude: -31.9505, longitude: 115.8605 }, regionType: 'urban' },
    { postcode: '6230', suburb: 'Bunbury', city: 'Bunbury', state: 'WA', coordinates: { latitude: -33.3267, longitude: 115.6347 }, regionType: 'rural' },
    { postcode: '6714', suburb: 'Karratha', city: 'Karratha', state: 'WA', coordinates: { latitude: -20.7364, longitude: 116.8460 }, regionType: 'remote' },
    { postcode: '6725', suburb: 'Broome', city: 'Broome', state: 'WA', coordinates: { latitude: -17.9614, longitude: 122.2359 }, regionType: 'remote' },

    // SA
    { postcode: '5000', suburb: 'Adelaide', city: 'Adelaide', state: 'SA', coordinates: { latitude: -34.9285, longitude: 138.6007 }, regionType: 'urban' },
    { postcode: '5001', suburb: 'Adelaide', city: 'Adelaide', state: 'SA', coordinates: { latitude: -34.9285, longitude: 138.6007 }, regionType: 'urban' },
    { postcode: '5341', suburb: 'Renmark', city: 'Renmark', state: 'SA', coordinates: { latitude: -34.1761, longitude: 140.7470 }, regionType: 'rural' },
    { postcode: '5723', suburb: 'Coober Pedy', city: 'Coober Pedy', state: 'SA', coordinates: { latitude: -29.0135, longitude: 134.7544 }, regionType: 'remote' },

    // TAS
    { postcode: '7000', suburb: 'Hobart', city: 'Hobart', state: 'TAS', coordinates: { latitude: -42.8821, longitude: 147.3272 }, regionType: 'urban' },
    { postcode: '7001', suburb: 'Hobart', city: 'Hobart', state: 'TAS', coordinates: { latitude: -42.8821, longitude: 147.3272 }, regionType: 'urban' },
    { postcode: '7250', suburb: 'Launceston', city: 'Launceston', state: 'TAS', coordinates: { latitude: -41.4332, longitude: 147.1441 }, regionType: 'rural' },

    // NT
    { postcode: '0800', suburb: 'Darwin', city: 'Darwin', state: 'NT', coordinates: { latitude: -12.4634, longitude: 130.8456 }, regionType: 'urban' },
    { postcode: '0801', suburb: 'Darwin', city: 'Darwin', state: 'NT', coordinates: { latitude: -12.4634, longitude: 130.8456 }, regionType: 'urban' },
    { postcode: '0870', suburb: 'Alice Springs', city: 'Alice Springs', state: 'NT', coordinates: { latitude: -23.6980, longitude: 133.8807 }, regionType: 'remote' },

    // ACT
    { postcode: '2600', suburb: 'Canberra', city: 'Canberra', state: 'ACT', coordinates: { latitude: -35.2809, longitude: 149.1300 }, regionType: 'urban' },
    { postcode: '2601', suburb: 'Canberra', city: 'Canberra', state: 'ACT', coordinates: { latitude: -35.2809, longitude: 149.1300 }, regionType: 'urban' }
  ];

  /**
   * Look up postcode information
   */
  static lookupPostcode(postcode: string): PostcodeInfo | null {
    const normalizedPostcode = postcode.trim().padStart(4, '0');
    return this.POSTCODE_DATA.find(item => item.postcode === normalizedPostcode) || null;
  }

  /**
   * Search postcodes by suburb name
   */
  static searchBySuburb(suburb: string): PostcodeInfo[] {
    const normalizedSuburb = suburb.toLowerCase().trim();
    return this.POSTCODE_DATA.filter(item => 
      item.suburb.toLowerCase().includes(normalizedSuburb)
    );
  }

  /**
   * Search postcodes by city name
   */
  static searchByCity(city: string): PostcodeInfo[] {
    const normalizedCity = city.toLowerCase().trim();
    return this.POSTCODE_DATA.filter(item => 
      item.city.toLowerCase().includes(normalizedCity)
    );
  }

  /**
   * Get all postcodes for a state
   */
  static getPostcodesByState(state: string): PostcodeInfo[] {
    const normalizedState = state.toUpperCase().trim();
    return this.POSTCODE_DATA.filter(item => item.state === normalizedState);
  }

  /**
   * Get postcodes by region type
   */
  static getPostcodesByRegionType(regionType: 'urban' | 'rural' | 'remote'): PostcodeInfo[] {
    return this.POSTCODE_DATA.filter(item => item.regionType === regionType);
  }

  /**
   * Validate Australian postcode format
   */
  static isValidPostcode(postcode: string): boolean {
    const normalizedPostcode = postcode.trim();
    return /^\d{4}$/.test(normalizedPostcode);
  }

  /**
   * Get address from postcode info
   */
  static getAddressFromPostcodeInfo(info: PostcodeInfo): Address {
    return {
      suburb: info.suburb,
      city: info.city,
      state: info.state,
      postcode: info.postcode,
      country: 'Australia'
    };
  }

  /**
   * Find nearest postcodes to coordinates
   */
  static findNearestPostcodes(coordinates: Coordinates, limit: number = 5): Array<PostcodeInfo & { distance: number }> {
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return this.POSTCODE_DATA
      .map(info => ({
        ...info,
        distance: calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          info.coordinates.latitude,
          info.coordinates.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  /**
   * Get suggested postcodes based on partial input
   */
  static getSuggestions(input: string, limit: number = 10): PostcodeInfo[] {
    const normalizedInput = input.toLowerCase().trim();
    
    if (!normalizedInput) return [];

    // If input looks like a postcode (numeric), search by postcode
    if (/^\d+$/.test(normalizedInput)) {
      return this.POSTCODE_DATA
        .filter(item => item.postcode.startsWith(normalizedInput))
        .slice(0, limit);
    }

    // Otherwise search by suburb and city names
    const results = new Set<PostcodeInfo>();
    
    // Search suburbs first (more specific)
    this.POSTCODE_DATA.forEach(item => {
      if (item.suburb.toLowerCase().includes(normalizedInput)) {
        results.add(item);
      }
    });

    // Then search cities if we need more results
    if (results.size < limit) {
      this.POSTCODE_DATA.forEach(item => {
        if (item.city.toLowerCase().includes(normalizedInput) && !results.has(item)) {
          results.add(item);
        }
      });
    }

    return Array.from(results).slice(0, limit);
  }
}

export default PostcodeUtils;