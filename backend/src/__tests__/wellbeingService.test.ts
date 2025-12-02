import { WellbeingService } from '../services/wellbeingService';
import WellbeingCheckIn from '../models/WellbeingCheckIn';
import MentalHealthResource from '../models/MentalHealthResource';
import SupportConnection from '../models/SupportConnection';
import User from '../models/User';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  sentiment: -0.3,
                  concernFlags: ['anxiety', 'stress'],
                  supportRecommendations: ['Consider speaking with a counselor', 'Practice relaxation techniques'],
                  riskFactors: ['work stress', 'sleep issues']
                })
              }
            }]
          })
        }
      }
    }))
  };
});

// Mock models
jest.mock('../models/WellbeingCheckIn');
jest.mock('../models/MentalHealthResource');
jest.mock('../models/SupportConnection');
jest.mock('../models/User');

describe('WellbeingService', () => {
  let wellbeingService: WellbeingService;

  beforeEach(() => {
    wellbeingService = new WellbeingService();
    jest.clearAllMocks();
  });

  describe('analyzeWellbeingCheckIn', () => {
    it('should analyze check-in and return risk assessment', async () => {
      const checkInData = {
        moodScore: 3,
        stressLevel: 8,
        sleepQuality: 4,
        socialConnection: 2,
        physicalActivity: 3,
        notes: 'Feeling really anxious about work and having trouble sleeping',
        tags: ['anxious', 'tired']
      };

      const result = await wellbeingService.analyzeWellbeingCheckIn(checkInData);

      expect(result.riskLevel).toBe('high');
      expect(result.followUpRequired).toBe(true);
      expect(result.aiAnalysis.sentiment).toBe(-0.3);
      expect(result.aiAnalysis.concernFlags).toContain('anxiety');
    });

    it('should identify critical risk for very low scores', async () => {
      const checkInData = {
        moodScore: 1,
        stressLevel: 10,
        sleepQuality: 1,
        socialConnection: 1,
        physicalActivity: 1,
        notes: 'I feel like giving up',
        tags: ['hopeless']
      };

      const result = await wellbeingService.analyzeWellbeingCheckIn(checkInData);

      expect(result.riskLevel).toBe('critical');
      expect(result.followUpRequired).toBe(true);
    });

    it('should handle low risk scenarios', async () => {
      const checkInData = {
        moodScore: 8,
        stressLevel: 3,
        sleepQuality: 8,
        socialConnection: 7,
        physicalActivity: 6,
        notes: 'Feeling good today, had a nice walk',
        tags: ['happy', 'energetic']
      };

      const result = await wellbeingService.analyzeWellbeingCheckIn(checkInData);

      expect(result.riskLevel).toBe('low');
      expect(result.followUpRequired).toBe(false);
    });
  });

  describe('createWellbeingCheckIn', () => {
    it('should create check-in with AI analysis', async () => {
      const userId = 'user123';
      const checkInData = {
        moodScore: 5,
        stressLevel: 6,
        sleepQuality: 5,
        socialConnection: 4,
        physicalActivity: 5,
        notes: 'Average day',
        tags: ['neutral'],
        isAnonymous: false
      };

      const mockCheckIn = {
        _id: 'checkin123',
        userId,
        ...checkInData,
        riskLevel: 'medium',
        aiAnalysis: {
          sentiment: 0,
          concernFlags: [],
          supportRecommendations: [],
          riskFactors: []
        },
        followUpRequired: false,
        save: jest.fn().mockResolvedValue(true)
      };

      (WellbeingCheckIn as any).mockImplementation(() => mockCheckIn);

      const result = await wellbeingService.createWellbeingCheckIn(userId, checkInData);

      expect(result).toBeDefined();
      expect(mockCheckIn.save).toHaveBeenCalled();
    });
  });

  describe('getWellbeingDashboard', () => {
    it('should return dashboard data with trends and recommendations', async () => {
      const userId = 'user123';
      const mockCheckIns = [
        {
          userId,
          date: new Date(),
          moodScore: 6,
          stressLevel: 5,
          sleepQuality: 7,
          socialConnection: 6,
          physicalActivity: 5,
          riskLevel: 'medium'
        }
      ];

      const mockUser = {
        _id: userId,
        location: { state: 'NSW' }
      };

      const mockConnections = [];
      const mockResources = [];

      (WellbeingCheckIn.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockCheckIns)
        })
      });

      (SupportConnection.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockConnections)
      });

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await wellbeingService.getWellbeingDashboard(userId, 30);

      expect(result).toHaveProperty('recentCheckIns');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('supportConnections');
      expect(result).toHaveProperty('recommendedResources');
    });
  });

  describe('findSupportMatches', () => {
    it('should find potential support matches', async () => {
      const userId = 'user123';
      const mockUser = {
        _id: userId,
        location: { state: 'NSW' },
        wellbeingProfile: {
          supportAreas: ['anxiety', 'depression']
        }
      };

      const mockPotentialSupporters = [
        {
          _id: 'supporter1',
          wellbeingProfile: {
            willingToSupport: true,
            supportAreas: ['anxiety', 'stress']
          },
          location: { state: 'NSW' }
        }
      ];

      const mockCheckIns = [
        {
          tags: ['anxious'],
          aiAnalysis: { concernFlags: ['anxiety'] }
        }
      ];

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (WellbeingCheckIn.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockCheckIns)
        })
      });
      (User.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockPotentialSupporters)
      });

      const result = await wellbeingService.findSupportMatches(userId, 'peer_support');

      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getRecommendedResources', () => {
    it('should return recommended resources based on user needs', async () => {
      const userId = 'user123';
      const state = 'NSW';

      const mockUser = {
        _id: userId,
        location: { state }
      };

      const mockCheckIns = [
        {
          aiAnalysis: {
            concernFlags: ['anxiety', 'depression']
          }
        }
      ];

      const mockResources = [
        {
          _id: 'resource1',
          title: 'Anxiety Support Service',
          category: 'telehealth',
          specializations: ['anxiety'],
          location: { state: 'NSW' },
          isVerified: true
        }
      ];

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (WellbeingCheckIn.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockCheckIns)
        })
      });
      (MentalHealthResource.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockResources)
        })
      });

      const result = await wellbeingService.getRecommendedResources(userId, state);

      expect(result).toBeInstanceOf(Array);
      expect(MentalHealthResource.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { 'location.state': state },
            { 'location.isNational': true }
          ],
          isVerified: true,
          specializations: { $in: ['anxiety', 'depression'] }
        })
      );
    });
  });
});

describe('WellbeingService Error Handling', () => {
  let wellbeingService: WellbeingService;

  beforeEach(() => {
    wellbeingService = new WellbeingService();
    jest.clearAllMocks();
  });

  it('should handle AI analysis errors gracefully', async () => {
    // Mock OpenAI to throw an error
    const mockOpenAI = require('openai').default;
    mockOpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      }
    }));

    const checkInData = {
      moodScore: 5,
      stressLevel: 5,
      sleepQuality: 5,
      socialConnection: 5,
      physicalActivity: 5,
      notes: 'Test notes',
      tags: []
    };

    const result = await wellbeingService.analyzeWellbeingCheckIn(checkInData);

    // Should still return a result with fallback analysis
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('aiAnalysis');
    expect(result).toHaveProperty('followUpRequired');
  });

  it('should handle database errors in dashboard retrieval', async () => {
    const userId = 'user123';

    (WellbeingCheckIn.find as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(wellbeingService.getWellbeingDashboard(userId)).rejects.toThrow('Database error');
  });
});