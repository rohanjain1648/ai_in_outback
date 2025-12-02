import { Types } from 'mongoose';
import { Skill, ISkill } from '../models/Skill';
import { UserSkill, IUserSkill } from '../models/UserSkill';
import { SkillEndorsement, ISkillEndorsement } from '../models/SkillEndorsement';
import { LearningSession, ILearningSession } from '../models/LearningSession';
import { SkillExchange, ISkillExchange } from '../models/SkillExchange';
import { User } from '../models/User';

export class SkillsService {
  // Skill Management
  async createSkill(skillData: Partial<ISkill>): Promise<ISkill> {
    const skill = new Skill(skillData);
    return await skill.save();
  }

  async getSkills(filters: {
    category?: string;
    isTraditional?: boolean;
    search?: string;
  } = {}): Promise<ISkill[]> {
    const query: any = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.isTraditional !== undefined) {
      query.isTraditional = filters.isTraditional;
    }
    
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    return await Skill.find(query).sort({ name: 1 });
  }

  // User Skills Management
  async addUserSkill(userId: string, skillData: Partial<IUserSkill>): Promise<IUserSkill> {
    const userSkill = new UserSkill({
      ...skillData,
      userId: new Types.ObjectId(userId)
    });
    return await userSkill.save();
  }

  async getUserSkills(userId: string): Promise<IUserSkill[]> {
    return await UserSkill.find({ userId: new Types.ObjectId(userId) })
      .populate('skillId')
      .populate('endorsements');
  }

  async updateUserSkill(userId: string, skillId: string, updates: Partial<IUserSkill>): Promise<IUserSkill | null> {
    return await UserSkill.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), skillId: new Types.ObjectId(skillId) },
      updates,
      { new: true }
    ).populate('skillId');
  }

  // Skills Matching
  async findSkillMatches(userId: string, skillId: string, type: 'teacher' | 'learner'): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);
    const skillObjectId = new Types.ObjectId(skillId);
    
    let matchQuery: any;
    
    if (type === 'teacher') {
      // User wants to learn, find teachers
      matchQuery = {
        skillId: skillObjectId,
        canTeach: true,
        availableForTeaching: true,
        userId: { $ne: userObjectId }
      };
    } else {
      // User wants to teach, find learners
      matchQuery = {
        skillId: skillObjectId,
        wantsToLearn: true,
        userId: { $ne: userObjectId }
      };
    }
    
    const matches = await UserSkill.find(matchQuery)
      .populate('userId', 'name email profile location')
      .populate('skillId')
      .sort({ proficiencyLevel: -1, createdAt: -1 });
    
    return matches;
  }

  async findSkillExchangeMatches(userId: string, offeredSkillId: string, requestedSkillId: string): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);
    const offeredSkillObjectId = new Types.ObjectId(offeredSkillId);
    const requestedSkillObjectId = new Types.ObjectId(requestedSkillId);
    
    // Find users who offer what we want and want what we offer
    const potentialMatches = await UserSkill.aggregate([
      {
        $match: {
          userId: { $ne: userObjectId },
          $or: [
            { skillId: requestedSkillObjectId, canTeach: true, availableForTeaching: true },
            { skillId: offeredSkillObjectId, wantsToLearn: true }
          ]
        }
      },
      {
        $group: {
          _id: '$userId',
          skills: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          'skills': {
            $elemMatch: { skillId: requestedSkillObjectId, canTeach: true, availableForTeaching: true }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);
    
    return potentialMatches;
  }

  // Endorsements
  async createEndorsement(endorsementData: Partial<ISkillEndorsement>): Promise<ISkillEndorsement> {
    const endorsement = new SkillEndorsement(endorsementData);
    const savedEndorsement = await endorsement.save();
    
    // Add endorsement to user skill
    await UserSkill.findOneAndUpdate(
      { 
        userId: endorsementData.endorsedUserId,
        skillId: endorsementData.skillId
      },
      { $push: { endorsements: savedEndorsement._id } }
    );
    
    return savedEndorsement;
  }

  async getSkillEndorsements(userId: string, skillId: string): Promise<ISkillEndorsement[]> {
    return await SkillEndorsement.find({
      endorsedUserId: new Types.ObjectId(userId),
      skillId: new Types.ObjectId(skillId)
    }).populate('endorserId', 'name profile');
  }

  // Learning Sessions
  async createLearningSession(sessionData: Partial<ILearningSession>): Promise<ILearningSession> {
    const session = new LearningSession(sessionData);
    return await session.save();
  }

  async getUserLearningSessions(userId: string, role: 'teacher' | 'learner' | 'both' = 'both'): Promise<ILearningSession[]> {
    const userObjectId = new Types.ObjectId(userId);
    let query: any = {};
    
    if (role === 'teacher') {
      query.teacherId = userObjectId;
    } else if (role === 'learner') {
      query.$or = [
        { learnerId: userObjectId },
        { currentParticipants: userObjectId }
      ];
    } else {
      query.$or = [
        { teacherId: userObjectId },
        { learnerId: userObjectId },
        { currentParticipants: userObjectId }
      ];
    }
    
    return await LearningSession.find(query)
      .populate('teacherId', 'name profile')
      .populate('learnerId', 'name profile')
      .populate('skillId')
      .sort({ scheduledDate: 1 });
  }

  async updateLearningSession(sessionId: string, updates: Partial<ILearningSession>): Promise<ILearningSession | null> {
    return await LearningSession.findByIdAndUpdate(sessionId, updates, { new: true })
      .populate('teacherId', 'name profile')
      .populate('learnerId', 'name profile')
      .populate('skillId');
  }

  // Skill Exchanges
  async createSkillExchange(exchangeData: Partial<ISkillExchange>): Promise<ISkillExchange> {
    const exchange = new SkillExchange(exchangeData);
    return await exchange.save();
  }

  async getUserSkillExchanges(userId: string): Promise<ISkillExchange[]> {
    const userObjectId = new Types.ObjectId(userId);
    
    return await SkillExchange.find({
      $or: [
        { participantA: userObjectId },
        { participantB: userObjectId }
      ]
    })
    .populate('participantA', 'name profile')
    .populate('participantB', 'name profile')
    .populate('skillOfferedByA')
    .populate('skillRequestedByA')
    .populate('skillOfferedByB')
    .populate('skillRequestedByB')
    .sort({ createdAt: -1 });
  }

  async updateSkillExchange(exchangeId: string, updates: Partial<ISkillExchange>): Promise<ISkillExchange | null> {
    return await SkillExchange.findByIdAndUpdate(exchangeId, updates, { new: true })
      .populate('participantA', 'name profile')
      .populate('participantB', 'name profile')
      .populate('skillOfferedByA')
      .populate('skillRequestedByA')
      .populate('skillOfferedByB')
      .populate('skillRequestedByB');
  }

  // Reputation and Analytics
  async getUserSkillReputation(userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);
    
    const [endorsements, completedSessions, exchanges] = await Promise.all([
      SkillEndorsement.aggregate([
        { $match: { endorsedUserId: userObjectId } },
        {
          $group: {
            _id: '$skillId',
            averageRating: { $avg: '$rating' },
            totalEndorsements: { $sum: 1 },
            verifiedEndorsements: {
              $sum: { $cond: ['$isVerified', 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'skills',
            localField: '_id',
            foreignField: '_id',
            as: 'skill'
          }
        }
      ]),
      
      LearningSession.countDocuments({
        $or: [
          { teacherId: userObjectId, status: 'Completed' },
          { learnerId: userObjectId, status: 'Completed' }
        ]
      }),
      
      SkillExchange.aggregate([
        {
          $match: {
            $or: [
              { participantA: userObjectId },
              { participantB: userObjectId }
            ],
            status: 'Completed'
          }
        },
        {
          $group: {
            _id: null,
            totalPointsEarned: {
              $sum: {
                $cond: [
                  { $eq: ['$participantA', userObjectId] },
                  '$reputation.pointsEarnedByA',
                  '$reputation.pointsEarnedByB'
                ]
              }
            },
            totalExchanges: { $sum: 1 }
          }
        }
      ])
    ]);
    
    return {
      skillEndorsements: endorsements,
      completedSessions,
      exchangeStats: exchanges[0] || { totalPointsEarned: 0, totalExchanges: 0 }
    };
  }

  // Traditional Skills Preservation
  async getTraditionalSkills(): Promise<ISkill[]> {
    return await Skill.find({ isTraditional: true }).sort({ name: 1 });
  }

  async getTraditionalSkillExperts(): Promise<any[]> {
    return await UserSkill.find({
      canTeach: true,
      availableForTeaching: true,
      proficiencyLevel: { $in: ['Advanced', 'Expert'] }
    })
    .populate({
      path: 'skillId',
      match: { isTraditional: true }
    })
    .populate('userId', 'name profile location')
    .then(results => results.filter(result => result.skillId));
  }
}

export const skillsService = new SkillsService();