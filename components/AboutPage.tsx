import React, { useRef, useState, useEffect } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon } from './Icon';

const VALUES = [
  {
    icon: '⚡',
    title: 'Agentic Speed',
    body: 'We use AI as a force-multiplier, not a shortcut. The result is months of traditional studio time compressed into weeks, without dropping engineering discipline.',
  },
  {
    icon: '🔒',
    title: 'Verified Quality',
    body: 'Every build ships with full test coverage, OWASP security audit, Lighthouse 95+ performance, and documentation. Non-negotiable on every project.',
  },
  {
    icon: '🎯',
    title: 'Outcome-First',
    body: 'We care about conversion rates, raised rounds, and App Store rankings, not just how it looks. Beautiful is a baseline. Impact is the goal.',
  },
  {
    icon: '🤝',
    title: 'Founder-Led',
    body: 'You talk directly to the people building. No account managers. No offshore handoffs. Founder-to-founder communication, daily updates, full transparency.',
  },
];

const TOOLS = [
  'React / Next.js', 'TypeScript', 'Node.js', 'Python',
  'Three.js', 'GSAP', 'Framer Motion', 'Tailwind CSS',
  'PostgreSQL', 'Supabase', 'Convex', 'Prisma',
  'OpenAI', 'Anthropic', 'LangChain', 'Pinecone',
  'React Native', 'Expo', 'Stripe', 'Vercel',
  'AWS', 'Docker', 'GitHub Actions', 'Figma',
];

const ROLES = [
  { title: 'Full-Stack Agentic Engineers', desc: 'Frontend, backend, DevOps: shipping production-grade code at AI-augmented speed.' },
  { title: 'AI-Centric Designers', desc: 'UI/UX professionals who use AI design systems to move faster without compromising craft.' },
  { title: 'Systems Architects', desc: 'Senior engineers who plan scalable infrastructure, database design, and API contracts before a line of code.' },
  { title: 'AI Strategy Experts', desc: 'Specialists in LLM integration, agent design, and automation workflows that actually work in production.' },
];

function useCounter(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); return; }
      setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return value;
}

const STATS = [
  { value: 72, suffix: 'h', label: 'Fastest delivery' },
  { value: 98, suffix: '/100', label: 'Lighthouse baseline' },
  { value: 4, suffix: '', label: 'Markets: US · UK · UAE · AU' },
  { value: 0, suffix: '', label: 'Broken builds shipped' },
];

