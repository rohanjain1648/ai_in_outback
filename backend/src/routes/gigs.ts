import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { gigService } from '../services/gigService';
import { gigValidation } from '../validation/gigValidation';

const router = Router();

// Create a new gig job
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { error, value } = gigValidation.createGigJob.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gig job data',
                errors: error.details.map(detail => detail.message)
            });
        }

        const gigJob = await gigService.createGigJob(req.user!.id, value);
        return res.status(201).json({
            success: true,
            message: 'Gig job created successfully',
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error creating gig job:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to create gig job'
        });
    }
});

// Get a specific gig job by ID
router.get('/:jobId', async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const gigJob = await gigService.getGigJobById(jobId);

        if (!gigJob) {
            return res.status(404).json({
                success: false,
                message: 'Gig job not found'
            });
        }

        return res.json({
            success: true,
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error retrieving gig job:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve gig job'
        });
    }
});

// Update a gig job
router.put('/:jobId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { error, value } = gigValidation.updateGigJob.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid update data',
                errors: error.details.map(detail => detail.message)
            });
        }

        const gigJob = await gigService.updateGigJob(jobId, req.user!.id, value);
        if (!gigJob) {
            return res.status(404).json({
                success: false,
                message: 'Gig job not found'
            });
        }

        return res.json({
            success: true,
            message: 'Gig job updated successfully',
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error updating gig job:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update gig job'
        });
    }
});

// Delete a gig job
router.delete('/:jobId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        await gigService.deleteGigJob(jobId, req.user!.id);
        return res.json({
            success: true,
            message: 'Gig job deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting gig job:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to delete gig job'
        });
    }
});

// Search and filter gig jobs
router.get('/', async (req: Request, res: Response) => {
    try {
        const { error, value } = gigValidation.searchGigJobs.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid search parameters',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { limit, skip, ...filters } = value;
        const gigJobs = await gigService.searchGigJobs(filters, limit, skip);

        return res.json({
            success: true,
            data: gigJobs
        });
    } catch (error: any) {
        console.error('Error searching gig jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search gig jobs'
        });
    }
});

// Apply for a gig job
router.post('/:jobId/apply', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { error, value } = gigValidation.applyForJob.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application data',
                errors: error.details.map(detail => detail.message)
            });
        }

        const gigJob = await gigService.applyForJob(jobId, req.user!.id, {
            jobId,
            message: value.message
        });

        return res.json({
            success: true,
            message: 'Application submitted successfully',
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error applying for job:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to apply for job'
        });
    }
});

// Select a worker for a job
router.post('/:jobId/select-worker', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { error, value } = gigValidation.selectWorker.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid worker selection data',
                errors: error.details.map(detail => detail.message)
            });
        }

        const gigJob = await gigService.selectWorker(jobId, req.user!.id, value.workerId);
        return res.json({
            success: true,
            message: 'Worker selected successfully',
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error selecting worker:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to select worker'
        });
    }
});

// Mark job as completed
router.post('/:jobId/complete', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const gigJob = await gigService.completeJob(jobId, req.user!.id);
        return res.json({
            success: true,
            message: 'Job marked as completed',
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error completing job:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to complete job'
        });
    }
});

// Rate a completed job
router.post('/:jobId/rate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { error, value } = gigValidation.rateJob.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid rating data',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { rating, review, raterRole } = value;
        const gigJob = await gigService.rateJob(jobId, req.user!.id, { rating, review }, raterRole);

        return res.json({
            success: true,
            message: 'Job rated successfully',
            data: gigJob
        });
    } catch (error: any) {
        console.error('Error rating job:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to rate job'
        });
    }
});

// Get jobs posted by the authenticated user
router.get('/user/posted', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const status = req.query.status as string | undefined;
        const jobs = await gigService.getUserPostedJobs(req.user!.id, status);
        return res.json({
            success: true,
            data: jobs
        });
    } catch (error: any) {
        console.error('Error retrieving posted jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve posted jobs'
        });
    }
});

// Get jobs the authenticated user has applied to
router.get('/user/applications', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const jobs = await gigService.getUserApplications(req.user!.id);
        return res.json({
            success: true,
            data: jobs
        });
    } catch (error: any) {
        console.error('Error retrieving applications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve applications'
        });
    }
});

// Get jobs assigned to the authenticated user
router.get('/user/assigned', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const status = req.query.status as string | undefined;
        const jobs = await gigService.getUserAssignedJobs(req.user!.id, status);
        return res.json({
            success: true,
            data: jobs
        });
    } catch (error: any) {
        console.error('Error retrieving assigned jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve assigned jobs'
        });
    }
});

export default router;
