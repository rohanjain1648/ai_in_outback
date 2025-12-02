export interface Resource {
  _id: string;
  title: string;
  description: string;
  category: 'equipment' | 'services' | 'knowledge' | 'materials' | 'transportation' | 'accommodation' | 'emergency' | 'other';
  subcategory?: string;
  availability: {
    status: 'available' | 'unavailable' | 'limited';
    schedule?: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    };
    quantity?: number;
    maxQuantity?: number;
  };
  location: {
    coordinates: [number, number];
    address: string;
    postcode: string;
    state: string;
    region: string;
    accessibilityNotes?: string;
  };
  contact: {
    name: string;
    phone?: string;
    email?: string;
    preferredMethod: 'phone' | 'email' | 'in-person';
  };
  owner: {
    _id: string;
    name: string;
    email?: string;
  };
  tags: string[];
  images?: string[];
  pricing?: {
    type: 'free' | 'paid' | 'donation' | 'barter';
    amount?: number;
    currency?: string;
    barterPreferences?: string[];
  };
  requirements?: {
    experience?: string;
    equipment?: string[];
    certification?: string[];
    other?: string;
  };
  rating: {
    average: number;
    count: number;
  };
  reviews: {
    user: {
      _id: string;
      name: string;
    };
    rating: number;
    comment: string;
    date: string;
  }[];
  searchKeywords: string[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  viewCount: number;
  bookingCount: number;
  distance?: number;
  aiExplanation?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  lat?: number;
  lon?: number;
  radius?: string;
  availability?: string;
  pricing?: string;
  tags?: string[];
  verified?: boolean;
  minRating?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'date' | 'popularity';
  useAI?: boolean;
}

export interface SearchResult {
  resources: Resource[];
  total: number;
  suggestions?: string[];
  aggregations?: {
    categories: { key: string; doc_count: number }[];
    states: { key: string; doc_count: number }[];
    pricing_types: { key: string; doc_count: number }[];
    availability_status: { key: string; doc_count: number }[];
    popular_tags: { key: string; doc_count: number }[];
  };
  aiInsights?: {
    category?: string;
    subcategory?: string;
    location?: string;
    availability?: string;
    pricing?: string;
    tags: string[];
    urgency?: 'low' | 'medium' | 'high';
    timeframe?: string;
    refinedQuery: string;
  };
}

export interface ResourceRecommendation {
  category: string;
  title: string;
  description: string;
  searchQuery: string;
  priority: 'high' | 'medium' | 'low';
  resources: Resource[];
}

export interface CreateResourceData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  availability: {
    status: string;
    schedule?: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    };
    quantity?: number;
    maxQuantity?: number;
  };
  location: {
    coordinates: [number, number];
    address: string;
    postcode: string;
    state: string;
    region: string;
    accessibilityNotes?: string;
  };
  contact: {
    name: string;
    phone?: string;
    email?: string;
    preferredMethod: string;
  };
  tags: string[];
  images?: string[];
  pricing?: {
    type: string;
    amount?: number;
    currency?: string;
    barterPreferences?: string[];
  };
  requirements?: {
    experience?: string;
    equipment?: string[];
    certification?: string[];
    other?: string;
  };
}

export interface ResourceCategory {
  category: string;
  count: number;
  subcategories: string[];
}