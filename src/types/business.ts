export interface Business {
  _id: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  name: string;
  description: string;
  category: string;
  subcategory: string;
  services: string[];
  capabilities: string[];
  location: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  businessHours: {
    [key: string]: {
      open?: string;
      close?: string;
      closed?: boolean;
    };
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: string;
    verificationDocuments?: string[];
    abn?: string;
    acn?: string;
  };
  ratings: {
    average: number;
    count: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  reviews: BusinessReview[];
  economicData: {
    employeeCount?: number;
    annualRevenue?: string;
    establishedYear?: number;
    businessType: 'sole-trader' | 'partnership' | 'company' | 'trust';
  };
  tags: string[];
  isActive: boolean;
  isPremium: boolean;
  featuredUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessReview {
  _id: string;
  business: string;
  reviewer: {
    _id: string;
    name: string;
  };
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSearchFilters {
  category?: string;
  subcategory?: string;
  services?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  rating?: number;
  verified?: boolean;
  tags?: string[];
  businessType?: string;
  page?: number;
  limit?: number;
}

export interface BusinessMatch {
  business: Business;
  matchScore: number;
  matchReasons: string[];
}

export interface EconomicOpportunity {
  type: 'partnership' | 'supply-chain' | 'market-gap' | 'collaboration';
  title: string;
  description: string;
  businesses: Business[];
  priority: 'high' | 'medium' | 'low';
}

export interface BusinessAnalytics {
  viewsThisMonth: number;
  reviewsThisMonth: number;
  averageRating: number;
  competitorAnalysis: {
    averageRatingInCategory: number;
    positionInCategory: number;
    totalInCategory: number;
  };
  recommendations: string[];
}

export const BUSINESS_CATEGORIES = [
  'Agriculture',
  'Food & Beverage',
  'Healthcare',
  'Education',
  'Technology',
  'Construction',
  'Transport',
  'Tourism',
  'Retail',
  'Professional Services',
  'Manufacturing',
  'Energy',
  'Finance',
  'Other'
] as const;

export const AUSTRALIAN_STATES = [
  'NSW',
  'VIC',
  'QLD',
  'WA',
  'SA',
  'TAS',
  'NT',
  'ACT'
] as const;

export const BUSINESS_TYPES = [
  'sole-trader',
  'partnership',
  'company',
  'trust'
] as const;

export const REVENUE_RANGES = [
  'under-50k',
  '50k-100k',
  '100k-250k',
  '250k-500k',
  '500k-1m',
  '1m-5m',
  'over-5m'
] as const;