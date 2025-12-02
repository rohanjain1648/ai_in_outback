import { 
  Farm, 
  DashboardData, 
  CropMonitoring, 
  WeatherData, 
  MarketInsights 
} from '../types/agriculture';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AgriculturalService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async getDashboardData(): Promise<DashboardData> {
    const response = await fetch(`${API_BASE_URL}/agriculture/dashboard`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const result = await response.json();
    return result.data;
  }

  async createOrUpdateFarm(farmData: Partial<Farm>): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/agriculture/farm`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(farmData)
    });

    if (!response.ok) {
      throw new Error('Failed to save farm profile');
    }

    const result = await response.json();
    return result.data;
  }

  async analyzeCropPhoto(
    farmId: string,
    cropName: string,
    photoUrl: string,
    metadata: any = {}
  ): Promise<CropMonitoring> {
    const response = await fetch(`${API_BASE_URL}/agriculture/analyze-crop`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        farmId,
        cropName,
        photoUrl,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze crop photo');
    }

    const result = await response.json();
    return result.data;
  }

  async getCropAnalysisHistory(farmId: string, cropName?: string): Promise<CropMonitoring[]> {
    const url = new URL(`${API_BASE_URL}/agriculture/crop-analysis/${farmId}`);
    if (cropName) {
      url.searchParams.append('cropName', cropName);
    }

    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch crop analysis history');
    }

    const result = await response.json();
    return result.data;
  }

  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const response = await fetch(
      `${API_BASE_URL}/agriculture/weather?latitude=${latitude}&longitude=${longitude}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const result = await response.json();
    return result.data;
  }

  async getMarketInsights(farmId: string): Promise<MarketInsights> {
    const response = await fetch(`${API_BASE_URL}/agriculture/market/${farmId}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market insights');
    }

    const result = await response.json();
    return result.data;
  }

  async getNearbyFarms(
    latitude: number, 
    longitude: number, 
    radius: number = 50
  ): Promise<Farm[]> {
    const response = await fetch(
      `${API_BASE_URL}/agriculture/nearby-farms?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch nearby farms');
    }

    const result = await response.json();
    return result.data;
  }

  // Helper method to upload photos (would integrate with file upload service)
  async uploadCropPhoto(file: File): Promise<string> {
    // In a real implementation, this would upload to a cloud storage service
    // For now, we'll simulate with a placeholder URL
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/crop-photos/${Date.now()}-${file.name}`);
      }, 1000);
    });
  }
}

export const agriculturalService = new AgriculturalService();