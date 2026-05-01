import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';

interface FinalCTASectionProps {
  openCalendlyModal: () => void;
}

const FinalCTASection: React.FC<FinalCTASectionProps> = ({ openCalendlyModal }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <section
      id="lets-talk"
      ref={ref}
      className={`py-24 md:py-32 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="container mx-auto px-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 md:px-16 py-14 md:py-20 text-center"
          style={{
            background: 'rgba(255,86,48,0.06)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,86,48,0.2)',
            boxShadow: '0 0 80px rgba(255,86,48,0.08)',
          }}
        >
          {/* Corner glow */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,86,48,0.2) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,86,48,0.15) 0%, transparent 70%)' }} />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5630] mb-4">Let's Build</p>

            <h2
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              READY TO HIT DIFFERENT?
            </h2>

            <p className="text-gray-900/60 dark:text-white/60 max-w-xl mx-auto mb-10 text-sm md:text-base">
              Book a 30-minute discovery call. Tell us what you're building. We'll tell you exactly what it will take, how long, and what it will cost.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openCalendlyModal}
                className="px-8 py-3.5 rounded-full font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: '#FF5630',
                  boxShadow: '0 0 20px rgba(255,86,48,0.5)',
                }}
              >
                Book a Discovery Call
              </button>
              <a
                href="mailto:hello@synaptixstudio.com"
                className="px-8 py-3.5 rounded-full font-semibold text-gray-900/80 dark:text-white/80 text-sm transition-all duration-200 hover:text-gray-900 dark:text-white"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                Send us a Brief
              </a>
            </div>

            <p className="mt-8 text-gray-900/25 dark:text-white/25 text-xs">
              No pitch decks. No long discovery questionnaires. Just a real conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
