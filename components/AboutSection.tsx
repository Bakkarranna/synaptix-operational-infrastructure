

import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

interface CultureCardProps {
    title: string;
    description: string;
    delay: number;
}

const CultureCard: React.FC<CultureCardProps> = ({ title, description, delay }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    return (
        <div 
            ref={ref}
            className={`bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 p-6 rounded-lg transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{transitionDelay: `${delay}ms`}}
        >
            <h4 className="font-bold text-sm text-gray-900 dark:text-white font-montserrat border-b border-primary/50 pb-3 mb-3">{title}</h4>
            <p className="text-gray-600 dark:text-white/80 text-xs">{description}</p>
        </div>
    );
}

interface AboutSectionProps {
  navigate: (path: string) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ navigate }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef, '-120px');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const culturePoints = [
    { title: 'Innovation First', description: 'We champion creativity, pushing boundaries through experimentation and future-ready thinking.' },
    { title: 'Client-Centered', description: 'Our success comes from delivering real value. Every project is tailored around the client\'s unique needs.' },
    { title: 'Integrity & Transparency', description: 'No fluff. Just results. We prioritize honest communication and long-term partnerships.' },
    { title: 'Adaptability', description: 'AI moves fast, and so do we. We keep our team and clients on the cutting edge of change.' },
  ];

  const intro1 = "Synaptix Studio is a cutting-edge AI automation agency dedicated to transforming the way businesses operate. By integrating intelligent automation tools such as **AI voice agents, chatbots, and custom web applications**, we help organizations reduce friction, save time, and scale effortlessly.";
  const intro2 = "We aren't just another agency. We're your **strategic partner in future-proofing your operations** — and making your business smarter, leaner, and faster.";


  return (
    <section id="about" ref={sectionRef} className="py-16 sm:py-20 overflow-hidden">
      <div className="container mx-auto px-6 space-y-16">
        
        {/* --- Introduction --- */}
        <div 
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="text-xl md:text-2xl font-bold font-montserrat text-center mb-12 bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Who We Are</h2>
          <div className="max-w-3xl mx-auto text-center">
            <div className="space-y-4 text-sm md:text-base text-gray-600 dark:text-white/80 leading-relaxed text-left">
               <p><StyledText text={intro1} /></p>
               <p><StyledText text={intro2} /></p>
            </div>
            <div className="mt-8 flex flex-row justify-center items-center gap-4">
              <a
                href="/careers"
                onClick={(e) => handleLinkClick(e, '/careers')}
                className="bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2 px-6 text-sm rounded-full transition-all transform hover:scale-105 hover:bg-primary/30 animate-glow text-center"
              >
                Join Our Team
              </a>
              <a
                href="/partner"
                onClick={(e) => handleLinkClick(e, '/partner')}
                className="bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2 px-6 text-sm rounded-full transition-all transform hover:scale-105 hover:bg-primary/30 animate-glow text-center"
              >
                Partner With Us
              </a>
            </div>
          </div>
        </div>

        {/* --- Mission & Vision --- */}
        <div 
            className={`bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-8 md:p-12 grid md:grid-cols-2 gap-x-12 gap-y-10 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{transitionDelay: '200ms'}}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-montserrat border-b border-primary/50 pb-3 mb-3 bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Our Mission</h3>
            <p className="text-gray-600 dark:text-white/80 leading-relaxed text-sm">
              To democratize AI automation for small and medium businesses by delivering intelligent solutions that streamline operations, reduce manual work, and create exceptional customer experiences — all while keeping innovation accessible and scalable.
            </p>
          </div>
          <div className="space-y-4 md:pl-12 md:border-l md:border-gray-200 dark:md:border-white/20">
            <h3 className="text-lg font-bold font-montserrat border-b border-primary/50 pb-3 mb-3 bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Our Vision</h3>
            <p className="text-gray-600 dark:text-white/80 leading-relaxed text-sm">
              To become the go-to AI automation partner for global businesses seeking to accelerate growth, reduce operational costs, and enhance user experience through smart, AI-powered systems.
            </p>
          </div>
        </div>
        
        {/* --- Our Culture --- */}
        <div 
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{transitionDelay: '400ms'}}
        >
            <h3 className="text-center text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Our Culture</h3>
            <p className="text-center mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-2xl mx-auto">At Synaptix Studio, culture isn't just a buzzword — it's our foundation for innovation and partnership:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
                {culturePoints.map((point, index) => (
                    <CultureCard 
                        key={point.title} 
                        title={point.title} 
                        description={point.description} 
                        delay={index * 150}
                    />
                ))}
            </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;