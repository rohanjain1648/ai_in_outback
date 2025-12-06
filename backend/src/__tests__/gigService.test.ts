import { gigService } from '../services/gigService';
import { GigJob } from '../models/GigJob';
import { User } from '../models/User';
import { UserSkill } from '../models/UserSkill';
import { Types } from 'mongoose';

// Mock the models
jest.mock('../models/GigJob');
jest.mock('../models/User');
jest.mock('../models/UserSkill');

const MockedGigJob = GigJob as jest.Mocked<typeof GigJob>;
const MockedUser = User as jest.Mocked<typeof User>;
const MockedUserSkill = UserSkill as jest.Mocked<typeof UserSkill>;

describe('GigService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createGigJob', () => {
        it('should create a new gig job', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const jobData = {
                title: 'Farm Help Needed',
                description: 'Need help with harvest',
                category: 'agriculture' as const,
                requiredSkills: [{
                    skillId: '507f1f77bcf86cd799439012',
                    minimumLevel: 'intermediate' as const
                }],
                location: {
                    coordinates: [151.2093, -33.8688] as [number, number],
                    description: 'Sydney, NSW',
                    radius: 50
                },
                payment: {
                    amount: 150,
                    type: 'fixed' as const,
                    escrowRequired: false
                },
                duration: {
                    estimatedHours: 8,
                    startDate: new Date('2024-01-15'),
                    deadline: new Date('2024-01-20')
                }
            };

            const mockUser = {
                _id: userId,
                email: 'test@example.com'
            };

            const mockGigJob: any = {
                _id: 'job123',
                ...jobData,
                postedBy: userId,
                status: 'open',
                applicants: [],
                save: jest.fn().mockResolvedValue(true)
            };

            MockedUser.findById = jest.fn().mockResolvedValue(mockUser as any);
            (MockedGigJob as any) = jest.fn(() => mockGigJob);

            const result = await gigService.createGigJob(userId, jobData);

            expect(MockedUser.findById).toHaveBeenCalledWith(userId);
            expect(result).toBeDefined();
        });

        it('should throw error if user not found', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const jobData = {
                title: 'Farm Help Needed',
                description: 'Need help with harvest',
                category: 'agriculture' as const,
                requiredSkills: [{
                    skillId: '507f1f77bcf86cd799439012',
                    minimumLevel: 'intermediate' as const
                }],
                location: {
                    coordinates: [151.2093, -33.8688] as [number, number],
                    description: 'Sydney, NSW',
                    radius: 50
                },
                payment: {
                    amount: 150,
                    type: 'fixed' as const,
                    escrowRequired: false
                },
                duration: {
                    estimatedHours: 8
                }
            };

            MockedUser.findById = jest.fn().mockResolvedValue(null);

            await expect(gigService.createGigJob(userId, jobData)).rejects.toThrow('User not found');
        });
    });

    describe('searchGigJobs', () => {
        it('should search gig jobs with filters', async () => {
            const filters = {
                category: 'agriculture',
                status: 'open'
            };

            const mockJobs = [
                {
                    _id: 'job1',
                    title: 'Farm Help',
                    category: 'agriculture',
                    status: 'open'
                },
                {
                    _id: 'job2',
                    title: 'Harvest Work',
                    category: 'agriculture',
                    status: 'open'
                }
            ];

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockJobs)
            };

            MockedGigJob.find = jest.fn().mockReturnValue(mockQuery as any);

            const result = await gigService.searchGigJobs(filters, 20, 0);

            expect(MockedGigJob.find).toHaveBeenCalled();
            expect(result).toEqual(mockJobs);
        });
    });

    describe('applyForJob', () => {
        it('should allow user to apply for a job', async () => {
            const jobId = '507f1f77bcf86cd799439011';
            const userId = '507f1f77bcf86cd799439012';
            const application = {
                jobId,
                message: 'I am interested in this job'
            };

            const mockJob: any = {
                _id: jobId,
                status: 'open',
                postedBy: new Types.ObjectId('507f1f77bcf86cd799439013'),
                applicants: [],
                save: jest.fn().mockResolvedValue(true)
            };

            MockedGigJob.findById = jest.fn().mockResolvedValue(mockJob);
            MockedUserSkill.find = jest.fn().mockResolvedValue([]);

            const result = await gigService.applyForJob(jobId, userId, application);

            expect(mockJob.applicants.length).toBe(1);
            expect(mockJob.applicants[0].userId.toString()).toBe(userId);
            expect(mockJob.save).toHaveBeenCalled();
        });

        it('should not allow user to apply to their own job', async () => {
            const jobId = '507f1f77bcf86cd799439011';
            const userId = '507f1f77bcf86cd799439012';
            const application = {
                jobId,
                message: 'I am interested in this job'
            };

            const mockJob: any = {
                _id: jobId,
                status: 'open',
                postedBy: new Types.ObjectId(userId),
                applicants: []
            };

            MockedGigJob.findById = jest.fn().mockResolvedValue(mockJob);

            await expect(gigService.applyForJob(jobId, userId, application)).rejects.toThrow('Cannot apply to your own job');
        });
    });

    describe('selectWorker', () => {
        it('should allow poster to select a worker', async () => {
            const jobId = '507f1f77bcf86cd799439011';
            const posterId = '507f1f77bcf86cd799439012';
            const workerId = '507f1f77bcf86cd799439013';

            const mockJob: any = {
                _id: jobId,
                status: 'open',
                postedBy: new Types.ObjectId(posterId),
                applicants: [{
                    userId: new Types.ObjectId(workerId),
                    appliedAt: new Date(),
                    message: 'I want this job',
                    matchScore: 85
                }],
                selectedWorker: undefined,
                save: jest.fn().mockResolvedValue(true)
            };

            MockedGigJob.findById = jest.fn().mockResolvedValue(mockJob);

            const result = await gigService.selectWorker(jobId, posterId, workerId);

            expect(mockJob.status).toBe('in_progress');
            expect(mockJob.selectedWorker.toString()).toBe(workerId);
            expect(mockJob.save).toHaveBeenCalled();
        });
    });

    describe('completeJob', () => {
        it('should allow poster or worker to complete a job', async () => {
            const jobId = '507f1f77bcf86cd799439011';
            const posterId = '507f1f77bcf86cd799439012';
            const workerId = '507f1f77bcf86cd799439013';

            const mockJob: any = {
                _id: jobId,
                status: 'in_progress',
                postedBy: new Types.ObjectId(posterId),
                selectedWorker: new Types.ObjectId(workerId),
                completedAt: undefined,
                save: jest.fn().mockResolvedValue(true)
            };

            MockedGigJob.findById = jest.fn().mockResolvedValue(mockJob);

            const result = await gigService.completeJob(jobId, posterId);

            expect(mockJob.status).toBe('completed');
            expect(mockJob.completedAt).toBeDefined();
            expect(mockJob.save).toHaveBeenCalled();
        });
    });

    describe('rateJob', () => {
        it('should allow poster to rate worker', async () => {
            const jobId = '507f1f77bcf86cd799439011';
            const posterId = '507f1f77bcf86cd799439012';
            const workerId = '507f1f77bcf86cd799439013';

            const mockJob: any = {
                _id: jobId,
                status: 'completed',
                postedBy: new Types.ObjectId(posterId),
                selectedWorker: new Types.ObjectId(workerId),
                ratings: undefined,
                save: jest.fn().mockResolvedValue(true)
            };

            MockedGigJob.findById = jest.fn().mockResolvedValue(mockJob);

            const rating = {
                rating: 5,
                review: 'Excellent work!'
            };

            const result = await gigService.rateJob(jobId, posterId, rating, 'poster');

            expect(mockJob.ratings).toBeDefined();
            expect(mockJob.ratings!.posterRating).toBe(5);
            expect(mockJob.ratings!.posterReview).toBe('Excellent work!');
            expect(mockJob.save).toHaveBeenCalled();
        });
    });
});
