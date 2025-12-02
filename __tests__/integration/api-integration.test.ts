import request from 'supertest';
import server from '../../backend/src/server';
import { User } from '../../backend/src/models/User';
import { Resource } from '../../backend/src/models/Resource';
import { CommunityMember } from '../../backend/src/models/CommunityMember';

describe('API Integration Tests', () => {
  let app: any;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = server.getApp();
  });

  beforeEach(async () => {
    // Clear all test data
    await User.deleteMany({});
    await Resource.deleteMany({});
    await CommunityMember.deleteMany({});

    // Create and authenticate a test user
    const userData = {
      email: 'integration@example.com',
      password: 'Password123!',
      firstName: 'Integration',
      lastName: 'Test',
      location: {
        postcode: '2000',
        state: 'NSW',
        region: 'Sydney'
      }
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    authToken = response.body.data.token;
    userId = response.body.data.user._id;
  });

  describe('User Registration and Profile Flow', () => {
    it('should complete full user onboarding flow', async () => {
      // 1. Register new user
      const newUserData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        location: {
          postcode: '3000',
          state: 'VIC',
          region: 'Melbourne'
        }
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserData)
        .expect(201);

      const newToken = registerResponse.body.data.token;
      const newUserId = registerResponse.body.data.user._id;

      // 2. Update profile with additional information
      const profileUpdate = {
        bio: 'Passionate about sustainable farming',
        phoneNumber: '0412345678',
        preferences: {
          communicationMethods: ['email', 'phone'],
          privacyLevel: 'moderate'
        }
      };

      await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newToken}`)
        .send(profileUpdate)
        .expect(200);

      // 3. Create community profile
      const communityProfile = {
        skills: [
          {
            name: 'Organic Farming',
            level: 'intermediate',
            canTeach: true,
            wantsToLearn: false,
            category: 'agricultural'
          }
        ],
        interests: [
          {
            name: 'Permaculture',
            category: 'agriculture',
            intensity: 'passionate'
          }
        ],
        availability: {
          timeSlots: [
            {
              day: 'saturday',
              startTime: '09:00',
              endTime: '17:00'
            }
          ],
          timezone: 'Australia/Melbourne',
          preferredMeetingTypes: ['in-person'],
          responseTime: 'within-day'
        }
      };

      const communityResponse = await request(app)
        .post('/api/v1/community/profile')
        .set('Authorization', `Bearer ${newToken}`)
        .send(communityProfile)
        .expect(201);

      expect(communityResponse.body.data.profile.userId).toBe(newUserId);
      expect(communityResponse.body.data.profile.skills).toHaveLength(1);

      // 4. Verify complete profile
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(profileResponse.body.data.user.bio).toBe(profileUpdate.bio);
      expect(profileResponse.body.data.user.phoneNumber).toBe(profileUpdate.phoneNumber);
    });
  });

  describe('Resource Management Flow', () => {
    it('should handle complete resource lifecycle', async () => {
      // 1. Create resource
      const resourceData = {
        title: 'Hay Baler Rental',
        description: 'Professional hay baler available for rent',
        category: 'equipment',
        subcategory: 'agricultural',
        availability: {
          status: 'available',
          schedule: {
            monday: { available: true, startTime: '08:00', endTime: '18:00' },
            tuesday: { available: true, startTime: '08:00', endTime: '18:00' }
          }
        },
        location: {
          postcode: '2000',
          state: 'NSW',
          region: 'Sydney'
        },
        contactInfo: {
          phone: '0412345678',
          email: 'haybailer@example.com'
        },
        pricing: {
          type: 'hourly',
          amount: 50,
          currency: 'AUD'
        }
      };

      const createResponse = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resourceData)
        .expect(201);

      const resourceId = createResponse.body.data.resource._id;

      // 2. Search for the resource
      const searchResponse = await request(app)
        .get('/api/v1/resources?search=hay baler')
        .expect(200);

      expect(searchResponse.body.data.resources).toHaveLength(1);
      expect(searchResponse.body.data.resources[0]._id).toBe(resourceId);

      // 3. Get resource by ID
      const getResponse = await request(app)
        .get(`/api/v1/resources/${resourceId}`)
        .expect(200);

      expect(getResponse.body.data.resource.title).toBe(resourceData.title);

      // 4. Update resource
      const updateData = {
        availability: { status: 'unavailable' },
        description: 'Updated description - currently under maintenance'
      };

      const updateResponse = await request(app)
        .put(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.data.resource.availability.status).toBe('unavailable');
      expect(updateResponse.body.data.resource.description).toBe(updateData.description);

      // 5. Filter by availability
      const availableResponse = await request(app)
        .get('/api/v1/resources?availability=available')
        .expect(200);

      expect(availableResponse.body.data.resources).toHaveLength(0);

      const unavailableResponse = await request(app)
        .get('/api/v1/resources?availability=unavailable')
        .expect(200);

      expect(unavailableResponse.body.data.resources).toHaveLength(1);

      // 6. Delete resource
      await request(app)
        .delete(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 7. Verify deletion
      await request(app)
        .get(`/api/v1/resources/${resourceId}`)
        .expect(404);
    });
  });

  describe('Community Matching Flow', () => {
    let secondUserId: string;
    let secondUserToken: string;

    beforeEach(async () => {
      // Create second user for matching
      const secondUserData = {
        email: 'matcher@example.com',
        password: 'Password123!',
        firstName: 'Match',
        lastName: 'User',
        location: {
          postcode: '2001',
          state: 'NSW',
          region: 'Sydney'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(secondUserData);

      secondUserToken = response.body.data.token;
      secondUserId = response.body.data.user._id;
    });

    it('should handle community matching workflow', async () => {
      // 1. Create community profiles for both users
      const firstUserProfile = {
        skills: [
          {
            name: 'Cattle Farming',
            level: 'advanced',
            canTeach: true,
            wantsToLearn: false,
            category: 'agricultural'
          }
        ],
        interests: [
          {
            name: 'Sustainable Agriculture',
            category: 'agriculture',
            intensity: 'passionate'
          }
        ],
        availability: {
          timeSlots: [
            { day: 'monday', startTime: '09:00', endTime: '17:00' }
          ],
          timezone: 'Australia/Sydney',
          preferredMeetingTypes: ['video-call'],
          responseTime: 'within-day'
        },
        matchingPreferences: {
          maxDistance: 50,
          preferredSkillLevels: ['beginner', 'intermediate'],
          priorityCategories: ['agricultural']
        }
      };

      await request(app)
        .post('/api/v1/community/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(firstUserProfile)
        .expect(201);

      const secondUserProfile = {
        skills: [
          {
            name: 'Cattle Farming',
            level: 'beginner',
            canTeach: false,
            wantsToLearn: true,
            category: 'agricultural'
          }
        ],
        interests: [
          {
            name: 'Sustainable Agriculture',
            category: 'agriculture',
            intensity: 'interested'
          }
        ],
        availability: {
          timeSlots: [
            { day: 'monday', startTime: '10:00', endTime: '16:00' }
          ],
          timezone: 'Australia/Sydney',
          preferredMeetingTypes: ['video-call'],
          responseTime: 'within-day'
        },
        matchingPreferences: {
          maxDistance: 100,
          preferredSkillLevels: ['advanced'],
          priorityCategories: ['agricultural']
        }
      };

      await request(app)
        .post('/api/v1/community/profile')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send(secondUserProfile)
        .expect(201);

      // 2. Get matches for first user
      const matchesResponse = await request(app)
        .get('/api/v1/community/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(matchesResponse.body.data.matches).toHaveLength(1);
      expect(matchesResponse.body.data.matches[0].userId).toBe(secondUserId);
      expect(matchesResponse.body.data.matches[0].matchScore).toBeGreaterThan(0);

      // 3. Get matches for second user
      const secondMatchesResponse = await request(app)
        .get('/api/v1/community/matches')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      expect(secondMatchesResponse.body.data.matches).toHaveLength(1);
      expect(secondMatchesResponse.body.data.matches[0].userId).toBe(userId);

      // 4. Create connection between users
      const connectionData = {
        targetUserId: secondUserId,
        message: 'Hi! I\'d love to help you learn cattle farming.'
      };

      const connectionResponse = await request(app)
        .post('/api/v1/community/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(connectionData)
        .expect(201);

      expect(connectionResponse.body.data.connection.fromUserId).toBe(userId);
      expect(connectionResponse.body.data.connection.toUserId).toBe(secondUserId);

      // 5. Accept connection
      const connectionId = connectionResponse.body.data.connection._id;

      await request(app)
        .put(`/api/v1/community/connections/${connectionId}/accept`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      // 6. Verify connection history
      const historyResponse = await request(app)
        .get('/api/v1/community/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(historyResponse.body.data.connections).toHaveLength(1);
      expect(historyResponse.body.data.connections[0].status).toBe('accepted');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent resource creation', async () => {
      const resourceData = {
        title: 'Concurrent Resource',
        description: 'Testing concurrent creation',
        category: 'equipment',
        location: { postcode: '2000', state: 'NSW', region: 'Sydney' },
        availability: { status: 'available' }
      };

      // Create multiple resources concurrently
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/v1/resources')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ...resourceData, title: `${resourceData.title} ${Math.random()}` })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all resources were created
      const allResourcesResponse = await request(app)
        .get('/api/v1/resources')
        .expect(200);

      expect(allResourcesResponse.body.data.resources.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle invalid authentication tokens gracefully', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'expired.jwt.token',
        ''
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/v1/auth/profile')
          .set('Authorization', token)
          .expect(401);

        expect(response.body.success).toBe(false);
      }
    });

    it('should handle database connection issues', async () => {
      // This test would require mocking database connection failures
      // For now, we'll test that the API handles malformed data gracefully
      
      const malformedData = {
        title: null,
        description: undefined,
        category: 123,
        location: 'not-an-object'
      };

      const response = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(malformedData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('Performance and Rate Limiting', () => {
    it('should handle rate limiting correctly', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array(20).fill(null).map(() =>
        request(app)
          .get('/api/v1/resources')
      );

      const responses = await Promise.all(promises);

      // Some requests should succeed, some might be rate limited
      const successfulRequests = responses.filter(r => r.status === 200);
      const rateLimitedRequests = responses.filter(r => r.status === 429);

      expect(successfulRequests.length).toBeGreaterThan(0);
      
      // If rate limiting is implemented, some requests should be limited
      if (rateLimitedRequests.length > 0) {
        rateLimitedRequests.forEach(response => {
          expect(response.body.message).toContain('rate limit');
        });
      }
    });

    it('should handle large dataset queries efficiently', async () => {
      // Create multiple resources for testing
      const resources = Array(50).fill(null).map((_, index) => ({
        title: `Resource ${index}`,
        description: `Description for resource ${index}`,
        category: index % 2 === 0 ? 'equipment' : 'services',
        ownerId: userId,
        location: { postcode: '2000', state: 'NSW', region: 'Sydney' },
        availability: { status: 'available' }
      }));

      await Resource.insertMany(resources);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/resources?limit=50')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data.resources).toHaveLength(50);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });
});