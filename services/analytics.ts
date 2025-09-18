// services/analytics.ts

// Make TypeScript aware of the global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

/**
 * Tracks a page view event.
 * @param path - The path of the page being viewed (e.g., '/blog').
 * @param title - The title of the page.
 */
export const trackPageView = (path: string, title: string): void => {
  console.log(`[Analytics] Page View: ${title} (${path})`);
  
  if (typeof window.gtag === 'function') {
    // This will use the Measurement ID already configured in index.html.
    // The path is formatted for hash-based routing.
    window.gtag('event', 'page_view', {
      page_path: path === '/' ? '/' : `/#${path}`,
      page_title: title,
    });
  }
};

/**
 * Tracks a custom event.
 * @param eventName - The name of the event (e.g., 'click_cta').
 * @param eventParams - An object of key-value pairs for event parameters. Defaults to an empty object if not provided.
 */
export const trackEvent = (eventName: string, eventParams: Record<string, any> = {}): void => {
  console.log(`[Analytics] Event: ${eventName}`, eventParams);

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};
