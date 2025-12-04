import { Types } from 'mongoose';
import { GigJob, IGigJob } from '../models/GigJob';
import { User } from '../models/User';
import { UserSkill } from '../models/UserSkill';
import { AppError } from '../utils/errors';

export interface CreateGigJobData {
    title: string;
    description: string;
    category: 'agriculture' | 'construction' | 'services' | 'transport' | 'other';
    requiredSkills: {
        skillId: string;
        minimumLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }[];
    location: {
        coordinates: [number, number];
        description: string;
        radius: number;
    };
    payment: {
        amount: number;
        type: 'fixed' | 'hourly' | 'negotiable';
        escrowRequired: boolean;
    };
    duration: {
        estimatedHours: number;
        startDate?: Date;
        deadline?: Date;
    };
}

export interface GigSearchFilters {
    category?: string;
    minPayment?: number;
    maxPayment?: number;
    paymentType?: string;
    maxDistance?: number;
    userLocation?: [number, number];
    skillIds?: string[];
    status?: string;
}

export interface JobApplication {
    jobId: string;
    message: string;
}

export interface JobRating {
    rating: number;
    review: string;
}

export class GigService {
    /**
     * Create a new gig job posting
     */
    async createGigJob(userId: string, jobData: CreateGigJobData): Promise<IGigJob> {
        try {
            // Verify user exists
            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Create the gig job
            const gigJob = new GigJob({
                ...jobData,
                postedBy: new Types.ObjectId(userId),
                location: {
                    type: 'Point',
                    ...jobData.location
                },
                payment: {
                    ...jobData.payment,
                    currency: 'AUD'
                },
                requiredSkills: jobData.requiredSkills.map(skill => ({
                    skillId: new Types.ObjectId(skill.skillId),
                    minimumLevel: skill.minimumLevel
                })),
                status: 'open',
                applicants: [],
                aiMatchingData: {
                    suggestedWorkers: [],
                    matchingFactors: {}
                }
            });

            await gigJob.save();

            // Run AI matching in background
            this.runAIMatching((gigJob._id as any).toString()).catch(err =>
                console.error('AI matching failed:', err)
            );

            return gigJob;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to create gig job', 500);
        }
    }

    /**
     * Get a gig job by ID
     */
    async getGigJobById(jobId: string): Promise<IGigJob | null> {
        return GigJob.findById(jobId)
            .populate('postedBy', 'profile email location')
            .populate('requiredSkills.skillId')
            .populate('applicants.userId', 'profile location')
            .populate('selectedWorker', 'profile location')
            .populate('aiMatchingData.suggestedWorkers', 'profile location');
    }

