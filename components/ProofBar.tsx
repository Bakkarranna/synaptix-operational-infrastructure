import React, { useRef } from 'react';
import { PROOF_STATS } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';

const ProofBar: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <section ref={ref} className={`py-8 border-y border-white/10 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
          {PROOF_STATS.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center px-4 py-2">
              <span
                className="text-2xl md:text-3xl font-black font-montserrat text-[#FF5630]"
                style={{ textShadow: '0 0 20px rgba(255,86,48,0.5)' }}
              >
                {stat.value}
              </span>
              <span className="mt-1 text-xs md:text-sm text-white/60 font-inter uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProofBar;
