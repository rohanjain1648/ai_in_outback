/**
 * Caching Strategies
 * 
 * Provides comprehensive caching solutions for API responses,
 * static assets, and application data to improve performance.
 */

// Cache configuration
interface CacheConfig {
  maxAge: number; // in milliseconds
  maxSize: number; // maximum number of entries
  strategy: 'lru' | 'fifo' | 'ttl';
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl?: number;
}

// Generic cache implementation
export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxAge: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      strategy: 'lru',
      ...config
    };
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    
    // Remove expired entries before adding new one
    this.cleanup();
    
    // If cache is full, remove entries based on strategy
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      ttl: ttl || this.config.maxAge
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > (entry.ttl || this.config.maxAge)) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > (entry.ttl || this.config.maxAge)) {
        this.cache.delete(key);
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToRemove: string;

    switch (this.config.strategy) {
      case 'lru':
        keyToRemove = this.findLRUKey();
        break;
      case 'fifo':
        keyToRemove = this.cache.keys().next().value;
        break;
      case 'ttl':
        keyToRemove = this.findOldestKey();
        break;
      default:
        keyToRemove = this.cache.keys().next().value;
    }

    this.cache.delete(keyToRemove);
  }

  private findLRUKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findOldestKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      strategy: this.config.strategy,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed
      }))
    };
  }
}

// API Response Cache
export class APICache {
  private cache: MemoryCache<any>;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new MemoryCache({
      maxAge: 10 * 60 * 1000, // 10 minutes for API responses
      maxSize: 200,
      strategy: 'lru',
      ...config
    });
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; forceRefresh?: boolean } = {}
  ): Promise<T> {
    const { ttl, forceRefresh = false } = options;

    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Make the request
    const promise = fetchFn()
      .then(data => {
        this.cache.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    const stats = this.cache.getStats();
    
    for (const entry of stats.entries) {
      if (regex.test(entry.key)) {
        this.cache.delete(entry.key);
      }
    }
  }

  getStats() {
    return {
      ...this.cache.getStats(),
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Static Asset Cache using Service Worker
export class StaticAssetCache {
  private cacheName = 'rural-connect-static-v1';
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  async cache(url: string, response: Response): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.put(url, response.clone());
    }
  }

  async get(url: string): Promise<Response | null> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      
      if (response) {
        // Check if cached response is still fresh
        const cachedTime = response.headers.get('cached-time');
        if (cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age > this.maxAge) {
            await cache.delete(url);
            return null;
          }
        }
        
        return response;
      }
    }
    
    return null;
  }

  async prefetch(urls: string[]): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      
      const fetchPromises = urls.map(async url => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            // Add timestamp header
            const responseWithTimestamp = new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: {
                ...Object.fromEntries(response.headers.entries()),
                'cached-time': Date.now().toString()
              }
            });
            
            await cache.put(url, responseWithTimestamp);
          }
        } catch (error) {
          console.warn(`Failed to prefetch ${url}:`, error);
        }
      });

      await Promise.allSettled(fetchPromises);
    }
  }

  async clear(): Promise<void> {
    if ('caches' in window) {
      await caches.delete(this.cacheName);
    }
  }

  async getStats(): Promise<{ size: number; urls: string[] }> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      
      return {
        size: keys.length,
        urls: keys.map(request => request.url)
      };
    }
    
    return { size: 0, urls: [] };
  }
}

// Image Cache with compression
export class ImageCache {
  private cache: MemoryCache<string>;
  private compressionQuality = 0.8;

  constructor() {
    this.cache = new MemoryCache<string>({
      maxAge: 30 * 60 * 1000, // 30 minutes
      maxSize: 50,
      strategy: 'lru'
    });
  }

  async get(url: string, options: { width?: number; height?: number; quality?: number } = {}): Promise<string> {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Load and process image
    const processedImageUrl = await this.loadAndProcessImage(url, options);
    this.cache.set(cacheKey, processedImageUrl);
    
    return processedImageUrl;
  }

  private getCacheKey(url: string, options: any): string {
    return `${url}_${JSON.stringify(options)}`;
  }

