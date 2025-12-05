// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { culturalStoryService, CreateStoryData, StoryFilters } from '../services/culturalStoryService';
import { mediaUploadService } from '../services/mediaUploadService';
import { successResponse, errorResponse } from '../utils/response';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createStorySchema = Joi.object({
  title: Joi.string().required().max(200),
  content: Joi.string().required(),
  summary: Joi.string().max(500),
  category: Joi.string().valid('traditional', 'historical', 'personal', 'community', 'legend', 'contemporary').required(),
  tags: Joi.array().items(Joi.string().max(50)),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    region: Joi.string().required(),
    specificPlace: Joi.string()
  }).required(),
  timeframe: Joi.object({
    period: Joi.string(),
    specificDate: Joi.date(),
    isOngoing: Joi.boolean()
  }),
  relatedPeople: Joi.array().items(Joi.string()),
  relatedEvents: Joi.array().items(Joi.string()),
  visibility: Joi.string().valid('public', 'community', 'private').default('public')
});

const updateStorySchema = Joi.object({
  title: Joi.string().max(200),
  content: Joi.string(),
  summary: Joi.string().max(500),
  category: Joi.string().valid('traditional', 'historical', 'personal', 'community', 'legend', 'contemporary'),
  tags: Joi.array().items(Joi.string().max(50)),
  timeframe: Joi.object({
    period: Joi.string(),
    specificDate: Joi.date(),
    isOngoing: Joi.boolean()
  }),
  relatedPeople: Joi.array().items(Joi.string()),
  relatedEvents: Joi.array().items(Joi.string()),
  visibility: Joi.string().valid('public', 'community', 'private')
});

// Get cultural stories with filtering and pagination
router.get('/stories', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      region,
      tags,
      author,
      status,
      culturalSignificance,
      lat,
      lng,
      radius,
      startDate,
      endDate
    } = req.query;

    const filters: StoryFilters = {};
    
    if (category) filters.category = category as string;
    if (region) filters.region = region as string;
    if (tags) filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
    if (author) filters.author = author as string;
    if (status) filters.status = status as string;
    if (culturalSignificance) filters.culturalSignificance = culturalSignificance as string;
    
    if (lat && lng && radius) {
      filters.location = {
        coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
        radius: parseFloat(radius as string)
      };
    }
    
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      };
    }

    const result = await culturalStoryService.getStories(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(successResponse(result, 'Stories retrieved successfully'));
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json(errorResponse('Failed to fetch stories'));
  }
});

// Get single story by ID
router.get('/stories/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const story = await culturalStoryService.getStoryById(id, userId);
    
    if (!story) {
      return res.status(404).json(errorResponse('Story not found'));
    }

    res.json(successResponse(story, 'Story retrieved successfully'));
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json(errorResponse('Failed to fetch story'));
  }
});

// Create new cultural story
router.post('/stories', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = createStorySchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const userId = req.user!.id;
    const storyData: CreateStoryData = value;

    const story = await culturalStoryService.createStory(userId, storyData);
    
    res.status(201).json(successResponse(story, 'Story created successfully'));
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json(errorResponse('Failed to create story'));
  }
});

// Update story
router.put('/stories/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = updateStorySchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user owns the story or is admin
    const existingStory = await culturalStoryService.getStoryById(id);
    if (!existingStory) {
      return res.status(404).json(errorResponse('Story not found'));
    }

    if (existingStory.author._id.toString() !== userId) {
      return res.status(403).json(errorResponse('Not authorized to update this story'));
    }

    // Update story (implementation would go in service)
    res.status(501).json(errorResponse('Story update not yet implemented'));
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json(errorResponse('Failed to update story'));
  }
});

