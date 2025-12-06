export interface BlockchainCredential {
    _id: string;
    userId: string;
    credentialType: 'skill_verification' | 'job_completion' | 'community_contribution' | 'emergency_response';
    nftTokenId?: string;
    blockchainTxHash?: string;
    metadata: {
        title: string;
        description: string;
        imageUrl?: string;
        attributes: Array<{
            trait_type: string;
            value: string;
        }>;
    };
    issuedAt: string;
    verifiedBy?: string;
    ipfsHash?: string;
    status: 'pending' | 'minted' | 'failed';
    failureReason?: string;
    retryCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface VerificationResult {
    isValid: boolean;
    owner?: string;
    metadata?: any;
    error?: string;
}

export interface BlockchainStatus {
    isAvailable: boolean;
    pendingCount: number;
    timestamp: string;
}
