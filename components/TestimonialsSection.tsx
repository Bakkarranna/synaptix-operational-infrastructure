
import React, { useRef } from 'react';
import { TESTIMONIALS } from '../constants';
import { QuoteIcon } from './Icon';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

interface TestimonialsSectionProps {
  currentIndex: number;
  onDotClick: (index: number) => void;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ currentIndex, onDotClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const activeTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section 
      ref={ref}
      id="testimonials" 
      className={`py-16 sm:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold font-montserrat mb-12 bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Trusted by Innovators</h2>
        
        {/* Container now sizes dynamically. min-h is set for larger screens to prevent layout shifts. */}
        <div className="relative max-w-3xl mx-auto sm:min-h-56 flex items-center justify-center">
          {activeTestimonial && (
            <div
              key={currentIndex} // Key forces re-render and re-triggers animation for a smooth transition.
              className="animate-fade-in-fast"
            >
              <div className="flex flex-col items-center justify-center h-full">
                 <QuoteIcon className="w-8 h-8 text-primary mb-4" />
                <p className="text-sm sm:text-base md:text-lg italic text-gray-700 dark:text-white/90 mb-6">"<StyledText text={activeTestimonial.quote} />"</p>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{activeTestimonial.name}</p>
                  <p className="text-gray-500 dark:text-white/70 text-xs">{activeTestimonial.company}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-3 mt-8">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300 dark:bg-white/40'}`}
              aria-label={`Go to testimonial ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;