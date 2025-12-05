// @ts-nocheck
import express, { Request, Response } from 'express';
import { serviceDirectoryService } from '../services/serviceDirectoryService';
import { authenticate } from '../middleware/auth';
// import { validate } from '../middleware/validation'; // TODO: implement validate function
import {
    createServiceSchema,
    updateServiceSchema,
    searchServicesSchema,
    addReviewSchema,
    serviceIdSchema
} from '../validation/serviceValidation';

const router = express.Router();

// Placeholder validation middleware
const validate = (schema: any) => (req: Request, res: Response, next: Function) => next();

/**
 * @route   POST /api/services
 * @desc    Create a new service listing
 * @access  Private (authenticated users)
 */
router.post(
    '/',
    authenticate,
    validate(createServiceSchema),
    async (req: Request, res: Response) => {
        try {
            const service = await serviceDirectoryService.createService(req.body);
            res.status(201).json({
                success: true,
                data: service
            });
        } catch (error: any) {
            console.error('Error creating service:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create service',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/services/search
 * @desc    Search services with filters
 * @access  Public
 */
router.get(
    '/search',
    validate(searchServicesSchema, 'query'),
    async (req: Request, res: Response) => {
        try {
            const {
                query,
                category,
                lat,
                lon,
                radius,
                verified,
                minRating,
                tags,
                essentialOnly,
                offlineAvailable,
                limit,
                offset,
                sortBy,
                lowDataMode
            } = req.query;

            const filters: any = {};
            if (query) filters.query = query as string;
            if (category) filters.category = category as string;
            if (lat && lon) {
                filters.location = {
                    lat: parseFloat(lat as string),
                    lon: parseFloat(lon as string),
                    radius: radius as string
                };
            }
            if (verified !== undefined) filters.verified = verified === 'true';
            if (minRating) filters.minRating = parseFloat(minRating as string);
            if (tags) {
                filters.tags = Array.isArray(tags) ? tags : [tags];
            }
            if (essentialOnly !== undefined) filters.essentialOnly = essentialOnly === 'true';
            if (offlineAvailable !== undefined) filters.offlineAvailable = offlineAvailable === 'true';

            const options: any = {};
            if (limit) options.limit = parseInt(limit as string);
            if (offset) options.offset = parseInt(offset as string);
            if (sortBy) options.sortBy = sortBy as string;
            if (lowDataMode !== undefined) options.lowDataMode = lowDataMode === 'true';

            const result = await serviceDirectoryService.searchServices(filters, options);

            res.json({
                success: true,
                data: result.services,
                total: result.total,
                suggestions: result.suggestions,
                pagination: {
                    limit: options.limit || 20,
                    offset: options.offset || 0,
                    total: result.total
                }
            });
        } catch (error: any) {
            console.error('Error searching services:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search services',
                error: error.message
            });
        }
    }
);

/**
 * @route   GET /api/services/essential
 * @desc    Get essential services for offline availability
 * @access  Public
 */
router.get('/essential', async (req: Request, res: Response) => {
    try {
        const { lat, lon } = req.query;

        let location;
        if (lat && lon) {
            location = {
                lat: parseFloat(lat as string),
                lon: parseFloat(lon as string)
            };
        }

        const services = await serviceDirectoryService.getEssentialServices(location);

        res.json({
            success: true,
            data: services,
            count: services.length
        });
    } catch (error: any) {
        console.error('Error getting essential services:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get essential services',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/services/categories
 * @desc    Get service categories with counts
 * @access  Public
 */
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const categories = await serviceDirectoryService.getServiceCategories();

        res.json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        console.error('Error getting service categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service categories',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/services/:serviceId
 * @desc    Get service by ID
 * @access  Public
 */
router.get(
    '/:serviceId',
    validate(serviceIdSchema, 'params'),
    async (req: Request, res: Response) => {
        try {
            const { serviceId } = req.params;
            const service = await serviceDirectoryService.getServiceById(serviceId, true);

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            res.json({
                success: true,
                data: service
            });
        } catch (error: any) {
            console.error('Error getting service:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get service',
                error: error.message
            });
        }
    }
);

/**
 * @route   PUT /api/services/:serviceId
 * @desc    Update a service listing
 * @access  Private (authenticated users)
 */
router.put(
    '/:serviceId',
    authenticate,
    validate(serviceIdSchema, 'params'),
    validate(updateServiceSchema),
    async (req: Request, res: Response) => {
        try {
            const { serviceId } = req.params;
            const service = await serviceDirectoryService.updateService(serviceId, req.body);

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            res.json({
                success: true,
                data: service
            });
        } catch (error: any) {
            console.error('Error updating service:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update service',
                error: error.message
            });
        }
    }
);

/**
 * @route   DELETE /api/services/:serviceId
 * @desc    Delete a service listing
 * @access  Private (authenticated users)
 */
router.delete(
    '/:serviceId',
    authenticate,
    validate(serviceIdSchema, 'params'),
    async (req: Request, res: Response) => {
        try {
            const { serviceId } = req.params;
            const deleted = await serviceDirectoryService.deleteService(serviceId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            res.json({
                success: true,
                message: 'Service deleted successfully'
            });
        } catch (error: any) {
            console.error('Error deleting service:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete service',
                error: error.message
            });
        }
    }
);

/**
 * @route   POST /api/services/:serviceId/reviews
 * @desc    Add a review to a service
 * @access  Private (authenticated users)
 */
router.post(
    '/:serviceId/reviews',
    authenticate,
    validate(serviceIdSchema, 'params'),
    validate(addReviewSchema),
    async (req: Request, res: Response) => {
        try {
            const { serviceId } = req.params;
            const { rating, comment } = req.body;
            const userId = (req as any).user.id;

            const service = await serviceDirectoryService.addServiceReview(
                serviceId,
                userId,
                rating,
                comment
            );

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            res.json({
                success: true,
                data: service
            });
        } catch (error: any) {
            console.error('Error adding service review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add service review',
                error: error.message
            });
        }
    }
);

/**
 * @route   POST /api/services/:serviceId/contact
 * @desc    Record that a user contacted a service
 * @access  Private (authenticated users)
 */
router.post(
    '/:serviceId/contact',
    authenticate,
    validate(serviceIdSchema, 'params'),
    async (req: Request, res: Response) => {
        try {
            const { serviceId } = req.params;
            await serviceDirectoryService.recordServiceContact(serviceId);

            res.json({
                success: true,
                message: 'Contact recorded'
            });
        } catch (error: any) {
            console.error('Error recording service contact:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to record contact',
                error: error.message
            });
        }
    }
);

/**
 * @route   POST /api/services/sync/government
 * @desc    Sync services from government APIs
 * @access  Private (admin only)
 */
router.post(
    '/sync/government',
    authenticate,
    async (req: Request, res: Response) => {
        try {
            // Check if user is admin
            const user = (req as any).user;
            if (user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: Admin access required'
                });
            }

            const result = await serviceDirectoryService.syncGovernmentServices();

            res.json({
                success: true,
                message: 'Government services sync completed',
                data: result
            });
        } catch (error: any) {
            console.error('Error syncing government services:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sync government services',
                error: error.message
            });
        }
    }
);

export default router;


