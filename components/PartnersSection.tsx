import React from 'react';
import { PARTNERS } from '../constants';
import PartnerLogo from './PartnerLogo';

const PartnersSection: React.FC = () => {
    // Duplicate the list *once* for a seamless animation loop
    const partnerList = [...PARTNERS, ...PARTNERS];

    return (
        <section id="partners" className="py-12">
            <div className="container mx-auto px-6">
                <h2 className="text-center text-sm font-semibold text-gray-500 dark:text-white/60 uppercase tracking-widest mb-8">
                    Powering Our Solutions with Industry-Leading Technologies
                </h2>
                <div
                    className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"
                >
                    <div className="inline-flex flex-nowrap animate-scroll-final hover:pause">
                        {partnerList.map((partner, index) => {
                            return (
                                <div 
                                    key={`${partner.name}-${index}`} 
                                    className="inline-flex flex-shrink-0 items-center justify-center align-middle px-4 h-10 w-36 group"
                                >
                                    <PartnerLogo
                                        name={partner.name}
                                        domain={partner.domain}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnersSection;