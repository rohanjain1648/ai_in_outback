// @ts-nocheck
import express from 'express';
import { avatarService } from '../services/avatarService';
import { authenticate } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * @route   POST /api/avatars/generate
 * @desc    Generate a new spirit avatar
 * @access  Private
 */
router.post(
    '/generate',
    authenticate,
    [
        body('customization.style')
            .isIn(['ethereal', 'geometric', 'nature', 'abstract', 'traditional'])
            .withMessage('Invalid style'),
        body('customization.theme')
            .isIn(['light', 'dark', 'earth', 'water', 'fire', 'air'])
            .withMessage('Invalid theme'),
        body('customization.colors')
            .optional()
            .isArray()
            .withMessage('Colors must be an array'),
    ],
    validateRequest,
    async (req: express.Request, res: express.Response) => {
        try {
            const userId = (req as any).user.id;

            const avatar = await avatarService.generateAvatar({
                userId,
                customization: req.body.customization,
                userProfile: req.body.userProfile,
            });

            res.json({
                success: true,
                avatar,
            });
        } catch (error) {
            console.error('Avatar generation error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate avatar',
            });
        }
    }
);

/**
 * @route   GET /api/avatars/user/:userId
 * @desc    Get all avatars for a user
 * @access  Private
 */
router.get(
    '/user/:userId',
    authenticate,
    [param('userId').isMongoId().withMessage('Invalid user ID')],
    validateRequest,
    async (req: express.Request, res: express.Response) => {
        try {
            const { userId } = req.params;
            const requestingUserId = (req as any).user.id;

            // Users can only view their own avatars
            if (userId !== requestingUserId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const avatars = await avatarService.getUserAvatars(userId);
            res.json(avatars);
        } catch (error) {
            console.error('Error fetching avatars:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch avatars',
            });
        }
    }
);

/**
 * @route   GET /api/avatars/active/:userId
 * @desc    Get active avatar for a user
 * @access  Public
 */
router.get(
    '/active/:userId',
    [param('userId').isMongoId().withMessage('Invalid user ID')],
    validateRequest,
    async (req: express.Request, res: express.Response) => {
        try {
            const { userId } = req.params;
            const avatar = await avatarService.getActiveAvatar(userId);

            if (!avatar) {
                return res.status(404).json({ error: 'No active avatar found' });
            }

            res.json(avatar);
        } catch (error) {
            console.error('Error fetching active avatar:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch active avatar',
            });
        }
    }
);

/**
 * @route   PUT /api/avatars/:avatarId/activate
 * @desc    Set an avatar as active
 * @access  Private
 */
router.put(
    '/:avatarId/activate',
    authenticate,
    [param('avatarId').isMongoId().withMessage('Invalid avatar ID')],
    validateRequest,
    async (req: express.Request, res: express.Response) => {
        try {
            const { avatarId } = req.params;
            const userId = (req as any).user.id;

            const avatar = await avatarService.setActiveAvatar(userId, avatarId);
            res.json(avatar);
        } catch (error) {
            console.error('Error activating avatar:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to activate avatar',
            });
        }
    }
);

/**
 * @route   DELETE /api/avatars/:avatarId
 * @desc    Delete an avatar
 * @access  Private
 */
router.delete(
    '/:avatarId',
    authenticate,
    [param('avatarId').isMongoId().withMessage('Invalid avatar ID')],
    validateRequest,
    async (req: express.Request, res: express.Response) => {
        try {
            const { avatarId } = req.params;
            const userId = (req as any).user.id;

            await avatarService.deleteAvatar(avatarId, userId);
            res.json({ success: true, message: 'Avatar deleted successfully' });
        } catch (error) {
            console.error('Error deleting avatar:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to delete avatar',
            });
        }
    }
);

export default router;



