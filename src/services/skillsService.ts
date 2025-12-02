import {
  Skill,
  UserSkill,
  SkillEndorsement,
  LearningSession,
  SkillExchange,
  SkillMatch,
  UserReputation,
  CreateSkillRequest,
  AddUserSkillRequest,
  CreateEndorsementRequest,
  CreateLearningSessionRequest,
  CreateSkillExchangeRequest,
  SkillCategory
} from '../types/skills';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class SkillsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Skills Management
  async getSkills(filters: {
    category?: SkillCategory;
    isTraditional?: boolean;
    search?: string;
  } = {}): Promise<Skill[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.isTraditional !== undefined) params.append('isTraditional', filters.isTraditional.toString());
    if (filters.search) params.append('search', filters.search);

    return this.request<Skill[]>(`/skills?${params.toString()}`);
  }

  async createSkill(skillData: CreateSkillRequest): Promise<Skill> {
    return this.request<Skill>('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  // User Skills Management
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return this.request<UserSkill[]>(`/skills/user/${userId}`);
  }

  async addUserSkill(skillData: AddUserSkillRequest): Promise<UserSkill> {
    return this.request<UserSkill>('/skills/user', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async updateUserSkill(skillId: string, updates: Partial<AddUserSkillRequest>): Promise<UserSkill> {
    return this.request<UserSkill>(`/skills/user/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Skills Matching
  async findSkillMatches(skillId: string, type: 'teacher' | 'learner'): Promise<SkillMatch[]> {
    const params = new URLSearchParams({ skillId, type });
    return this.request<SkillMatch[]>(`/skills/matches?${params.toString()}`);
  }

  async findSkillExchangeMatches(offeredSkillId: string, requestedSkillId: string): Promise<any[]> {
    const params = new URLSearchParams({ offeredSkillId, requestedSkillId });
    return this.request<any[]>(`/skills/exchange-matches?${params.toString()}`);
  }

  // Endorsements
  async createEndorsement(endorsementData: CreateEndorsementRequest): Promise<SkillEndorsement> {
    return this.request<SkillEndorsement>('/skills/endorsements', {
      method: 'POST',
      body: JSON.stringify(endorsementData),
    });
  }

  async getSkillEndorsements(userId: string, skillId: string): Promise<SkillEndorsement[]> {
    return this.request<SkillEndorsement[]>(`/skills/endorsements/${userId}/${skillId}`);
  }

  // Learning Sessions
  async createLearningSession(sessionData: CreateLearningSessionRequest): Promise<LearningSession> {
    return this.request<LearningSession>('/skills/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getUserLearningSessions(role: 'teacher' | 'learner' | 'both' = 'both'): Promise<LearningSession[]> {
    const params = new URLSearchParams({ role });
    return this.request<LearningSession[]>(`/skills/sessions?${params.toString()}`);
  }

  async updateLearningSession(sessionId: string, updates: Partial<LearningSession>): Promise<LearningSession> {
    return this.request<LearningSession>(`/skills/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Skill Exchanges
  async createSkillExchange(exchangeData: CreateSkillExchangeRequest): Promise<SkillExchange> {
    return this.request<SkillExchange>('/skills/exchanges', {
      method: 'POST',
      body: JSON.stringify(exchangeData),
    });
  }

  async getUserSkillExchanges(): Promise<SkillExchange[]> {
    return this.request<SkillExchange[]>('/skills/exchanges');
  }

  async updateSkillExchange(exchangeId: string, updates: Partial<SkillExchange>): Promise<SkillExchange> {
    return this.request<SkillExchange>(`/skills/exchanges/${exchangeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Reputation and Analytics
  async getUserSkillReputation(userId: string): Promise<UserReputation> {
    return this.request<UserReputation>(`/skills/reputation/${userId}`);
  }

  // Traditional Skills
  async getTraditionalSkills(): Promise<Skill[]> {
    return this.request<Skill[]>('/skills/traditional');
  }

  async getTraditionalSkillExperts(): Promise<SkillMatch[]> {
    return this.request<SkillMatch[]>('/skills/traditional/experts');
  }
}

export const skillsService = new SkillsService();