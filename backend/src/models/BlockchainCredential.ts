import mongoose, { Document, Schema } from 'mongoose';

export interface IBlockchainCredential extends Document {
    userId: mongoose.Types.ObjectId;
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
    issuedAt: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    ipfsHash?: string;
    status: 'pending' | 'minted' | 'failed';
    failureReason?: string;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const BlockchainCredentialSchema = new Schema<IBlockchainCredential>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    credentialType: {
        type: String,
        enum: ['skill_verification', 'job_completion', 'community_contribution', 'emergency_response'],
        required: true,
    },
    nftTokenId: {
        type: String,
        sparse: true,
        unique: true,
    },
    blockchainTxHash: {
        type: String,
        sparse: true,
    },
    metadata: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: String,
        attributes: [{
            trait_type: {
                type: String,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        }],
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    ipfsHash: String,
    status: {
        type: String,
        enum: ['pending', 'minted', 'failed'],
        default: 'pending',
        index: true,
    },
    failureReason: String,
    retryCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes for performance
BlockchainCredentialSchema.index({ userId: 1, status: 1 });
BlockchainCredentialSchema.index({ credentialType: 1 });
BlockchainCredentialSchema.index({ blockchainTxHash: 1 });
BlockchainCredentialSchema.index({ createdAt: -1 });

export const BlockchainCredential = mongoose.model<IBlockchainCredential>('BlockchainCredential', BlockchainCredentialSchema);
