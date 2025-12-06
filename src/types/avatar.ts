// Spirit Avatar Types

export type AvatarStyle = 'ethereal' | 'geometric' | 'nature' | 'abstract' | 'traditional';
export type AvatarTheme = 'light' | 'dark' | 'earth' | 'water' | 'fire' | 'air';

export interface AvatarCustomization {
    style: AvatarStyle;
    theme: AvatarTheme;
    colors: string[];
    prompt?: string;
}

export interface SpiritAvatar {
    id: string;
    userId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    customization: AvatarCustomization;
    isAIGenerated: boolean;
    generatedAt: Date;
    isActive: boolean;
    prompt?: string;
}

export interface AvatarGenerationRequest {
    userId: string;
    customization: AvatarCustomization;
    userProfile?: {
        interests?: string[];
        occupation?: string;
        location?: string;
    };
}

export interface AvatarGenerationResponse {
    avatar: SpiritAvatar;
    success: boolean;
    error?: string;
}

export interface GeometricAvatarConfig {
    seed: string;
    colors: string[];
    shapes: ('circle' | 'triangle' | 'square' | 'hexagon')[];
    complexity: number;
}
