import React, { useRef } from 'react';
import { PRICING_PREVIEW_TIERS } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon } from './Icon';

interface PricingPreviewProps {
  openCalendlyModal: () => void;
}

const TIER_INCLUDES: Record<string, string[]> = {
  landing: ['Animated design', 'CRO-optimised copy', 'SEO foundation', '72h delivery'],
  website: ['Multi-page', '3D animations', 'Full brand integration', 'Analytics'],
  webapp: ['Full-stack build', 'Auth & dashboard', 'API integration', 'CI/CD pipeline'],
  mobile: ['iOS & Android', 'Native performance', 'App store submission', 'Push notifications'],
  enterprise: ['Custom scope', 'Multi-system integration', 'Dedicated engineer', 'SLA support'],
};

const PricingPreview: React.FC<PricingPreviewProps> = ({ openCalendlyModal }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <section
      id="pricing"
      ref={ref}
      className={`py-20 md:py-28 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5630] mb-3">Scope & Engagement</p>
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-900 dark:text-white">
            Every project, scoped right.<br />
            <span className="text-[#FF5630]">No hidden costs. No surprises.</span>
          </h2>
          <p className="mt-4 text-gray-600 dark:text-white/60 max-w-xl mx-auto text-sm md:text-base">
            We quote each project based on your exact requirements. Book a discovery call and we'll scope it
            together and give you a clear number before anything starts.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PRICING_PREVIEW_TIERS.map((tier) => {
            const includes = TIER_INCLUDES[tier.id] ?? [];
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl p-5 transition-all duration-300 group ${
                  tier.highlight ? 'ring-2 ring-[#FF5630]/60' : ''
                }`}
                style={{
                  background: tier.highlight
                    ? 'rgba(255,86,48,0.1)'
                    : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: tier.highlight
                    ? '1px solid rgba(255,86,48,0.35)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: tier.highlight ? '0 0 30px rgba(255,86,48,0.12)' : 'none',
                }}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5630] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    Most Requested
                  </div>
                )}

                <h3 className={`text-sm font-bold font-montserrat mb-1 ${tier.highlight ? 'text-white' : 'text-white/80 dark:text-white/80 text-gray-800'}`}>
                  {tier.title}
                </h3>

                <p className="text-white/50 dark:text-white/50 text-gray-500 text-xs leading-relaxed mb-4 flex-1">
                  {tier.description}
                </p>

                {/* Includes */}
                <div className="space-y-1.5 mb-4">
                  {includes.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[11px] text-white/50 dark:text-white/50 text-gray-500">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Turnaround */}
                <div className="flex items-center gap-1 text-[10px] text-[#FF5630] mb-4 font-semibold">
                  <span>⚡</span>
                  <span>{tier.turnaround}</span>
                </div>

                <button
                  onClick={openCalendlyModal}
                  className={`w-full py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                    tier.highlight
                      ? 'bg-[#FF5630] text-white hover:bg-[#ff6a47] shadow-[0_0_12px_rgba(255,86,48,0.35)]'
                      : 'bg-white/8 text-white hover:bg-white/15 border border-white/10'
                  }`}
                >
                  Get a Custom Quote
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-white/30 text-xs mb-4">
            Not sure which scope fits? Book a free 30-minute discovery call and we'll figure it out together.
          </p>
          <button
            onClick={openCalendlyModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,86,48,0.12)',
              border: '1px solid rgba(255,86,48,0.3)',
              color: '#FF5630',
            }}
          >
            Book a Free Discovery Call
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default PricingPreview;
