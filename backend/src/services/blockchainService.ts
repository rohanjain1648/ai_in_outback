import { ethers } from 'ethers';
import { BlockchainCredential, IBlockchainCredential } from '../models/BlockchainCredential';
import mongoose from 'mongoose';

// Simple NFT contract ABI for minting badges
const NFT_ABI = [
    'function mint(address to, string memory tokenURI) public returns (uint256)',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

interface BlockchainConfig {
    rpcUrl: string;
    privateKey?: string;
    contractAddress?: string;
    chainId: number;
}

interface CredentialMetadata {
    title: string;
    description: string;
    imageUrl?: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
}

interface MintResult {
    success: boolean;
    txHash?: string;
    tokenId?: string;
    error?: string;
}

interface VerificationResult {
    isValid: boolean;
    owner?: string;
    metadata?: any;
    error?: string;
}

class BlockchainService {
    private provider: ethers.JsonRpcProvider | null = null;
    private wallet: ethers.Wallet | null = null;
    private contract: ethers.Contract | null = null;
    private config: BlockchainConfig;
    private offlineQueue: Array<{ credentialId: string; retryCount: number }> = [];
    private isProcessingQueue = false;

    constructor() {
        // Default to Polygon Mumbai testnet
        this.config = {
            rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
            privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
            contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
            chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '80001'), // Mumbai testnet
        };

        this.initialize();
    }

    /**
     * Initialize blockchain connection
     */
    private async initialize(): Promise<void> {
        try {
            // Set up provider
            this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

            // Set up wallet if private key is available
            if (this.config.privateKey) {
                this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
            }

            // Set up contract if address is available
            if (this.config.contractAddress && this.wallet) {
                this.contract = new ethers.Contract(
                    this.config.contractAddress,
                    NFT_ABI,
                    this.wallet
                );
            }

            console.log('Blockchain service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            // Service will work in offline mode
        }
    }

    /**
     * Check if blockchain service is available
     */
    public isAvailable(): boolean {
        return this.provider !== null && this.wallet !== null && this.contract !== null;
    }

    /**
     * Issue a new credential (create pending record)
     */
    public async issueCredential(
        userId: mongoose.Types.ObjectId,
        credentialType: IBlockchainCredential['credentialType'],
        metadata: CredentialMetadata,
        verifiedBy?: mongoose.Types.ObjectId
    ): Promise<IBlockchainCredential> {
        const credential = new BlockchainCredential({
            userId,
            credentialType,
            metadata,
            verifiedBy,
            status: 'pending',
            issuedAt: new Date(),
        });

        await credential.save();

        // Try to mint immediately if blockchain is available
        if (this.isAvailable()) {
            await this.mintCredential((credential._id as mongoose.Types.ObjectId).toString());
        } else {
            // Add to offline queue
            this.addToOfflineQueue((credential._id as mongoose.Types.ObjectId).toString());
        }

        return credential;
    }

    /**
     * Mint credential as NFT on blockchain
     */
    public async mintCredential(credentialId: string): Promise<MintResult> {
        try {
            const credential = await BlockchainCredential.findById(credentialId);

            if (!credential) {
                return { success: false, error: 'Credential not found' };
            }

            if (credential.status === 'minted') {
                return { success: true, txHash: credential.blockchainTxHash, tokenId: credential.nftTokenId };
            }

            if (!this.isAvailable()) {
                this.addToOfflineQueue(credentialId);
                return { success: false, error: 'Blockchain service unavailable, added to queue' };
            }

            // Create metadata URI (in production, this would be uploaded to IPFS)
            const metadataUri = await this.uploadMetadataToIPFS(credential.metadata);
            credential.ipfsHash = metadataUri;

            // Mint NFT
            const userAddress = await this.getUserWalletAddress(credential.userId);

            if (!userAddress) {
                credential.status = 'failed';
                credential.failureReason = 'User wallet address not found';
                await credential.save();
                return { success: false, error: 'User wallet address not found' };
            }

            const tx = await this.contract!.mint(userAddress, metadataUri);
            const receipt = await tx.wait();

            // Extract token ID from Transfer event
            const transferEvent = receipt.logs.find((log: any) => {
                try {
                    const parsed = this.contract!.interface.parseLog(log);
                    return parsed?.name === 'Transfer';
                } catch {
                    return false;
                }
            });

            let tokenId = '';
            if (transferEvent) {
                const parsed = this.contract!.interface.parseLog(transferEvent);
                tokenId = parsed?.args[2]?.toString() || '';
            }

            // Update credential with blockchain data
            credential.blockchainTxHash = receipt.hash;
            credential.nftTokenId = tokenId;
            credential.status = 'minted';
            await credential.save();

            return {
                success: true,
                txHash: receipt.hash,
                tokenId,
            };
        } catch (error: any) {
            console.error('Failed to mint credential:', error);

            // Update credential status
            const credential = await BlockchainCredential.findById(credentialId);
            if (credential) {
                credential.status = 'failed';
                credential.failureReason = error.message;
                credential.retryCount += 1;
                await credential.save();

                // Add to retry queue if not too many retries
                if (credential.retryCount < 3) {
                    this.addToOfflineQueue(credentialId);
                }
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Verify a credential using blockchain transaction hash
     */
    public async verifyCredential(credentialId: string): Promise<VerificationResult> {
        try {
            const credential = await BlockchainCredential.findById(credentialId);

            if (!credential) {
                return { isValid: false, error: 'Credential not found' };
            }

            if (credential.status !== 'minted' || !credential.blockchainTxHash) {
                return { isValid: false, error: 'Credential not minted on blockchain' };
            }

            if (!this.isAvailable()) {
                // Fallback to database verification
                return {
                    isValid: true,
                    metadata: credential.metadata,
                    error: 'Blockchain verification unavailable, using database record',
                };
            }

            // Verify transaction exists on blockchain
            const tx = await this.provider!.getTransaction(credential.blockchainTxHash);

            if (!tx) {
                return { isValid: false, error: 'Transaction not found on blockchain' };
            }

            // Verify token ownership if token ID is available
            if (credential.nftTokenId) {
                const owner = await this.contract!.ownerOf(credential.nftTokenId);
                const userAddress = await this.getUserWalletAddress(credential.userId);

                return {
                    isValid: owner.toLowerCase() === userAddress?.toLowerCase(),
                    owner,
                    metadata: credential.metadata,
                };
            }

            return {
                isValid: true,
                metadata: credential.metadata,
            };
        } catch (error: any) {
            console.error('Failed to verify credential:', error);
            return { isValid: false, error: error.message };
        }
    }

    /**
     * Get all credentials for a user
     */
    public async getUserCredentials(userId: mongoose.Types.ObjectId): Promise<IBlockchainCredential[]> {
        return BlockchainCredential.find({ userId }).sort({ issuedAt: -1 });
    }

    /**
     * Get credential by ID
     */
    public async getCredential(credentialId: string): Promise<IBlockchainCredential | null> {
        return BlockchainCredential.findById(credentialId);
    }

    /**
     * Add credential to offline queue
     */
    private addToOfflineQueue(credentialId: string): void {
        const existing = this.offlineQueue.find(item => item.credentialId === credentialId);
        if (!existing) {
            this.offlineQueue.push({ credentialId, retryCount: 0 });
        }
    }

    /**
     * Process offline queue
     */
    public async processOfflineQueue(): Promise<void> {
        if (this.isProcessingQueue || !this.isAvailable()) {
            return;
        }

        this.isProcessingQueue = true;

        try {
            const queue = [...this.offlineQueue];
            this.offlineQueue = [];

            for (const item of queue) {
                const result = await this.mintCredential(item.credentialId);

                if (!result.success && item.retryCount < 3) {
                    this.offlineQueue.push({
                        credentialId: item.credentialId,
                        retryCount: item.retryCount + 1,
                    });
                }
            }
        } finally {
            this.isProcessingQueue = false;
        }
    }

    /**
     * Upload metadata to IPFS (mock implementation)
     * In production, this would use a real IPFS service like Pinata or Infura
     */
    private async uploadMetadataToIPFS(metadata: CredentialMetadata): Promise<string> {
        // Mock implementation - returns a hash-like string
        // In production, upload to IPFS and return the actual hash
        const mockHash = `ipfs://Qm${Buffer.from(JSON.stringify(metadata)).toString('base64').substring(0, 44)}`;
        return mockHash;
    }

    /**
     * Get user's wallet address
     * In production, this would be stored in the user profile
     */
    private async getUserWalletAddress(userId: mongoose.Types.ObjectId): Promise<string | null> {
        // Mock implementation - generates a deterministic address from user ID
        // In production, retrieve from user profile or wallet connection
        const mockAddress = ethers.keccak256(ethers.toUtf8Bytes(userId.toString())).substring(0, 42);
        return mockAddress;
    }

    /**
     * Get pending credentials that need minting
     */
    public async getPendingCredentials(): Promise<IBlockchainCredential[]> {
        return BlockchainCredential.find({ status: 'pending' }).sort({ createdAt: 1 });
    }

    /**
     * Retry failed credentials
     */
    public async retryFailedCredentials(): Promise<void> {
        const failedCredentials = await BlockchainCredential.find({
            status: 'failed',
            retryCount: { $lt: 3 },
        });

        for (const credential of failedCredentials) {
            await this.mintCredential((credential._id as mongoose.Types.ObjectId).toString());
        }
    }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
