import request from 'supertest';
import server from '../server';
import { User, IUser } from '../models/User';
import { CommunityMember } from '../models/CommunityMember';
import { AuthService } from '../middleware/auth';
import mongoose from 'mongoose';

const app = server.getApp();

describe('Community Matching System', () => {
  let userToken: string;
  let userId: string;
  let testUser: IUser;

  beforeAll(async () => {
    // Create a test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
      },
      location: {
        type: 'Point',
        coordinates: [151.2093, -33.8688], // Sydney coordinates
        city: 'Sydney',
        state: 'NSW',
        region: 'Metropolitan',
      },
    });
    await testUser.save();
    userId = (testUser._id as mongoose.Types.ObjectId).toString();

    // Generate token
    const tokens = AuthService.generateTokens({
      id: userId,
      email: testUser.email,
      role: testUser.role,
    });
    userToken = tokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /test.*@example\.com/ } });
    await CommunityMember.deleteMany({});
  });

  describe('POST /api/community/profile', () => {
    it('should create a community member profile', async () => {
      const profileData = {
        skills: [
          {
            name: 'Cattle Farming',
            level: 'advanced',
            yearsExperience: 10,
            canTeach: true,
            wantsToLearn: false,
            category: 'agricultural',
          },
          {
            name: 'Web Development',
            level: 'intermediate',
            yearsExperience: 5,
            canTeach: true,
            wantsToLearn: true,
            category: 'technical',
          },
        ],
        interests: [
          {
            name: 'Sustainable Farming',
            category: 'agriculture',
            intensity: 'passionate',
          },
          {
            name: 'Technology',
            category: 'technology',
            intensity: 'moderate',
          },
        ],
        availability: {
          timeSlots: [
            {
              day: 'monday',
              startTime: '09:00',
              endTime: '17:00',
            },
            {
              day: 'wednesday',
              startTime: '10:00',
              endTime: '16:00',
            },
          ],
          timezone: 'Australia/Sydney',
          preferredMeetingTypes: ['video-call', 'in-person'],
          maxTravelDistance: 50,
          responseTime: 'within-day',
        },
        matchingPreferences: {
          maxDistance: 100,
          preferredSkillLevels: ['intermediate', 'advanced'],
          priorityCategories: ['agricultural', 'technical'],
          requireMutualInterests: false,
          minimumSharedInterests: 1,
        },
      };

      const response = await request(app)
        .post('/api/community/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(profileData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId', userId);
      expect(response.body.data.skills).toHaveLength(2);
      expect(response.body.data.interests).toHaveLength(2);
      expect(response.body.data.profileCompleteness).toBeGreaterThan(0);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        skills: [], // Empty skills array should fail validation
        interests: [
          {
            name: 'Test Interest',
            category: 'agriculture',
            intensity: 'moderate',
          },
        ],
        availability: {
          timeSlots: [],
          timezone: 'Australia/Sydney',
          preferredMeetingTypes: ['video-call'],
          responseTime: 'within-day',
        },
        matchingPreferences: {
          maxDistance: 50,
          preferredSkillLevels: ['intermediate'],
          priorityCategories: ['agriculture'],
          requireMutualInterests: false,
          minimumSharedInterests: 1,
        },
      };

      await request(app)
        .post('/api/community/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/community/profile', () => {
    it('should get the current user\'s community profile', async () => {
      const response = await request(app)
        .get('/api/community/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId', userId);
      expect(response.body.data.skills).toBeDefined();
      expect(response.body.data.interests).toBeDefined();
    });

    it('should return 404 if profile doesn\'t exist', async () => {
      // Create a new user without a community profile
      const newUser = new User({
        email: 'test2@example.com',
        password: 'password123',
        profile: {
          firstName: 'Test2',
          lastName: 'User2',
        },
      });
      await newUser.save();

      const tokens = AuthService.generateTokens({
        id: (newUser._id as mongoose.Types.ObjectId).toString(),
        email: newUser.email,
        role: newUser.role,
      });

      await request(app)
        .get('/api/community/profile')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(404);
    });
  });

  describe('GET /api/community/matches', () => {
    beforeAll(async () => {
      // Create additional test users and community members for matching
      const users = [];
      const members = [];

      for (let i = 0; i < 3; i++) {
        const user = new User({
          email: `testmatch${i}@example.com`,
          password: 'password123',
          profile: {
            firstName: `Match${i}`,
            lastName: 'User',
            displayName: `Match User ${i}`,
            occupation: 'Farmer',
            yearsInArea: 5 + i,
          },
          location: {
            type: 'Point',
            coordinates: [151.2093 + (i * 0.1), -33.8688 + (i * 0.1)],
            city: `City${i}`,
            state: 'NSW',
            region: 'Rural',
          },
        });
        await user.save();
        users.push(user);

        const member = new CommunityMember({
          userId: user._id,
          skills: [
            {
              name: i % 2 === 0 ? 'Cattle Farming' : 'Crop Farming',
              level: 'intermediate',
              canTeach: true,
              wantsToLearn: false,
              category: 'agricultural',
            },
          ],
          interests: [
            {
              name: 'Sustainable Farming',
              category: 'agriculture',
              intensity: 'moderate',
            },
          ],
          availability: {
            timeSlots: [
              {
                day: 'monday',
                startTime: '09:00',
                endTime: '17:00',
              },
            ],
            timezone: 'Australia/Sydney',
            preferredMeetingTypes: ['video-call'],
            responseTime: 'within-day',
          },
          matchingPreferences: {
            maxDistance: 100,
            preferredSkillLevels: ['intermediate', 'advanced'],
            priorityCategories: ['agricultural'],
            requireMutualInterests: false,
            minimumSharedInterests: 1,
          },
          isAvailableForMatching: true,
        });
        await member.save();
        members.push(member);
      }
    });

    it('should find community matches', async () => {
      const response = await request(app)
        .get('/api/community/matches')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check match structure
      const match = response.body.data[0];
      expect(match).toHaveProperty('member');
      expect(match).toHaveProperty('user');
      expect(match).toHaveProperty('matchingScore');
      expect(match).toHaveProperty('compatibilityFactors');
      expect(match).toHaveProperty('recommendations');
    });

    it('should filter matches by skill categories', async () => {
      const response = await request(app)
        .get('/api/community/matches')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ 
          skillCategories: 'agricultural',
          limit: 10 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter matches by minimum matching score', async () => {
      const response = await request(app)
        .get('/api/community/matches')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ 
          minMatchingScore: 70,
          limit: 10 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All matches should have score >= 70
      response.body.data.forEach((match: any) => {
        expect(match.matchingScore).toBeGreaterThanOrEqual(70);
      });
    });
  });

  describe('POST /api/community/connect/:memberId', () => {
    let targetUserId: string;

    beforeAll(async () => {
      // Get one of the test match users
      const targetUser = await User.findOne({ email: 'testmatch0@example.com' });
      targetUserId = (targetUser!._id as mongoose.Types.ObjectId).toString();
    });

    it('should connect with a community member', async () => {
      const response = await request(app)
        .post(`/api/community/connect/${targetUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ connectionType: 'requested' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate connection type', async () => {
      await request(app)
        .post(`/api/community/connect/${targetUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ connectionType: 'invalid' })
        .expect(400);
    });
  });

  describe('GET /api/community/connections', () => {
    it('should get connection history', async () => {
      const response = await request(app)
        .get('/api/community/connections')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check connection structure
      const connection = response.body.data[0];
      expect(connection).toHaveProperty('userId');
      expect(connection).toHaveProperty('connectionType');
      expect(connection).toHaveProperty('connectionDate');
      expect(connection).toHaveProperty('status');
    });
  });

  describe('GET /api/community/stats', () => {
    it('should get community statistics', async () => {
      const response = await request(app)
        .get('/api/community/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalMembers');
      expect(response.body.data).toHaveProperty('activeMembers');
      expect(response.body.data).toHaveProperty('skillCategories');
      expect(response.body.data).toHaveProperty('interestCategories');
      expect(response.body.data).toHaveProperty('averageProfileCompleteness');
    });
  });

  describe('PUT /api/community/availability', () => {
    it('should update availability', async () => {
      const newAvailability = {
        timeSlots: [
          {
            day: 'tuesday',
            startTime: '10:00',
            endTime: '18:00',
          },
        ],
        timezone: 'Australia/Sydney',
        preferredMeetingTypes: ['phone-call'],
        responseTime: 'within-hour',
      };

      const response = await request(app)
        .put('/api/community/availability')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newAvailability)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availability.timeSlots).toHaveLength(1);
      expect(response.body.data.availability.timeSlots[0].day).toBe('tuesday');
    });
  });

  describe('POST /api/community/toggle-availability', () => {
    it('should toggle matching availability', async () => {
      const response = await request(app)
        .post('/api/community/toggle-availability')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isAvailableForMatching');
    });
  });
});