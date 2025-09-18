

import React, { useRef } from 'react';
import { SERVICES } from '../constants';
import { Icon } from './Icon';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

const ServiceCard: React.FC<{ service: typeof SERVICES[0]; index: number }> = ({ service, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <div 
      ref={ref}
      className={`group snap-start bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer dark:hover:bg-white/10 hover:bg-white/30 border border-gray-900/10 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 animate-glow flex flex-col flex-shrink-0 w-80 lg:w-auto ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms`, transitionProperty: 'opacity, transform, box-shadow' }}
    >
      <div className="mb-4">
          <Icon name={service.icon} className="h-8 sm:h-10 w-8 sm:h-10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"/>
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-3">{service.title}</h3>
      <ul className="text-gray-600 dark:text-white/80 space-y-2 text-xs list-inside flex-grow">
        {service.specialties.map((item, i) => (
            <li key={i} className="flex items-start">
                <span className="text-primary mr-2 mt-1">&#8226;</span>
                <span><StyledText text={item} /></span>
            </li>
        ))}
      </ul>
    </div>
  );
};

const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useOnScreen(sectionRef, '-100px');

  return (
    <section 
      ref={sectionRef} 
      id="services" 
      className={`py-16 sm:py-20`}
    >
      <div className="container mx-auto px-6">
        <div 
          className={`text-center mb-12 transition-all duration-700 ease-out ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="text-xl sm:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">What We Specialize In</h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto">
            We specialize in building intelligent automation systems designed to replace outdated workflows, reduce dependency on human resources, and scale businesses with precision and ease.
          </p>
        </div>
        <div className="relative">
          {/* Mobile: Seamless scrolling marquee */}
          <div className="lg:hidden w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)] -mx-6 px-6">
            <div className="inline-flex flex-nowrap space-x-6 animate-scroll-services hover:pause">
              {[...SERVICES, ...SERVICES].map((service, index) => (
                <ServiceCard key={`marquee-${index}`} service={service} index={index % SERVICES.length} />
              ))}
            </div>
          </div>

          {/* Desktop: Static grid */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
            {SERVICES.map((service, index) => (
              <ServiceCard key={`grid-${index}`} service={service} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;