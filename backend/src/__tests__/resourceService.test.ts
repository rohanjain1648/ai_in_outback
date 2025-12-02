import { resourceService } from '../services/resourceService';
import { Resource } from '../models/Resource';
import { elasticsearchService } from '../services/elasticsearchService';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../services/elasticsearchService');
jest.mock('../models/Resource');

const mockElasticsearchService = elasticsearchService as jest.Mocked<typeof elasticsearchService>;
const mockResource = Resource as jest.MockedClass<typeof Resource>;

describe('ResourceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createResource', () => {
    it('should create a resource and index it in Elasticsearch', async () => {
      const resourceData = {
        title: 'Test Tractor',
        description: 'A reliable tractor for farming',
        category: 'equipment' as const,
        availability: { status: 'available' as const },
        location: {
          coordinates: [151.2093, -33.8688] as [number, number],
          address: '123 Farm Road',
          postcode: '2000',
          state: 'NSW',
          region: 'Sydney'
        },
        contact: {
          name: 'John Farmer',
          preferredMethod: 'email' as const
        },
        tags: ['tractor', 'farming'],
        owner: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
      };

      const mockSavedResource = {
        _id: 'resource123',
        ...resourceData,
        save: jest.fn().mockResolvedValue(true)
      };

      mockResource.mockImplementation(() => mockSavedResource as any);
      mockElasticsearchService.indexResource.mockResolvedValue(undefined);

      const result = await resourceService.createResource(resourceData);

      expect(mockResource).toHaveBeenCalledWith(resourceData);
      expect(mockSavedResource.save).toHaveBeenCalled();
      expect(mockElasticsearchService.indexResource).toHaveBeenCalledWith(mockSavedResource);
      expect(result).toBe(mockSavedResource);
    });

    it('should handle errors during resource creation', async () => {
      const resourceData = {
        title: 'Test Resource',
        description: 'Test description',
        category: 'equipment' as const,
        availability: { status: 'available' as const },
        location: {
          coordinates: [151.2093, -33.8688] as [number, number],
          address: '123 Test Road',
          postcode: '2000',
          state: 'NSW',
          region: 'Sydney'
        },
        contact: {
          name: 'Test User',
          preferredMethod: 'email' as const
        },
        tags: [],
        owner: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
      };

      const mockFailedResource = {
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      mockResource.mockImplementation(() => mockFailedResource as any);

      await expect(resourceService.createResource(resourceData)).rejects.toThrow('Database error');
    });
  });

  describe('searchResources', () => {
    it('should use Elasticsearch when available', async () => {
      const filters = {
        query: 'tractor',
        category: 'equipment',
        limit: 10,
        offset: 0
      };

      const mockSearchResult = {
        resources: [
          {
            id: 'resource1',
            title: 'Test Tractor',
            category: 'equipment'
          }
        ],
        total: 1,
        maxScore: 1.5
      };

      mockElasticsearchService.isHealthy.mockResolvedValue(true);
      mockElasticsearchService.searchResources.mockResolvedValue(mockSearchResult);
      mockElasticsearchService.getAggregations.mockResolvedValue({});

      const result = await resourceService.searchResources(filters, {});

      expect(mockElasticsearchService.isHealthy).toHaveBeenCalled();
      expect(mockElasticsearchService.searchResources).toHaveBeenCalledWith(filters);
      expect(result.resources).toEqual(mockSearchResult.resources);
      expect(result.total).toBe(1);
    });

    it('should fallback to MongoDB when Elasticsearch is unavailable', async () => {
      const filters = {
        query: 'tractor',
        category: 'equipment',
        limit: 10,
        offset: 0
      };

      mockElasticsearchService.isHealthy.mockResolvedValue(false);

      // Mock MongoDB search
      const mockMongoResources = [
        {
          _id: 'resource1',
          title: 'Test Tractor',
          category: 'equipment'
        }
      ];

      mockResource.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockMongoResources)
              })
            })
          })
        })
      });

      mockResource.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await resourceService.searchResources(filters, {});

      expect(mockElasticsearchService.isHealthy).toHaveBeenCalled();
      expect(result.resources).toEqual(mockMongoResources);
      expect(result.total).toBe(1);
    });
  });

  describe('updateResource', () => {
    it('should update a resource and sync with Elasticsearch', async () => {
      const resourceId = 'resource123';
      const updateData = {
        title: 'Updated Tractor',
        description: 'Updated description'
      };

      const mockUpdatedResource = {
        _id: resourceId,
        ...updateData
      };

      mockResource.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedResource);
      mockElasticsearchService.updateResource.mockResolvedValue(undefined);

      const result = await resourceService.updateResource(resourceId, updateData);

      expect(mockResource.findByIdAndUpdate).toHaveBeenCalledWith(
        resourceId,
        { ...updateData, updatedAt: expect.any(Date) },
        { new: true, runValidators: true }
      );
      expect(mockElasticsearchService.updateResource).toHaveBeenCalledWith(resourceId, mockUpdatedResource);
      expect(result).toBe(mockUpdatedResource);
    });
  });

  describe('deleteResource', () => {
    it('should delete a resource and remove from Elasticsearch', async () => {
      const resourceId = 'resource123';
      const mockDeletedResource = { _id: resourceId };

      mockResource.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedResource);
      mockElasticsearchService.deleteResource.mockResolvedValue(undefined);

      const result = await resourceService.deleteResource(resourceId);

      expect(mockResource.findByIdAndDelete).toHaveBeenCalledWith(resourceId);
      expect(mockElasticsearchService.deleteResource).toHaveBeenCalledWith(resourceId);
      expect(result).toBe(true);
    });

    it('should return false when resource not found', async () => {
      const resourceId = 'nonexistent';

      mockResource.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const result = await resourceService.deleteResource(resourceId);

      expect(result).toBe(false);
      expect(mockElasticsearchService.deleteResource).not.toHaveBeenCalled();
    });
  });

  describe('addResourceReview', () => {
    it('should add a new review and update rating', async () => {
      const resourceId = 'resource123';
      const userId = 'user123';
      const rating = 5;
      const comment = 'Great resource!';

      const mockResource = {
        _id: resourceId,
        reviews: [] as any[],
        rating: { average: 0, count: 0 },
        save: jest.fn().mockResolvedValue(true)
      };

      Resource.findById = jest.fn().mockResolvedValue(mockResource);
      mockElasticsearchService.updateResource.mockResolvedValue(undefined);

      const result = await resourceService.addResourceReview(resourceId, userId, rating, comment);

      expect(mockResource.reviews).toHaveLength(1);
      expect(mockResource.reviews[0].rating).toBe(rating);
      expect(mockResource.reviews[0].comment).toBe(comment);
      expect(mockResource.rating.average).toBe(5);
      expect(mockResource.rating.count).toBe(1);
      expect(mockResource.save).toHaveBeenCalled();
    });

    it('should update existing review', async () => {
      const resourceId = 'resource123';
      const userId = 'user123';
      const newRating = 4;
      const newComment = 'Updated review';

      const mockResource = {
        _id: resourceId,
        reviews: [
          {
            user: { toString: () => userId },
            rating: 5,
            comment: 'Old review'
          }
        ] as any[],
        rating: { average: 5, count: 1 },
        save: jest.fn().mockResolvedValue(true)
      };

      Resource.findById = jest.fn().mockResolvedValue(mockResource);
      mockElasticsearchService.updateResource.mockResolvedValue(undefined);

      const result = await resourceService.addResourceReview(resourceId, userId, newRating, newComment);

      expect(mockResource.reviews).toHaveLength(1);
      expect(mockResource.reviews[0].rating).toBe(newRating);
      expect(mockResource.reviews[0].comment).toBe(newComment);
      expect(mockResource.rating.average).toBe(4);
      expect(mockResource.rating.count).toBe(1);
    });
  });
});