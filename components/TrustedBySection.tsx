import React, { useEffect, useRef } from 'react';
import { TRUSTED_BY_CLIENTS } from '../constants';
import PartnerLogo from './PartnerLogo';
import { iconPreloadService } from '../services/iconPreload';
import { useLazyLoad } from '../hooks/useLazyLoad';

const TrustedBySection: React.FC = () => {
    // Duplicate the list *once* for a seamless animation loop
    const logoList = [...TRUSTED_BY_CLIENTS, ...TRUSTED_BY_CLIENTS];
    const [sectionRef, isVisible] = useLazyLoad({ threshold: 0.2, rootMargin: '200px' });
    const preloadInitiated = useRef(false);

    // Preload client icons when section becomes visible
    useEffect(() => {
        if (isVisible && !preloadInitiated.current) {
            preloadInitiated.current = true;
            const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            iconPreloadService.preloadSectionIcons('trusted-clients', currentTheme);
        }
    }, [isVisible]);

    return (
        <section 
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="trusted-by" 
            className="py-12 bg-white/5 dark:bg-black/5"
        >
            <div className="container mx-auto px-6">
                <h2 className="text-center text-sm font-semibold text-gray-500 dark:text-white/60 uppercase tracking-widest mb-8">
                    Trusted by 50+ Innovative Companies
                </h2>
                <div
                    className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"
                >
                    <div className="inline-flex flex-nowrap animate-scroll-final hover:pause">
                        {logoList.map((client, index) => (
                            <div 
                                key={`${client.name}-${index}`} 
                                className="inline-flex flex-shrink-0 items-center justify-center align-middle px-4 h-10 w-36 group"
                            >
                                <PartnerLogo
                                    name={client.name}
                                    domain={client.domain}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBySection;