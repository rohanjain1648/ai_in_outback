// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { resourceService } from '../services/resourceService';
import { successResponse, errorResponse } from '../utils/response';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createResourceSchema = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().required().max(2000),
  category: Joi.string().required().valid('equipment', 'services', 'knowledge', 'materials', 'transportation', 'accommodation', 'emergency', 'other'),
  subcategory: Joi.string().optional().max(100),
  availability: Joi.object({
    status: Joi.string().required().valid('available', 'unavailable', 'limited'),
    schedule: Joi.object({
      days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
      hours: Joi.object({
        start: Joi.string(),
        end: Joi.string()
      })
    }).optional(),
    quantity: Joi.number().min(0).optional(),
    maxQuantity: Joi.number().min(0).optional()
  }).required(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    address: Joi.string().required(),
    postcode: Joi.string().required(),
    state: Joi.string().required(),
    region: Joi.string().required(),
    accessibilityNotes: Joi.string().optional()
  }).required(),
  contact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    preferredMethod: Joi.string().required().valid('phone', 'email', 'in-person')
  }).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  pricing: Joi.object({
    type: Joi.string().valid('free', 'paid', 'donation', 'barter').default('free'),
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().default('AUD').optional(),
    barterPreferences: Joi.array().items(Joi.string()).optional()
  }).optional(),
  requirements: Joi.object({
    experience: Joi.string().optional(),
    equipment: Joi.array().items(Joi.string()).optional(),
    certification: Joi.array().items(Joi.string()).optional(),
    other: Joi.string().optional()
  }).optional()
});

const searchSchema = Joi.object({
  query: Joi.string().optional(),
  category: Joi.string().optional(),
  lat: Joi.number().optional(),
  lon: Joi.number().optional(),
  radius: Joi.string().optional(),
  availability: Joi.string().valid('available', 'unavailable', 'limited').optional(),
  pricing: Joi.string().valid('free', 'paid', 'donation', 'barter').optional(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  verified: Joi.boolean().optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0),
  sortBy: Joi.string().valid('relevance', 'distance', 'rating', 'date', 'popularity').default('relevance'),
  useAI: Joi.boolean().default(false)
});

const reviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5),
  comment: Joi.string().required().max(1000)
});

// Search resources
router.get('/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse('Invalid search parameters', error.details));
    }

    const {
      query,
      category,
      lat,
      lon,
      radius,
      availability,
      pricing,
      tags,
      verified,
      minRating,
      limit,
      offset,
      sortBy,
      useAI
    } = value;

    // Build search filters
    const filters: any = {};
    if (query) filters.query = query;
    if (category) filters.category = category;
    if (lat && lon) {
      filters.location = { lat, lon };
      if (radius) filters.location.radius = radius;
    }
    if (availability) filters.availability = availability;
    if (pricing) filters.pricing = pricing;
    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }
    if (verified !== undefined) filters.verified = verified;
    if (minRating) filters.minRating = minRating;

    const options = { limit, offset, sortBy, useAI };
    const userId = req.user?.id;

    const result = await resourceService.searchResources(filters, options, userId);

    res.json(successResponse('Resources retrieved successfully', result));
  } catch (error) {
    console.error('Search resources error:', error);
    res.status(500).json(errorResponse('Failed to search resources'));
  }
});

// Get resource recommendations
router.get('/recommendations', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lat, lon, limit = 10 } = req.query;

    let userLocation;
    if (lat && lon) {
      userLocation = { lat: parseFloat(lat as string), lon: parseFloat(lon as string) };
    }

    const recommendations = await resourceService.getResourceRecommendations(
      userId,
      userLocation,
      parseInt(limit as string)
    );

    res.json(successResponse('Recommendations retrieved successfully', { recommendations }));
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json(errorResponse('Failed to get recommendations'));
  }
});

// Get popular resources
router.get('/popular', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon, limit = 10 } = req.query;

    let location;
    if (lat && lon) {
      location = { lat: parseFloat(lat as string), lon: parseFloat(lon as string) };
    }

    const resources = await resourceService.getPopularResources(location, parseInt(limit as string));

    res.json(successResponse('Popular resources retrieved successfully', { resources }));
  } catch (error) {
    console.error('Get popular resources error:', error);
    res.status(500).json(errorResponse('Failed to get popular resources'));
  }
});

// Get resource categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await resourceService.getResourceCategories();
    res.json(successResponse('Categories retrieved successfully', { categories }));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(errorResponse('Failed to get categories'));
  }
});

// Get resource by ID
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await resourceService.getResourceById(id, true); // increment view count

    if (!resource) {
      return res.status(404).json(errorResponse('Resource not found'));
    }

    res.json(successResponse('Resource retrieved successfully', { resource }));
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json(errorResponse('Failed to get resource'));
  }
});

// Submit new resource
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = createResourceSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse('Invalid resource data', error.details));
    }

    const resourceData = {
      ...value,
      owner: req.user!.id
    };

    const resource = await resourceService.createResource(resourceData);

    res.status(201).json(successResponse('Resource created successfully', { resource }));
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json(errorResponse('Failed to create resource'));
  }
});

// Update resource
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = createResourceSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse('Invalid resource data', error.details));
    }

    // Check if user owns the resource
    const existingResource = await resourceService.getResourceById(id);
    if (!existingResource) {
      return res.status(404).json(errorResponse('Resource not found'));
    }

    if (existingResource.owner.toString() !== req.user!.id) {
      return res.status(403).json(errorResponse('Not authorized to update this resource'));
    }

    const resource = await resourceService.updateResource(id, value);

    res.json(successResponse('Resource updated successfully', { resource }));
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json(errorResponse('Failed to update resource'));
  }
});

// Delete resource
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns the resource
    const existingResource = await resourceService.getResourceById(id);
    if (!existingResource) {
      return res.status(404).json(errorResponse('Resource not found'));
    }

    if (existingResource.owner.toString() !== req.user!.id) {
      return res.status(403).json(errorResponse('Not authorized to delete this resource'));
    }

    const deleted = await resourceService.deleteResource(id);

    if (deleted) {
      res.json(successResponse('Resource deleted successfully'));
    } else {
      res.status(404).json(errorResponse('Resource not found'));
    }
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json(errorResponse('Failed to delete resource'));
  }
});

// Add review to resource
router.post('/:id/reviews', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse('Invalid review data', error.details));
    }

    const { rating, comment } = value;
    const userId = req.user!.id;

    const resource = await resourceService.addResourceReview(id, userId, rating, comment);

    if (!resource) {
      return res.status(404).json(errorResponse('Resource not found'));
    }

    res.json(successResponse('Review added successfully', { resource }));
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json(errorResponse('Failed to add review'));
  }
});

// Get user's resources
router.get('/user/my-resources', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { includeInactive = false } = req.query;

    const resources = await resourceService.getResourcesByOwner(
      userId,
      includeInactive === 'true'
    );

    res.json(successResponse('User resources retrieved successfully', { resources }));
  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json(errorResponse('Failed to get user resources'));
  }
});

export default router;
