export interface Skill {
  _id: string;
  name: string;
  category: SkillCategory;
  description: string;
  isTraditional: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory = 
  | 'Agriculture'
  | 'Crafts'
  | 'Technology'
  | 'Business'
  | 'Health'
  | 'Education'
  | 'Traditional'
  | 'Mechanical'
  | 'Creative'
  | 'Other';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface UserSkill {
  _id: string;
  userId: string;
  skillId: Skill;
  proficiencyLevel: ProficiencyLevel;
  canTeach: boolean;
  wantsToLearn: boolean;
  yearsOfExperience: number;
  certifications: string[];
  endorsements: SkillEndorsement[];
  description: string;
  availableForTeaching: boolean;
  teachingPreferences: {
    format: ('In-person' | 'Online' | 'Both')[];
    groupSize: 'Individual' | 'Small Group' | 'Large Group' | 'Any';
    timeCommitment: 'Flexible' | 'Regular' | 'Intensive';
  };
  createdAt: string;
  updatedAt: string;
}

export interface SkillEndorsement {
  _id: string;
  endorserId: {
    _id: string;
    name: string;
    profile: {
      avatar?: string;
    };
  };
  endorsedUserId: string;
  skillId: string;
  rating: number;
  comment: string;
  verificationMethod: 'Direct Experience' | 'Witnessed Work' | 'Certification Review' | 'Peer Recommendation';
  isVerified: boolean;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningSession {
  _id: string;
  teacherId: {
    _id: string;
    name: string;
    profile: {
      avatar?: string;
    };
  };
  learnerId: {
    _id: string;
    name: string;
    profile: {
      avatar?: string;
    };
  };
  skillId: Skill;
  title: string;
  description: string;
  format: 'In-person' | 'Online' | 'Hybrid';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate: string;
  duration: number;
  location?: {
    coordinates: [number, number];
    address: string;
  };
  onlineLink?: string;
  maxParticipants: number;
  currentParticipants: string[];
  materials: string[];
  prerequisites: string[];
  learningObjectives: string[];
  feedback: {
    teacherRating?: number;
    learnerRating?: number;
    teacherComment?: string;
    learnerComment?: string;
    skillsLearned?: string[];
  };
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'Weekly' | 'Biweekly' | 'Monthly';
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SkillExchange {
  _id: string;
  participantA: {
    _id: string;
    name: string;
    profile: {
      avatar?: string;
    };
  };
  participantB: {
    _id: string;
    name: string;
    profile: {
      avatar?: string;
    };
  };
  skillOfferedByA: Skill;
  skillRequestedByA: Skill;
  skillOfferedByB: Skill;
  skillRequestedByB: Skill;
  status: 'Proposed' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  exchangeType: 'Direct' | 'Time Bank' | 'Skill Credits';
  timeCommitment: {
    hoursOfferedByA: number;
    hoursOfferedByB: number;
  };
  schedule: {
    sessionAtoB: string[];
    sessionBtoA: string[];
  };
  completionTracking: {
    sessionsCompletedAtoB: number;
    sessionsCompletedBtoA: number;
    totalSessionsAtoB: number;
    totalSessionsBtoA: number;
  };
  feedback: {
    fromA: {
      rating?: number;
      comment?: string;
      skillsLearned?: string[];
    };
    fromB: {
      rating?: number;
      comment?: string;
      skillsLearned?: string[];
    };
  };
  reputation: {
    pointsEarnedByA: number;
    pointsEarnedByB: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SkillMatch {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profile: {
      avatar?: string;
      bio?: string;
    };
    location?: {
      coordinates: [number, number];
      address: string;
    };
  };
  skillId: Skill;
  proficiencyLevel: ProficiencyLevel;
  canTeach: boolean;
  wantsToLearn: boolean;
  yearsOfExperience: number;
  description: string;
  availableForTeaching: boolean;
  teachingPreferences: {
    format: ('In-person' | 'Online' | 'Both')[];
    groupSize: 'Individual' | 'Small Group' | 'Large Group' | 'Any';
    timeCommitment: 'Flexible' | 'Regular' | 'Intensive';
  };
}

export interface UserReputation {
  skillEndorsements: {
    _id: string;
    averageRating: number;
    totalEndorsements: number;
    verifiedEndorsements: number;
    skill: Skill[];
  }[];
  completedSessions: number;
  exchangeStats: {
    totalPointsEarned: number;
    totalExchanges: number;
  };
}

export interface CreateSkillRequest {
  name: string;
  category: SkillCategory;
  description: string;
  isTraditional?: boolean;
  tags?: string[];
}

export interface AddUserSkillRequest {
  skillId: string;
  proficiencyLevel: ProficiencyLevel;
  canTeach?: boolean;
  wantsToLearn?: boolean;
  yearsOfExperience?: number;
  certifications?: string[];
  description?: string;
  availableForTeaching?: boolean;
  teachingPreferences?: {
    format?: ('In-person' | 'Online' | 'Both')[];
    groupSize?: 'Individual' | 'Small Group' | 'Large Group' | 'Any';
    timeCommitment?: 'Flexible' | 'Regular' | 'Intensive';
  };
}

export interface CreateEndorsementRequest {
  endorsedUserId: string;
  skillId: string;
  rating: number;
  comment: string;
  verificationMethod: 'Direct Experience' | 'Witnessed Work' | 'Certification Review' | 'Peer Recommendation';
}

export interface CreateLearningSessionRequest {
  learnerId: string;
  skillId: string;
  title: string;
  description: string;
  format: 'In-person' | 'Online' | 'Hybrid';
  scheduledDate: string;
  duration: number;
  location?: {
    coordinates: [number, number];
    address: string;
  };
  onlineLink?: string;
  maxParticipants?: number;
  materials?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'Weekly' | 'Biweekly' | 'Monthly';
    endDate: string;
  };
}

export interface CreateSkillExchangeRequest {
  participantB: string;
  skillOfferedByA: string;
  skillRequestedByA: string;
  skillOfferedByB: string;
  skillRequestedByB: string;
  exchangeType?: 'Direct' | 'Time Bank' | 'Skill Credits';
  timeCommitment: {
    hoursOfferedByA: number;
    hoursOfferedByB: number;
  };
}