export interface AustralianRegion {
  name: string;
  state: string;
  type: 'urban' | 'rural' | 'remote';
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  majorCities?: string[];
}

export const australianRegions: AustralianRegion[] = [
  // New South Wales
  {
    name: 'Greater Sydney',
    state: 'NSW',
    type: 'urban',
    bounds: { north: -33.4, south: -34.2, east: 151.3, west: 150.5 },
    majorCities: ['Sydney', 'Parramatta', 'Liverpool', 'Blacktown']
  },
  {
    name: 'Hunter Valley',
    state: 'NSW',
    type: 'rural',
    bounds: { north: -32.0, south: -33.0, east: 152.0, west: 150.5 },
    majorCities: ['Newcastle', 'Maitland', 'Cessnock']
  },
  {
    name: 'Central West NSW',
    state: 'NSW',
    type: 'rural',
    bounds: { north: -31.5, south: -34.5, east: 150.5, west: 147.0 },
    majorCities: ['Orange', 'Bathurst', 'Dubbo']
  },
  {
    name: 'Far West NSW',
    state: 'NSW',
    type: 'remote',
    bounds: { north: -28.0, south: -37.5, east: 147.0, west: 141.0 },
    majorCities: ['Broken Hill', 'Bourke', 'Lightning Ridge']
  },

  // Victoria
  {
    name: 'Greater Melbourne',
    state: 'VIC',
    type: 'urban',
    bounds: { north: -37.4, south: -38.4, east: 145.8, west: 144.3 },
    majorCities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo']
  },
  {
    name: 'Gippsland',
    state: 'VIC',
    type: 'rural',
    bounds: { north: -37.0, south: -39.2, east: 149.9, west: 145.8 },
    majorCities: ['Traralgon', 'Sale', 'Bairnsdale']
  },
  {
    name: 'Western Victoria',
    state: 'VIC',
    type: 'rural',
    bounds: { north: -36.0, south: -38.5, east: 144.3, west: 140.9 },
    majorCities: ['Warrnambool', 'Hamilton', 'Portland']
  },
  {
    name: 'Mallee Victoria',
    state: 'VIC',
    type: 'remote',
    bounds: { north: -34.0, south: -36.5, east: 144.3, west: 140.9 },
    majorCities: ['Mildura', 'Swan Hill', 'Ouyen']
  },

  // Queensland
  {
    name: 'South East Queensland',
    state: 'QLD',
    type: 'urban',
    bounds: { north: -26.0, south: -28.5, east: 153.6, west: 151.5 },
    majorCities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Toowoomba']
  },
  {
    name: 'Central Queensland',
    state: 'QLD',
    type: 'rural',
    bounds: { north: -22.0, south: -26.0, east: 153.0, west: 147.0 },
    majorCities: ['Rockhampton', 'Gladstone', 'Bundaberg']
  },
  {
    name: 'North Queensland',
    state: 'QLD',
    type: 'rural',
    bounds: { north: -16.0, south: -22.0, east: 146.0, west: 142.0 },
    majorCities: ['Townsville', 'Cairns', 'Mount Isa']
  },
  {
    name: 'Far North Queensland',
    state: 'QLD',
    type: 'remote',
    bounds: { north: -10.0, south: -16.0, east: 145.8, west: 138.0 },
    majorCities: ['Cairns', 'Port Douglas', 'Cooktown']
  },

  // Western Australia
  {
    name: 'Perth Metropolitan',
    state: 'WA',
    type: 'urban',
    bounds: { north: -31.6, south: -32.5, east: 116.3, west: 115.6 },
    majorCities: ['Perth', 'Fremantle', 'Joondalup', 'Rockingham']
  },
  {
    name: 'South West WA',
    state: 'WA',
    type: 'rural',
    bounds: { north: -32.5, south: -35.0, east: 117.5, west: 114.5 },
    majorCities: ['Bunbury', 'Busselton', 'Margaret River']
  },
  {
    name: 'Pilbara',
    state: 'WA',
    type: 'remote',
    bounds: { north: -20.0, south: -24.0, east: 121.0, west: 117.0 },
    majorCities: ['Karratha', 'Port Hedland', 'Newman']
  },
  {
    name: 'Kimberley',
    state: 'WA',
    type: 'remote',
    bounds: { north: -14.0, south: -20.0, east: 129.0, west: 120.0 },
    majorCities: ['Broome', 'Kununurra', 'Derby']
  },

  // South Australia
  {
    name: 'Adelaide Metropolitan',
    state: 'SA',
    type: 'urban',
    bounds: { north: -34.5, south: -35.3, east: 139.0, west: 138.4 },
    majorCities: ['Adelaide', 'Gawler', 'Mount Barker']
  },
  {
    name: 'Riverland',
    state: 'SA',
    type: 'rural',
    bounds: { north: -33.5, south: -34.5, east: 141.0, west: 139.5 },
    majorCities: ['Renmark', 'Berri', 'Loxton']
  },
  {
    name: 'Outback SA',
    state: 'SA',
    type: 'remote',
    bounds: { north: -26.0, south: -33.5, east: 141.0, west: 129.0 },
    majorCities: ['Coober Pedy', 'Roxby Downs', 'Whyalla']
  },

  // Tasmania
  {
    name: 'Greater Hobart',
    state: 'TAS',
    type: 'urban',
    bounds: { north: -42.6, south: -43.2, east: 147.6, west: 147.0 },
    majorCities: ['Hobart', 'Glenorchy', 'Clarence']
  },
  {
    name: 'Northern Tasmania',
    state: 'TAS',
    type: 'rural',
    bounds: { north: -40.8, south: -42.0, east: 148.3, west: 144.7 },
    majorCities: ['Launceston', 'Devonport', 'Burnie']
  },

  // Northern Territory
  {
    name: 'Greater Darwin',
    state: 'NT',
    type: 'urban',
    bounds: { north: -12.2, south: -12.8, east: 131.2, west: 130.6 },
    majorCities: ['Darwin', 'Palmerston', 'Katherine']
  },
  {
    name: 'Central Australia',
    state: 'NT',
    type: 'remote',
    bounds: { north: -20.0, south: -26.0, east: 138.0, west: 129.0 },
    majorCities: ['Alice Springs', 'Tennant Creek', 'Yulara']
  },

  // Australian Capital Territory
  {
    name: 'ACT',
    state: 'ACT',
    type: 'urban',
    bounds: { north: -35.1, south: -35.9, east: 149.4, west: 148.7 },
    majorCities: ['Canberra', 'Queanbeyan']
  }
];

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get region information based on coordinates
 */
