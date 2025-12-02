import request from 'supertest';
import server from '../server';
import { User } from '../models/User';
import { Resource } from '../models/Resource';

describe('Resources Routes', () => {
  let app: any;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = server.getApp();
  });

  beforeEach(async () => {
    // Clear data
    await User.deleteMany({});
    await Resource.deleteMany({});

    // Create and authenticate user
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
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

  describe('POST /api/v1/resources', () => {
    it('should create a new resource successfully', async () => {
      const resourceData = {
        title: 'Farm Equipment Rental',
        description: 'Tractor available for rent',
        category: 'equipment',
        subcategory: 'agricultural',
        availability: {
          status: 'available',
          schedule: {
            monday: { available: true, startTime: '08:00', endTime: '18:00' }
          }
        },
        location: {
          postcode: '2000',
          state: 'NSW',
          region: 'Sydney'
        },
        contactInfo: {
          phone: '0412345678',
          email: 'contact@example.com'
        }
      };

      const response = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resourceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource.title).toBe(resourceData.title);
      expect(response.body.data.resource.ownerId).toBe(userId);
      expect(response.body.data.resource.category).toBe(resourceData.category);
    });

    it('should return 400 for invalid resource data', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const resourceData = {
        title: 'Test Resource',
        description: 'Test description',
        category: 'equipment'
      };

      const response = await request(app)
        .post('/api/v1/resources')
        .send(resourceData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/resources', () => {
    beforeEach(async () => {
      // Create test resources
      const resources = [
        {
          title: 'Tractor Rental',
          description: 'Heavy duty tractor',
          category: 'equipment',
          subcategory: 'agricultural',
          ownerId: userId,
          location: { postcode: '2000', state: 'NSW', region: 'Sydney' },
          availability: { status: 'available' }
        },
        {
          title: 'Veterinary Services',
          description: 'Mobile vet services',
          category: 'services',
          subcategory: 'veterinary',
          ownerId: userId,
          location: { postcode: '2001', state: 'NSW', region: 'Sydney' },
          availability: { status: 'available' }
        }
      ];

      await Resource.insertMany(resources);
    });

    it('should return all resources', async () => {
      const response = await request(app)
        .get('/api/v1/resources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter resources by category', async () => {
      const response = await request(app)
        .get('/api/v1/resources?category=equipment')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(1);
      expect(response.body.data.resources[0].category).toBe('equipment');
    });

    it('should filter resources by location', async () => {
      const response = await request(app)
        .get('/api/v1/resources?postcode=2000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(1);
      expect(response.body.data.resources[0].location.postcode).toBe('2000');
    });

    it('should search resources by title', async () => {
      const response = await request(app)
        .get('/api/v1/resources?search=tractor')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(1);
      expect(response.body.data.resources[0].title.toLowerCase()).toContain('tractor');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/resources?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/v1/resources/:id', () => {
    let resourceId: string;

    beforeEach(async () => {
      const resource = new Resource({
        title: 'Test Resource',
        description: 'Test description',
        category: 'equipment',
        ownerId: userId,
        location: { postcode: '2000', state: 'NSW', region: 'Sydney' },
        availability: { status: 'available' }
      });

      const savedResource = await resource.save();
      resourceId = savedResource._id.toString();
    });

    it('should return resource by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/resources/${resourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource._id).toBe(resourceId);
      expect(response.body.data.resource.title).toBe('Test Resource');
    });

    it('should return 404 for non-existent resource', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/resources/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid resource ID', async () => {
      const response = await request(app)
        .get('/api/v1/resources/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('PUT /api/v1/resources/:id', () => {
    let resourceId: string;

    beforeEach(async () => {
      const resource = new Resource({
        title: 'Test Resource',
        description: 'Test description',
        category: 'equipment',
        ownerId: userId,
        location: { postcode: '2000', state: 'NSW', region: 'Sydney' },
        availability: { status: 'available' }
      });

      const savedResource = await resource.save();
      resourceId = savedResource._id.toString();
    });

    it('should update resource successfully', async () => {
      const updateData = {
        title: 'Updated Resource',
        description: 'Updated description',
        availability: { status: 'unavailable' }
      };

      const response = await request(app)
        .put(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource.title).toBe('Updated Resource');
      expect(response.body.data.resource.availability.status).toBe('unavailable');
    });

    it('should return 403 for unauthorized update', async () => {
      // Create another user
      const otherUserData = {
        email: 'other@example.com',
        password: 'Password123!',
        firstName: 'Other',
        lastName: 'User'
      };

      const otherUserResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(otherUserData);

      const otherToken = otherUserResponse.body.data.token;

      const updateData = { title: 'Unauthorized Update' };

      const response = await request(app)
        .put(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('authorized');
    });
  });

  describe('DELETE /api/v1/resources/:id', () => {
    let resourceId: string;

    beforeEach(async () => {
      const resource = new Resource({
        title: 'Test Resource',
        description: 'Test description',
        category: 'equipment',
        ownerId: userId,
        location: { postcode: '2000', state: 'NSW', region: 'Sydney' },
        availability: { status: 'available' }
      });

      const savedResource = await resource.save();
      resourceId = savedResource._id.toString();
    });

    it('should delete resource successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify resource is deleted
      const deletedResource = await Resource.findById(resourceId);
      expect(deletedResource).toBeNull();
    });

    it('should return 403 for unauthorized deletion', async () => {
      // Create another user
      const otherUserData = {
        email: 'other@example.com',
        password: 'Password123!',
        firstName: 'Other',
        lastName: 'User'
      };

      const otherUserResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(otherUserData);

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .delete(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('authorized');
    });
  });
});