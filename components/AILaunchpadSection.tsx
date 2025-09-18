import React, { useState, useRef } from 'react';
import { LAUNCHPAD_PERSONAS } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon, IconName, CheckIcon } from './Icon';
import StyledText from './StyledText';

type PersonaKey = keyof typeof LAUNCHPAD_PERSONAS;

interface AILaunchpadSectionProps {
  navigate: (path: string) => void;
}

const AILaunchpadSection: React.FC<AILaunchpadSectionProps> = ({ navigate }) => {
  const personaKeys = Object.keys(LAUNCHPAD_PERSONAS) as PersonaKey[];
  const [activePersona, setActivePersona] = useState<PersonaKey>(personaKeys[0]);
  const activeData = LAUNCHPAD_PERSONAS[activePersona];
  
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/#lets-talk');
  };

  const title = "Your AI **Launchpad**";
  const subtitle = "Select your profile to see how we build **tailored AI solutions** to solve your specific challenges and launch your business to the next level.";

  return (
    <section
      ref={ref}
      id="launchpad"
      className={`py-16 sm:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={subtitle} /></p>
        </div>

        {/* Persona Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {personaKeys.map((key) => {
            const persona = LAUNCHPAD_PERSONAS[key];
            return (
              <button
                key={key}
                onClick={() => setActivePersona(key)}
                className={`group p-4 rounded-xl font-bold transition-all duration-300 border-2 flex flex-col items-center justify-center ${activePersona === key ? 'bg-primary text-white border-primary animate-glow shadow-primary/20' : 'bg-white/20 dark:bg-black/20 backdrop-blur-md border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-800 dark:text-white'}`}
              >
                <Icon name={persona.icon} className="h-8 w-8 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 hidden md:block md:mb-2" />
                <span className="text-sm sm:text-base text-center">{persona.title}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Content */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 md:p-12 animate-fade-in-fast">
            <div className="text-center mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-montserrat mb-3">{activeData.title}</h3>
              <p className="text-gray-600 dark:text-white/80 max-w-2xl mx-auto text-xs sm:text-sm">{activeData.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Challenges */}
              <div className="space-y-4">
                <h4 className="font-bold text-base text-gray-900 dark:text-white font-montserrat text-center md:text-left">Your Challenges</h4>
                {activeData.challenges.map((challenge, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                    <h5 className="font-bold text-primary text-sm">{challenge.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-white/80 mt-1">{challenge.description}</p>
                  </div>
                ))}
              </div>
              {/* Solutions */}
              <div className="space-y-4">
                <h4 className="font-bold text-base text-gray-900 dark:text-white font-montserrat text-center md:text-left">Our AI Solutions</h4>
                 {activeData.solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white text-sm">{solution.title}</h5>
                      <p className="text-xs text-gray-600 dark:text-white/80">{solution.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-12">
              <a href="#lets-talk" onClick={handleCTAClick} className="bg-primary text-white font-bold py-2.5 px-7 text-sm rounded-full transition-all transform hover:scale-105 hover:bg-opacity-90 animate-glow inline-block">
                Build Your Solution
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AILaunchpadSection;