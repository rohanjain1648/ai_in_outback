/**
 * CDN Integration for Global Content Delivery
 * 
 * Provides utilities for integrating with CDN services to optimize
 * static asset delivery and improve global performance.
 */

import React from 'react';

// CDN configuration interface
interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheTTL: number;
  compressionEnabled: boolean;
  imageOptimization: boolean;
}

// Asset optimization options
interface AssetOptimizationOptions {
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
}

export class CDNManager {
  private config: CDNConfig;
  private assetCache = new Map<string, string>();

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Generate optimized asset URL
  getAssetUrl(path: string, options: AssetOptimizationOptions = {}): string {
    const cacheKey = `${path}_${JSON.stringify(options)}`;
    
    // Return cached URL if available
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!;
    }

    let url = `${this.config.baseUrl}${path}`;
    
    // Add optimization parameters for images
    if (this.config.imageOptimization && this.isImageAsset(path)) {
      url = this.addImageOptimizationParams(url, options);
    }

    // Cache the generated URL
    this.assetCache.set(cacheKey, url);
    
    return url;
  }

  // Generate responsive image URLs
  getResponsiveImageUrls(path: string, breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]): Array<{ url: string; width: number }> {
    return breakpoints.map(width => ({
      url: this.getAssetUrl(path, { width, format: 'webp', quality: 80 }),
      width
    }));
  }

  // Generate picture element with multiple formats
  generatePictureElement(path: string, alt: string, options: AssetOptimizationOptions = {}): string {
    const webpUrl = this.getAssetUrl(path, { ...options, format: 'webp' });
    const avifUrl = this.getAssetUrl(path, { ...options, format: 'avif' });
    const fallbackUrl = this.getAssetUrl(path, { ...options, format: 'jpeg' });

    return `
      <picture>
        <source srcset="${avifUrl}" type="image/avif">
        <source srcset="${webpUrl}" type="image/webp">
        <img src="${fallbackUrl}" alt="${alt}" loading="lazy">
      </picture>
    `;
  }

  // Preload critical assets
  async preloadCriticalAssets(assets: string[]): Promise<void> {
    const preloadPromises = assets.map(asset => {
      const url = this.getAssetUrl(asset);
      return this.preloadAsset(url);
    });

    await Promise.allSettled(preloadPromises);
  }

  private preloadAsset(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      // Determine resource type
      if (this.isImageAsset(url)) {
        link.as = 'image';
      } else if (this.isFontAsset(url)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (this.isStyleAsset(url)) {
        link.as = 'style';
      } else if (this.isScriptAsset(url)) {
        link.as = 'script';
      }

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
      
      document.head.appendChild(link);
    });
  }

  private addImageOptimizationParams(url: string, options: AssetOptimizationOptions): string {
    const params = new URLSearchParams();
    
    if (options.format) params.set('format', options.format);
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.fit) params.set('fit', options.fit);
    if (options.progressive) params.set('progressive', 'true');

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  private isImageAsset(path: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
    return imageExtensions.some(ext => path.toLowerCase().includes(ext));
  }

  private isFontAsset(path: string): boolean {
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    return fontExtensions.some(ext => path.toLowerCase().includes(ext));
  }

  private isStyleAsset(path: string): boolean {
    return path.toLowerCase().includes('.css');
  }

  private isScriptAsset(path: string): boolean {
    return path.toLowerCase().includes('.js');
  }

  // Purge CDN cache
  async purgeCache(paths?: string[]): Promise<void> {
    // This would integrate with your CDN provider's API
    // Example implementation for a generic CDN
    try {
      const response = await fetch(`${this.config.baseUrl}/purge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CDN_API_KEY}`
        },
        body: JSON.stringify({
          paths: paths || ['/*'] // Purge all if no specific paths
        })
      });

      if (!response.ok) {
        throw new Error(`CDN purge failed: ${response.statusText}`);
      }

      console.log('CDN cache purged successfully');
    } catch (error) {
      console.error('Failed to purge CDN cache:', error);
      throw error;
    }
  }

  // Get CDN performance metrics
  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/metrics`, {
        headers: {
          'Authorization': `Bearer ${process.env.CDN_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CDN metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch CDN metrics:', error);
      return null;
    }
  }
}

// Asset bundling and optimization
export class AssetBundler {
  private bundles = new Map<string, string[]>();
  private cdnManager: CDNManager;

  constructor(cdnManager: CDNManager) {
    this.cdnManager = cdnManager;
  }

  // Define asset bundles
  defineBundle(name: string, assets: string[]) {
    this.bundles.set(name, assets);
  }

  // Get bundle URL
  getBundleUrl(name: string): string | null {
    const assets = this.bundles.get(name);
    if (!assets) return null;

    // In a real implementation, this would return a pre-built bundle URL
    // For now, we'll return the first asset as an example
    return this.cdnManager.getAssetUrl(assets[0]);
  }

  // Preload bundle
  async preloadBundle(name: string): Promise<void> {
    const assets = this.bundles.get(name);
    if (!assets) return;

    await this.cdnManager.preloadCriticalAssets(assets);
  }

  // Get all defined bundles
  getBundles(): string[] {
    return Array.from(this.bundles.keys());
  }
}

