/**
 * Icon Cache Service
 * 
 * This service manages caching of Brandfetch API responses to prevent
 * duplicate requests and improve performance.
 */

interface CacheEntry {
  url: string;
  timestamp: number;
  isValid: boolean;
}

class IconCacheService {
  private cache = new Map<string, CacheEntry>();
  private loadingPromises = new Map<string, Promise<string>>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly BRANDFETCH_CLIENT_ID = '1idyMWHGpXUFWWxXx_q';

  /**
   * Get a cached icon URL or fetch it from Brandfetch API
   */
  async getIconUrl(domain: string, type: 'logo' | 'symbol' = 'logo', theme: 'light' | 'dark' = 'light'): Promise<string> {
    const cacheKey = `${domain}-${type}-${theme}`;
    
    // Check if we have a valid cached entry
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.url;
    }

    // Check if we're already loading this icon
    const existingPromise = this.loadingPromises.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new loading promise
    const loadingPromise = this.fetchAndValidateIcon(domain, type, theme, cacheKey);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const url = await loadingPromise;
      return url;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Preload icons for critical above-the-fold content
   */
  async preloadCriticalIcons(icons: Array<{ domain: string; type?: 'logo' | 'symbol'; theme?: 'light' | 'dark' }>): Promise<void> {
    const preloadPromises = icons.map(({ domain, type = 'logo', theme = 'light' }) =>
      this.getIconUrl(domain, type, theme).catch(() => {
        // Silently fail for preloading - don't block the UI
        console.warn(`Failed to preload icon for ${domain}`);
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Check if an icon exists in cache and is valid
   */
  isCached(domain: string, type: 'logo' | 'symbol' = 'logo', theme: 'light' | 'dark' = 'light'): boolean {
    const cacheKey = `${domain}-${type}-${theme}`;
    const cached = this.cache.get(cacheKey);
    return cached ? this.isCacheValid(cached) : false;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const total = this.cache.size;
    const valid = Array.from(this.cache.values()).filter(entry => this.isCacheValid(entry)).length;
    const invalid = total - valid;
    
    return {
      total,
      valid,
      invalid,
      hitRate: total > 0 ? (valid / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  private async fetchAndValidateIcon(domain: string, type: 'logo' | 'symbol', theme: 'light' | 'dark', cacheKey: string): Promise<string> {
    const url = `https://cdn.brandfetch.io/${domain}/${type}/${theme}?c=${this.BRANDFETCH_CLIENT_ID}`;
    
    try {
      // Test if the image loads successfully
      await this.validateImageUrl(url);
      
      // Cache the valid URL
      this.cache.set(cacheKey, {
        url,
        timestamp: Date.now(),
        isValid: true
      });
      
      return url;
    } catch (error) {
      // Cache the invalid result to prevent repeated failed requests
      this.cache.set(cacheKey, {
        url: '',
        timestamp: Date.now(),
        isValid: false
      });
      
      throw error;
    }
  }

  private validateImageUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private isCacheValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.CACHE_DURATION;
  }
}

// Export singleton instance
export const iconCacheService = new IconCacheService();

// Periodically clean up expired cache entries
if (typeof window !== 'undefined') {
  setInterval(() => {
    iconCacheService.clearExpiredCache();
  }, 60 * 60 * 1000); // Clean up every hour
}