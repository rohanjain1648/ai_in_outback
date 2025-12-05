import { SpiritAvatar, ISpiritAvatar } from '../models/SpiritAvatar';
import { User } from '../models/User';
import axios from 'axios';

interface AvatarGenerationRequest {
    userId: string;
    customization: {
        style: 'ethereal' | 'geometric' | 'nature' | 'abstract' | 'traditional';
        theme: 'light' | 'dark' | 'earth' | 'water' | 'fire' | 'air';
        colors: string[];
        prompt?: string;
    };
    userProfile?: {
        interests?: string[];
        occupation?: string;
        location?: string;
    };
}

class AvatarService {
    /**
     * Generate a spirit avatar using OpenAI DALL-E
     */
    async generateAvatar(request: AvatarGenerationRequest): Promise<ISpiritAvatar> {
        try {
            // Get user profile for personalization
            const user = await User.findById(request.userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Build AI prompt
            const prompt = this.buildAvatarPrompt(request.customization, {
                interests: user.preferences?.interests || request.userProfile?.interests,
                occupation: user.profile?.occupation || request.userProfile?.occupation,
                location: user.location?.region || request.userProfile?.location,
            });

            let imageUrl: string;
            let isAIGenerated = false;
            let dalleImageId: string | undefined;

            // Try to generate with DALL-E if API key is available
            if (process.env.OPENAI_API_KEY) {
                try {
                    const dalleResponse = await this.generateWithDallE(prompt);
                    imageUrl = dalleResponse.url;
                    dalleImageId = dalleResponse.id;
                    isAIGenerated = true;
                } catch (dalleError) {
                    console.warn('DALL-E generation failed, using fallback:', dalleError);
                    imageUrl = this.generateGeometricFallback(request);
                }
            } else {
                console.log('OpenAI API key not configured, using geometric fallback');
                imageUrl = this.generateGeometricFallback(request);
            }

            // Create avatar record
            const avatar = new SpiritAvatar({
                userId: request.userId,
                imageUrl,
                thumbnailUrl: imageUrl, // In production, would generate thumbnail
                customization: request.customization,
                isAIGenerated,
                generatedAt: new Date(),
                isActive: false,
                prompt,
                dalleImageId,
            });

            await avatar.save();
            return avatar;
        } catch (error) {
            console.error('Avatar generation error:', error);
            throw error;
        }
    }

    /**
     * Generate avatar using OpenAI DALL-E API
     */
    private async generateWithDallE(prompt: string): Promise<{ url: string; id: string }> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/images/generations',
                {
                    model: 'dall-e-3',
                    prompt,
                    n: 1,
                    size: '1024x1024',
                    quality: 'standard',
                    style: 'vivid',
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000, // 60 second timeout
                }
            );

            if (response.data?.data?.[0]?.url) {
                return {
                    url: response.data.data[0].url,
                    id: response.data.data[0].revised_prompt || 'dalle-generated',
                };
            }

            throw new Error('Invalid DALL-E response');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('DALL-E API error:', error.response?.data || error.message);
            }
            throw error;
        }
    }

    /**
     * Generate geometric pattern as fallback
     */
    private generateGeometricFallback(request: AvatarGenerationRequest): string {
        // Return a data URL for geometric pattern
        // In a real implementation, this would generate an SVG or use a service
        return `https://api.dicebear.com/7.x/shapes/svg?seed=${request.userId}&backgroundColor=${this.getThemeColor(request.customization.theme)}`;
    }

    /**
     * Get user's avatars
     */
    async getUserAvatars(userId: string): Promise<ISpiritAvatar[]> {
        return SpiritAvatar.find({ userId })
            .sort({ generatedAt: -1 })
            .limit(20)
            .exec();
    }

    /**
     * Get active avatar for user
     */
    async getActiveAvatar(userId: string): Promise<ISpiritAvatar | null> {
        return SpiritAvatar.findOne({ userId, isActive: true }).exec();
    }

    /**
     * Set active avatar
     */
    async setActiveAvatar(userId: string, avatarId: string): Promise<ISpiritAvatar> {
        // Deactivate all other avatars
        await SpiritAvatar.updateMany(
            { userId, _id: { $ne: avatarId } },
            { $set: { isActive: false } }
        );

        // Activate the selected avatar
        const avatar = await SpiritAvatar.findByIdAndUpdate(
            avatarId,
            { $set: { isActive: true } },
            { new: true }
        );

        if (!avatar) {
            throw new Error('Avatar not found');
        }

        // Update user profile with avatar URL
        await User.findByIdAndUpdate(userId, {
            $set: { 'profile.avatar': avatar.imageUrl },
        });

        return avatar;
    }

    /**
     * Delete avatar
     */
    async deleteAvatar(avatarId: string, userId: string): Promise<void> {
        const avatar = await SpiritAvatar.findOne({ _id: avatarId, userId });

        if (!avatar) {
            throw new Error('Avatar not found or unauthorized');
        }

        // If deleting active avatar, clear user profile avatar
        if (avatar.isActive) {
            await User.findByIdAndUpdate(userId, {
                $unset: { 'profile.avatar': '' },
            });
        }

        await SpiritAvatar.findByIdAndDelete(avatarId);
    }

    /**
     * Build AI prompt for avatar generation
     */
    private buildAvatarPrompt(
        customization: AvatarGenerationRequest['customization'],
        userProfile?: any
    ): string {
        const styleDescriptions: Record<string, string> = {
            ethereal: 'ethereal, ghostly, translucent with glowing edges, spirit-like',
            geometric: 'geometric patterns, sacred geometry, symmetrical, mandala-inspired',
            nature: 'natural elements, organic forms, flowing, botanical',
            abstract: 'abstract art, surreal, dreamlike, artistic',
            traditional: 'traditional Aboriginal art style, dot painting, earth tones, indigenous patterns',
        };

        const themeDescriptions: Record<string, string> = {
            light: 'bright, luminous, celestial colors, radiant',
            dark: 'dark, mysterious, deep shadows, nocturnal',
            earth: 'earthy tones, browns, ochres, natural, grounded',
            water: 'aquatic blues, flowing, liquid, reflective',
            fire: 'warm reds, oranges, energetic, passionate',
            air: 'light blues, whites, airy, floating, ethereal',
        };

        let prompt = `Create a mystical spirit avatar in ${styleDescriptions[customization.style]} style with ${themeDescriptions[customization.theme]}. `;

        if (userProfile?.interests && userProfile.interests.length > 0) {
            prompt += `Incorporate subtle elements representing ${userProfile.interests.slice(0, 2).join(' and ')}. `;
        }

        if (userProfile?.occupation) {
            prompt += `Include gentle references to ${userProfile.occupation}. `;
        }

        if (userProfile?.location) {
            prompt += `Inspired by the Australian ${userProfile.location} landscape. `;
        }

        prompt += 'The avatar should be mystical, spiritual, suitable for a profile picture with centered composition. No text, no faces, abstract representation only. High quality, artistic, memorable.';

        return prompt;
    }

    /**
     * Get theme color for fallback
     */
    private getThemeColor(theme: string): string {
        const colors: Record<string, string> = {
            light: 'E0F2FE',
            dark: '1E293B',
            earth: '92400E',
            water: '0369A1',
            fire: 'DC2626',
            air: '3B82F6',
        };
        return colors[theme] || colors.light;
    }
}

export const avatarService = new AvatarService();
