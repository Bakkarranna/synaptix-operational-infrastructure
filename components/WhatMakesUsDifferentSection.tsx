import React, { useRef } from 'react';
import { DIFFERENTIATORS } from '../constants';
import { Icon } from './Icon';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

const DifferentiatorCard: React.FC<{ item: typeof DIFFERENTIATORS[0]; index: number }> = ({ item, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <div
      ref={ref}
      className={`group bg-white/20 dark:bg-black/20 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 border border-gray-900/10 dark:border-white/10 hover:-translate-y-1 hover:border-primary/30 dark:hover:border-primary/30 hover:animate-glow ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${(index + 2) * 100}ms` }}
    >
      <div className="mb-4">
        <Icon name={item.icon} className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-2">{item.title}</h3>
      <p className="text-gray-700 dark:text-white/80 text-sm"><StyledText text={item.description} /></p>
    </div>
  );
};

const WhatMakesUsDifferentSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef);

  return (
    <section 
      ref={sectionRef} 
      className="py-16 sm:py-20"
    >
      <div className="container mx-auto px-6">
        <div 
          className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">What Makes Us Different</h2>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {DIFFERENTIATORS.map((item, index) => (
            <DifferentiatorCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsDifferentSection;