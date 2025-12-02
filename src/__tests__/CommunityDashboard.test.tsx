import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunityDashboard } from '../components/CommunityDashboard';
import { communityService } from '../services/communityService';

// Mock the community service
jest.mock('../services/communityService', () => ({
  communityService: {
    getProfile: jest.fn(),
    getCommunityStats: jest.fn(),
    getConnectionHistory: jest.fn(),
    toggleMatchingAvailability: jest.fn(),
  },
}));

const mockCommunityService = communityService as jest.Mocked<typeof communityService>;

const mockProfile = {
  userId: 'user123',
  skills: [
    {
      name: 'Cattle Farming',
      level: 'advanced' as const,
      canTeach: true,
      wantsToLearn: false,
      category: 'agricultural' as const,
    },
  ],
  interests: [
    {
      name: 'Sustainable Farming',
      category: 'agriculture' as const,
      intensity: 'passionate' as const,
    },
  ],
  availability: {
    timeSlots: [
      {
        day: 'monday' as const,
        startTime: '09:00',
        endTime: '17:00',
      },
    ],
    timezone: 'Australia/Sydney',
    preferredMeetingTypes: ['video-call' as const],
    responseTime: 'within-day' as const,
  },
  matchingPreferences: {
    maxDistance: 50,
    preferredSkillLevels: ['intermediate' as const, 'advanced' as const],
    priorityCategories: ['agricultural'],
    requireMutualInterests: false,
    minimumSharedInterests: 1,
  },
  profileCompleteness: 85,
  isAvailableForMatching: true,
  joinedCommunityDate: '2023-01-01',
  lastActiveDate: '2023-12-01',
};

const mockStats = {
  totalMembers: 150,
  activeMembers: 120,
  skillCategories: {
    agricultural: 80,
    technical: 45,
    creative: 25,
  },
  interestCategories: {
    agriculture: 90,
    technology: 60,
    arts: 30,
  },
  averageProfileCompleteness: 75,
};

const mockConnections = [
  {
    userId: 'user456',
    connectionDate: '2023-11-01',
    interactionCount: 5,
    lastInteraction: '2023-11-15',
    connectionType: 'matched' as const,
    status: 'active' as const,
    rating: 5,
  },
];

describe('CommunityDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCommunityService.getProfile.mockResolvedValue(mockProfile);
    mockCommunityService.getCommunityStats.mockResolvedValue(mockStats);
    mockCommunityService.getConnectionHistory.mockResolvedValue(mockConnections);
  });

  it('renders dashboard with profile data', async () => {
    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
    });

    // Check profile completeness
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Profile Completeness')).toBeInTheDocument();

    // Check navigation tabs
    expect(screen.getByText('Matches')).toBeInTheDocument();
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('Community Stats')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows profile setup when no profile exists', async () => {
    mockCommunityService.getProfile.mockResolvedValue(null);

    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Community Profile Setup')).toBeInTheDocument();
    });
  });

  it('toggles matching availability', async () => {
    const updatedProfile = { ...mockProfile, isAvailableForMatching: false };
    mockCommunityService.toggleMatchingAvailability.mockResolvedValue(updatedProfile);

    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Available for matching:')).toBeInTheDocument();
    });

    // Find and click the toggle button
    const toggleButton = screen.getByRole('button', { name: /available for matching/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockCommunityService.toggleMatchingAvailability).toHaveBeenCalled();
    });
  });

  it('displays community stats', async () => {
    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
    });

    // Click on stats tab
    fireEvent.click(screen.getByText('Community Stats'));

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total members
      expect(screen.getByText('120')).toBeInTheDocument(); // Active members
      expect(screen.getByText('Total Members')).toBeInTheDocument();
      expect(screen.getByText('Active Members')).toBeInTheDocument();
    });
  });

  it('displays connections', async () => {
    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
    });

    // Click on connections tab
    fireEvent.click(screen.getByText('Connections'));

    await waitFor(() => {
      expect(screen.getByText('Your Connections')).toBeInTheDocument();
      expect(screen.getByText('matched')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('displays profile information', async () => {
    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
    });

    // Click on profile tab
    fireEvent.click(screen.getByText('Profile'));

    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Cattle Farming')).toBeInTheDocument();
      expect(screen.getByText('Sustainable Farming')).toBeInTheDocument();
      expect(screen.getByText('Can teach')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    mockCommunityService.getProfile.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<CommunityDashboard />);

    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('opens profile setup when edit profile is clicked', async () => {
    render(<CommunityDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
    });

    // Click edit profile button
    const editButtons = screen.getAllByText('Edit Profile');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Community Profile Setup')).toBeInTheDocument();
    });
  });
});