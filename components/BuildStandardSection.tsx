import React, { useState, useEffect, useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { BUILD_QUALITY_TERMINAL } from '../constants';
import { Icon } from './Icon';

const COMPARISON_ROWS = [
  { label: 'Testing & QA',           theirs: false, ours: 'Full suite: unit, integration, E2E' },
  { label: 'Security audit',         theirs: false, ours: 'OWASP Top 10 on every project' },
  { label: 'Error handling',         theirs: false, ours: 'Graceful states, no silent crashes' },
  { label: 'Performance tuning',     theirs: false, ours: 'Lighthouse 95+ baseline' },
  { label: 'Clean architecture',     theirs: false, ours: 'Typed APIs, modular structure' },
  { label: 'Handoff documentation',  theirs: false, ours: 'Full docs included, always' },
  { label: 'Accessibility',          theirs: false, ours: 'WCAG-compliant by default' },
];

const BuildStandardSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef, '-80px');
  const [terminalStep, setTerminalStep] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isVisible && !started) setStarted(true);
  }, [isVisible, started]);

  useEffect(() => {
    if (!started) return;
    if (terminalStep >= BUILD_QUALITY_TERMINAL.length) return;
    const t = setTimeout(() => setTerminalStep(s => s + 1), 500 + terminalStep * 180);
    return () => clearTimeout(t);
  }, [started, terminalStep]);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-6">

        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border"
              style={{
                background: 'rgba(255,86,48,0.08)',
                borderColor: 'rgba(255,86,48,0.25)',
                color: '#FF5630',
              }}
            >
              Built Different
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-montserrat text-gray-900 dark:text-white mb-4">
            Most AI builders ship broken.{' '}
            <span style={{ color: '#FF5630' }}>We ship verified.</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/60 max-w-2xl mx-auto leading-relaxed">
            Built for people who need results, not responses. Same agentic speed, with the engineering discipline those tools skip entirely.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* LEFT — Terminal */}
          <div
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            style={{ transitionDelay: '150ms' }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 40px rgba(0,0,0,0.4)',
              }}
            >
              {/* Terminal titlebar */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-gray-900/25 dark:text-white/25 text-xs font-mono">synaptix-quality-check.sh</span>
              </div>

              {/* Terminal body */}
              <div className="p-6 font-mono text-xs space-y-2 min-h-[260px]">
                <div className="text-gray-900/30 dark:text-white/30 mb-4">$ ./verify --full-suite --owasp --lighthouse</div>
                {BUILD_QUALITY_TERMINAL.slice(0, terminalStep).map((line, i) => (
                  <div
                    key={i}
                    className={`${line.color} transition-all duration-300 animate-fade-in-fast`}
                  >
                    {line.text}
                  </div>
                ))}
                {terminalStep < BUILD_QUALITY_TERMINAL.length && (
                  <span className="inline-block w-2 h-4 bg-[#FF5630] animate-blink align-middle" />
                )}
                {terminalStep >= BUILD_QUALITY_TERMINAL.length && (
                  <div className="mt-4 pt-4 border-t border-white/5 text-green-400 font-semibold">
                    ✓ All checks passed, cleared for production
                  </div>
                )}
              </div>
            </div>

            {/* Bottom callout */}
            <div
              className="mt-4 rounded-xl px-5 py-4 flex items-center gap-4"
              style={{
                background: 'rgba(255,86,48,0.06)',
                border: '1px solid rgba(255,86,48,0.15)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,86,48,0.12)' }}
              >
                <Icon name="zap" className="w-5 h-5 text-[#FF5630]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">AI-augmented. Human-verified.</p>
                <p className="text-xs text-gray-600 dark:text-white/50 mt-0.5">
                  AI generates at speed. Our engineers own every line that ships.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Two-column comparison table */}
          <div
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '300ms' }}
          >
            {/* Column headers */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className="rounded-xl px-4 py-3 text-center"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">Lovable / Bolt</p>
                <p className="text-[10px] text-red-400/50 mt-0.5">AI builders</p>
              </div>
              <div
                className="rounded-xl px-4 py-3 text-center"
                style={{
                  background: 'rgba(255,86,48,0.06)',
                  border: '1px solid rgba(255,86,48,0.2)',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-[#FF5630]">Synaptix Studio</p>
                <p className="text-[10px] text-[#CC4526]/50 dark:text-[#FF5630]/50 mt-0.5">Engineering-grade</p>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-2 gap-3 transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${350 + i * 80}ms` }}
                >
                  {/* Their side */}
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-2.5"
                    style={{
                      background: 'rgba(239,68,68,0.04)',
                      border: '1px solid rgba(239,68,68,0.1)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(239,68,68,0.12)' }}
                    >
                      <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-xs text-red-300/60 line-through leading-tight">{row.label}</span>
                  </div>

                  {/* Our side */}
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-2.5"
                    style={{
                      background: 'rgba(74,222,128,0.04)',
                      border: '1px solid rgba(74,222,128,0.12)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}
                    >
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-900/70 dark:text-white/70 leading-tight">{row.ours}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <p className="mt-6 text-center text-xs text-gray-900/30 dark:text-white/30">
              Same AI speed, none of the technical debt.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BuildStandardSection;
