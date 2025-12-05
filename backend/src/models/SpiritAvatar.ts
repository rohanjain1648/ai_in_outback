import mongoose, { Document, Schema } from 'mongoose';

export interface IAvatarCustomization {
    style: 'ethereal' | 'geometric' | 'nature' | 'abstract' | 'traditional';
    theme: 'light' | 'dark' | 'earth' | 'water' | 'fire' | 'air';
    colors: string[];
    prompt?: string;
}

export interface ISpiritAvatar extends Document {
    userId: mongoose.Types.ObjectId;
    imageUrl: string;
    thumbnailUrl?: string;
    customization: IAvatarCustomization;
    isAIGenerated: boolean;
    generatedAt: Date;
    isActive: boolean;
    prompt?: string;
    dalleImageId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AvatarCustomizationSchema = new Schema<IAvatarCustomization>({
    style: {
        type: String,
        enum: ['ethereal', 'geometric', 'nature', 'abstract', 'traditional'],
        required: true,
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'earth', 'water', 'fire', 'air'],
        required: true,
    },
    colors: {
        type: [String],
        default: [],
    },
    prompt: String,
});

const SpiritAvatarSchema = new Schema<ISpiritAvatar>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        thumbnailUrl: String,
        customization: {
            type: AvatarCustomizationSchema,
            required: true,
        },
        isAIGenerated: {
            type: Boolean,
            default: false,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        prompt: String,
        dalleImageId: String,
    },
    {
        timestamps: true,
    }
);

// Indexes
SpiritAvatarSchema.index({ userId: 1, isActive: 1 });
SpiritAvatarSchema.index({ userId: 1, generatedAt: -1 });

// Ensure only one active avatar per user
SpiritAvatarSchema.pre('save', async function (next) {
    if (this.isActive && this.isModified('isActive')) {
        await mongoose.model('SpiritAvatar').updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { $set: { isActive: false } }
        );
    }
    next();
});

export const SpiritAvatar = mongoose.model<ISpiritAvatar>('SpiritAvatar', SpiritAvatarSchema);
