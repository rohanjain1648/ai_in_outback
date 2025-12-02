export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  region?: string;
}

export interface Preferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    emergency: boolean;
    community: boolean;
    agricultural: boolean;
    business: boolean;
    cultural: boolean;
    skills: boolean;
    wellbeing: boolean;
  };
  privacy: {
    showLocation: boolean;
    showProfile: boolean;
    allowMatching: boolean;
    shareSkills: boolean;
  };
  interests: string[];
  skills: string[];
  languages: string[];
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
}

export interface Profile {
  firstName: string;
  lastName: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  occupation?: string;
  farmType?: string;
  businessType?: string;
  yearsInArea?: number;
  familySize?: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  profile: Profile;
  location?: Location;
  preferences: Preferences;
  isEmailVerified: boolean;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    displayName?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    occupation?: string;
    farmType?: string;
    businessType?: string;
    yearsInArea?: number;
    familySize?: number;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    region?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  profile?: Partial<Profile>;
  location?: Location;
  preferences?: Partial<Preferences>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}