    /**
     * Update a gig job
     */
    async updateGigJob(jobId: string, userId: string, updates: Partial<CreateGigJobData>): Promise<IGigJob | null> {
        try {
            const job = await GigJob.findById(jobId);
            if (!job) {
                throw new AppError('Job not found', 404);
            }

            // Verify user is the poster
            if (job.postedBy.toString() !== userId) {
                throw new AppError('Unauthorized to update this job', 403);
            }

            // Only allow updates if job is still open
            if (job.status !== 'open') {
                throw new AppError('Cannot update job that is not open', 400);
            }

            // Update fields
            if (updates.title) job.title = updates.title;
            if (updates.description) job.description = updates.description;
            if (updates.category) job.category = updates.category;
            if (updates.payment) {
                job.payment = { ...job.payment, ...updates.payment };
            }
            if (updates.duration) {
                job.duration = { ...job.duration, ...updates.duration };
            }
            if (updates.location) {
                job.location = {
                    type: 'Point',
                    ...updates.location
                };
            }
            if (updates.requiredSkills) {
                job.requiredSkills = updates.requiredSkills.map(skill => ({
                    skillId: new Types.ObjectId(skill.skillId),
                    minimumLevel: skill.minimumLevel
                }));
            }

            await job.save();

            // Re-run AI matching if skills changed
            if (updates.requiredSkills) {
                this.runAIMatching(jobId).catch(err =>
                    console.error('AI matching failed:', err)
                );
            }

            return this.getGigJobById(jobId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to update gig job', 500);
        }
    }

    /**
     * Delete a gig job
     */
    async deleteGigJob(jobId: string, userId: string): Promise<void> {
        try {
            const job = await GigJob.findById(jobId);
            if (!job) {
                throw new AppError('Job not found', 404);
            }

            // Verify user is the poster
            if (job.postedBy.toString() !== userId) {
                throw new AppError('Unauthorized to delete this job', 403);
            }

            // Only allow deletion if job is open or cancelled
            if (job.status !== 'open' && job.status !== 'cancelled') {
                throw new AppError('Cannot delete job that is in progress or completed', 400);
            }

            await GigJob.findByIdAndDelete(jobId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to delete gig job', 500);
        }
    }

    /**
     * Search and filter gig jobs
     */
    async searchGigJobs(filters: GigSearchFilters, limit: number = 20, skip: number = 0): Promise<IGigJob[]> {
        try {
            const query: any = {};

            // Status filter (default to open jobs)
            query.status = filters.status || 'open';

            // Category filter
            if (filters.category) {
                query.category = filters.category;
            }

            // Payment filters
            if (filters.minPayment !== undefined || filters.maxPayment !== undefined) {
                query['payment.amount'] = {};
                if (filters.minPayment !== undefined) {
                    query['payment.amount'].$gte = filters.minPayment;
                }
                if (filters.maxPayment !== undefined) {
                    query['payment.amount'].$lte = filters.maxPayment;
                }
            }

            if (filters.paymentType) {
                query['payment.type'] = filters.paymentType;
            }

            // Skill filter
            if (filters.skillIds && filters.skillIds.length > 0) {
                query['requiredSkills.skillId'] = {
                    $in: filters.skillIds.map(id => new Types.ObjectId(id))
                };
            }

            // Location-based search
            let jobs: IGigJob[];
            if (filters.userLocation && filters.maxDistance) {
                jobs = await GigJob.find({
                    ...query,
                    'location.coordinates': {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: filters.userLocation
                            },
                            $maxDistance: filters.maxDistance * 1000 // Convert km to meters
                        }
                    }
                })
                    .populate('postedBy', 'profile location')
                    .populate('requiredSkills.skillId')
                    .limit(limit)
                    .skip(skip)
                    .sort({ postedAt: -1 });
            } else {
                jobs = await GigJob.find(query)
                    .populate('postedBy', 'profile location')
                    .populate('requiredSkills.skillId')
                    .limit(limit)
                    .skip(skip)
                    .sort({ postedAt: -1 });
            }

            return jobs;
        } catch (error) {
            throw new AppError('Failed to search gig jobs', 500);
        }
    }