export function getRegionByCoordinates(latitude: number, longitude: number): { name: string; state: string; type: 'urban' | 'rural' | 'remote' } {
  for (const region of australianRegions) {
    if (
      latitude <= region.bounds.north &&
      latitude >= region.bounds.south &&
      longitude <= region.bounds.east &&
      longitude >= region.bounds.west
    ) {
      return {
        name: region.name,
        state: region.state,
        type: region.type
      };
    }
  }
  
  // Default to remote if no specific region found
  return {
    name: 'Remote Australia',
    state: 'Unknown',
    type: 'remote'
  };
}

/**
 * Get all regions by state
 */
export function getRegionsByState(state: string): AustralianRegion[] {
  return australianRegions.filter(region => region.state === state);
}

/**
 * Get regions by type
 */
export function getRegionsByType(type: 'urban' | 'rural' | 'remote'): AustralianRegion[] {
  return australianRegions.filter(region => region.type === type);
}

/**
 * Find nearest major city to coordinates
 */
export function findNearestCity(latitude: number, longitude: number): { city: string; distance: number; region: string } | null {
  let nearestCity = null;
  let minDistance = Infinity;
  
  for (const region of australianRegions) {
    if (region.majorCities) {
      // Use region center as approximation for city location
      const regionCenterLat = (region.bounds.north + region.bounds.south) / 2;
      const regionCenterLng = (region.bounds.east + region.bounds.west) / 2;
      
      const distance = calculateDistance(latitude, longitude, regionCenterLat, regionCenterLng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = {
          city: region.majorCities[0],
          distance: Math.round(distance),
          region: region.name
        };
      }
    }
  }
  
  return nearestCity;
}

/**
 * Check if coordinates are within Australia
 */
export function isWithinAustralia(latitude: number, longitude: number): boolean {
  // Australia's approximate bounds
  const australiaBounds = {
    north: -10.0,
    south: -44.0,
    east: 154.0,
    west: 113.0
  };
  
  return (
    latitude <= australiaBounds.north &&
    latitude >= australiaBounds.south &&
    longitude <= australiaBounds.east &&
    longitude >= australiaBounds.west
  );
}

/**
 * Get postcode information (simplified - in production would use external API)
 */
export function getPostcodeInfo(postcode: string): { state: string; region: string; type: 'urban' | 'rural' | 'remote' } | null {
  const postcodeRanges: { [key: string]: { state: string; type: 'urban' | 'rural' | 'remote' } } = {
    // NSW
    '1000-1999': { state: 'NSW', type: 'urban' },
    '2000-2599': { state: 'NSW', type: 'urban' },
    '2600-2899': { state: 'NSW', type: 'rural' },
    '2900-2999': { state: 'NSW', type: 'remote' },
    
    // VIC
    '3000-3199': { state: 'VIC', type: 'urban' },
    '3200-3999': { state: 'VIC', type: 'rural' },
    
    // QLD
    '4000-4199': { state: 'QLD', type: 'urban' },
    '4200-4999': { state: 'QLD', type: 'rural' },
    
    // SA
    '5000-5199': { state: 'SA', type: 'urban' },
    '5200-5999': { state: 'SA', type: 'rural' },
    
    // WA
    '6000-6199': { state: 'WA', type: 'urban' },
    '6200-6999': { state: 'WA', type: 'rural' },
    
    // TAS
    '7000-7999': { state: 'TAS', type: 'rural' },
    
    // NT
    '0800-0999': { state: 'NT', type: 'remote' },
    
    // ACT
    '2600-2699': { state: 'ACT', type: 'urban' }
  };
  
  const code = parseInt(postcode);
  
  for (const [range, info] of Object.entries(postcodeRanges)) {
    const [start, end] = range.split('-').map(Number);
    if (code >= start && code <= end) {
      return {
        state: info.state,
        region: `${info.state} ${info.type}`,
        type: info.type
      };
    }
  }
  
  return null;
}