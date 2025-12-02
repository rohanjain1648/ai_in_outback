import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { CommunityMatchingService, MatchingFilters } from '../services/communityMatchingService';
import { AppError } from '../utils/errors';
import { successResponse, errorResponse } from '../utils/response';
import {
  validateCommunityMember,
  validateAvailability,
  validateMatchingPreferences,
  validateConnectMember,
  validateMatchingFilters,
} from '../validation/communityValidation';

const router = Router();

// Create or update community member profile
router.post('/profile', authenticate, validateCommunityMember, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profileData = {
      userId,
      ...req.body,
    };

    const communityMember = await CommunityMatchingService.createOrUpdateCommunityMember(profileData);
    
    res.json(successResponse(communityMember, 'Community profile updated successfully'));
  } catch (error) {
    console.error('Create/update community profile error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to update community profile'));
    }
  }
});

// Get current user's community profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const communityMember = await CommunityMatchingService.getCommunityMemberByUserId(userId);
    
    if (!communityMember) {
      res.status(404).json(errorResponse('Community profile not found'));
      return;
    }

    res.json(successResponse(communityMember, 'Community profile retrieved successfully'));
  } catch (error) {
    console.error('Get community profile error:', error);
    res.status(500).json(errorResponse('Failed to retrieve community profile'));
  }
});

// Get community matches
router.get('/matches', authenticate, validateMatchingFilters, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      maxDistance,
      skillCategories,
      interestCategories,
      skillLevels,
      availabilityTypes,
      minAge,
      maxAge,
      genderPreference,
      communicationStyles,
      minMatchingScore,
      limit = 20,
    } = req.query;

    const filters: MatchingFilters = {};
    
    if (maxDistance) filters.maxDistance = parseInt(maxDistance as string);
    if (skillCategories) filters.skillCategories = (skillCategories as string).split(',');
    if (interestCategories) filters.interestCategories = (interestCategories as string).split(',');
    if (skillLevels) filters.skillLevels = (skillLevels as string).split(',');
    if (availabilityTypes) filters.availabilityTypes = (availabilityTypes as string).split(',');
    if (minAge) filters.minAge = parseInt(minAge as string);
    if (maxAge) filters.maxAge = parseInt(maxAge as string);
    if (genderPreference) filters.genderPreference = (genderPreference as string).split(',');
    if (communicationStyles) filters.communicationStyles = (communicationStyles as string).split(',');
    if (minMatchingScore) filters.minMatchingScore = parseInt(minMatchingScore as string);

    const matches = await CommunityMatchingService.findMatches(
      userId,
      filters,
      parseInt(limit as string) || 20
    );

    res.json(successResponse(matches, 'Matches retrieved successfully'));
  } catch (error) {
    console.error('Get matches error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to retrieve matches'));
    }
  }
});

// Get community members (public endpoint with optional auth)
router.get('/members', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      skillCategories,
      interestCategories,
      limit = 20,
      page = 1,
    } = req.query;

    // For public access, we'll show limited information
    // This could be expanded based on privacy settings
    const filters: MatchingFilters = {};
    
    if (skillCategories) filters.skillCategories = (skillCategories as string).split(',');
    if (interestCategories) filters.interestCategories = (interestCategories as string).split(',');

    // If user is authenticated, we can show more personalized results
    if (req.user) {
      const matches = await CommunityMatchingService.findMatches(
        req.user.id,
        filters,
        parseInt(limit as string) || 20
      );
      res.json(successResponse(matches, 'Community members retrieved successfully'));
    } else {
      // For non-authenticated users, show basic community stats
      const stats = await CommunityMatchingService.getCommunityStats();
      res.json(successResponse(stats, 'Community statistics retrieved successfully'));
    }
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json(errorResponse('Failed to retrieve community members'));
  }
});

// Connect with community member
router.post('/connect/:memberId', authenticate, validateConnectMember, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { memberId } = req.params;
    const { connectionType = 'requested' } = req.body;

    await CommunityMatchingService.recordConnection(userId, memberId, connectionType);
    
    res.json(successResponse(null, 'Connection recorded successfully'));
  } catch (error) {
    console.error('Connect with member error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to connect with member'));
    }
  }
});

// Get connection history
router.get('/connections', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const connections = await CommunityMatchingService.getConnectionHistory(userId);
    
    res.json(successResponse(connections, 'Connection history retrieved successfully'));
  } catch (error) {
    console.error('Get connections error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to retrieve connections'));
    }
  }
});

// Update availability
router.put('/availability', authenticate, validateAvailability, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const availability = req.body;

    const updatedMember = await CommunityMatchingService.updateAvailability(userId, availability);
    
    res.json(successResponse(updatedMember, 'Availability updated successfully'));
  } catch (error) {
    console.error('Update availability error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to update availability'));
    }
  }
});

// Update matching preferences
router.put('/preferences', authenticate, validateMatchingPreferences, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const preferences = req.body;

    const updatedMember = await CommunityMatchingService.updateMatchingPreferences(userId, preferences);
    
    res.json(successResponse(updatedMember, 'Matching preferences updated successfully'));
  } catch (error) {
    console.error('Update preferences error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to update preferences'));
    }
  }
});

// Toggle matching availability
router.post('/toggle-availability', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updatedMember = await CommunityMatchingService.toggleMatchingAvailability(userId);
    
    res.json(successResponse(updatedMember, 'Matching availability toggled successfully'));
  } catch (error) {
    console.error('Toggle availability error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      res.status(500).json(errorResponse('Failed to toggle availability'));
    }
  }
});

// Get community statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await CommunityMatchingService.getCommunityStats();
    res.json(successResponse(stats, 'Community statistics retrieved successfully'));
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json(errorResponse('Failed to retrieve community statistics'));
  }
});

export default router;