    /**
     * Apply for a gig job
     */
    async applyForJob(jobId: string, userId: string, application: JobApplication): Promise<IGigJob | null> {
        try {
            const job = await GigJob.findById(jobId);
            if (!job) {
                throw new AppError('Job not found', 404);
            }

            // Check if job is open
            if (job.status !== 'open') {
                throw new AppError('Job is not accepting applications', 400);
            }

            // Check if user is the poster
            if (job.postedBy.toString() === userId) {
                throw new AppError('Cannot apply to your own job', 400);
            }

            // Check if already applied
            const existingApplication = job.applicants.find(
                app => app.userId.toString() === userId
            );
            if (existingApplication) {
                throw new AppError('Already applied to this job', 400);
            }

            // Calculate match score
            const matchScore = await this.calculateMatchScore(jobId, userId);

            // Add application
            job.applicants.push({
                userId: new Types.ObjectId(userId),
                appliedAt: new Date(),
                message: application.message,
                matchScore
            });

            await job.save();

            return this.getGigJobById(jobId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to apply for job', 500);
        }
    }

    /**
     * Select a worker for a job
     */
    async selectWorker(jobId: string, posterId: string, workerId: string): Promise<IGigJob | null> {
        try {
            const job = await GigJob.findById(jobId);
            if (!job) {
                throw new AppError('Job not found', 404);
            }

            // Verify user is the poster
            if (job.postedBy.toString() !== posterId) {
                throw new AppError('Unauthorized to select worker', 403);
            }

            // Check if job is open
            if (job.status !== 'open') {
                throw new AppError('Job is not open', 400);
            }

            // Verify worker has applied
            const application = job.applicants.find(
                app => app.userId.toString() === workerId
            );
            if (!application) {
                throw new AppError('Worker has not applied to this job', 400);
            }

            // Update job
            job.selectedWorker = new Types.ObjectId(workerId);
            job.status = 'in_progress';
            job.acceptedAt = new Date();

            await job.save();

            return this.getGigJobById(jobId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to select worker', 500);
        }
    }

    /**
     * Mark job as completed
     */
    async completeJob(jobId: string, userId: string): Promise<IGigJob | null> {
        try {
            const job = await GigJob.findById(jobId);
            if (!job) {
                throw new AppError('Job not found', 404);
            }

            // Verify user is the poster or selected worker
            const isPoster = job.postedBy.toString() === userId;
            const isWorker = job.selectedWorker?.toString() === userId;

            if (!isPoster && !isWorker) {
                throw new AppError('Unauthorized to complete this job', 403);
            }

            // Check if job is in progress
            if (job.status !== 'in_progress') {
                throw new AppError('Job is not in progress', 400);
            }

            // Update job
            job.status = 'completed';
            job.completedAt = new Date();

            await job.save();

            return this.getGigJobById(jobId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to complete job', 500);
        }
    }

    /**
     * Rate a job (mutual rating)
     */
    async rateJob(jobId: string, userId: string, rating: JobRating, raterRole: 'poster' | 'worker'): Promise<IGigJob | null> {
        try {
            const job = await GigJob.findById(jobId);
            if (!job) {
                throw new AppError('Job not found', 404);
            }

            // Check if job is completed
            if (job.status !== 'completed') {
                throw new AppError('Can only rate completed jobs', 400);
            }

            // Verify user is authorized to rate
            const isPoster = job.postedBy.toString() === userId;
            const isWorker = job.selectedWorker?.toString() === userId;

            if (!isPoster && !isWorker) {
                throw new AppError('Unauthorized to rate this job', 403);
            }

            // Initialize ratings if not exists
            if (!job.ratings) {
                job.ratings = {
                    posterRating: 0,
                    posterReview: '',
                    workerRating: 0,
                    workerReview: ''
                };
            }

            // Update appropriate rating
            if (raterRole === 'poster' && isPoster) {
                job.ratings.posterRating = rating.rating;
                job.ratings.posterReview = rating.review;
            } else if (raterRole === 'worker' && isWorker) {
                job.ratings.workerRating = rating.rating;
                job.ratings.workerReview = rating.review;
            } else {
                throw new AppError('Invalid rater role', 400);
            }

            await job.save();

            return this.getGigJobById(jobId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to rate job', 500);
        }
    }

    /**
     * Get jobs posted by a user
     */
    async getUserPostedJobs(userId: string, status?: string): Promise<IGigJob[]> {
        const query: any = { postedBy: new Types.ObjectId(userId) };
        if (status) {
            query.status = status;
        }

        return GigJob.find(query)
            .populate('requiredSkills.skillId')
            .populate('applicants.userId', 'profile location')
            .populate('selectedWorker', 'profile location')
            .sort({ postedAt: -1 });
    }

    /**
     * Get jobs a user has applied to
     */
    async getUserApplications(userId: string): Promise<IGigJob[]> {
        return GigJob.find({
            'applicants.userId': new Types.ObjectId(userId)
        })
            .populate('postedBy', 'profile location')
            .populate('requiredSkills.skillId')
            .sort({ postedAt: -1 });
    }

    /**
     * Get jobs assigned to a user
     */
    async getUserAssignedJobs(userId: string, status?: string): Promise<IGigJob[]> {
        const query: any = { selectedWorker: new Types.ObjectId(userId) };
        if (status) {
            query.status = status;
        }

        return GigJob.find(query)
            .populate('postedBy', 'profile location')
            .populate('requiredSkills.skillId')
            .sort({ acceptedAt: -1 });
    }

    /**
     * AI-powered job-to-worker matching
     */
    private async runAIMatching(jobId: string): Promise<void> {
        try {
            const job = await GigJob.findById(jobId).populate('requiredSkills.skillId');
            if (!job) return;

            // Get all users with matching skills
            const requiredSkillIds = job.requiredSkills.map(rs => rs.skillId);

            const matchingUsers = await UserSkill.find({
                skillId: { $in: requiredSkillIds },
                canTeach: true,
                availableForTeaching: true
            })
                .populate('userId')
                .limit(50);

            // Calculate match scores for each user
            const scoredMatches = await Promise.all(
                matchingUsers.map(async (userSkill: any) => {
                    const userId = userSkill.userId._id.toString();
                    const score = await this.calculateMatchScore(jobId, userId);
                    return { userId, score };
                })
            );

            // Sort by score and get top matches
            const topMatches = scoredMatches
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .filter(match => match.score >= 60); // Minimum 60% match

            // Update job with suggested workers
            job.aiMatchingData.suggestedWorkers = topMatches.map(
                match => new Types.ObjectId(match.userId)
            );
            job.aiMatchingData.matchingFactors = {
                totalCandidates: matchingUsers.length,
                topMatchScores: topMatches.map(m => m.score),
                lastUpdated: new Date()
            };

            await job.save();
        } catch (error) {
            console.error('AI matching error:', error);
        }
    }

    /**
     * Calculate match score between a job and a user
     */
    private async calculateMatchScore(jobId: string, userId: string): Promise<number> {
        try {
            const job = await GigJob.findById(jobId).populate('requiredSkills.skillId');
            if (!job) return 0;

            const userSkills = await UserSkill.find({
                userId: new Types.ObjectId(userId)
            }).populate('skillId');

            if (userSkills.length === 0) return 0;

            // Calculate skill match percentage
            let skillMatchScore = 0;
            let totalRequiredSkills = job.requiredSkills.length;

            for (const requiredSkill of job.requiredSkills) {
                const userSkill = userSkills.find(
                    us => us.skillId._id.toString() === requiredSkill.skillId._id.toString()
                );

                if (userSkill) {
                    // Skill level scoring
                    const levelScores = {
                        'beginner': 1,
                        'intermediate': 2,
                        'advanced': 3,
                        'expert': 4
                    };

                    const requiredLevel = levelScores[requiredSkill.minimumLevel];
                    const userLevel = levelScores[userSkill.proficiencyLevel as keyof typeof levelScores] || 0;

                    if (userLevel >= requiredLevel) {
                        skillMatchScore += 100 / totalRequiredSkills;
                    } else {
                        // Partial credit for lower skill level
                        skillMatchScore += (userLevel / requiredLevel) * (100 / totalRequiredSkills) * 0.5;
                    }
                }
            }

            // Calculate location proximity score (if user has location)
            const user = await User.findById(userId);
            let locationScore = 0;

            if (user?.location?.coordinates && job.location?.coordinates) {
                const distance = this.calculateDistance(
                    user.location.coordinates[1],
                    user.location.coordinates[0],
                    job.location.coordinates[1],
                    job.location.coordinates[0]
                );

                if (distance <= job.location.radius) {
                    locationScore = 100 * (1 - distance / job.location.radius);
                }
            }

            // Weighted average: 70% skills, 30% location
            const finalScore = (skillMatchScore * 0.7) + (locationScore * 0.3);

            return Math.round(finalScore);
        } catch (error) {
            console.error('Match score calculation error:', error);
            return 0;
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

export const gigService = new GigService();
