import { useState, useEffect, useRef } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook for lazy loading with Intersection Observer
 * 
 * @param options - Configuration options for the intersection observer
 * @returns [ref, isVisible, hasBeenVisible] - Reference to attach to element, current visibility, and if it was ever visible
 */
export function useLazyLoad({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
}: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - immediately show the element
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;
        
        setIsVisible(isIntersecting);
        
        if (isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          
          // If triggerOnce is true, stop observing after first intersection
          if (triggerOnce && observerRef.current) {
            observerRef.current.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce, hasBeenVisible]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [elementRef, isVisible, hasBeenVisible] as const;
}

/**
 * Hook specifically for lazy loading images with preload support
 */
export function useLazyImage(src: string, options?: UseLazyLoadOptions) {
  const [elementRef, isVisible, hasBeenVisible] = useLazyLoad(options);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!hasBeenVisible || !src) return;

    // Preload the image
    const img = new Image();
    
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };
    
    img.src = src;
  }, [hasBeenVisible, src]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
    imageLoaded,
    imageError,
    shouldLoad: hasBeenVisible,
  };
}