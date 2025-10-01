
import React, { useRef } from 'react';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { Icon } from './Icon';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

const Step: React.FC<{ step: typeof HOW_IT_WORKS_STEPS[0]; index: number }> = ({ step, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, '-64px');
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className="group flex flex-col items-center gap-6 text-center md:grid md:grid-cols-2 md:items-center md:gap-16 md:text-left mb-12 relative"
        >
            {/* Icon and Number - Placed first for mobile stacking order */}
            <div className={`flex justify-center items-center transition-all duration-700 ease-out ${!isEven ? 'md:order-2' : ''} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/50 dark:bg-black/50 border-4 border-gray-200 dark:border-white/10 transition-transform duration-300 group-hover:scale-105">
                    <div className="absolute w-3 h-3 bg-white dark:bg-brand-dark rounded-full border-2 border-primary"></div>
                    <div className="relative z-10 p-3 bg-primary rounded-full shadow-lg">
                        <Icon name={step.icon} className="h-10 w-10 text-white transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                </div>
            </div>

            {/* Content - Placed second for mobile stacking order */}
            <div 
                className={`transition-all duration-700 ease-out ${!isEven ? 'md:order-1' : ''} ${isVisible ? 'opacity-100 translate-y-0 md:translate-x-0' : `opacity-0 translate-y-10 ${!isEven ? 'md:-translate-x-10' : 'md:translate-x-10'}`}`} 
                style={{transitionDelay: '200ms'}}
            >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-white/80 text-sm"><StyledText text={step.description} /></p>
            </div>
        </div>
    );
}

const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useOnScreen(sectionRef);
  
  return (
    <section 
      ref={sectionRef} 
      className={`py-16 sm:py-20`}
    >
      <div className="container mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-700 ease-out ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Our Approach</h2>
        </div>
        <div className="relative">
          {/* Vertical line removed */}
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <Step key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;