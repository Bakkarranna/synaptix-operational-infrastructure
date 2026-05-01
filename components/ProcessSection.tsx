import React, { useRef } from 'react';
import { PROCESS_STEPS } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon } from './Icon';

const POWER_WORDS = ['MAP', 'MAKE', 'BUILD', 'SHIP'];

const ProcessSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <section id="process" ref={ref} className={`py-20 md:py-28 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5630] mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-900 dark:text-white">
            From Brief to Live<br />
            <span className="text-[#FF5630]">in Weeks, Not Months</span>
          </h2>
          <p className="mt-4 text-gray-900/60 dark:text-white/60 max-w-xl mx-auto text-sm md:text-base">
            Our agentic engineering workflow compresses months of traditional studio time into days. No black boxes, no scope creep.
          </p>
        </div>

        <div className="relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF5630]/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.step}
                className="relative flex flex-col items-center text-center"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Power word — big, above the icon */}
                <div
                  className="text-4xl md:text-5xl font-black font-montserrat mb-2 leading-none"
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '1px rgba(255,86,48,0.35)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {POWER_WORDS[i]}
                </div>

                {/* Step number + icon circle */}
                <div
                  className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-5 border border-[#FF5630]/30"
                  style={{
                    background: 'rgba(255,86,48,0.08)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 24px rgba(255,86,48,0.15)',
                  }}
                >
                  <Icon name={step.icon} className="w-6 h-6 text-[#FF5630]" />
                </div>

                <div
                  className="px-5 py-4 rounded-2xl w-full"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="text-xs font-mono text-[#CC4526]/70 dark:text-[#FF5630]/70 mb-1">{step.duration}</div>
                  <h3 className="text-base font-bold font-montserrat text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-900/55 dark:text-white/55 text-xs leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow between steps (mobile only) */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="md:hidden text-gray-900/20 dark:text-white/20 text-2xl mt-4 mb-0">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
