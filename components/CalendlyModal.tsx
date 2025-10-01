import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icon';

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const CalendlyModal: React.FC<CalendlyModalProps> = ({ isOpen, onClose, theme }) => {
  const calendlyRef = useRef<HTMLDivElement>(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });
  const isInitialized = useRef(false); // Ref to track if the widget has been initialized for the current session

  // Track viewport dimensions for optimal sizing
  useEffect(() => {
    const updateDimensions = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Calculate optimal modal size based on device and viewport
  const getOptimalModalSize = () => {
    const { width, height } = viewportDimensions;
    const aspectRatio = width / height;
    const isLandscape = aspectRatio > 1.3;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    if (isMobile) {
      if (isLandscape) {
        return 'h-[85vh] max-h-[500px]'; // Landscape mobile
      }
      return 'h-[75vh] max-h-[600px]'; // Portrait mobile
    }
    
    if (isTablet) {
      if (isLandscape) {
        return 'h-[75vh] max-h-[550px]'; // Landscape tablet
      }
      return 'h-[70vh] max-h-[650px]'; // Portrait tablet
    }
    
    if (isDesktop) {
      if (width >= 1920) {
        return 'h-[600px] max-h-[650px]'; // Large desktop/4K - More reasonable size
      }
      if (width >= 1440) {
        return 'h-[580px] max-h-[620px]'; // Standard large desktop - Smaller
      }
      return 'h-[560px] max-h-[600px]'; // Standard desktop - Much more reasonable
    }
    
    return 'h-[560px] max-h-[600px]'; // Fallback
  };

  const getOptimalModalWidth = () => {
    const { width } = viewportDimensions;
    
    if (width >= 1920) {
      return 'max-w-4xl'; // 4K and ultra-wide - Reduced from max-w-6xl
    }
    if (width >= 1440) {
      return 'max-w-3xl'; // Large desktop - Reduced from max-w-5xl
    }
    if (width >= 1024) {
      return 'max-w-2xl'; // Desktop - Much smaller and more appropriate
    }
    if (width >= 768) {
      return 'max-w-xl'; // Tablet - Reduced size
    }
    return 'max-w-full'; // Mobile
  };

  useEffect(() => {
    // Only proceed if the modal is open
    if (!isOpen) {
      // When modal closes, reset the state for the next time it opens
      setIsWidgetLoaded(false);
      isInitialized.current = false;
      return;
    }

    // Do not re-initialize if the widget is already initialized. This prevents the "reappearing preloader".
    if (isInitialized.current) {
        return;
    }
    
    // Set a fallback timer to hide the preloader in case the Calendly event is missed
    const fallbackTimer = setTimeout(() => {
        setIsWidgetLoaded(true);
    }, 3500);

    // Listen for the official Calendly event that signals the widget is ready
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event === 'calendly.event_type_viewed') {
        clearTimeout(fallbackTimer); // Cancel the fallback
        setIsWidgetLoaded(true);
        // We can now remove the listener as we only care about the initial load
        window.removeEventListener('message', handleCalendlyEvent);
      }
    };
    window.addEventListener('message', handleCalendlyEvent);

    const themeParams = theme === 'dark'
      ? 'background_color=000000&text_color=e0e0e0&primary_color=ff5630'
      : 'background_color=f9fafb&text_color=374151&primary_color=ff5630';
    
    const calendlyUrl = `https://calendly.com/synaptix-studio?${themeParams}&hide_event_type_details=1&hide_gdpr_banner=1`;

    if (calendlyRef.current && typeof (window as any).Calendly?.initInlineWidget === 'function') {
      // Clear previous widget content to ensure a fresh instance
      calendlyRef.current.innerHTML = '';
      (window as any).Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement: calendlyRef.current,
      });
      isInitialized.current = true; // Mark as initialized
    }

    // Cleanup function to remove listeners and timers when the modal closes or component unmounts
    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('message', handleCalendlyEvent);
    };

  }, [isOpen, theme]); // Rerun effect if the modal is opened/closed or the theme changes

  return (
    <div 
      className={`fixed inset-0 bg-gray-900/80 dark:bg-black/80 z-[60] flex justify-center items-center overflow-y-auto p-2 sm:p-4 pt-20 sm:pt-24 pb-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div 
        className={`bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl w-full ${getOptimalModalWidth()} relative flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'} animate-glow my-auto mx-auto`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 dark:bg-black/90 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-black transition-all duration-200 z-20 p-2.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 border border-gray-200/50 dark:border-white/20"
          aria-label="Close calendar"
          tabIndex={isOpen ? 0 : -1}
        >
          <CloseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <div className={`relative w-full overflow-hidden rounded-xl min-h-[400px] ${getOptimalModalSize()}`}>
          {/* Custom Full-Size Preloader */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${!isWidgetLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} rounded-xl`}>
            <div className="animate-pulse">
              <img src={theme === 'dark' ? "https://iili.io/Fkb6akl.png" : "https://iili.io/KFWHFZG.png"} alt="Synaptix Studio Logo" className="h-12 w-auto sm:h-14 md:h-16" />
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/70 text-center px-4">Loading scheduling options...</p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          {/* Calendly Widget Container */}
          <div
            ref={calendlyRef}
            className={`calendly-inline-widget w-full h-full transition-opacity duration-500 ${isWidgetLoaded ? 'opacity-100' : 'opacity-0'} rounded-xl`}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendlyModal;
