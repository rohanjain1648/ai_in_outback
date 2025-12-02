import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillsDashboard from '../components/SkillsDashboard';
import { skillsService } from '../services/skillsService';
import { useAuth } from '../hooks/useAuth';

// Mock the services and hooks
jest.mock('../services/skillsService');
jest.mock('../hooks/useAuth');

const mockSkillsService = skillsService as jest.Mocked<typeof skillsService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('SkillsDashboard', () => {
  const mockUser = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com'
  };

  const mockUserSkills = [
    {
      _id: 'userSkill1',
      userId: 'user123',
      skillId: {
        _id: 'skill1',
        name: 'Organic Gardening',
        category: 'Agriculture' as const,
        description: 'Growing vegetables without chemicals',
        isTraditional: false,
        tags: ['organic'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      proficiencyLevel: 'Intermediate' as const,
      canTeach: true,
      wantsToLearn: false,
      yearsOfExperience: 3,
      certifications: [],
      endorsements: [],
      description: 'I love organic gardening',
      availableForTeaching: true,
      teachingPreferences: {
        format: ['In-person' as const],
        groupSize: 'Small Group' as const,
        timeCommitment: 'Flexible' as const
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const mockLearningSessions = [
    {
      _id: 'session1',
      teacherId: {
        _id: 'user123',
        name: 'John Doe',
        profile: {}
      },
      learnerId: {
        _id: 'user456',
        name: 'Jane Smith',
        profile: {}
      },
      skillId: {
        _id: 'skill1',
        name: 'Organic Gardening',
        category: 'Agriculture' as const,
        description: 'Growing vegetables',
        isTraditional: false,
        tags: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      title: 'Gardening Basics',
      description: 'Learn organic gardening',
      format: 'In-person' as const,
      status: 'Scheduled' as const,
      scheduledDate: '2024-12-01T10:00:00Z',
      duration: 120,
      maxParticipants: 1,
      currentParticipants: [],
      materials: [],
      prerequisites: [],
      learningObjectives: [],
      feedback: {},
      isRecurring: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const mockSkillExchanges = [
    {
      _id: 'exchange1',
      participantA: {
        _id: 'user123',
        name: 'John Doe',
        profile: {}
      },
      participantB: {
        _id: 'user456',
        name: 'Jane Smith',
        profile: {}
      },
      skillOfferedByA: {
        _id: 'skill1',
        name: 'Gardening',
        category: 'Agriculture' as const,
        description: 'Growing plants',
        isTraditional: false,
        tags: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      skillRequestedByA: {
        _id: 'skill2',
        name: 'Cooking',
        category: 'Other' as const,
        description: 'Preparing food',
        isTraditional: false,
        tags: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      skillOfferedByB: {
        _id: 'skill2',
        name: 'Cooking',
        category: 'Other' as const,
        description: 'Preparing food',
        isTraditional: false,
        tags: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      skillRequestedByB: {
        _id: 'skill1',
        name: 'Gardening',
        category: 'Agriculture' as const,
        description: 'Growing plants',
        isTraditional: false,
        tags: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      status: 'Proposed' as const,
      exchangeType: 'Direct' as const,
      timeCommitment: {
        hoursOfferedByA: 5,
        hoursOfferedByB: 5
      },
      schedule: {
        sessionAtoB: [],
        sessionBtoA: []
      },
      completionTracking: {
        sessionsCompletedAtoB: 0,
        sessionsCompletedBtoA: 0,
        totalSessionsAtoB: 0,
        totalSessionsBtoA: 0
      },
      feedback: {
        fromA: {},
        fromB: {}
      },
      reputation: {
        pointsEarnedByA: 0,
        pointsEarnedByB: 0
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    mockSkillsService.getUserSkills.mockResolvedValue(mockUserSkills);
    mockSkillsService.getUserLearningSessions.mockResolvedValue(mockLearningSessions);
    mockSkillsService.getUserSkillExchanges.mockResolvedValue(mockSkillExchanges);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the skills dashboard with correct title', async () => {
    render(<SkillsDashboard />);

    expect(screen.getByText('Skills Sharing & Learning Network')).toBeInTheDocument();
    expect(screen.getByText(/Connect with your community to share knowledge/)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<SkillsDashboard />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('loads and displays user data', async () => {
    render(<SkillsDashboard />);

    await waitFor(() => {
      expect(mockSkillsService.getUserSkills).toHaveBeenCalledWith(mockUser.id);
      expect(mockSkillsService.getUserLearningSessions).toHaveBeenCalled();
      expect(mockSkillsService.getUserSkillExchanges).toHaveBeenCalled();
    });

    // Check stats are displayed
    expect(screen.getByText('1')).toBeInTheDocument(); // My Skills count
    expect(screen.getByText('My Skills')).toBeInTheDocument();
  });

  it('displays navigation tabs', async () => {
    render(<SkillsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('🎯 My Skills')).toBeInTheDocument();
      expect(screen.getByText('📚 Skills Directory')).toBeInTheDocument();
      expect(screen.getByText('🤝 Find Matches')).toBeInTheDocument();
      expect(screen.getByText('📅 Learning Sessions')).toBeInTheDocument();
      expect(screen.getByText('🔄 Skill Exchanges')).toBeInTheDocument();
      expect(screen.getByText('🏛️ Traditional Skills')).toBeInTheDocument();
    });
  });

  it('switches between tabs when clicked', async () => {
    render(<SkillsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('🎯 My Skills')).toBeInTheDocument();
    });

    // Click on Skills Directory tab
    fireEvent.click(screen.getByText('📚 Skills Directory'));

    // Should show skills directory content
    await waitFor(() => {
      expect(screen.getByText('Skills Directory')).toBeInTheDocument();
    });
  });

  it('displays correct stats from user data', async () => {
    render(<SkillsDashboard />);

    await waitFor(() => {
      // My Skills count
      expect(screen.getByText('1')).toBeInTheDocument();
      
      // Can Teach count (skills where canTeach is true)
      const canTeachCount = mockUserSkills.filter(s => s.canTeach).length;
      expect(screen.getByText(canTeachCount.toString())).toBeInTheDocument();
      
      // Learning Sessions count
      expect(screen.getByText(mockLearningSessions.length.toString())).toBeInTheDocument();
      
      // Skill Exchanges count
      expect(screen.getByText(mockSkillExchanges.length.toString())).toBeInTheDocument();
    });
  });

  it('handles loading error gracefully', async () => {
    mockSkillsService.getUserSkills.mockRejectedValue(new Error('Failed to load'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SkillsDashboard />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load user skills data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('does not load data when user is not available', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    render(<SkillsDashboard />);

    expect(mockSkillsService.getUserSkills).not.toHaveBeenCalled();
    expect(mockSkillsService.getUserLearningSessions).not.toHaveBeenCalled();
    expect(mockSkillsService.getUserSkillExchanges).not.toHaveBeenCalled();
  });
});