// Geographic optimization
export class GeographicOptimizer {
  private regionEndpoints: Map<string, string> = new Map();

  constructor() {
    this.setupRegionEndpoints();
  }

  private setupRegionEndpoints() {
    // Define CDN endpoints for different regions
    this.regionEndpoints.set('AU', 'https://cdn-au.ruralconnect.ai');
    this.regionEndpoints.set('US', 'https://cdn-us.ruralconnect.ai');
    this.regionEndpoints.set('EU', 'https://cdn-eu.ruralconnect.ai');
    this.regionEndpoints.set('ASIA', 'https://cdn-asia.ruralconnect.ai');
  }

  // Get optimal CDN endpoint based on user location
  getOptimalEndpoint(userLocation?: { country?: string; region?: string }): string {
    if (!userLocation?.country) {
      return this.regionEndpoints.get('AU')!; // Default to Australia
    }

    // Map countries to regions
    const countryToRegion: Record<string, string> = {
      'AU': 'AU',
      'NZ': 'AU',
      'US': 'US',
      'CA': 'US',
      'GB': 'EU',
      'DE': 'EU',
      'FR': 'EU',
      'JP': 'ASIA',
      'SG': 'ASIA',
      'CN': 'ASIA'
    };

    const region = countryToRegion[userLocation.country] || 'AU';
    return this.regionEndpoints.get(region) || this.regionEndpoints.get('AU')!;
  }

  // Measure latency to different endpoints
  async measureLatency(): Promise<Record<string, number>> {
    const latencies: Record<string, number> = {};

    for (const [region, endpoint] of this.regionEndpoints) {
      try {
        const startTime = performance.now();
        await fetch(`${endpoint}/ping`, { method: 'HEAD' });
        const endTime = performance.now();
        latencies[region] = endTime - startTime;
      } catch (error) {
        latencies[region] = Infinity;
      }
    }

    return latencies;
  }
}

// React hooks for CDN integration
export function useCDN(config: CDNConfig) {
  const [cdnManager] = React.useState(() => new CDNManager(config));
  const [assetBundler] = React.useState(() => new AssetBundler(cdnManager));

  const getAssetUrl = React.useCallback((path: string, options?: AssetOptimizationOptions) => {
    return cdnManager.getAssetUrl(path, options);
  }, [cdnManager]);

  const getResponsiveImageUrls = React.useCallback((path: string, breakpoints?: number[]) => {
    return cdnManager.getResponsiveImageUrls(path, breakpoints);
  }, [cdnManager]);

  const preloadAssets = React.useCallback(async (assets: string[]) => {
    await cdnManager.preloadCriticalAssets(assets);
  }, [cdnManager]);

  return {
    getAssetUrl,
    getResponsiveImageUrls,
    preloadAssets,
    cdnManager,
    assetBundler
  };
}

// Optimized image component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}> = ({ src, alt, width, height, quality = 80, className, loading = 'lazy' }) => {
  const cdnConfig: CDNConfig = {
    baseUrl: process.env.REACT_APP_CDN_URL || '',
    regions: ['AU', 'US', 'EU', 'ASIA'],
    cacheTTL: 86400,
    compressionEnabled: true,
    imageOptimization: true
  };

  const { getAssetUrl, getResponsiveImageUrls } = useCDN(cdnConfig);

  // Generate responsive image URLs
  const responsiveUrls = getResponsiveImageUrls(src);
  const srcSet = responsiveUrls.map(({ url, width }) => `${url} ${width}w`).join(', ');

  // Generate optimized URLs for different formats
  const webpUrl = getAssetUrl(src, { format: 'webp', quality, width, height });
  const avifUrl = getAssetUrl(src, { format: 'avif', quality, width, height });
  const fallbackUrl = getAssetUrl(src, { format: 'jpeg', quality, width, height });

  return (
    <picture className={className}>
      <source srcSet={avifUrl} type="image/avif" />
      <source srcSet={webpUrl} type="image/webp" />
      <img
        src={fallbackUrl}
        srcSet={srcSet}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};

// CDN configuration for different environments
export const CDNConfigs = {
  development: {
    baseUrl: 'http://localhost:3000',
    regions: ['local'],
    cacheTTL: 0,
    compressionEnabled: false,
    imageOptimization: false
  },
  staging: {
    baseUrl: 'https://cdn-staging.ruralconnect.ai',
    regions: ['AU'],
    cacheTTL: 3600,
    compressionEnabled: true,
    imageOptimization: true
  },
  production: {
    baseUrl: 'https://cdn.ruralconnect.ai',
    regions: ['AU', 'US', 'EU', 'ASIA'],
    cacheTTL: 86400,
    compressionEnabled: true,
    imageOptimization: true
  }
};

// Initialize CDN based on environment
export function initializeCDN(): CDNManager {
  const env = process.env.NODE_ENV || 'development';
  const config = CDNConfigs[env as keyof typeof CDNConfigs];
  
  const cdnManager = new CDNManager(config);
  
  // Preload critical assets in production
  if (env === 'production') {
    const criticalAssets = [
      '/assets/logo.svg',
      '/assets/icons/sprite.svg',
      '/assets/fonts/inter-var.woff2'
    ];
    
    cdnManager.preloadCriticalAssets(criticalAssets);
  }
  
  return cdnManager;
}