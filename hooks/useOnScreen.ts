
import { useState, useEffect, RefObject } from 'react';

export function useOnScreen(ref: RefObject<HTMLElement>, rootMargin: string = '0px') {
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        // Fallback timer to ensure content becomes visible even if the observer fails in some environments.
        const fallbackTimer = setTimeout(() => {
            setIntersecting(true);
        }, 2500); // After 2.5 seconds, force visibility.

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    clearTimeout(fallbackTimer); // Clear the fallback if observer works correctly.
                    setIntersecting(true);
                    observer.unobserve(element);
                }
            },
            {
                rootMargin,
                threshold: 0.05 // Lowered threshold for better reliability on fast-loading pages.
            }
        );

        observer.observe(element);

        return () => {
            clearTimeout(fallbackTimer);
            if(element) {
                observer.unobserve(element);
            }
        };
    }, [ref, rootMargin]);

    return isIntersecting;
}
