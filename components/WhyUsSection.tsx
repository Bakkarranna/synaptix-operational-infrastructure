import React, { useRef } from 'react';
import { WHY_US_ROWS } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';

const WhyUsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <section id="why-us" ref={ref} className={`py-20 md:py-28 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5630] mb-3">The Advantage</p>
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-900 dark:text-white">
            Why Synaptix Studio
            <br />
            <span className="text-[#FF5630]">Hits Different</span>
          </h2>
          <p className="mt-4 text-gray-900/60 dark:text-white/60 max-w-xl mx-auto text-sm md:text-base">
            Traditional studios are slow. Freelancers are unpredictable. We're neither.
          </p>
        </div>

        <div
          className="overflow-x-auto rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900/40 dark:text-white/40 w-1/4" />
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-900/40 dark:text-white/40">Traditional Studio</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-900/40 dark:text-white/40">Freelancer</th>
                <th className="px-6 py-4 text-center relative">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5630]">Synaptix Studio</span>
                  <div className="absolute inset-0 bg-[#FF5630]/5 rounded-t-none" />
                </th>
              </tr>
            </thead>
            <tbody>
              {WHY_US_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                >
                  <td className="px-6 py-4 text-xs font-semibold text-gray-900/50 dark:text-white/50 uppercase tracking-wider whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900/40 dark:text-white/40">{row.traditional}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900/40 dark:text-white/40">{row.freelancer}</td>
                  <td className="px-6 py-4 text-center relative">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.synaptix}</span>
                    <div className="absolute inset-0 bg-[#FF5630]/[0.04]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-gray-900/30 dark:text-white/30 text-xs mt-6">
          Same price bracket as traditional studios. Same quality bar. Half the time.
        </p>
      </div>
    </section>
  );
};

export default WhyUsSection;