interface AboutPageProps {
  navigate: (path: string) => void;
  openCalendlyModal: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ navigate, openCalendlyModal }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLDivElement>(null);

  const heroVisible = useOnScreen(heroRef);
  const statsVisible = useOnScreen(statsRef, '-40px');
  const valuesVisible = useOnScreen(valuesRef, '-60px');
  const teamVisible = useOnScreen(teamRef, '-60px');
  const toolsVisible = useOnScreen(toolsRef, '-60px');
  const diffVisible = useOnScreen(diffRef, '-60px');

  const c0 = useCounter(STATS[0].value, 1200, statsVisible);
  const c1 = useCounter(STATS[1].value, 1400, statsVisible);
  const c2 = useCounter(STATS[2].value, 800, statsVisible);
  const c3 = useCounter(STATS[3].value, 600, statsVisible);
  const counters = [c0, c1, c2, c3];

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
              About Synaptix Studio
            </span>
            <h1
              className="text-6xl md:text-7xl xl:text-8xl text-gray-900 dark:text-white leading-[0.9] mb-6"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              NOT AN AGENCY.<br />
              <span style={{ color: '#FF5630', textShadow: '0 0 30px rgba(255,86,48,0.5)' }}>A STUDIO THAT SHIPS.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-900/55 dark:text-white/55 max-w-2xl leading-relaxed">
              Synaptix Studio is a premium AI-forward software and web studio. We build the digital products that make your competitors nervous, engineered by industry experts, accelerated by AI, shipped at a speed traditional studios can't match.
            </p>
          </div>
        </div>
      </div>

      {/* Stats with counter animation */}
      <div
        ref={statsRef}
        className={`px-6 mb-20 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="container mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center text-center py-8 px-4 ${i < 3 ? 'border-r border-white/8' : ''}`}
              >
                <span
                  className="text-4xl md:text-5xl font-black font-montserrat"
                  style={{ color: '#FF5630', textShadow: '0 0 20px rgba(255,86,48,0.4)' }}
                >
                  {counters[i]}{s.suffix}
                </span>
                <span className="mt-2 text-xs text-gray-900/40 dark:text-white/40 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founder story */}
      <div className="px-6 mb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-3">The Story</p>
              <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-white mb-6">
                Built from frustration with how digital gets made.
              </h2>
              <div className="space-y-4 text-sm text-gray-900/60 dark:text-white/60 leading-relaxed">
                <p>
                  I started Synaptix Studio after watching founders (smart, funded, ambitious people) settle for mediocre digital. Not because they didn't care. Because every option was broken. Traditional agencies were slow and expensive. Freelancers were unpredictable. AI builders shipped fast but shipped broken.
                </p>
                <p>
                  The AI builder wave made it worse. Tools like Lovable and Bolt let anyone scaffold a product in minutes. But they skip testing, skip security, skip architecture. The output looks functional until it isn't. Founders shipped products they were embarrassed to show investors.
                </p>
                <p>
                  So I built a different kind of studio. One where AI isn't the product, it's the workflow. A studio of industry experts using the most advanced AI tools, models, and engineering systems available. Agentic speed. Zero shortcuts.
                </p>
                <p>
                  Every project we ship is tested, security-audited, performance-optimized, and documented. Not because a client asks. Because that's the only standard we know.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-montserrat text-gray-900 dark:text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF5630 0%, #ff7a59 100%)', boxShadow: '0 0 20px rgba(255,86,48,0.4)' }}
                >
                  A
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Muhammad Abubakar Siddique</p>
                  <p className="text-xs text-gray-900/40 dark:text-white/40">Founder & CEO, Synaptix Studio</p>
                </div>
              </div>
            </div>

            {/* Values */}
            <div
              ref={valuesRef}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 ${valuesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  className={`rounded-2xl p-5 transition-all duration-500 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{
                    transitionDelay: `${i * 100}ms`,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="text-2xl mb-3">{v.icon}</div>
                  <h3 className="text-sm font-bold font-montserrat text-gray-900 dark:text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-gray-900/50 dark:text-white/50 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div
        ref={teamRef}
        className={`px-6 mb-20 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-3">The Team</p>
            <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-white mb-4">
              Industry experts. AI-native.
            </h2>
            <p className="text-sm text-gray-900/50 dark:text-white/50 max-w-xl mx-auto">
              No generalists. No juniors learning on your project. Every person on your build is a specialist, working with the best AI tools available.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {ROLES.map((r, i) => (
              <div
                key={r.title}
                className={`flex gap-4 p-5 rounded-2xl transition-all duration-500 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(255,86,48,0.12)', border: '1px solid rgba(255,86,48,0.25)' }}
                >
                  <svg className="w-4 h-4 text-[#FF5630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{r.title}</p>
                  <p className="text-xs text-gray-900/50 dark:text-white/50 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div
        ref={toolsRef}
        className={`px-6 mb-20 transition-all duration-700 ${toolsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-3">Tools & Tech</p>
            <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
              Best-in-class stack. Every project.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {TOOLS.map((t, i) => (
              <span
                key={t}
                className={`px-4 py-2 rounded-full text-xs font-mono text-white/50 transition-all duration-300 ${toolsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{
                  transitionDelay: `${i * 35}ms`,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The difference */}
      <div
        ref={diffRef}
        className={`px-6 mb-20 transition-all duration-700 ${diffVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto max-w-4xl">
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{ background: 'rgba(255,86,48,0.04)', border: '1px solid rgba(255,86,48,0.12)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630] mb-4">Why It Matters</p>
            <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-white mb-6">
              The tools your competitors use ship broken. We ship verified.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-900/55 dark:text-white/55">
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-2">What AI builders skip</p>
                <p>Testing. Security audits. Error handling. Documentation. Accessibility. Performance tuning. Clean architecture. The fundamentals that determine whether software actually works in production.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-2">What we do instead</p>
                <p>Full test suites. OWASP security on every project. Lighthouse 95+ as a baseline. Clean architecture with typed APIs. Full handoff documentation. Everything a professional product requires.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-2">The result</p>
                <p>Software that works. Products that impress investors. Websites that convert. Systems that run at 2am without breaking. Digital that actually justifies what you paid for it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6">
        <div className="container mx-auto">
          <div
            className="rounded-2xl p-10 md:p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2
              className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              READY TO BUILD WITH US?
            </h2>
            <p className="text-gray-900/50 dark:text-white/50 text-sm mb-8 max-w-lg mx-auto">
              30 minutes. No pitch decks. Just a real conversation about what you're building and how we can help.
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
                onClick={() => navigate('/work')}
                className="px-8 py-3.5 rounded-full font-semibold text-gray-900/60 dark:text-white/60 text-sm hover:text-gray-900 dark:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
              >
                See Our Work
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
