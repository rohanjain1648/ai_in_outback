// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { businessService } from '../services/businessService';
import { 
  createBusinessSchema, 
  updateBusinessSchema, 
  businessSearchSchema, 
  businessReviewSchema,
  businessMatchingSchema 
} from '../validation/businessValidation';
import { AppError } from '../utils/errors';

const router = Router();

// Get business directory with search and filters
router.get('/directory', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = businessSearchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { page, limit, ...filters } = value;
    const result = await businessService.searchBusinesses(filters, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search businesses'
    });
  }
});

// Get business recommendations for authenticated user
router.get('/recommendations', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recommendations = await businessService.getBusinessRecommendations(req.user!.id, limit);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting business recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business recommendations'
    });
  }
});

// Create business profile
router.post('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = createBusinessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business data',
        errors: error.details.map(detail => detail.message)
      });
    }

    const businessData = {
      ...value,
      owner: req.user!.id
    };

    const business = await businessService.createBusiness(businessData);

    res.status(201).json({
      success: true,
      data: business,
      message: 'Business profile created successfully'
    });
  } catch (error) {
    console.error('Error creating business profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create business profile'
    });
  }
});

// Get specific business by ID
router.get('/:businessId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const business = await businessService.getBusinessById(req.params.businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Error getting business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business'
    });
  }
});

// Update business profile
router.put('/:businessId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = updateBusinessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business data',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if user owns the business
    const existingBusiness = await businessService.getBusinessById(req.params.businessId);
    if (!existingBusiness) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (existingBusiness.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this business'
      });
    }

    const updatedBusiness = await businessService.updateBusiness(req.params.businessId, value);

    res.json({
      success: true,
      data: updatedBusiness,
      message: 'Business profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business'
    });
  }
});

// Get AI-powered business matches
router.post('/matches', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = businessMatchingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid matching criteria',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if user owns the business
    const business = await businessService.getBusinessById(value.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (business.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to get matches for this business'
      });
    }

    const matches = await businessService.getAIBusinessMatches(value);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Error getting business matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business matches'
    });
  }
});

// Add business review
router.post('/:businessId/reviews', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = businessReviewSchema.validate({
      ...req.body,
      business: req.params.businessId
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review data',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if business exists
    const business = await businessService.getBusinessById(req.params.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Prevent users from reviewing their own business
    if (business.owner.toString() === req.user!.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review your own business'
      });
    }

    const reviewData = {
      ...value,
      reviewer: req.user!.id
    };

    const review = await businessService.addBusinessReview(reviewData);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Error adding business review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// Get business analytics (for business owners)
router.get('/:businessId/analytics', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user owns the business
    const business = await businessService.getBusinessById(req.params.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (business.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this business'
      });
    }

    const analytics = await businessService.getBusinessAnalytics(req.params.businessId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting business analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business analytics'
    });
  }
});

// Get economic opportunities in an area
router.get('/opportunities/area', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const location = {
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string)
    };

    const radiusKm = radius ? parseFloat(radius as string) : 25;

    const opportunities = await businessService.getEconomicOpportunities(location, radiusKm);

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    console.error('Error getting economic opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get economic opportunities'
    });
  }
});

export default router;
