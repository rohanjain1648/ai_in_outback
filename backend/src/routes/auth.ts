import { Router, Request, Response } from 'express';
import { authRateLimitMiddleware } from '../middleware/security';
import { authenticate, AuthenticatedRequest, AuthService } from '../middleware/auth';
import { UserService } from '../services/userService';
import { AppError } from '../utils/errors';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validation/userValidation';

const router = Router();

// Apply strict rate limiting to all auth routes
router.use(authRateLimitMiddleware);

// User registration
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    // Create user
    const { user, tokens } = await UserService.createUser(value);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens,
      },
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
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// User login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    // Authenticate user
    const { user, tokens } = await UserService.loginUser(value);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        tokens,
      },
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
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Token refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Refresh tokens
    const tokens = await UserService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: { tokens },
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
      message: 'Token refresh failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// User logout
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await AuthService.blacklistToken(token);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Password reset request
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    const message = await UserService.requestPasswordReset(value.email);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Password reset confirmation
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    await UserService.resetPassword(value.token, value.newPassword);

    res.json({
      success: true,
      message: 'Password reset successful',
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
      message: 'Password reset failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
      return;
    }

    await UserService.verifyEmail(value.token);

    res.json({
      success: true,
      message: 'Email verified successfully',
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
      message: 'Email verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user info (protected route)
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      message: 'User info retrieved successfully',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;