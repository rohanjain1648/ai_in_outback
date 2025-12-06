import axios from 'axios';
import {
    SpiritAvatar,
    AvatarGenerationRequest,
    AvatarGenerationResponse,
    GeometricAvatarConfig,
    AvatarCustomization,
} from '../types/avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AvatarService {
    private cache: Map<string, SpiritAvatar> = new Map();
    private readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

    /**
     * Generate a spirit avatar using AI (DALL-E) or fallback to geometric
     */
    async generateAvatar(request: AvatarGenerationRequest): Promise<AvatarGenerationResponse> {
        try {
            // Check cache first
            const cacheKey = this.getCacheKey(request);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return { avatar: cached, success: true };
            }

            // Try AI generation first
            try {
                const response = await axios.post<AvatarGenerationResponse>(
                    `${API_URL}/avatars/generate`,
                    request,
                    {
                        timeout: 30000, // 30 second timeout for AI generation
                    }
                );

                if (response.data.success && response.data.avatar) {
                    this.addToCache(cacheKey, response.data.avatar);
                    return response.data;
                }
            } catch (aiError) {
                console.warn('AI avatar generation failed, falling back to geometric:', aiError);
            }

            // Fallback to geometric avatar
            const geometricAvatar = this.generateGeometricAvatar(request);
            this.addToCache(cacheKey, geometricAvatar);

            return {
                avatar: geometricAvatar,
                success: true,
            };
        } catch (error) {
            console.error('Avatar generation error:', error);

            // Final fallback to geometric avatar
            const geometricAvatar = this.generateGeometricAvatar(request);
            return {
                avatar: geometricAvatar,
                success: true,
            };
        }
    }

    /**
     * Get user's avatars from backend
     */
    async getUserAvatars(userId: string): Promise<SpiritAvatar[]> {
        try {
            const response = await axios.get<SpiritAvatar[]>(`${API_URL}/avatars/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user avatars:', error);
            return [];
        }
    }

    /**
     * Set active avatar for user
     */
    async setActiveAvatar(userId: string, avatarId: string): Promise<boolean> {
        try {
            await axios.put(`${API_URL}/avatars/${avatarId}/activate`, { userId });
            return true;
        } catch (error) {
            console.error('Error setting active avatar:', error);
            return false;
        }
    }

    /**
     * Delete an avatar
     */
    async deleteAvatar(avatarId: string): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/avatars/${avatarId}`);
            return true;
        } catch (error) {
            console.error('Error deleting avatar:', error);
            return false;
        }
    }

    /**
     * Generate a geometric pattern avatar as fallback
     */
    private generateGeometricAvatar(request: AvatarGenerationRequest): SpiritAvatar {
        const config: GeometricAvatarConfig = {
            seed: request.userId,
            colors: request.customization.colors.length > 0
                ? request.customization.colors
                : this.getThemeColors(request.customization.theme),
            shapes: ['circle', 'triangle', 'square', 'hexagon'],
            complexity: 5,
        };

        const svgData = this.generateGeometricSVG(config);
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;

        return {
            id: `geometric-${Date.now()}`,
            userId: request.userId,
            imageUrl: dataUrl,
            thumbnailUrl: dataUrl,
            customization: request.customization,
            isAIGenerated: false,
            generatedAt: new Date(),
            isActive: false,
        };
    }

    /**
     * Generate SVG for geometric avatar
     */
    private generateGeometricSVG(config: GeometricAvatarConfig): string {
        const size = 200;
        const centerX = size / 2;
        const centerY = size / 2;

        // Use seed to generate deterministic random values
        const random = this.seededRandom(config.seed);

        let shapes = '';

        // Generate multiple layers of shapes
        for (let i = 0; i < config.complexity; i++) {
            const shapeType = config.shapes[Math.floor(random() * config.shapes.length)];
            const color = config.colors[Math.floor(random() * config.colors.length)];
            const opacity = 0.3 + random() * 0.5;
            const radius = 20 + random() * 60;
            const angle = random() * Math.PI * 2;
            const distance = random() * 40;

            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            switch (shapeType) {
                case 'circle':
                    shapes += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${opacity}" />`;
                    break;
                case 'triangle':
                    const points = this.getTrianglePoints(x, y, radius);
                    shapes += `<polygon points="${points}" fill="${color}" opacity="${opacity}" />`;
                    break;
                case 'square':
                    shapes += `<rect x="${x - radius}" y="${y - radius}" width="${radius * 2}" height="${radius * 2}" fill="${color}" opacity="${opacity}" transform="rotate(${random() * 360} ${x} ${y})" />`;
                    break;
                case 'hexagon':
                    const hexPoints = this.getHexagonPoints(x, y, radius);
                    shapes += `<polygon points="${hexPoints}" fill="${color}" opacity="${opacity}" />`;
                    break;
            }
        }

        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="${size}" height="${size}" fill="#1a1a2e"/>
        <g filter="url(#glow)">
          ${shapes}
        </g>
      </svg>
    `;
    }

    /**
     * Get triangle points for SVG
     */
    private getTrianglePoints(x: number, y: number, radius: number): string {
        const height = radius * Math.sqrt(3);
        return `${x},${y - height / 2} ${x - radius},${y + height / 2} ${x + radius},${y + height / 2}`;
    }

    /**
     * Get hexagon points for SVG
     */
    private getHexagonPoints(x: number, y: number, radius: number): string {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            points.push(`${px},${py}`);
        }
        return points.join(' ');
    }

    /**
     * Seeded random number generator for deterministic patterns
     */
    private seededRandom(seed: string): () => number {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }

        return () => {
            hash = (hash * 9301 + 49297) % 233280;
            return hash / 233280;
        };
    }

    /**
     * Get theme-based color palette
     */
    private getThemeColors(theme: string): string[] {
        const themes: Record<string, string[]> = {
            light: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9'],
            dark: ['#1E293B', '#334155', '#475569', '#64748B', '#94A3B8'],
            earth: ['#78350F', '#92400E', '#A16207', '#CA8A04', '#EAB308'],
            water: ['#0C4A6E', '#075985', '#0369A1', '#0284C7', '#0EA5E9'],
            fire: ['#7C2D12', '#991B1B', '#B91C1C', '#DC2626', '#EF4444'],
            air: ['#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA'],
        };

        return themes[theme] || themes.light;
    }

    /**
     * Generate cache key for avatar request
     */
    private getCacheKey(request: AvatarGenerationRequest): string {
        return `${request.userId}-${request.customization.style}-${request.customization.theme}`;
    }

    /**
     * Get avatar from cache
     */
    private getFromCache(key: string): SpiritAvatar | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check if cache is still valid
        const age = Date.now() - new Date(cached.generatedAt).getTime();
        if (age > this.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return cached;
    }

    /**
     * Add avatar to cache
     */
    private addToCache(key: string, avatar: SpiritAvatar): void {
        this.cache.set(key, avatar);
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Build AI prompt for avatar generation
     */
    buildAvatarPrompt(customization: AvatarCustomization, userProfile?: any): string {
        const styleDescriptions: Record<string, string> = {
            ethereal: 'ethereal, ghostly, translucent with glowing edges',
            geometric: 'geometric patterns, sacred geometry, symmetrical',
            nature: 'natural elements, organic forms, flowing',
            abstract: 'abstract art, surreal, dreamlike',
            traditional: 'traditional Aboriginal art style, dot painting, earth tones',
        };

        const themeDescriptions: Record<string, string> = {
            light: 'bright, luminous, celestial colors',
            dark: 'dark, mysterious, deep shadows',
            earth: 'earthy tones, browns, ochres, natural',
            water: 'aquatic blues, flowing, liquid',
            fire: 'warm reds, oranges, energetic',
            air: 'light blues, whites, airy, floating',
        };

        let prompt = `A spirit avatar in ${styleDescriptions[customization.style]} style with ${themeDescriptions[customization.theme]}. `;

        if (userProfile?.interests && userProfile.interests.length > 0) {
            prompt += `Incorporating elements of ${userProfile.interests.slice(0, 2).join(' and ')}. `;
        }

        if (userProfile?.occupation) {
            prompt += `Subtle references to ${userProfile.occupation}. `;
        }

        prompt += 'Mystical, spiritual, Australian outback inspired, suitable for profile picture, centered composition, no text.';

        return prompt;
    }
}

export const avatarService = new AvatarService();
