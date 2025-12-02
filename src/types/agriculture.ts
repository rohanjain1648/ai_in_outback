export interface Crop {
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  area: number;
  status: 'planted' | 'growing' | 'flowering' | 'harvesting' | 'harvested';
  notes?: string;
}

export interface Livestock {
  type: string;
  breed: string;
  count: number;
  age?: string;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'quarantined';
  notes?: string;
}

export interface Equipment {
  name: string;
  type: string;
  model?: string;
  purchaseDate?: Date;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  maintenanceSchedule?: Date;
  notes?: string;
}

export interface Farm {
  _id: string;
  userId: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    postcode: string;
    state: string;
  };
  totalArea: number;
  farmType: string;
  crops: Crop[];
  livestock: Livestock[];
  equipment: Equipment[];
  soilType?: string;
  irrigationType?: string;
  organicCertified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
    rainfall: number;
  };
  forecast: WeatherForecast[];
  agricultural: {
    soilMoisture: number;
    evapotranspiration: number;
    growingDegreeDays: number;
    frostRisk: boolean;
    irrigationRecommendation: string;
    sprayingConditions: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  humidity: number;
  rainfall: number;
  condition: string;
  icon: string;
  windSpeed: number;
  uvIndex: number;
}

export interface CropAnalysis {
  healthScore: number;
  diseaseDetected?: string[];
  pestDetected?: string[];
  nutritionDeficiency?: string[];
  growthStage: string;
  recommendations: string[];
  confidence: number;
}

export interface CropMonitoring {
  _id: string;
  farmId: string;
  cropName: string;
  photoUrl: string;
  photoMetadata: {
    captureDate: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    weather?: {
      temperature: number;
      humidity: number;
      rainfall: number;
    };
  };
  analysis: CropAnalysis;
  aiModel: string;
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketPrice {
  commodity: string;
  variety?: string;
  price: number;
  unit: string;
  currency: string;
  market: string;
  date: Date;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MarketAlert {
  commodity: string;
  alertType: 'price_increase' | 'price_decrease' | 'volatility' | 'opportunity';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: Date;
}

export interface DashboardData {
  farm: Farm;
  weather: WeatherData;
  marketPrices: MarketPrice[];
  marketAlerts: MarketAlert[];
  recentAnalyses: CropMonitoring[];
  recommendations: string[];
  summary: {
    totalCrops: number;
    totalLivestock: number;
    healthyCrops: number;
    alertsCount: number;
    avgHealthScore: number;
  };
}

export interface MarketInsights {
  prices: MarketPrice[];
  alerts: MarketAlert[];
  recommendations: {
    commodity: string;
    recommendation: string;
    bestMonth: string;
    expectedPrice: number;
    reasoning: string[];
  }[];
}