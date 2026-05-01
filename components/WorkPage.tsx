import React, { useState, useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';

interface CaseStudy {
  id: string;
  client: string;
  type: string;
  typeTag: string;
  headline: string;
  description: string;
  outcomes: string[];
  tech: string[];
  duration: string;
  gradient: string;
  status: 'live' | 'in-progress';
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'meridian-ai',
    client: 'Meridian AI',
    type: 'Web App / SaaS',
    typeTag: 'webapp',
    headline: 'From prototype to funded in 60 days.',
    description: 'Full-stack SaaS dashboard with AI-powered analytics, real-time collaboration, and multi-tenant auth. Shipped in 8 weeks, investor-ready on day 56.',
    outcomes: ['$2.1M seed closed', 'Featured in TechCrunch', 'Lighthouse 97/100'],
    tech: ['React', 'Node.js', 'PostgreSQL', 'OpenAI'],
    duration: '8 weeks',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    status: 'live',
  },
  {
    id: 'hazel-health',
    client: 'Hazel Health',
    type: 'Landing Page',
    typeTag: 'landing',
    headline: '72-hour delivery. 17% conversion rate.',
    description: 'CRO-engineered campaign page for a telehealth brand. A/B-ready, analytics wired on day one, Lighthouse 99.',
    outcomes: ['17% conversion rate', 'Delivered in 68 hours', '99 Lighthouse score'],
    tech: ['React', 'GSAP', 'Vercel'],
    duration: '72h',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    status: 'live',
  },
  {
    id: 'nomados',
    client: 'NomadOS',
    type: 'Mobile App',
    typeTag: 'mobile',
    headline: '#3 on Product Hunt. Day one.',
    description: 'iOS & Android app for remote workers to discover and book co-living spaces. Native performance, offline-first architecture, push notifications.',
    outcomes: ['#3 Product Hunt Day 1', '4.8★ App Store', '10k downloads month 1'],
    tech: ['React Native', 'Expo', 'Supabase', 'Stripe'],
    duration: '10 weeks',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    status: 'live',
  },
  {
    id: 'verd-studio',
    client: 'Verd Brand Studio',
    type: 'Premium Website',
    typeTag: 'website',
    headline: '300% increase in qualified inquiries.',
    description: 'Cinematic portfolio site with GSAP scroll animations, 3D WebGL hero, custom CMS. Creative studio now positions as premium and charges for it.',
    outcomes: ['300% more inquiries', 'Awwwarded SOTD', 'Lighthouse 98/100'],
    tech: ['React', 'Three.js', 'GSAP', 'Sanity'],
    duration: '3 weeks',
    gradient: 'linear-gradient(135deg, #DB2777 0%, #EC4899 100%)',
    status: 'live',
  },
  {
    id: 'pulse-mind',
    client: 'PulseMind',
    type: 'AI Agent System',
    typeTag: 'ai',
    headline: '80% of support resolved without a human.',
    description: 'AI sales + support system with custom-trained agents, CRM sync, voice escalation, and 24/7 availability. $42k/yr saved in headcount.',
    outcomes: ['80% auto-resolution', '3-min avg response', '$42k/yr saved'],
    tech: ['OpenAI', 'LangChain', 'Twilio', 'HubSpot'],
    duration: '6 weeks',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    status: 'live',
  },
  {
    id: 'orion-capital',
    client: 'Orion Capital',
    type: 'Premium Website',
    typeTag: 'website',
    headline: 'Enterprise trust. Boutique craft.',
    description: 'Investor-facing multi-page site for UAE-based private equity. Glassmorphism, animated data visualizations, WCAG AA, used in Series A deck.',
    outcomes: ['Live in 2 weeks', 'Used in Series A', 'Zero a11y violations'],
    tech: ['Next.js', 'Framer Motion', 'Chart.js'],
    duration: '2 weeks',
    gradient: 'linear-gradient(135deg, #FF5630 0%, #ff7a59 100%)',
    status: 'live',
  },
];

const FILTERS = [
  { label: 'All Work', value: 'all' },
  { label: 'Websites', value: 'website' },
  { label: 'Web Apps', value: 'webapp' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'AI Systems', value: 'ai' },
  { label: 'Landing Pages', value: 'landing' },
];

interface WorkPageProps {
  navigate: (path: string) => void;
  openCalendlyModal: () => void;
}

const WorkPage: React.FC<WorkPageProps> = ({ navigate, openCalendlyModal }) => {
  const [active, setActive] = useState('all');
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroVisible = useOnScreen(heroRef);
  const gridVisible = useOnScreen(gridRef, '-60px');

  const filtered = active === 'all'
    ? CASE_STUDIES
    : CASE_STUDIES.filter(c => c.typeTag === active);

  return (
    <div className="min-h-screen pb-32">

      {/* Hero */}
      <div
        ref={heroRef}
        className={`pt-36 pb-16 px-6 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto">
          <div className="max-w-4xl">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border mb-6"
              style={{ background: 'rgba(255,86,48,0.08)', borderColor: 'rgba(255,86,48,0.25)', color: '#FF5630' }}
            >
              Selected Work
            </span>
            <h1
              className="text-6xl md:text-7xl xl:text-8xl text-gray-900 dark:text-white leading-[0.9] mb-6"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              WORK THAT<br />
              <span style={{ color: '#FF5630', textShadow: '0 0 30px rgba(255,86,48,0.5)' }}>SELLS ITSELF.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-900/50 dark:text-white/50 max-w-2xl leading-relaxed">
              Every project is tested, verified, and built to outperform. These are the results. Lighthouse scores, conversion rates, and raised rounds. Not vibes.
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 mb-12">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActive(f.value)}
                className="px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={
                  active === f.value
                    ? { background: '#FF5630', color: '#fff', boxShadow: '0 0 16px rgba(255,86,48,0.4)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((study, i) => (
              <article
                key={study.id}
                className={`group rounded-2xl overflow-hidden transition-all duration-500 ease-out cursor-pointer hover:-translate-y-1 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Gradient band */}
                <div
                  className="h-44 relative overflow-hidden"
                  style={{ background: study.gradient }}
                >
                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  {/* Type badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white/90 bg-black/30 backdrop-blur-sm">
                      {study.type}
                    </span>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono text-white/70 bg-black/30 backdrop-blur-sm">
                      {study.duration}
                    </span>
                  </div>
                  {/* Client name */}
                  <div className="absolute bottom-4 left-4">
                    <p
                      className="text-2xl text-gray-900 dark:text-white"
                      style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.05em' }}
                    >
                      {study.client}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-base font-bold font-montserrat text-gray-900 dark:text-white mb-2 leading-snug">
                    {study.headline}
                  </h2>
                  <p className="text-xs text-gray-900/50 dark:text-white/50 leading-relaxed mb-4">
                    {study.description}
                  </p>

                  {/* Outcomes */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {study.outcomes.map(o => (
                      <span
                        key={o}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(74,222,128,0.1)', color: 'rgb(74,222,128)', border: '1px solid rgba(74,222,128,0.2)' }}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        {o}
                      </span>
                    ))}
                  </div>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/6">
                    {study.tech.map(t => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded font-mono text-gray-900/35 dark:text-white/35"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-gray-900/30 dark:text-white/30 text-sm">
              No projects in this category yet.
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 mt-24">
        <div className="container mx-auto">
          <div
            className="rounded-2xl p-10 md:p-16 text-center"
            style={{
              background: 'rgba(255,86,48,0.05)',
              border: '1px solid rgba(255,86,48,0.15)',
            }}
          >
            <h2
              className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              YOUR PROJECT NEXT?
            </h2>
            <p className="text-gray-900/50 dark:text-white/50 text-sm mb-8 max-w-xl mx-auto">
              Every case study above started with a 30-minute call. Tell us what you're building.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={openCalendlyModal}
                className="px-8 py-3.5 rounded-full font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#FF5630', boxShadow: '0 0 20px rgba(255,86,48,0.4)' }}
              >
                Book a Discovery Call
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3.5 rounded-full font-semibold text-gray-900/70 dark:text-white/70 text-sm hover:text-gray-900 dark:text-white transition-colors duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
              >
                Send a Brief
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WorkPage;
