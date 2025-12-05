import { blockchainService } from '../services/blockchainService';
import { BlockchainCredential } from '../models/BlockchainCredential';
import mongoose from 'mongoose';

// Mock the BlockchainCredential model
jest.mock('../models/BlockchainCredential');

describe('BlockchainService', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockCredentialId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('issueCredential', () => {
        it('should create a new credential with pending status', async () => {
            const mockMetadata = {
                title: 'Test Credential',
                description: 'This is a test credential',
                attributes: [
                    { trait_type: 'skill', value: 'farming' },
                ],
            };

            const mockCredential = {
                _id: mockCredentialId,
                userId: mockUserId,
                credentialType: 'skill_verification',
                metadata: mockMetadata,
                status: 'pending',
                save: jest.fn().mockResolvedValue(true),
            };

            (BlockchainCredential as any).mockImplementation(() => mockCredential);

            const result = await blockchainService.issueCredential(
                mockUserId,
                'skill_verification',
                mockMetadata
            );

            expect(result).toBeDefined();
            expect(mockCredential.save).toHaveBeenCalled();
        });

        it('should handle different credential types', async () => {
            const credentialTypes = [
                'skill_verification',
                'job_completion',
                'community_contribution',
                'emergency_response',
            ];

            for (const type of credentialTypes) {
                const mockMetadata = {
                    title: `${type} Credential`,
                    description: `Test ${type}`,
                    attributes: [{ trait_type: 'type', value: type }],
                };

                const mockCredential = {
                    _id: new mongoose.Types.ObjectId().toString(),
                    userId: mockUserId,
                    credentialType: type,
                    metadata: mockMetadata,
                    status: 'pending',
                    save: jest.fn().mockResolvedValue(true),
                };

                (BlockchainCredential as any).mockImplementation(() => mockCredential);

                const result = await blockchainService.issueCredential(
                    mockUserId,
                    type as any,
                    mockMetadata
                );

                expect(result.credentialType).toBe(type);
            }
        });
    });

    describe('getUserCredentials', () => {
        it('should return all credentials for a user', async () => {
            const mockCredentials = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    userId: mockUserId,
                    credentialType: 'skill_verification',
                    status: 'minted',
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    userId: mockUserId,
                    credentialType: 'job_completion',
                    status: 'pending',
                },
            ];

            (BlockchainCredential.find as jest.Mock) = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockCredentials),
            });

            const result = await blockchainService.getUserCredentials(mockUserId);

            expect(result).toHaveLength(2);
            expect(BlockchainCredential.find).toHaveBeenCalledWith({ userId: mockUserId });
        });
    });

    describe('getCredential', () => {
        it('should return a credential by ID', async () => {
            const mockCredential = {
                _id: mockCredentialId,
                userId: mockUserId,
                credentialType: 'skill_verification',
                status: 'minted',
            };

            (BlockchainCredential.findById as jest.Mock) = jest.fn().mockResolvedValue(mockCredential);

            const result = await blockchainService.getCredential(mockCredentialId);

            expect(result).toBeDefined();
            expect(result?._id).toBe(mockCredentialId);
            expect(BlockchainCredential.findById).toHaveBeenCalledWith(mockCredentialId);
        });

        it('should return null for non-existent credential', async () => {
            (BlockchainCredential.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

            const result = await blockchainService.getCredential('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('isAvailable', () => {
        it('should return blockchain service availability status', () => {
            const isAvailable = blockchainService.isAvailable();
            expect(typeof isAvailable).toBe('boolean');
        });
    });

    describe('getPendingCredentials', () => {
        it('should return all pending credentials', async () => {
            const mockPendingCredentials = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    status: 'pending',
                    credentialType: 'skill_verification',
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    status: 'pending',
                    credentialType: 'job_completion',
                },
            ];

            (BlockchainCredential.find as jest.Mock) = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockPendingCredentials),
            });

            const result = await blockchainService.getPendingCredentials();

            expect(result).toHaveLength(2);
            expect(BlockchainCredential.find).toHaveBeenCalledWith({ status: 'pending' });
        });
    });

    describe('verifyCredential', () => {
        it('should return error for non-existent credential', async () => {
            (BlockchainCredential.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

            const result = await blockchainService.verifyCredential('nonexistent');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Credential not found');
        });

        it('should return error for non-minted credential', async () => {
            const mockCredential = {
                _id: mockCredentialId,
                status: 'pending',
            };

            (BlockchainCredential.findById as jest.Mock) = jest.fn().mockResolvedValue(mockCredential);

            const result = await blockchainService.verifyCredential(mockCredentialId);

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Credential not minted on blockchain');
        });
    });
});
