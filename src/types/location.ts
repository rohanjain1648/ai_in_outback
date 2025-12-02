export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  suburb?: string;
  city: string;
  state: string;
  postcode: string;
  country?: string;
}

export interface Region {
  name: string;
  state: string;
  type: 'urban' | 'rural' | 'remote';
}

export interface LocationPrivacy {
  isPrivate: boolean;
  anonymized: boolean;
}

export interface Location {
  _id: string;
  userId: string;
  coordinates: Coordinates;
  address?: Address;
  region: Region;
  isPrivate: boolean;
  anonymized: boolean;
  approximateLocation?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  lastUpdated: string;
  source: 'gps' | 'manual' | 'ip' | 'postcode';
  accuracy?: number;
}

export interface LocationUpdate {
  coordinates: Coordinates;
  address?: Address;
  source: 'gps' | 'manual' | 'ip' | 'postcode';
  accuracy?: number;
  privacy?: LocationPrivacy;
}

export interface LocationFilter {
  state?: string;
  regionType?: 'urban' | 'rural' | 'remote';
  maxDistance?: number;
  centerPoint?: Coordinates;
}

export interface NearbySearchParams {
  coordinates: Coordinates;
  radius: number;
  filters?: LocationFilter;
}

export interface NearbyUsersResponse {
  users: Location[];
  count: number;
  searchRadius: number;
  center: Coordinates;
}

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

export interface RegionalStats {
  _id: string;
  regions: Array<{
    type: 'urban' | 'rural' | 'remote';
    count: number;
    lastActivity: string;
  }>;
  totalUsers: number;
}

export interface NearestCity {
  city: string;
  distance: number;
  region: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}