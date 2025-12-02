import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgriculturalDashboard from '../components/AgriculturalDashboard';
import { agriculturalService } from '../services/agriculturalService';

// Mock the agricultural service
jest.mock('../services/agriculturalService');
const mockAgriculturalService = agriculturalService as jest.Mocked<typeof agriculturalService>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockDashboardData = {
  farm: {
    _id: 'farm123',
    userId: 'user123',
    name: 'Test Farm',
    location: {
      address: '123 Farm Road, Rural NSW',
      coordinates: { latitude: -33.8688, longitude: 151.2093 },
      postcode: '2000',
      state: 'NSW'
    },
    totalArea: 100,
    farmType: 'mixed',
    crops: [
      {
        name: 'wheat',
        variety: 'winter wheat',
        plantingDate: new Date('2024-05-01'),
        expectedHarvestDate: new Date('2024-12-01'),
        area: 50,
        status: 'growing' as const,
        notes: 'Looking good'
      }
    ],
    livestock: [
      {
        type: 'cattle',
        breed: 'angus',
        count: 50,
        healthStatus: 'healthy' as const
      }
    ],
    equipment: [],
    organicCertified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  weather: {
    location: {
      name: 'Sydney',
      region: 'NSW',
      country: 'Australia',
      lat: -33.8688,
      lon: 151.2093
    },
    current: {
      temperature: 22,
      humidity: 65,
      windSpeed: 10,
      windDirection: 'NW',
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      condition: 'Partly cloudy',
      icon: 'partly-cloudy.png',
      rainfall: 0
    },
    forecast: [],
    agricultural: {
      soilMoisture: 75,
      evapotranspiration: 4.2,
      growingDegreeDays: 150,
      frostRisk: false,
      irrigationRecommendation: 'Monitor',
      sprayingConditions: 'good' as const
    }
  },
  marketPrices: [
    {
      commodity: 'wheat',
      price: 450,
      unit: 'per tonne',
      currency: 'AUD',
      market: 'Australian Commodity Exchange',
      date: new Date(),
      change: 2.5,
      trend: 'up' as const
    }
  ],
  marketAlerts: [],
  recentAnalyses: [],
  recommendations: [
    'Monitor crop development closely',
    'Check soil moisture levels',
    'Review weather forecast for planning'
  ],
  summary: {
    totalCrops: 1,
    totalLivestock: 50,
    healthyCrops: 1,
    alertsCount: 0,
    avgHealthScore: 85
  }
};

describe('AgriculturalDashboard', () => {
  beforeEach(() => {
    mockAgriculturalService.getDashboardData.mockResolvedValue(mockDashboardData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<AgriculturalDashboard />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('renders dashboard data after loading', async () => {
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Farm Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('123 Farm Road, Rural NSW • 100 hectares')).toBeInTheDocument();
  });

  it('displays navigation tabs', async () => {
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Crop Health')).toBeInTheDocument();
    expect(screen.getByText('Market Data')).toBeInTheDocument();
    expect(screen.getByText('Photo Analysis')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Farm Dashboard')).toBeInTheDocument();
    });

    // Click on Crop Health tab
    await user.click(screen.getByText('Crop Health'));
    
    // Should show crop health content
    expect(screen.getByText('wheat')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockAgriculturalService.getDashboardData.mockRejectedValue(new Error('API Error'));
    
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
    });

    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('retries loading on error', async () => {
    const user = userEvent.setup();
    mockAgriculturalService.getDashboardData
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockDashboardData);
    
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Farm Dashboard')).toBeInTheDocument();
    });
  });

  it('displays farm summary cards', async () => {
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Crops')).toBeInTheDocument();
    });

    expect(screen.getByText('Livestock Count')).toBeInTheDocument();
    expect(screen.getByText('Healthy Crops')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('Avg Health Score')).toBeInTheDocument();
  });

  it('displays weather information', async () => {
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Weather & Conditions')).toBeInTheDocument();
    });

    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument(); // Soil moisture
  });

  it('displays market prices', async () => {
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Market Prices')).toBeInTheDocument();
    });

    expect(screen.getByText('wheat')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    expect(screen.getByText('+2.5%')).toBeInTheDocument();
  });

  it('displays AI recommendations', async () => {
    render(<AgriculturalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    });

    expect(screen.getByText('Monitor crop development closely')).toBeInTheDocument();
    expect(screen.getByText('Check soil moisture levels')).toBeInTheDocument();
  });
});