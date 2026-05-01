import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon } from './Icon';
import { IconName } from './Icon';

interface ServiceBlock {
  id: string;
  icon: IconName;
  title: string;
  tagline: string;
  description: string;
  whoFor: string[];
  deliverables: string[];
  tech: string[];
  turnaround: string;
  accentColor: string;
}

const SERVICES: ServiceBlock[] = [
  {
    id: 'websites',
    icon: 'layout',
    title: 'Premium Websites',
    tagline: 'The kind clients screenshot and send to their board.',
    description: 'Cinematic, 3D-animated, conversion-engineered websites that make your brand impossible to ignore. Every scroll interaction is intentional. Every load time is fast. Every pixel earns its place.',
    whoFor: ['Scale-up founders ready to stop losing deals to better-looking competitors', 'Marketing directors launching a rebrand or entering a new market', 'Agencies and studios who need their site to be their best case study'],
    deliverables: ['Multi-page custom build', '3D / WebGL hero animations', 'GSAP scroll interactions', 'CMS integration (Sanity / Contentful)', 'SEO foundation + structured data', 'Lighthouse 95+ guaranteed', 'Full handoff with documentation'],
    tech: ['React / Next.js', 'Three.js', 'GSAP', 'Tailwind', 'Vercel'],
    turnaround: '2–4 weeks',
    accentColor: '#FF5630',
  },
  {
    id: 'landing-pages',
    icon: 'target',
    title: 'Landing Pages',
    tagline: 'Campaign-ready in 72 hours. Conversion-engineered from line one.',
    description: 'A single-purpose page that turns traffic into leads. Written with CRO principles, animated to stop the scroll, and wired to your stack on day one. We\'ve shipped pages in 68 hours that out-convert sites that took months.',
    whoFor: ['Founders running paid campaigns who need a page that actually converts', 'Product teams launching a feature or waitlist', 'Marketers who need a page live before the ad budget runs out'],
    deliverables: ['Single-page custom build', 'CRO-optimized copywriting', 'A/B test-ready structure', 'Analytics + heatmap wiring', 'Lead capture + CRM integration', 'Mobile-first responsive', '72h delivery SLA'],
    tech: ['React', 'GSAP', 'Vercel', 'HubSpot / Klaviyo'],
    turnaround: '72 hours',
    accentColor: '#10B981',
  },
  {
    id: 'web-apps',
    icon: 'code',
    title: 'Web Apps & SaaS',
    tagline: 'Full-stack products shipped at agentic speed.',
    description: 'From auth to dashboard to billing: production-ready web apps built with the architecture that scales. We don\'t scaffold and hand off. We build tested, documented, maintainable software that your team can own after we leave.',
    whoFor: ['Founders with a validated idea ready to build the real product', 'Teams replacing a legacy system with a modern stack', 'Operators who need a custom internal tool their team will actually use'],
    deliverables: ['Full-stack application build', 'Auth + user management', 'Dashboard + admin panel', 'API design + documentation', 'CI/CD pipeline setup', 'Unit + integration test suite', 'OWASP security audit', 'Deployment + monitoring'],
    tech: ['React / Next.js', 'Node.js / Convex', 'PostgreSQL / Supabase', 'Stripe', 'Vercel / AWS'],
    turnaround: '4–8 weeks',
    accentColor: '#4F46E5',
  },
  {
    id: 'mobile-apps',
    icon: 'phone',
    title: 'Mobile Apps',
    tagline: 'iOS & Android. Native performance. Premium UX.',
    description: 'Apps designed to impress and engineered to scale. We build cross-platform with React Native for speed, but never at the cost of feel. Push notifications, offline mode, app store submission: handled.',
    whoFor: ['Founders building a consumer product that lives on the phone', 'B2B operators who need a field or client-facing mobile tool', 'Brands extending their web product to mobile'],
    deliverables: ['iOS + Android build', 'Custom UI design system', 'Push notifications', 'Offline-first architecture', 'App Store + Play Store submission', 'Analytics integration', 'Performance profiling', 'Post-launch support window'],
    tech: ['React Native', 'Expo', 'Supabase', 'Firebase', 'Stripe'],
    turnaround: '6–10 weeks',
    accentColor: '#F59E0B',
  },
  {
    id: 'brand-identity',
    icon: 'sparkles',
    title: 'Brand Identity',
    tagline: 'Visual identity systems that communicate premium before you say a word.',
    description: 'Logo, design system, brand guidelines, and assets, all built to scale. We don\'t just make things look good. We build identity systems that work across every surface, from a business card to a 100-foot billboard.',
    whoFor: ['Pre-launch founders who need a brand before building the product', 'Scale-up teams whose current brand no longer reflects who they are', 'Agencies rebranding a client and needing a delivery-grade system'],
    deliverables: ['Logo + logomark variants', 'Primary + extended color palette', 'Typography system', 'Component design system (Figma)', 'Brand usage guidelines', 'Icon set', 'Social + marketing templates', 'Asset export package'],
    tech: ['Figma', 'Adobe Illustrator', 'Framer'],
    turnaround: '1–3 weeks',
    accentColor: '#EC4899',
  },
  {
    id: 'ai-systems',
    icon: 'zap',
    title: 'AI Agent Systems',
    tagline: 'Autonomous agents that run your ops, sales, and support 24/7.',
    description: 'Custom AI agents trained on your business, integrated into your stack, and running autonomously. Not ChatGPT wrappers. Real systems with error handling, fallback logic, escalation paths, and monitoring dashboards.',
    whoFor: ['Operators spending too much on repetitive support and sales tasks', 'Founders who want AI embedded in their product, not bolted on', 'Agencies building AI features for clients and needing a reliable partner'],
    deliverables: ['Custom agent design + training', 'CRM / helpdesk integration', 'Escalation + fallback logic', 'Voice support (Twilio)', 'Monitoring dashboard', 'Knowledge base setup', 'Weekly performance reports', 'Ongoing optimization'],
    tech: ['OpenAI / Anthropic', 'LangChain', 'Pinecone', 'Twilio', 'Zapier / Make'],
    turnaround: '4–8 weeks',
    accentColor: '#8B5CF6',
  },
];

