import { User, UpdateProfileData, ChangePasswordData } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = localStorage.getItem('accessToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<{ success: boolean; data: { user: User } }>('/users/profile');
    return response.data.user;
  }

  async updateProfile(updateData: UpdateProfileData): Promise<User> {
    const response = await this.makeRequest<{ success: boolean; data: { user: User } }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data.user;
  }

  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    await this.makeRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deactivateAccount(): Promise<void> {
    await this.makeRequest('/users/account', {
      method: 'DELETE',
    });
  }

  async findNearbyUsers(
    longitude: number,
    latitude: number,
    maxDistance: number = 50000,
    limit: number = 20
  ): Promise<User[]> {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      maxDistance: maxDistance.toString(),
      limit: limit.toString(),
    });

    const response = await this.makeRequest<{ success: boolean; data: { users: User[] } }>(
      `/users/nearby?${params}`
    );
    return response.data.users;
  }
}

export const userService = new UserService();