
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLazyImage } from '../hooks/useLazyLoad';
import { iconCacheService } from '../services/iconCache';

interface PartnerLogoProps {
  name: string;
  domain: string;
}

const PartnerLogo: React.FC<PartnerLogoProps> = memo(({ name, domain }) => {
  const [hasError, setHasError] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Theme detection with optimization
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // URL loading with cache - optimized for preloaded icons
  const loadLogoUrl = useCallback(async () => {
    if (isLoadingUrl) return;
    
    // Check if icon is already cached before making a request
    const isCached = iconCacheService.isCached(domain, 'logo', theme);
    if (isCached) {
      setIsLoadingUrl(true);
      try {
        const url = await iconCacheService.getIconUrl(domain, 'logo', theme);
        setLogoUrl(url);
        setHasError(false);
      } catch (error) {
        setHasError(true);
        setLogoUrl('');
      } finally {
        setIsLoadingUrl(false);
      }
      return;
    }
    
    setIsLoadingUrl(true);
    setHasError(false);
    
    try {
      const url = await iconCacheService.getIconUrl(domain, 'logo', theme);
      setLogoUrl(url);
    } catch (error) {
      setHasError(true);
      setLogoUrl('');
    } finally {
      setIsLoadingUrl(false);
    }
  }, [domain, theme, isLoadingUrl]);

  useEffect(() => {
    loadLogoUrl();
  }, [loadLogoUrl]);

  // Lazy loading setup
  const {
    elementRef,
    shouldLoad,
    imageLoaded,
    imageError
  } = useLazyImage(logoUrl, {
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  // Show loading placeholder or fallback if needed
  if (hasError || imageError || (!shouldLoad && !logoUrl)) {
    return (
      <div 
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className="relative group flex items-center justify-center text-center text-xs font-semibold text-gray-500 dark:text-white/60 h-full w-full"
      >
        {isLoadingUrl ? (
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <span className="text-center leading-tight">{name}</span>
        )}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 dark:bg-black/50 dark:border dark:border-white/10 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
          {name}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-black/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className="relative group h-full w-full"
    >
      {shouldLoad && logoUrl && (
        <>
          {/* Removed preloader animation as requested */}
          <img
            src={logoUrl}
            alt={`${name} Logo`}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
            className="h-full w-full object-contain filter grayscale group-hover:grayscale-0 dark:invert dark:group-hover:invert-0 transition-all duration-300"
            style={{
              transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out'
            }}
          />
        </>
      )}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 dark:bg-black/50 dark:border dark:border-white/10 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        {name}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-black/50"></div>
      </div>
    </div>
  );
});

PartnerLogo.displayName = 'PartnerLogo';

export default PartnerLogo;
