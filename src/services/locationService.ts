import { 
  Location, 
  LocationUpdate, 
  LocationFilter, 
  NearbySearchParams, 
  NearbyUsersResponse,
  AustralianRegion,
  RegionalStats,
  NearestCity,
  Coordinates,
  GeolocationOptions,
  GeolocationError
} from '../types/location';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class LocationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Get current user's location
   */
  async getCurrentLocation(): Promise<Location | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/current`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to get current location');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get current location error:', error);
      throw error;
    }
  }

  /**
   * Update user location
   */
  async updateLocation(locationData: LocationUpdate): Promise<Location> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/update`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(locationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update location');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  }

  /**
   * Get another user's location (respects privacy)
   */
  async getUserLocation(userId: string): Promise<Location | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/user/${userId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to get user location');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get user location error:', error);
      throw error;
    }
  }

  /**
   * Find nearby users
   */
  async findNearbyUsers(searchParams: NearbySearchParams): Promise<NearbyUsersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/nearby`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error('Failed to find nearby users');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Find nearby users error:', error);
      throw error;
    }
  }

  /**
   * Search locations by region
   */
  async searchLocationsByRegion(filters: LocationFilter): Promise<{ locations: Location[]; count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Search locations error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance to another user
   */
  async calculateDistanceToUser(userId: string): Promise<{ distance: number; unit: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/distance/${userId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to calculate distance');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Calculate distance error:', error);
      throw error;
    }
  }

  /**
   * Get regional statistics
   */
  async getRegionalStats(): Promise<RegionalStats[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/stats/regional`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get regional statistics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get regional stats error:', error);
      throw error;
    }
  }

  /**
   * Get regions by state
   */
  async getRegionsByState(state: string): Promise<AustralianRegion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/regions/${state}`);

      if (!response.ok) {
        throw new Error('Failed to get regions by state');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get regions by state error:', error);
      throw error;
    }
  }

  /**
   * Get regions by type
   */
  async getRegionsByType(type: 'urban' | 'rural' | 'remote'): Promise<AustralianRegion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/regions/type/${type}`);

      if (!response.ok) {
        throw new Error('Failed to get regions by type');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get regions by type error:', error);
      throw error;
    }
  }

  /**
   * Find nearest city to coordinates
   */
  async findNearestCity(coordinates: Coordinates): Promise<NearestCity> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/nearest-city`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(coordinates)
      });

      if (!response.ok) {
        throw new Error('Failed to find nearest city');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Find nearest city error:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService();
export default locationService;