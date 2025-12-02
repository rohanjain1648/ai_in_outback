import { Router, Request, Response } from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { UserService } from '../services/userService';
import { AppError } from '../utils/errors';
import { updateProfileSchema, changePasswordSchema } from '../validation/userValidation';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await UserService.getUserById(req.user!.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    const user = await UserService.updateUser(req.user!.id, value);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Change password
router.put('/change-password', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    await UserService.changePassword(req.user!.id, value.currentPassword, value.newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Deactivate account
router.delete('/account', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await UserService.deactivateUser(req.user!.id);

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Find users near location
router.get('/nearby', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { longitude, latitude, maxDistance = 50000, limit = 20 } = req.query;

    if (!longitude || !latitude) {
      res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required',
      });
      return;
    }

    const coordinates: [number, number] = [Number(longitude), Number(latitude)];
    const users = await UserService.findUsersNearLocation(
      coordinates,
      Number(maxDistance),
      Number(limit)
    );

    res.json({
      success: true,
      message: 'Nearby users retrieved successfully',
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticate, authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserService.getUserById(req.params.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List users (admin only)
router.get('/', authenticate, authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      role: role as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };

    const result = await UserService.getUsers(options);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;