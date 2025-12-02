import { skillsService } from '../services/skillsService';
import { Skill } from '../models/Skill';
import { UserSkill } from '../models/UserSkill';
import { SkillEndorsement } from '../models/SkillEndorsement';
import { LearningSession } from '../models/LearningSession';
import { SkillExchange } from '../models/SkillExchange';

// Mock the models
jest.mock('../models/Skill');
jest.mock('../models/UserSkill');
jest.mock('../models/SkillEndorsement');
jest.mock('../models/LearningSession');
jest.mock('../models/SkillExchange');

const MockedSkill = Skill as jest.Mocked<typeof Skill>;
const MockedUserSkill = UserSkill as jest.Mocked<typeof UserSkill>;
const MockedSkillEndorsement = SkillEndorsement as jest.Mocked<typeof SkillEndorsement>;
const MockedLearningSession = LearningSession as jest.Mocked<typeof LearningSession>;
const MockedSkillExchange = SkillExchange as jest.Mocked<typeof SkillExchange>;

describe('SkillsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSkill', () => {
    it('should create a new skill', async () => {
      const skillData = {
        name: 'Organic Gardening',
        category: 'Agriculture' as const,
        description: 'Growing vegetables without chemicals',
        isTraditional: false,
        tags: ['organic', 'vegetables', 'sustainable']
      };

      const mockSkill = {
        _id: 'skill123',
        ...skillData,
        save: jest.fn().mockResolvedValue(skillData)
      };

      MockedSkill.mockImplementation(() => mockSkill as any);

      const result = await skillsService.createSkill(skillData);

      expect(MockedSkill).toHaveBeenCalledWith(skillData);
      expect(mockSkill.save).toHaveBeenCalled();
      expect(result).toEqual(skillData);
    });
  });

  describe('getSkills', () => {
    it('should return skills with filters', async () => {
      const mockSkills = [
        {
          _id: 'skill1',
          name: 'Organic Gardening',
          category: 'Agriculture',
          description: 'Growing vegetables',
          isTraditional: false,
          tags: ['organic']
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockSkills)
      };

      MockedSkill.find = jest.fn().mockReturnValue(mockQuery);

      const result = await skillsService.getSkills({ category: 'Agriculture' });

      expect(MockedSkill.find).toHaveBeenCalledWith({ category: 'Agriculture' });
      expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 });
      expect(result).toEqual(mockSkills);
    });

    it('should handle search filter', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };

      MockedSkill.find = jest.fn().mockReturnValue(mockQuery);

      await skillsService.getSkills({ search: 'gardening' });

      expect(MockedSkill.find).toHaveBeenCalledWith({
        $text: { $search: 'gardening' }
      });
    });
  });

  describe('addUserSkill', () => {
    it('should add a skill to user profile', async () => {
      const userId = 'user123';
      const skillData = {
        skillId: 'skill123',
        proficiencyLevel: 'Intermediate' as const,
        canTeach: true,
        wantsToLearn: false,
        yearsOfExperience: 3
      };

      const mockUserSkill = {
        _id: 'userSkill123',
        userId,
        ...skillData,
        save: jest.fn().mockResolvedValue({ userId, ...skillData })
      };

      MockedUserSkill.mockImplementation(() => mockUserSkill as any);

      const result = await skillsService.addUserSkill(userId, skillData);

      expect(MockedUserSkill).toHaveBeenCalledWith({
        ...skillData,
        userId: expect.any(Object)
      });
      expect(mockUserSkill.save).toHaveBeenCalled();
    });
  });

  describe('findSkillMatches', () => {
    it('should find teachers for a skill', async () => {
      const userId = 'user123';
      const skillId = 'skill123';
      const mockMatches = [
        {
          _id: 'match1',
          userId: { name: 'John Doe', email: 'john@example.com' },
          skillId: { name: 'Gardening' },
          proficiencyLevel: 'Expert',
          canTeach: true,
          availableForTeaching: true
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMatches)
      };

      MockedUserSkill.find = jest.fn().mockReturnValue(mockQuery);

      const result = await skillsService.findSkillMatches(userId, skillId, 'teacher');

      expect(MockedUserSkill.find).toHaveBeenCalledWith({
        skillId: expect.any(Object),
        canTeach: true,
        availableForTeaching: true,
        userId: { $ne: expect.any(Object) }
      });
      expect(result).toEqual(mockMatches);
    });

    it('should find learners for a skill', async () => {
      const userId = 'user123';
      const skillId = 'skill123';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };

      MockedUserSkill.find = jest.fn().mockReturnValue(mockQuery);

      await skillsService.findSkillMatches(userId, skillId, 'learner');

      expect(MockedUserSkill.find).toHaveBeenCalledWith({
        skillId: expect.any(Object),
        wantsToLearn: true,
        userId: { $ne: expect.any(Object) }
      });
    });
  });

  describe('createEndorsement', () => {
    it('should create an endorsement and update user skill', async () => {
      const endorsementData = {
        endorserId: 'endorser123',
        endorsedUserId: 'user123',
        skillId: 'skill123',
        rating: 5,
        comment: 'Excellent teacher',
        verificationMethod: 'Direct Experience' as const
      };

      const mockEndorsement = {
        _id: 'endorsement123',
        ...endorsementData,
        save: jest.fn().mockResolvedValue({ _id: 'endorsement123', ...endorsementData })
      };

      MockedSkillEndorsement.mockImplementation(() => mockEndorsement as any);

      const mockUserSkillUpdate = {
        findOneAndUpdate: jest.fn().mockResolvedValue({})
      };
      MockedUserSkill.findOneAndUpdate = mockUserSkillUpdate.findOneAndUpdate;

      const result = await skillsService.createEndorsement(endorsementData);

      expect(MockedSkillEndorsement).toHaveBeenCalledWith(endorsementData);
      expect(mockEndorsement.save).toHaveBeenCalled();
      expect(MockedUserSkill.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: endorsementData.endorsedUserId,
          skillId: endorsementData.skillId
        },
        { $push: { endorsements: 'endorsement123' } }
      );
    });
  });

  describe('createLearningSession', () => {
    it('should create a learning session', async () => {
      const sessionData = {
        teacherId: 'teacher123',
        learnerId: 'learner123',
        skillId: 'skill123',
        title: 'Gardening Basics',
        description: 'Learn the basics of organic gardening',
        format: 'In-person' as const,
        scheduledDate: new Date('2024-12-01T10:00:00Z'),
        duration: 120
      };

      const mockSession = {
        _id: 'session123',
        ...sessionData,
        save: jest.fn().mockResolvedValue({ _id: 'session123', ...sessionData })
      };

      MockedLearningSession.mockImplementation(() => mockSession as any);

      const result = await skillsService.createLearningSession(sessionData);

      expect(MockedLearningSession).toHaveBeenCalledWith(sessionData);
      expect(mockSession.save).toHaveBeenCalled();
    });
  });

  describe('createSkillExchange', () => {
    it('should create a skill exchange', async () => {
      const exchangeData = {
        participantA: 'userA123',
        participantB: 'userB123',
        skillOfferedByA: 'skillA123',
        skillRequestedByA: 'skillB123',
        skillOfferedByB: 'skillB123',
        skillRequestedByB: 'skillA123',
        exchangeType: 'Direct' as const,
        timeCommitment: {
          hoursOfferedByA: 5,
          hoursOfferedByB: 5
        }
      };

      const mockExchange = {
        _id: 'exchange123',
        ...exchangeData,
        save: jest.fn().mockResolvedValue({ _id: 'exchange123', ...exchangeData })
      };

      MockedSkillExchange.mockImplementation(() => mockExchange as any);

      const result = await skillsService.createSkillExchange(exchangeData);

      expect(MockedSkillExchange).toHaveBeenCalledWith(exchangeData);
      expect(mockExchange.save).toHaveBeenCalled();
    });
  });

  describe('getTraditionalSkills', () => {
    it('should return traditional skills only', async () => {
      const mockTraditionalSkills = [
        {
          _id: 'skill1',
          name: 'Bushcraft',
          category: 'Traditional',
          isTraditional: true
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTraditionalSkills)
      };

      MockedSkill.find = jest.fn().mockReturnValue(mockQuery);

      const result = await skillsService.getTraditionalSkills();

      expect(MockedSkill.find).toHaveBeenCalledWith({ isTraditional: true });
      expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 });
      expect(result).toEqual(mockTraditionalSkills);
    });
  });
});