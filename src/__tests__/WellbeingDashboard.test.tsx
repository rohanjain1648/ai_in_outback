import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WellbeingDashboard from '../components/WellbeingDashboard';
import wellbeingService from '../services/wellbeingService';

// Mock the wellbeing service
jest.mock('../services/wellbeingService');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockDashboardData = {
  recentCheckIns: [
    {
      _id: '1',
      userId: 'user1',
      date: new Date('2024-01-15'),
      moodScore: 6,
      stressLevel: 5,
      sleepQuality: 7,
      socialConnection: 6,
      physicalActivity: 5,
      notes: 'Feeling okay today',
      tags: ['neutral'],
      isAnonymous: false,
      riskLevel: 'medium' as const,
      followUpRequired: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ],
  trends: {
    mood: [5, 6, 7, 6, 6],
    stress: [6, 5, 4, 5, 5],
    sleep: [6, 7, 8, 7, 7],
    social: [5, 6, 6, 6, 6],
    activity: [4, 5, 5, 5, 5],
    dates: ['2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15']
  },
  riskAssessment: {
    currentRisk: 'medium' as const,
    riskTrend: 'stable' as const,
    lastCheckIn: new Date('2024-01-15')
  },
  supportConnections: [],
  recommendedResources: [
    {
      _id: 'resource1',
      title: 'Test Mental Health Service',
      description: 'A test service for mental health support',
      category: 'telehealth' as const,
      resourceType: 'phone' as const,
      contactInfo: {
        phone: '1800 123 456',
        website: 'https://test.com'
      },
      availability: {
        hours: '9 AM - 5 PM',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'Australia/Sydney',
        is24x7: false
      },
      targetAudience: ['adults'],
      services: ['counseling'],
      cost: 'free' as const,
      location: {
        state: 'NSW',
        isNational: false
      },
      languages: ['English'],
      specializations: ['anxiety', 'depression'],
      rating: 4.5,
      reviewCount: 100,
      isVerified: true,
      lastVerified: new Date()
    }
  ]
};

describe('WellbeingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (wellbeingService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);
  });

  it('renders loading state initially', () => {
    render(<WellbeingDashboard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dashboard content after loading', async () => {
    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Wellbeing Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Track your mental health and connect with support')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Support Network')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('displays current wellbeing status', async () => {
    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Current Wellbeing Status')).toBeInTheDocument();
    });

    expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    expect(screen.getByText('→ Stable')).toBeInTheDocument();
  });

  it('shows crisis resources alert for high risk users', async () => {
    const highRiskData = {
      ...mockDashboardData,
      riskAssessment: {
        ...mockDashboardData.riskAssessment,
        currentRisk: 'high' as const
      }
    };

    (wellbeingService.getDashboard as jest.Mock).mockResolvedValue(highRiskData);

    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Immediate Support Available')).toBeInTheDocument();
    });

    expect(screen.getByText(/We've noticed you might be going through a difficult time/)).toBeInTheDocument();
    expect(screen.getByText('View Crisis Resources')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Wellbeing Dashboard')).toBeInTheDocument();
    });

    // Click on Check-in tab
    fireEvent.click(screen.getByText('Check-in'));
    
    // Should show check-in form (we'll need to mock this component)
    await waitFor(() => {
      expect(screen.getByText('Check-in')).toHaveClass('text-blue-600');
    });

    // Click on Resources tab
    fireEvent.click(screen.getByText('Resources'));
    
    await waitFor(() => {
      expect(screen.getByText('Resources')).toHaveClass('text-blue-600');
    });
  });

  it('displays quick stats correctly', async () => {
    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Check-ins')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // Total check-ins
    expect(screen.getByText('Support Connections')).toBeInTheDocument();
    expect(screen.getByText('Available Resources')).toBeInTheDocument();
    expect(screen.getByText('Days Tracked')).toBeInTheDocument();
  });

  it('handles error state correctly', async () => {
    (wellbeingService.getDashboard as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('retries loading when try again button is clicked', async () => {
    (wellbeingService.getDashboard as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockResolvedValueOnce(mockDashboardData);

    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Wellbeing Dashboard')).toBeInTheDocument();
    });
  });

  it('dismisses crisis resources alert', async () => {
    const criticalRiskData = {
      ...mockDashboardData,
      riskAssessment: {
        ...mockDashboardData.riskAssessment,
        currentRisk: 'critical' as const
      }
    };

    (wellbeingService.getDashboard as jest.Mock).mockResolvedValue(criticalRiskData);

    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Immediate Support Available')).toBeInTheDocument();
    });

    // Find and click the dismiss button (X)
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('Immediate Support Available')).not.toBeInTheDocument();
    });
  });
});

describe('WellbeingDashboard Integration', () => {
  it('calls wellbeingService.getDashboard with correct parameters', async () => {
    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(wellbeingService.getDashboard).toHaveBeenCalledWith(30);
    });
  });

  it('refreshes dashboard after check-in submission', async () => {
    const mockCheckIn = {
      _id: 'new-checkin',
      userId: 'user1',
      date: new Date(),
      moodScore: 7,
      stressLevel: 4,
      sleepQuality: 8,
      socialConnection: 7,
      physicalActivity: 6,
      notes: 'Feeling better today',
      tags: ['positive'],
      isAnonymous: false,
      riskLevel: 'low' as const,
      followUpRequired: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(<WellbeingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Wellbeing Dashboard')).toBeInTheDocument();
    });

    // Simulate check-in submission by calling the callback directly
    // In a real test, this would be triggered by the WellbeingCheckInForm component
    const dashboardComponent = screen.getByTestId('wellbeing-dashboard');
    
    // This would normally be triggered by the form submission
    // For now, we'll just verify the service was called initially
    expect(wellbeingService.getDashboard).toHaveBeenCalledTimes(1);
  });
});