export interface WellbeingCheckIn {
  _id: string;
  userId: string;
  date: Date;
  moodScore: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
  socialConnection: number; // 1-10 scale
  physicalActivity: number; // 1-10 scale
  notes?: string;
  tags: string[];
  isAnonymous: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  aiAnalysis?: {
    sentiment: number;
    concernFlags: string[];
    supportRecommendations: string[];
    riskFactors: string[];
  };
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WellbeingCheckInForm {
  moodScore: number;
  stressLevel: number;
  sleepQuality: number;
  socialConnection: number;
  physicalActivity: number;
  notes?: string;
  tags: string[];
  isAnonymous: boolean;
}

export interface MentalHealthResource {
  _id: string;
  title: string;
  description: string;
  category: 'telehealth' | 'crisis' | 'support_group' | 'self_help' | 'professional' | 'emergency';
  resourceType: 'phone' | 'website' | 'app' | 'in_person' | 'online_chat' | 'video_call';
  contactInfo: {
    phone?: string;
    website?: string;
    email?: string;
    address?: string;
  };
  availability: {
    hours: string;
    days: string[];
    timezone: string;
    is24x7: boolean;
  };
  targetAudience: string[];
  services: string[];
  cost: 'free' | 'bulk_billed' | 'private' | 'sliding_scale';
  location: {
    state: string;
    region?: string;
    isNational: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  languages: string[];
  specializations: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  lastVerified: Date;
}

export interface SupportConnection {
  _id: string;
  supporterId: string;
  supporteeId: string;
  connectionType: 'peer_support' | 'mentor' | 'buddy' | 'crisis_support';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'terminated';
  matchingScore: number;
  matchingFactors: {
    locationProximity: number;
    experienceSimilarity: number;
    availabilityMatch: number;
    personalityMatch: number;
    supportNeedsAlignment: number;
  };
  supportAreas: string[];
  communicationPreferences: {
    methods: string[];
    frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'as_needed';
    timezone: string;
  };
  isAnonymous: boolean;
  anonymousIds: {
    supporterAlias?: string;
    supporteeAlias?: string;
  };
  lastInteraction: Date;
  totalInteractions: number;
  averageRating: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeerSupportMessage {
  senderId: string;
  senderAlias: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  reactions?: {
    emoji: string;
    userId: string;
    userAlias: string;
  }[];
}

export interface PeerSupportChat {
  _id: string;
  connectionId: string;
  participants: {
    userId: string;
    alias: string;
    joinedAt: Date;
    lastSeen: Date;
    isActive: boolean;
  }[];
  messages: PeerSupportMessage[];
  chatType: 'one_on_one' | 'group' | 'crisis_support';
  isAnonymous: boolean;
  moderatorId?: string;
  chatSettings: {
    allowImages: boolean;
    allowFiles: boolean;
    moderationLevel: 'none' | 'basic' | 'strict';
    maxParticipants: number;
  };
  supportTopic?: string;
  isActive: boolean;
  lastActivity: Date;
  totalMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WellbeingDashboard {
  recentCheckIns: WellbeingCheckIn[];
  trends: {
    mood: number[];
    stress: number[];
    sleep: number[];
    social: number[];
    activity: number[];
    dates: string[];
  };
  riskAssessment: {
    currentRisk: string;
    riskTrend: 'improving' | 'stable' | 'declining';
    lastCheckIn: Date;
  };
  supportConnections: SupportConnection[];
  recommendedResources: MentalHealthResource[];
}

export interface WellbeingTrends {
  mood: number[];
  stress: number[];
  sleep: number[];
  social: number[];
  activity: number[];
  dates: string[];
}

export interface RiskAssessment {
  currentRisk: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  riskTrend: 'improving' | 'stable' | 'declining';
  lastCheckIn: Date;
  concernFlags: string[];
  supportRecommendations: string[];
}

export interface CrisisResource {
  title: string;
  phone: string;
  website?: string;
  description: string;
  availability: string;
  isNational: boolean;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    title: 'Lifeline',
    phone: '13 11 14',
    website: 'https://www.lifeline.org.au',
    description: '24/7 crisis support and suicide prevention',
    availability: '24/7',
    isNational: true
  },
  {
    title: 'Beyond Blue',
    phone: '1300 22 4636',
    website: 'https://www.beyondblue.org.au',
    description: 'Support for anxiety, depression and suicide prevention',
    availability: '24/7',
    isNational: true
  },
  {
    title: 'Kids Helpline',
    phone: '1800 55 1800',
    website: 'https://kidshelpline.com.au',
    description: 'Free, private and confidential 24/7 phone and online counselling service for young people aged 5 to 25',
    availability: '24/7',
    isNational: true
  },
  {
    title: 'MensLine Australia',
    phone: '1300 78 99 78',
    website: 'https://mensline.org.au',
    description: 'Professional telephone and online support and information service for Australian men',
    availability: '24/7',
    isNational: true
  }
];