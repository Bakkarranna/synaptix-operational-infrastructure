import React, { useRef, useState } from 'react';
import { SERVICES_BENTO } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon } from './Icon';

const ServicesSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const [hovered, setHovered] = useState<string | null>(null);

  const featured = SERVICES_BENTO.find(s => s.featured)!;
  const rest = SERVICES_BENTO.filter(s => !s.featured);

  return (
    <section
      id="services"
      ref={ref}
      className={`py-20 md:py-28 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5630] mb-3">What We Build</p>
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-900 dark:text-white">
            The Full Studio Stack
          </h2>
          <p className="mt-4 text-gray-900/60 dark:text-white/60 max-w-xl mx-auto text-sm md:text-base">
            From cinematic landing pages to full-stack SaaS products. If it's digital and it matters, we build it.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Featured card — spans 5 columns */}
          <ServiceCard
            service={featured}
            isHovered={hovered === featured.id}
            onMouseEnter={() => setHovered(featured.id)}
            onMouseLeave={() => setHovered(null)}
            className="md:col-span-5 md:row-span-2"
            large
          />

          {/* Rest — 2 per row in remaining 7 columns */}
          {rest.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              isHovered={hovered === service.id}
              onMouseEnter={() => setHovered(service.id)}
              onMouseLeave={() => setHovered(null)}
              className="md:col-span-7 lg:col-span-3 last:md:col-span-7 last:lg:col-span-4"
            />
          ))}
        </div>

        <p className="text-center text-gray-900/30 dark:text-white/30 text-xs mt-8">
          Custom scope? Book a 30-min call and we'll build your quote on the spot.
        </p>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  service: typeof SERVICES_BENTO[0];
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  className?: string;
  large?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  className = '',
  large = false,
}) => (
  <div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 cursor-default ${className} ${
      isHovered ? 'scale-[1.02]' : ''
    }`}
    style={{
      background: isHovered
        ? 'rgba(255,86,48,0.08)'
        : 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(16px)',
      border: isHovered
        ? '1px solid rgba(255,86,48,0.3)'
        : '1px solid rgba(255,255,255,0.07)',
      boxShadow: isHovered
        ? '0 0 30px rgba(255,86,48,0.12)'
        : 'none',
      minHeight: large ? '280px' : '160px',
    }}
  >
    {/* Icon */}
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
      style={{
        background: isHovered ? 'rgba(255,86,48,0.2)' : 'rgba(255,86,48,0.1)',
      }}
    >
      <Icon name={service.icon} className="w-5 h-5 text-[#FF5630]" />
    </div>

    {/* Title */}
    <div className="mb-2">
      <h3 className={`font-bold font-montserrat text-white ${large ? 'text-xl' : 'text-base'}`}>
        {service.title}
      </h3>
    </div>

    {/* Description */}
    <p className={`text-white/50 leading-relaxed flex-1 ${large ? 'text-sm' : 'text-xs'}`}>
      {service.description}
    </p>

    {/* Tags */}
    <div className="flex flex-wrap gap-1.5 mt-4">
      {service.tags.map(tag => (
        <span
          key={tag}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {tag}
        </span>
      ))}
    </div>

    {/* Hover arrow */}
    {isHovered && (
      <div className="absolute top-4 right-4 text-[#FF5630] text-lg font-bold transition-opacity duration-200">
        →
      </div>
    )}
  </div>
);

export default ServicesSection;