const ServiceCard: React.FC<{ service: ServiceBlock; index: number; navigate: (path: string) => void; openCalendlyModal: () => void }> = ({ service, index, navigate, openCalendlyModal }) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(ref, '-60px');
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      id={service.id}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start py-16 border-b border-white/6 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* Text side — alternates */}
      <div className={isEven ? 'order-1' : 'order-1 lg:order-2'}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${service.accentColor}18`, border: `1px solid ${service.accentColor}30` }}
          >
            <Icon name={service.icon} className="w-5 h-5" style={{ color: service.accentColor }} />
          </div>
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${service.accentColor}12`, color: service.accentColor, border: `1px solid ${service.accentColor}25` }}
          >
            {service.turnaround}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-white mb-3">
          {service.title}
        </h2>
        <p className="text-sm font-semibold mb-4" style={{ color: service.accentColor }}>
          {service.tagline}
        </p>
        <p className="text-sm text-gray-900/55 dark:text-white/55 leading-relaxed mb-8">
          {service.description}
        </p>

        {/* Who it's for */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-900/30 dark:text-white/30 mb-3">Who it's for</p>
          <div className="space-y-2">
            {service.whoFor.map((w, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-900/60 dark:text-white/60 leading-relaxed">
                <span style={{ color: service.accentColor }} className="shrink-0 mt-0.5">→</span>
                {w}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={openCalendlyModal}
            className="px-6 py-3 rounded-full font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: service.accentColor, boxShadow: `0 0 16px ${service.accentColor}40` }}
          >
            Get a Quote
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-3 rounded-full font-semibold text-gray-900/60 dark:text-white/60 text-sm hover:text-gray-900 dark:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
          >
            Send Brief
          </button>
        </div>
      </div>

      {/* Details side */}
      <div className={isEven ? 'order-2' : 'order-2 lg:order-1'}>
        {/* Deliverables */}
        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-900/30 dark:text-white/30 mb-4">What's delivered</p>
          <div className="space-y-2.5">
            {service.deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${service.accentColor}18`, border: `1px solid ${service.accentColor}30` }}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke={service.accentColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-900/70 dark:text-white/70">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-900/25 dark:text-white/25 mb-3">Tech stack</p>
          <div className="flex flex-wrap gap-2">
            {service.tech.map(t => (
              <span
                key={t}
                className="text-xs font-mono px-3 py-1 rounded-md text-gray-900/45 dark:text-white/45"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ServicesPageProps {
  navigate: (path: string) => void;
  openCalendlyModal: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ navigate, openCalendlyModal }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroVisible = useOnScreen(heroRef);

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
              Full Studio Stack
            </span>
            <h1
              className="text-6xl md:text-7xl xl:text-8xl text-gray-900 dark:text-white leading-[0.9] mb-6"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              ONE STUDIO.<br />
              <span style={{ color: '#FF5630', textShadow: '0 0 30px rgba(255,86,48,0.5)' }}>EVERY DIGITAL NEED.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-900/50 dark:text-white/50 max-w-2xl leading-relaxed mb-10">
              Synaptix Studio builds premium websites, web apps, mobile apps, SaaS platforms, brand identities, and AI agent systems, all under one roof, all to the same engineering standard.
            </p>

            {/* Jump links */}
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:text-gray-900 dark:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AEO intro paragraph — structured for AI search */}
      <div className="px-6 mb-4">
        <div className="container mx-auto">
          <div
            className="rounded-2xl px-6 py-5 max-w-4xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-gray-900/35 dark:text-white/35 leading-relaxed">
              <strong className="text-gray-900/50 dark:text-white/50">Synaptix Studio</strong> is a premium AI-forward software and web studio serving clients in the US, UK, UAE, and Australia. Services include custom website design and development, web application and SaaS development, mobile app development (iOS and Android), brand identity systems, landing page development, and AI agent system design. All projects include full test coverage, OWASP security auditing, and Lighthouse performance optimization. Turnaround times range from 72 hours (landing pages) to 10 weeks (mobile apps). Projects are scoped individually. Book a discovery call to receive a custom quote.
            </p>
          </div>
        </div>
      </div>

      {/* Services list */}
      <div className="px-6">
        <div className="container mx-auto">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              navigate={navigate}
              openCalendlyModal={openCalendlyModal}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 mt-20">
        <div className="container mx-auto">
          <div
            className="rounded-2xl p-10 md:p-16 text-center"
            style={{ background: 'rgba(255,86,48,0.05)', border: '1px solid rgba(255,86,48,0.15)' }}
          >
            <h2
              className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              NOT SURE WHICH SERVICE FITS?
            </h2>
            <p className="text-gray-900/50 dark:text-white/50 text-sm mb-8 max-w-lg mx-auto">
              30 minutes. Tell us what you're building. We'll tell you exactly what scope, timeline, and investment it takes.
            </p>
            <button
              onClick={openCalendlyModal}
              className="px-10 py-4 rounded-full font-semibold text-gray-900 dark:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: '#FF5630', boxShadow: '0 0 24px rgba(255,86,48,0.45)' }}
            >
              Book Free Discovery Call
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ServicesPage;
