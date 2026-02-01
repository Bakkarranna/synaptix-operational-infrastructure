import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { FOUNDER_STORY } from '../constants';
import StyledText from './StyledText';
import { QuoteIcon } from './Icon';

const MeetTheFounderSection: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(sectionRef);

    return (
        <section
            ref={sectionRef}
            className={`py-16 sm:py-20 lg:py-24 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {/* Image & Bio */}
                    <div
                        className={`lg:col-span-1 order-1 lg:order-1 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        <div className="relative aspect-square max-w-[280px] sm:max-w-[320px] lg:max-w-[300px] mx-auto group flex items-center justify-center">
                            {/* Orange background circle with glass effect */}
                            <div className="absolute inset-0 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30"></div>

                            {/* The image is smaller, and the ring acts as its border ON TOP of the glass circle */}
                            <img
                                src={FOUNDER_STORY.imageUrl}
                                alt={`Portrait of ${FOUNDER_STORY.name}`}
                                className="relative w-[85%] h-[85%] object-cover rounded-full shadow-lg ring-4 ring-white dark:ring-brand-dark"
                            />
                        </div>
                        <div className="mt-6 text-center max-w-sm mx-auto">
                            <p className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">{FOUNDER_STORY.name}</p>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-white/80 mt-2 leading-relaxed">
                                Founder & CEO at Synaptix Studio — building the operational infrastructure of the next decade, where autonomous systems drive enterprise growth.
                            </p>
                        </div>
                    </div>

                    {/* Story & Quote */}
                    <div
                        className={`lg:col-span-2 order-2 lg:order-2 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{ transitionDelay: '300ms' }}
                    >
                        <h3 className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto] mb-6 lg:mb-4">
                            Meet the Founder
                        </h3>

                        <div className="mt-6 space-y-4 sm:space-y-5 text-sm sm:text-base lg:text-sm xl:text-base text-gray-600 dark:text-white/80 leading-relaxed">
                            {FOUNDER_STORY.story.map((paragraph, index) => (
                                <p key={index} className="leading-relaxed">
                                    <StyledText text={paragraph} />
                                </p>
                            ))}
                        </div>

                        <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary rounded-r-lg">
                            <QuoteIcon className="w-6 h-6 text-primary/80 dark:text-primary/60 mb-3" />
                            <p className="text-base sm:text-lg italic font-semibold text-gray-700 dark:text-white/90 leading-relaxed">
                                <StyledText text={`"${FOUNDER_STORY.quote}"`} />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MeetTheFounderSection;