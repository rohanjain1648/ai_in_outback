// @ts-nocheck
import express, { Request, Response } from 'express';
import { blockchainService } from '../services/blockchainService';
import { authenticate } from '../middleware/auth';
// import { validate } from '../middleware/validation';
import { issueCredentialSchema, credentialIdSchema } from '../validation/blockchainValidation';
import mongoose from 'mongoose';

const router = express.Router();

// Placeholder validation middleware
const validate = (schema: any) => (req: Request, res: Response, next: Function) => next();

/**
 * @route   POST /api/blockchain/credentials
 * @desc    Issue a new blockchain credential
 * @access  Private
 */
router.post('/credentials', authenticate, validate(issueCredentialSchema), async (req: Request, res: Response) => {
    try {
        const { credentialType, metadata, verifiedBy } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!credentialType || !metadata) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const credential = await blockchainService.issueCredential(
            new mongoose.Types.ObjectId(userId),
            credentialType,
            metadata,
            verifiedBy ? new mongoose.Types.ObjectId(verifiedBy) : undefined
        );

        res.status(201).json({
            message: 'Credential issued successfully',
            credential,
        });
    } catch (error: any) {
        console.error('Error issuing credential:', error);
        res.status(500).json({ error: 'Failed to issue credential', details: error.message });
    }
});

/**
 * @route   GET /api/blockchain/credentials
 * @desc    Get all credentials for the authenticated user
 * @access  Private
 */
router.get('/credentials', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const credentials = await blockchainService.getUserCredentials(
            new mongoose.Types.ObjectId(userId)
        );

        res.json({
            credentials,
            count: credentials.length,
        });
    } catch (error: any) {
        console.error('Error fetching credentials:', error);
        res.status(500).json({ error: 'Failed to fetch credentials', details: error.message });
    }
});

/**
 * @route   GET /api/blockchain/credentials/:id
 * @desc    Get a specific credential by ID
 * @access  Public (for verification purposes)
 */
router.get('/credentials/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid credential ID' });
        }

        const credential = await blockchainService.getCredential(id);

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        res.json({ credential });
    } catch (error: any) {
        console.error('Error fetching credential:', error);
        res.status(500).json({ error: 'Failed to fetch credential', details: error.message });
    }
});

/**
 * @route   POST /api/blockchain/credentials/:id/verify
 * @desc    Verify a credential using blockchain
 * @access  Public
 */
router.post('/credentials/:id/verify', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid credential ID' });
        }

        const verification = await blockchainService.verifyCredential(id);

        res.json({
            verification,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error verifying credential:', error);
        res.status(500).json({ error: 'Failed to verify credential', details: error.message });
    }
});

/**
 * @route   POST /api/blockchain/credentials/:id/mint
 * @desc    Manually trigger minting for a pending credential
 * @access  Private
 */
router.post('/credentials/:id/mint', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid credential ID' });
        }

        // Verify the credential belongs to the user
        const credential = await blockchainService.getCredential(id);
        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        if (credential.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to mint this credential' });
        }

        const result = await blockchainService.mintCredential(id);

        if (result.success) {
            res.json({
                message: 'Credential minted successfully',
                txHash: result.txHash,
                tokenId: result.tokenId,
            });
        } else {
            res.status(500).json({
                error: 'Failed to mint credential',
                details: result.error,
            });
        }
    } catch (error: any) {
        console.error('Error minting credential:', error);
        res.status(500).json({ error: 'Failed to mint credential', details: error.message });
    }
});

/**
 * @route   GET /api/blockchain/status
 * @desc    Get blockchain service status
 * @access  Public
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        const isAvailable = blockchainService.isAvailable();
        const pendingCredentials = await blockchainService.getPendingCredentials();

        res.json({
            isAvailable,
            pendingCount: pendingCredentials.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error checking blockchain status:', error);
        res.status(500).json({ error: 'Failed to check status', details: error.message });
    }
});

/**
 * @route   POST /api/blockchain/process-queue
 * @desc    Process offline transaction queue (admin only)
 * @access  Private (Admin)
 */
router.post('/process-queue', authenticate, async (req: Request, res: Response) => {
    try {
        const userRole = req.user?.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        await blockchainService.processOfflineQueue();

        res.json({
            message: 'Queue processing initiated',
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error processing queue:', error);
        res.status(500).json({ error: 'Failed to process queue', details: error.message });
    }
});

/**
 * @route   POST /api/blockchain/retry-failed
 * @desc    Retry failed credential minting (admin only)
 * @access  Private (Admin)
 */
router.post('/retry-failed', authenticate, async (req: Request, res: Response) => {
    try {
        const userRole = req.user?.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        await blockchainService.retryFailedCredentials();

        res.json({
            message: 'Retry process initiated',
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error retrying failed credentials:', error);
        res.status(500).json({ error: 'Failed to retry credentials', details: error.message });
    }
});

export default router;