// Upload media for story
router.post('/stories/:id/media', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const upload = mediaUploadService.getMulterConfig();
    
    upload.array('media', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json(errorResponse(err.message));
      }

      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      const captions = req.body.captions ? JSON.parse(req.body.captions) : [];

      if (!files || files.length === 0) {
        return res.status(400).json(errorResponse('No files uploaded'));
      }

      try {
        const processedMedia = await mediaUploadService.processUploadedFiles(files, captions);
        
        // Add media to story (implementation would go in service)
        res.json(successResponse(processedMedia, 'Media uploaded successfully'));
      } catch (error) {
        console.error('Error processing media:', error);
        res.status(500).json(errorResponse('Failed to process uploaded media'));
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json(errorResponse('Failed to upload media'));
  }
});

// Search stories
router.get('/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, page = 1, limit = 20, ...filters } = req.query;
    
    if (!q) {
      return res.status(400).json(errorResponse('Search query is required'));
    }

    const searchFilters: StoryFilters = {};
    if (filters.category) searchFilters.category = filters.category as string;
    if (filters.region) searchFilters.region = filters.region as string;
    if (filters.tags) searchFilters.tags = Array.isArray(filters.tags) ? filters.tags as string[] : [filters.tags as string];

    const result = await culturalStoryService.searchStories(
      q as string,
      searchFilters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(successResponse(result, 'Search completed successfully'));
  } catch (error) {
    console.error('Error searching stories:', error);
    res.status(500).json(errorResponse('Failed to search stories'));
  }
});

// Get story recommendations
router.get('/recommendations', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;

    const recommendations = await culturalStoryService.getRecommendations(
      userId,
      parseInt(limit as string)
    );

    res.json(successResponse(recommendations, 'Recommendations retrieved successfully'));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json(errorResponse('Failed to fetch recommendations'));
  }
});

// Like/unlike story
router.post('/stories/:id/like', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const story = await culturalStoryService.likeStory(id, userId);
    
    if (!story) {
      return res.status(404).json(errorResponse('Story not found'));
    }

    const isLiked = story.likes.some(likeId => likeId.toString() === userId);
    const message = isLiked ? 'Story liked successfully' : 'Story unliked successfully';

    res.json(successResponse({ story, isLiked }, message));
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json(errorResponse('Failed to like story'));
  }
});

// Add comment to story
router.post('/stories/:id/comments', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json(errorResponse('Comment content is required'));
    }

    if (content.length > 1000) {
      return res.status(400).json(errorResponse('Comment is too long (max 1000 characters)'));
    }

    const story = await culturalStoryService.addComment(id, userId, content.trim());
    
    if (!story) {
      return res.status(404).json(errorResponse('Story not found'));
    }

    res.json(successResponse(story, 'Comment added successfully'));
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json(errorResponse('Failed to add comment'));
  }
});

// Add story connection
router.post('/stories/:id/connections', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { storyId, connectionType, description, strength = 0.5 } = req.body;

    if (!storyId || !connectionType) {
      return res.status(400).json(errorResponse('Story ID and connection type are required'));
    }

    const validConnectionTypes = ['related', 'sequel', 'prequel', 'reference', 'location', 'family'];
    if (!validConnectionTypes.includes(connectionType)) {
      return res.status(400).json(errorResponse('Invalid connection type'));
    }

    const story = await culturalStoryService.addStoryConnection(id, {
      storyId,
      connectionType,
      description,
      strength: Math.min(Math.max(strength, 0), 1)
    });

    if (!story) {
      return res.status(404).json(errorResponse('Story not found'));
    }

    res.json(successResponse(story, 'Story connection added successfully'));
  } catch (error) {
    console.error('Error adding story connection:', error);
    res.status(500).json(errorResponse('Failed to add story connection'));
  }
});

// Get popular tags
router.get('/tags/popular', async (req: Request, res: Response) => {
  try {
    // This would be implemented in the service
    res.status(501).json(errorResponse('Popular tags endpoint not yet implemented'));
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json(errorResponse('Failed to fetch popular tags'));
  }
});

// Get story statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // This would be implemented in the service
    res.status(501).json(errorResponse('Story statistics endpoint not yet implemented'));
  } catch (error) {
    console.error('Error fetching story statistics:', error);
    res.status(500).json(errorResponse('Failed to fetch story statistics'));
  }
});

export default router;
