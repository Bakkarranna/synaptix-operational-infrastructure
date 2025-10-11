import { iconCacheService } from './iconCache';
import { PARTNERS, TRUSTED_BY_CLIENTS, SOCIAL_LINKS } from '../constants';

/**
 * Preload Service for Critical Icons
 * 
 * This service preloads icons that are visible on initial page load
 * to improve perceived performance and reduce layout shifts.
 */

class IconPreloadService {
  private preloadStarted = false;
  private preloadPromise: Promise<void> | null = null;

  /**
   * Start preloading critical icons that appear above the fold
   */
  async preloadCriticalIcons(): Promise<void> {
    if (this.preloadStarted) {
      return this.preloadPromise || Promise.resolve();
    }

    this.preloadStarted = true;
    this.preloadPromise = this.performPreload();
    
    return this.preloadPromise;
  }

  private async performPreload(): Promise<void> {
    try {
      // Get current theme
      const isDark = document.documentElement.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';

      // Prepare icons to preload
      const iconsToPreload = this.getCriticalIcons(theme);

      // Preload in batches to avoid overwhelming the browser
      const batchSize = 5;
      for (let i = 0; i < iconsToPreload.length; i += batchSize) {
        const batch = iconsToPreload.slice(i, i + batchSize);
        
        // Process batch with timeout to prevent blocking
        await Promise.race([
          iconCacheService.preloadCriticalIcons(batch),
          new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout per batch
        ]);

        // Small delay between batches to prevent blocking the main thread
        if (i + batchSize < iconsToPreload.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log('✅ Critical icons preloaded successfully');
    } catch (error) {
      console.warn('⚠️ Some critical icons failed to preload:', error);
    }
  }

  private getCriticalIcons(theme: 'light' | 'dark') {
    const criticalIcons: Array<{ domain: string; type?: 'logo' | 'symbol'; theme?: 'light' | 'dark' }> = [];

    // 1. Social media icons (always visible in hero section)
    const socialDomains = {
      'x': 'x.com',
      'linkedin': 'linkedin.com', 
      'instagram': 'instagram.com',
      'youtube': 'youtube.com'
    };

    SOCIAL_LINKS.forEach(social => {
      const domain = socialDomains[social.icon as keyof typeof socialDomains];
      if (domain) {
        criticalIcons.push({
          domain,
          type: social.icon === 'x' ? 'logo' : 'symbol',
          theme
        });
      }
    });

    // 2. First few partner logos (visible in hero section carousel)
    const firstPartners = PARTNERS.slice(0, 5); // First 5 partners shown initially
    firstPartners.forEach(partner => {
      criticalIcons.push({
        domain: partner.domain,
        type: 'logo',
        theme
      });
    });

    // 3. First few trusted client logos (visible in hero section)
    const firstClients = TRUSTED_BY_CLIENTS.slice(0, 4); // First 4 clients shown initially
    firstClients.forEach(client => {
      criticalIcons.push({
        domain: client.domain,
        type: 'logo',
        theme
      });
    });

    return criticalIcons;
  }

  /**
   * Preload icons for a specific section when it's about to be visible
   */
  async preloadSectionIcons(sectionType: 'partners' | 'trusted-clients', theme: 'light' | 'dark' = 'light'): Promise<void> {
    const icons: Array<{ domain: string; type?: 'logo' | 'symbol'; theme?: 'light' | 'dark' }> = [];

    if (sectionType === 'partners') {
      PARTNERS.forEach(partner => {
        icons.push({
          domain: partner.domain,
          type: 'logo',
          theme
        });
      });
    } else if (sectionType === 'trusted-clients') {
      TRUSTED_BY_CLIENTS.forEach(client => {
        icons.push({
          domain: client.domain,
          type: 'logo',
          theme
        });
      });
    }

    // Preload in smaller batches for section-specific loading
    const batchSize = 8;
    for (let i = 0; i < icons.length; i += batchSize) {
      const batch = icons.slice(i, i + batchSize);
      
      try {
        await Promise.race([
          iconCacheService.preloadCriticalIcons(batch),
          new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second timeout
        ]);
      } catch (error) {
        console.warn(`Failed to preload ${sectionType} icons batch:`, error);
      }

      // Brief pause between batches
      if (i + batchSize < icons.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  /**
   * Get preload statistics
   */
  getPreloadStats() {
    return {
      started: this.preloadStarted,
      cacheStats: iconCacheService.getCacheStats()
    };
  }
}

// Export singleton instance
export const iconPreloadService = new IconPreloadService();

// Note: Preloading is now initiated by the Preloader component
// to ensure logos start loading during the preloader phase