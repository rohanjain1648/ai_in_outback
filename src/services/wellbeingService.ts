import { 
  WellbeingCheckIn, 
  WellbeingCheckInForm, 
  WellbeingDashboard, 
  MentalHealthResource, 
  SupportConnection, 
  PeerSupportChat 
} from '../types/wellbeing';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class WellbeingService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  /**
   * Get wellbeing dashboard data
   */
  async getDashboard(days: number = 30): Promise<WellbeingDashboard> {
    const response = await this.fetchWithAuth(`/wellbeing/dashboard?days=${days}`);
    return response.data;
  }

  /**
   * Submit a wellbeing check-in
   */
  async submitCheckIn(checkIn: WellbeingCheckInForm): Promise<WellbeingCheckIn> {
    const response = await this.fetchWithAuth('/wellbeing/checkin', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    });
    return response.data;
  }

  /**
   * Get wellbeing check-in history
   */
  async getCheckInHistory(page: number = 1, limit: number = 20): Promise<{
    checkIns: WellbeingCheckIn[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await this.fetchWithAuth(`/wellbeing/checkins?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Get mental health resources
   */
  async getResources(category?: string, state?: string): Promise<MentalHealthResource[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (state) params.append('state', state);
    
    const response = await this.fetchWithAuth(`/wellbeing/resources?${params.toString()}`);
    return response.data;
  }

  /**
   * Get crisis resources (no auth required)
   */
  async getCrisisResources(state?: string): Promise<MentalHealthResource[]> {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    
    const response = await fetch(`${API_BASE_URL}/wellbeing/crisis-resources?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch crisis resources');
    }
    
    const result = await response.json();
    return result.data;
  }

  /**
   * Find support matches
   */
  async findSupportMatches(type: 'peer_support' | 'mentor' | 'buddy' = 'peer_support'): Promise<SupportConnection[]> {
    const response = await this.fetchWithAuth(`/wellbeing/support-matches?type=${type}`);
    return response.data;
  }

  /**
   * Create a support connection
   */
  async createSupportConnection(data: {
    supporterId: string;
    connectionType?: string;
    supportAreas?: string[];
  }): Promise<SupportConnection> {
    const response = await this.fetchWithAuth('/wellbeing/support-connection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * Get user's support connections
   */
  async getSupportConnections(): Promise<SupportConnection[]> {
    const response = await this.fetchWithAuth('/wellbeing/support-connections');
    return response.data;
  }

  /**
   * Update support connection status
   */
  async updateSupportConnection(id: string, status: string): Promise<SupportConnection> {
    const response = await this.fetchWithAuth(`/wellbeing/support-connection/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  /**
   * Get peer support chats
   */
  async getPeerChats(): Promise<PeerSupportChat[]> {
    const response = await this.fetchWithAuth('/wellbeing/peer-chats');
    return response.data;
  }

  /**
   * Create a peer support chat
   */
  async createPeerChat(data: {
    connectionId: string;
    chatType?: string;
  }): Promise<PeerSupportChat> {
    const response = await this.fetchWithAuth('/wellbeing/peer-chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * Calculate wellbeing score from check-in data
   */
  calculateWellbeingScore(checkIn: WellbeingCheckInForm): number {
    const { moodScore, stressLevel, sleepQuality, socialConnection, physicalActivity } = checkIn;
    
    // Convert stress level to positive scale (lower stress = higher score)
    const adjustedStress = 11 - stressLevel;
    
    // Calculate weighted average
    const totalScore = (moodScore * 0.3) + (adjustedStress * 0.25) + 
                      (sleepQuality * 0.2) + (socialConnection * 0.15) + 
                      (physicalActivity * 0.1);
    
    return Math.round(totalScore * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get risk level color for UI
   */
  getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get risk level background color for UI
   */
  getRiskLevelBgColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'high': return 'bg-orange-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  }

  /**
   * Format wellbeing score for display
   */
  formatWellbeingScore(score: number): string {
    if (score >= 8) return 'Excellent';
    if (score >= 6.5) return 'Good';
    if (score >= 5) return 'Fair';
    if (score >= 3.5) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Get trend direction from data points
   */
  getTrendDirection(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-3);
    const older = data.slice(0, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return 'up';
    if (difference < -0.5) return 'down';
    return 'stable';
  }

  /**
   * Validate check-in form data
   */
  validateCheckInForm(checkIn: WellbeingCheckInForm): string[] {
    const errors: string[] = [];
    
    if (checkIn.moodScore < 1 || checkIn.moodScore > 10) {
      errors.push('Mood score must be between 1 and 10');
    }
    
    if (checkIn.stressLevel < 1 || checkIn.stressLevel > 10) {
      errors.push('Stress level must be between 1 and 10');
    }
    
    if (checkIn.sleepQuality < 1 || checkIn.sleepQuality > 10) {
      errors.push('Sleep quality must be between 1 and 10');
    }
    
    if (checkIn.socialConnection < 1 || checkIn.socialConnection > 10) {
      errors.push('Social connection must be between 1 and 10');
    }
    
    if (checkIn.physicalActivity < 1 || checkIn.physicalActivity > 10) {
      errors.push('Physical activity must be between 1 and 10');
    }
    
    if (checkIn.notes && checkIn.notes.length > 1000) {
      errors.push('Notes must be less than 1000 characters');
    }
    
    if (checkIn.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
    
    return errors;
  }
}

export default new WellbeingService();