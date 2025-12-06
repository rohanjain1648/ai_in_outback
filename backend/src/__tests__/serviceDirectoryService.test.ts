import { serviceDirectoryService } from '../services/serviceDirectoryService';
import { ServiceListing } from '../models/ServiceListing';
import { Types } from 'mongoose';

// Mock the ServiceListing model
jest.mock('../models/ServiceListing');

const MockedServiceListing = ServiceListing as jest.Mocked<typeof ServiceListing>;

describe('ServiceDirectoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createService', () => {
        it('should create a new service listing', async () => {
            const serviceData = {
                name: 'Rural Health Clinic',
                category: 'health' as const,
                description: 'Primary healthcare services for rural communities',
                location: {
                    type: 'Point' as const,
                    coordinates: [151.2093, -33.8688] as [number, number],
                    address: '123 Main St, Sydney NSW 2000',
                    region: 'Sydney'
                },
                contact: {
                    phone: '02 1234 5678',
                    email: 'info@ruralhealthclinic.com.au',
                    website: 'https://ruralhealthclinic.com.au',
                    hours: 'Mon-Fri 9am-5pm'
                },
                services: ['General Practice', 'Emergency Care', 'Vaccinations'],
                isVerified: true,
                source: 'manual' as const,
                offlineAvailable: true,
                isEssential: true,
                tags: ['health', 'clinic', 'emergency']
            };

            const mockService: any = {
                _id: 'service123',
                ...serviceData,
                save: jest.fn().mockResolvedValue(true)
            };

            // Mock the ServiceListing constructor
            jest.spyOn(ServiceListing.prototype, 'save').mockResolvedValue(mockService);

            const result = await serviceDirectoryService.createService(serviceData);

            expect(result).toBeDefined();
        });
    });

    describe('searchServices', () => {
        it('should search services with text query', async () => {
            const filters = {
                query: 'health clinic',
                category: 'health'
            };

            const mockServices = [
                {
                    _id: 'service1',
                    name: 'Rural Health Clinic',
                    category: 'health',
                    isActive: true
                },
                {
                    _id: 'service2',
                    name: 'Community Health Center',
                    category: 'health',
                    isActive: true
                }
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockServices)
            };

            MockedServiceListing.find = jest.fn().mockReturnValue(mockQuery as any);
            MockedServiceListing.countDocuments = jest.fn().mockResolvedValue(2);

            const result = await serviceDirectoryService.searchServices(filters);

            expect(MockedServiceListing.find).toHaveBeenCalled();
            expect(result.services).toEqual(mockServices);
            expect(result.total).toBe(2);
        });

        it('should search services with location filter', async () => {
            const filters = {
                location: {
                    lat: -33.8688,
                    lon: 151.2093,
                    radius: '50km'
                }
            };

            const mockServices = [
                {
                    _id: 'service1',
                    name: 'Nearby Clinic',
                    location: {
                        coordinates: [151.2093, -33.8688]
                    }
                }
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockServices)
            };

            MockedServiceListing.find = jest.fn().mockReturnValue(mockQuery as any);
            MockedServiceListing.countDocuments = jest.fn().mockResolvedValue(1);

            const result = await serviceDirectoryService.searchServices(filters);

            expect(result.services.length).toBeGreaterThan(0);
        });

        it('should filter essential services only', async () => {
            const filters = {
                essentialOnly: true
            };

            const mockServices = [
                {
                    _id: 'service1',
                    name: 'Emergency Services',
                    isEssential: true
                }
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockServices)
            };

            MockedServiceListing.find = jest.fn().mockReturnValue(mockQuery as any);
            MockedServiceListing.countDocuments = jest.fn().mockResolvedValue(1);

            const result = await serviceDirectoryService.searchServices(filters);

            expect(result.services).toEqual(mockServices);
        });
    });

    describe('getServiceById', () => {
        it('should get service by ID and increment view count', async () => {
            const serviceId = '507f1f77bcf86cd799439011';

            const mockService: any = {
                _id: serviceId,
                name: 'Test Service',
                category: 'health'
            };

            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockService)
            };

            MockedServiceListing.findById = jest.fn().mockReturnValue(mockQuery as any);
            MockedServiceListing.findByIdAndUpdate = jest.fn().mockResolvedValue(mockService);

            const result = await serviceDirectoryService.getServiceById(serviceId, true);

            expect(MockedServiceListing.findById).toHaveBeenCalledWith(serviceId);
            expect(MockedServiceListing.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockService);
        });
    });

    describe('addServiceReview', () => {
        it('should add a new review to a service', async () => {
            const serviceId = '507f1f77bcf86cd799439011';
            const userId = '507f1f77bcf86cd799439012';
            const rating = 5;
            const comment = 'Excellent service!';

            const mockService: any = {
                _id: serviceId,
                reviews: [],
                ratings: {
                    average: 0,
                    count: 0
                },
                save: jest.fn().mockResolvedValue(true)
            };

            MockedServiceListing.findById = jest.fn().mockResolvedValue(mockService);

            const result = await serviceDirectoryService.addServiceReview(
                serviceId,
                userId,
                rating,
                comment
            );

            expect(mockService.reviews.length).toBe(1);
            expect(mockService.reviews[0].rating).toBe(5);
            expect(mockService.ratings.average).toBe(5);
            expect(mockService.ratings.count).toBe(1);
            expect(mockService.save).toHaveBeenCalled();
        });

        it('should update existing review from same user', async () => {
            const serviceId = '507f1f77bcf86cd799439011';
            const userId = '507f1f77bcf86cd799439012';
            const rating = 4;
            const comment = 'Updated review';

            const mockService: any = {
                _id: serviceId,
                reviews: [{
                    user: new Types.ObjectId(userId),
                    rating: 3,
                    comment: 'Old review',
                    date: new Date(),
                    helpful: 5
                }],
                ratings: {
                    average: 3,
                    count: 1
                },
                save: jest.fn().mockResolvedValue(true)
            };

            MockedServiceListing.findById = jest.fn().mockResolvedValue(mockService);

            const result = await serviceDirectoryService.addServiceReview(
                serviceId,
                userId,
                rating,
                comment
            );

            expect(mockService.reviews.length).toBe(1);
            expect(mockService.reviews[0].rating).toBe(4);
            expect(mockService.reviews[0].comment).toBe('Updated review');
            expect(mockService.ratings.average).toBe(4);
            expect(mockService.save).toHaveBeenCalled();
        });
    });

    describe('getEssentialServices', () => {
        it('should get essential services for offline availability', async () => {
            const mockServices = [
                {
                    _id: 'service1',
                    name: 'Emergency Services',
                    isEssential: true,
                    offlineAvailable: true
                },
                {
                    _id: 'service2',
                    name: 'Health Clinic',
                    isEssential: true,
                    offlineAvailable: true
                }
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockServices)
            };

            MockedServiceListing.find = jest.fn().mockReturnValue(mockQuery as any);

            const result = await serviceDirectoryService.getEssentialServices();

            expect(MockedServiceListing.find).toHaveBeenCalled();
            expect(result).toEqual(mockServices);
        });

        it('should get essential services near a location', async () => {
            const location = {
                lat: -33.8688,
                lon: 151.2093
            };

            const mockServices = [
                {
                    _id: 'service1',
                    name: 'Nearby Emergency Services',
                    isEssential: true,
                    offlineAvailable: true
                }
            ];

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockServices)
            };

            MockedServiceListing.find = jest.fn().mockReturnValue(mockQuery as any);

            const result = await serviceDirectoryService.getEssentialServices(location);

            expect(result).toEqual(mockServices);
        });
    });

    describe('recordServiceContact', () => {
        it('should increment contact count when service is contacted', async () => {
            const serviceId = '507f1f77bcf86cd799439011';

            MockedServiceListing.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            await serviceDirectoryService.recordServiceContact(serviceId);

            expect(MockedServiceListing.findByIdAndUpdate).toHaveBeenCalledWith(
                serviceId,
                expect.objectContaining({
                    $inc: { 'metadata.contactCount': 1 }
                })
            );
        });
    });

    describe('getServiceCategories', () => {
        it('should return service categories with counts', async () => {
            const mockCategories = [
                {
                    _id: 'health',
                    count: 15,
                    essentialCount: 10,
                    subcategories: ['clinic', 'hospital']
                },
                {
                    _id: 'transport',
                    count: 8,
                    essentialCount: 3,
                    subcategories: ['bus', 'taxi']
                }
            ];

            MockedServiceListing.aggregate = jest.fn().mockResolvedValue(mockCategories);

            const result = await serviceDirectoryService.getServiceCategories();

            expect(MockedServiceListing.aggregate).toHaveBeenCalled();
            expect(result.length).toBe(2);
            expect(result[0].category).toBe('health');
            expect(result[0].count).toBe(15);
        });
    });

    describe('updateService', () => {
        it('should update an existing service', async () => {
            const serviceId = '507f1f77bcf86cd799439011';
            const updateData = {
                name: 'Updated Service Name',
                description: 'Updated description'
            };

            const mockService: any = {
                _id: serviceId,
                ...updateData
            };

            MockedServiceListing.findByIdAndUpdate = jest.fn().mockResolvedValue(mockService);

            const result = await serviceDirectoryService.updateService(serviceId, updateData);

            expect(MockedServiceListing.findByIdAndUpdate).toHaveBeenCalledWith(
                serviceId,
                expect.objectContaining(updateData),
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockService);
        });
    });

    describe('deleteService', () => {
        it('should delete a service', async () => {
            const serviceId = '507f1f77bcf86cd799439011';

            MockedServiceListing.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: serviceId });

            const result = await serviceDirectoryService.deleteService(serviceId);

            expect(MockedServiceListing.findByIdAndDelete).toHaveBeenCalledWith(serviceId);
            expect(result).toBe(true);
        });

        it('should return false if service not found', async () => {
            const serviceId = '507f1f77bcf86cd799439011';

            MockedServiceListing.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            const result = await serviceDirectoryService.deleteService(serviceId);

            expect(result).toBe(false);
        });
    });
});