  private async loadAndProcessImage(
    url: string, 
    options: { width?: number; height?: number; quality?: number }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate dimensions
        let { width = img.width, height = img.height } = options;
        const aspectRatio = img.width / img.height;
        
        if (width && !height) {
          height = width / aspectRatio;
        } else if (height && !width) {
          width = height * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const quality = options.quality || this.compressionQuality;
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        resolve(dataUrl);
      };
      
      img.onerror = reject;
      img.src = url;
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return this.cache.getStats();
  }
}

// Cache Manager - coordinates all caches
export class CacheManager {
  private apiCache: APICache;
  private staticAssetCache: StaticAssetCache;
  private imageCache: ImageCache;

  constructor() {
    this.apiCache = new APICache();
    this.staticAssetCache = new StaticAssetCache();
    this.imageCache = new ImageCache();
  }

  // API caching methods
  async cacheAPIResponse<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> {
    return this.apiCache.get(key, fetchFn, options);
  }

  invalidateAPICache(pattern?: string): void {
    this.apiCache.invalidate(pattern);
  }

  // Static asset caching methods
  async cacheStaticAsset(url: string, response: Response): Promise<void> {
    return this.staticAssetCache.cache(url, response);
  }

  async getStaticAsset(url: string): Promise<Response | null> {
    return this.staticAssetCache.get(url);
  }

  async prefetchAssets(urls: string[]): Promise<void> {
    return this.staticAssetCache.prefetch(urls);
  }

  // Image caching methods
  async cacheImage(url: string, options?: { width?: number; height?: number; quality?: number }): Promise<string> {
    return this.imageCache.get(url, options);
  }

  // Cache management
  async clearAllCaches(): Promise<void> {
    this.apiCache.invalidate();
    await this.staticAssetCache.clear();
    this.imageCache.clear();
  }

  async getCacheStats() {
    const [staticStats] = await Promise.all([
      this.staticAssetCache.getStats()
    ]);

    return {
      api: this.apiCache.getStats(),
      staticAssets: staticStats,
      images: this.imageCache.getStats(),
      timestamp: Date.now()
    };
  }

  // Preload critical resources
  async preloadCriticalResources(): Promise<void> {
    const criticalAssets = [
      '/assets/logo.svg',
      '/assets/icons/sprite.svg',
      '/assets/fonts/inter-var.woff2',
      '/assets/images/hero-bg.webp'
    ];

    await this.prefetchAssets(criticalAssets);
  }

  // Cache warming for common API endpoints
  async warmAPICache(): Promise<void> {
    const commonEndpoints = [
      { key: 'user-profile', fn: () => fetch('/api/v1/auth/profile').then(r => r.json()) },
      { key: 'resource-categories', fn: () => fetch('/api/v1/resources/categories').then(r => r.json()) },
      { key: 'community-stats', fn: () => fetch('/api/v1/community/stats').then(r => r.json()) }
    ];

    const promises = commonEndpoints.map(({ key, fn }) =>
      this.cacheAPIResponse(key, fn).catch(error => 
        console.warn(`Failed to warm cache for ${key}:`, error)
      )
    );

    await Promise.allSettled(promises);
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Cache-aware fetch wrapper
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & { cacheKey?: string; ttl?: number; forceRefresh?: boolean } = {}
): Promise<T> {
  const { cacheKey = url, ttl, forceRefresh, ...fetchOptions } = options;

  return cacheManager.cacheAPIResponse(
    cacheKey,
    async () => {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    { ttl, forceRefresh }
  );
}

// React hook for cache management
export function useCache() {
  const [cacheStats, setCacheStats] = React.useState<any>(null);

  const refreshStats = React.useCallback(async () => {
    const stats = await cacheManager.getCacheStats();
    setCacheStats(stats);
  }, []);

  React.useEffect(() => {
    refreshStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats: cacheStats,
    clearAll: () => cacheManager.clearAllCaches(),
    invalidateAPI: (pattern?: string) => cacheManager.invalidateAPICache(pattern),
    preloadCritical: () => cacheManager.preloadCriticalResources(),
    warmCache: () => cacheManager.warmAPICache(),
    refreshStats
  };
}