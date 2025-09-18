

import React, { useState, useRef } from 'react';
import { CUSTOM_SOLUTIONS } from '../constants';
import { Icon, IconName } from './Icon';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

type SolutionKey = keyof typeof CUSTOM_SOLUTIONS;

interface CustomSolutionsSectionProps {
  navigate: (path: string) => void;
}

const CustomSolutionsSection: React.FC<CustomSolutionsSectionProps> = ({ navigate }) => {
  const solutionKeys = Object.keys(CUSTOM_SOLUTIONS) as SolutionKey[];
  const [activeTab, setActiveTab] = useState<SolutionKey>(solutionKeys[0]);

  const activeSolution = CUSTOM_SOLUTIONS[activeTab];
  
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/#ai-strategy');
  };

  const title = "Bespoke **AI for Your Industry**";
  const subtitle = "Your challenges are unique. **Your AI solutions should be too.**";

  return (
    <section 
      ref={ref} 
      id="custom-solutions" 
      className={`py-16 sm:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:bg-clip-text dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-2xl mx-auto">
            <StyledText text={subtitle} />
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Tabs */}
          <div className="grid grid-cols-2 md:flex md:flex-col md:w-1/3 gap-2">
            {solutionKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full text-left p-2.5 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${activeTab === key ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white shadow-lg animate-glow' : 'bg-white/20 dark:bg-black/20 backdrop-blur-md hover:bg-white/30 dark:hover:bg-black/10 text-gray-700 dark:text-white border border-gray-900/10 dark:border-white/10'}`}
              >
                {CUSTOM_SOLUTIONS[key].title}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="md:w-2/3 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-shrink-0 p-3 bg-white/10 dark:bg-black/20 rounded-lg">
                <Icon name={activeSolution.icon} className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700 dark:text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">{activeSolution.title}</h3>
                <p className="text-gray-600 dark:text-white/80 mb-6 text-sm"><StyledText text={activeSolution.description} /></p>
                <a href="/#ai-strategy" onClick={handleCTAClick} className="inline-block bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-1.5 px-4 text-xs sm:text-sm rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow">
                  Request Custom Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomSolutionsSection;