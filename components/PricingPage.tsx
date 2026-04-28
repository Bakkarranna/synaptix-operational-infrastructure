import React, { useState, useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';

const TIERS = [
  {
    id: 'landing',
    title: 'Landing Page',
    turnaround: '72 hours',
    highlight: false,
    description: 'A single-page conversion engine: animated, CRO-optimized, live in 72 hours.',
    includes: [
      'Custom design + development',
      'GSAP scroll animations',
      'CRO-optimized copy structure',
      'A/B test-ready',
      'Analytics wired (GA4 / Plausible)',
      'Lead capture + CRM integration',
      'Mobile-first responsive',
      'Lighthouse 95+ performance',
      '30-day post-launch support',
    ],
    badge: null,
  },
  {
    id: 'website',
    title: 'Premium Website',
    turnaround: '2–3 weeks',
    highlight: false,
    description: 'Multi-page cinematic site with 3D animations, full brand integration, and CMS.',
    includes: [
      'Multi-page custom build (up to 8 pages)',
      '3D / WebGL hero animations',
      'GSAP scroll interactions',
      'CMS setup (Sanity / Contentful)',
      'SEO foundation + JSON-LD schema',
      'Blog / case study templates',
      'Full brand system integration',
      'Lighthouse 98+ performance',
      'Staging environment + QA',
      '60-day post-launch support',
    ],
    badge: null,
  },
  {
    id: 'webapp',
    title: 'Web App / SaaS',
    turnaround: '4–8 weeks',
    highlight: true,
    description: 'Full-stack product: auth, dashboard, billing, API, production-ready.',
    includes: [
      'Full-stack application build',
      'Auth + user management',
      'Dashboard + admin panel',
      'API design + documentation',
      'Stripe billing integration',
      'CI/CD pipeline (GitHub Actions)',
      'Unit + integration test suite',
      'OWASP security audit',
      'Monitoring + error tracking',
      'Deployment (Vercel / AWS)',
      'Full handoff documentation',
      '90-day post-launch support',
    ],
    badge: 'Most Requested',
  },
  {
    id: 'mobile',
    title: 'Mobile App',
    turnaround: '6–10 weeks',
    highlight: false,
    description: 'iOS & Android: native performance, premium UX, App Store ready.',
    includes: [
      'iOS + Android build (React Native)',
      'Custom UI design system',
      'Push notifications',
      'Offline-first architecture',
      'In-app purchases (RevenueCat)',
      'App Store + Play Store submission',
      'Analytics (Mixpanel / Amplitude)',
      'Performance profiling',
      'OWASP mobile security audit',
      '90-day post-launch support',
    ],
    badge: null,
  },
  {
    id: 'enterprise',
    title: 'Enterprise / AI System',
    turnaround: 'Custom',
    highlight: false,
    description: 'Complex platforms, multi-system integrations, AI agents, custom scope.',
    includes: [
      'Custom scoping workshop',
      'Architecture planning session',
      'Dedicated engineering team',
      'AI agent design + training',
      'Multi-system integration',
      'Custom infrastructure design',
      'SLA + priority support',
      'Dedicated Slack channel',
      'Weekly progress calls',
      'Full IP transfer + source code',
    ],
    badge: 'Custom Quote',
  },
];

const BASE_INCLUDED = [
  'OWASP security audit',
  'Lighthouse performance optimization',
  'Full test suite (unit + integration)',
  'Accessibility audit (WCAG AA)',
  'Mobile-first responsive design',
  'Git repository + clean codebase handoff',
  'Deployment to production',
  'Post-launch support window',
];

const FAQS = [
  {
    q: 'How is Synaptix Studio pricing structured?',
    a: 'Every project is scoped individually. We don\'t publish fixed prices because every project has a different scope, stack, and timeline. Book a free 30-minute discovery call and we\'ll scope your project and send a fixed-price proposal within 48 hours. No hourly billing. No scope creep.',
  },
  {
    q: 'How fast can you actually deliver?',
    a: 'Landing pages: 72 hours. Premium websites: 2–4 weeks. Web apps and SaaS: 4–8 weeks. Mobile apps: 6–10 weeks. These aren\'t best-case estimates, they\'re our standard turnaround, achieved through agentic engineering workflows that compress months of traditional studio time.',
  },
  {
    q: 'What makes Synaptix Studio different from Lovable, Bolt, or other AI builders?',
    a: 'AI builders scaffold code fast but skip the fundamentals: testing, security, architecture, documentation. We use AI as a force-multiplier on top of real engineering discipline. Every project we ship has a full test suite, OWASP security audit, Lighthouse 95+ performance, and complete handoff documentation. Same speed, none of the technical debt.',
  },
  {
    q: 'Do I own the code and IP after the project?',
    a: 'Yes. 100% of the code, design assets, and intellectual property is yours on final payment. We transfer the GitHub repository, Figma files, and all credentials. No licensing fees. No vendor lock-in.',
  },
  {
    q: 'Can you work with my existing brand and design?',
    a: 'Yes. We integrate with existing brand guidelines, Figma files, and design systems. If you need brand work before building, we offer brand identity as a standalone service or as part of the project scope.',
  },
  {
    q: 'Do you offer ongoing support after launch?',
    a: 'Every project includes a post-launch support window (30–90 days depending on scope). For ongoing maintenance, feature development, or retainer arrangements, we offer monthly support packages. Ask us about this during the discovery call.',
  },
  {
    q: 'What markets do you serve?',
    a: 'We work with clients across the US, UK, UAE, and Australia primarily, but operate fully remote and take projects globally. All communication is in English. Contracts and invoicing are in USD.',
  },
  {
    q: 'How does the discovery call work?',
    a: 'It\'s a free 30-minute Zoom call with the founder. We talk about what you\'re building, your goals, timeline, and budget range. No sales pressure. Within 48 hours we send a detailed proposal with a fixed project scope and investment.',
  },
  {
    q: 'Can you start immediately?',
    a: 'Depending on current project load, we typically start new projects within 1–2 weeks of signed agreement. For urgent timelines (like landing pages in 72 hours), we can often accommodate immediately. Ask during the discovery call.',
  },
  {
    q: 'Do you work with pre-revenue startups?',
    a: 'Yes. We work with founders at all stages, from pre-launch MVPs to scale-up redesigns. Budget range matters more than funding stage. If you\'re serious about building something real, book a call.',
  },
];

const FaqItem: React.FC<{ faq: { q: string; a: string } }> = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b transition-colors duration-200"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center text-left py-5 gap-4"
      >
        <span className="text-sm font-semibold text-white leading-snug">{faq.q}</span>
        <span
          className="text-lg shrink-0 transition-transform duration-300 text-white/30"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '300px' : '0px' }}
      >
        <p className="text-sm text-white/55 leading-relaxed pb-5">{faq.a}</p>
      </div>
    </div>
  );
};

interface PricingPageProps {
  navigate: (path: string) => void;
  openCalendlyModal: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ navigate, openCalendlyModal }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  const heroVisible = useOnScreen(heroRef);
  const tiersVisible = useOnScreen(tiersRef, '-60px');
  const baseVisible = useOnScreen(baseRef, '-60px');
  const faqVisible = useOnScreen(faqRef, '-60px');
  const processVisible = useOnScreen(processRef, '-60px');

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
              Transparent Pricing
            </span>
            <h1
              className="text-6xl md:text-7xl xl:text-8xl text-white leading-[0.9] mb-6"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              SCOPED RIGHT.<br />
              <span style={{ color: '#FF5630', textShadow: '0 0 30px rgba(255,86,48,0.5)' }}>PRICED FAIR.</span>
            </h1>
            <p className="text-base md:text-lg text-white/50 max-w-2xl leading-relaxed mb-6">
              No hourly rates. No hidden fees. Every project is scoped as a fixed investment. You know the number before we start, and it doesn't change.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-white/50"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-3.5 h-3.5 text-[#FF5630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prices aren't published because every project is unique. Book a call → get a fixed quote in 48h.
            </div>
          </div>
        </div>
      </div>

      {/* How it works — 3-step process */}
      <div
        ref={processRef}
        className={`px-6 mb-20 transition-all duration-700 ${processVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-8 text-center">How pricing works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Discovery Call', body: '30 minutes. Tell us what you\'re building. We ask the right questions.' },
              { step: '02', title: 'Fixed Proposal', body: 'We send a detailed scope and fixed investment within 48 hours. No surprises.' },
              { step: '03', title: 'We Build', body: 'Agreement signed, 50% deposit, start date confirmed. Build begins immediately.' },
            ].map((s, i) => (
              <div
                key={s.step}
                className={`p-6 rounded-2xl text-center transition-all duration-500 ${processVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="text-3xl font-black font-montserrat mb-4 leading-none"
                  style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,86,48,0.4)', letterSpacing: '0.05em' }}
                >
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier cards */}
      <div ref={tiersRef} className="px-6 mb-20">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-3">Project Types</p>
            <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-white">
              Every project, scoped right.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <div
                key={tier.id}
                className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-500 ease-out ${tiersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${tier.highlight ? 'ring-1 ring-[#FF5630]/40' : ''}`}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  background: tier.highlight ? 'rgba(255,86,48,0.06)' : 'rgba(255,255,255,0.03)',
                  border: tier.highlight ? '1px solid rgba(255,86,48,0.2)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                  {tier.badge && (
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                      style={{ background: 'rgba(255,86,48,0.15)', color: '#FF5630' }}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-bold font-montserrat text-white mb-1">{tier.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-[#FF5630]">⚡ {tier.turnaround}</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{tier.description}</p>
                </div>

                {/* Divider */}
                <div className="mx-6 border-t border-white/6" />

                {/* Includes */}
                <div className="px-6 py-4 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">What's included</p>
                  <div className="space-y-2">
                    {tier.includes.map(item => (
                      <div key={item} className="flex items-start gap-2.5">
                        <svg className="w-3.5 h-3.5 text-[#FF5630] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs text-white/60 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={openCalendlyModal}
                    className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    style={
                      tier.highlight
                        ? { background: '#FF5630', color: '#fff', boxShadow: '0 0 20px rgba(255,86,48,0.4)' }
                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    Get a Custom Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Always included */}
      <div
        ref={baseRef}
        className={`px-6 mb-20 transition-all duration-700 ${baseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto max-w-4xl">
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">Included on every project</p>
            <h2 className="text-xl font-bold font-montserrat text-white mb-6">
              These aren't add-ons. They're the minimum.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BASE_INCLUDED.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
                  >
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div
        ref={faqRef}
        className={`px-6 mb-20 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-3">FAQ</p>
            <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-white">
              Questions you'd ask before booking.
            </h2>
          </div>
          <div
            className="rounded-2xl px-6 md:px-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {FAQS.map(faq => (
              <FaqItem key={faq.q} faq={faq} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6">
        <div className="container mx-auto">
          <div
            className="rounded-2xl p-10 md:p-16 text-center"
            style={{ background: 'rgba(255,86,48,0.05)', border: '1px solid rgba(255,86,48,0.15)' }}
          >
            <h2
              className="text-4xl md:text-5xl text-white mb-4"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              GET YOUR FIXED QUOTE.
            </h2>
            <p className="text-white/50 text-sm mb-8 max-w-lg mx-auto">
              30-minute call. Detailed proposal in 48 hours. Fixed price, no surprises.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={openCalendlyModal}
                className="px-10 py-4 rounded-full font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#FF5630', boxShadow: '0 0 24px rgba(255,86,48,0.45)' }}
              >
                Book Free Discovery Call
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-10 py-4 rounded-full font-semibold text-white/60 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
              >
                Send a Brief Instead
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;
