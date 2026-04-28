import React, { useState, useEffect } from 'react';
import { trackEvent } from '../services/analytics';
import { FLOATING_SERVICES, CTA_BUTTONS, CALENDLY_LINK } from '../constants';
import { Icon } from './Icon';

interface HeroSectionProps {
  navigate: (path: string) => void;
  openCalendlyModal: () => void;
}

const TAGLINES = [
  'Cinematic websites that stop the scroll.',
  'Web apps shipped in weeks, not quarters.',
  'Mobile apps with native-grade performance.',
  'AI-powered systems that run while you sleep.',
  'Brand identity that commands premium prices.',
  'Digital that makes your competitors nervous.',
];

const QUALITY_BADGES = [
  { label: 'TypeScript Strict', icon: 'check' as const },
  { label: 'OWASP Secured', icon: 'check' as const },
  { label: 'Lighthouse 98/100', icon: 'check' as const },
  { label: 'Tested & Validated', icon: 'check' as const },
  { label: 'Full Documentation', icon: 'check' as const },
  { label: 'Production-Grade Arch', icon: 'check' as const },
];

const HERO_NUMBERS = [
  { value: '72h', label: 'Landing page delivery' },
  { value: '10×', label: 'Faster than traditional' },
  { value: '0', label: 'Broken builds shipped' },
  { value: '4', label: 'Markets: US · UK · UAE · AU' },
];

const HeroSection: React.FC<HeroSectionProps> = ({ navigate, openCalendlyModal }) => {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFading, setTaglineFading] = useState(false);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [serviceExiting, setServiceExiting] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(0);
  const [numbersVisible, setNumbersVisible] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTaglineFading(true);
      setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length);
        setTaglineFading(false);
      }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (badgeVisible >= QUALITY_BADGES.length) return;
    const t = setTimeout(() => setBadgeVisible(v => v + 1), 300 + badgeVisible * 180);
    return () => clearTimeout(t);
  }, [badgeVisible]);

  useEffect(() => {
    const t = setInterval(() => {
      setServiceExiting(true);
      setTimeout(() => {
        setServiceIndex(i => (i + 1) % FLOATING_SERVICES.length);
        setServiceExiting(false);
      }, 300);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setNumbersVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const currentService = FLOATING_SERVICES[serviceIndex];

  const handleCTA = (href: string, label: string) => {
    trackEvent('hero_cta_click', { label });
    if (label === 'Start a Project') {
      openCalendlyModal();
    } else {
      navigate(href);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      {/* Radial corner glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #FF5630 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #FF5630 0%, transparent 70%)' }}
      />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT COLUMN */}
          <div className="flex flex-col">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start mb-6">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border"
                style={{
                  background: 'rgba(255,86,48,0.1)',
                  borderColor: 'rgba(255,86,48,0.3)',
                  color: '#FF5630',
                }}
              >
                Premium Software & Web Studio
              </span>
            </div>

            {/* H1 — NVRMND-style stacked massive */}
            <h1
              className="leading-[0.9] text-white mb-2"
              style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
            >
              <span className="block text-6xl md:text-7xl xl:text-8xl">WE BUILD</span>
              <span className="block text-6xl md:text-7xl xl:text-8xl">DIGITAL THAT</span>
              <span
                className="block text-6xl md:text-7xl xl:text-8xl"
                style={{ color: '#FF5630', textShadow: '0 0 30px rgba(255,86,48,0.6)' }}
              >
                HITS DIFFERENT.
              </span>
            </h1>

            {/* Cycling tagline */}
            <p
              className={`text-base md:text-lg text-white/50 mb-3 font-inter transition-opacity duration-300 min-h-[1.75rem] ${taglineFading ? 'opacity-0' : 'opacity-100'}`}
            >
              {TAGLINES[taglineIndex]}
            </p>

            {/* Numbers bar — inline, above CTAs */}
            <div
              className={`grid grid-cols-4 gap-0 mb-8 rounded-xl overflow-hidden border border-white/8 transition-all duration-700 ${numbersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {HERO_NUMBERS.map((n, i) => (
                <div
                  key={n.label}
                  className={`flex flex-col items-center text-center py-3 px-2 ${i < HERO_NUMBERS.length - 1 ? 'border-r border-white/8' : ''}`}
                >
                  <span
                    className="text-xl md:text-2xl font-black font-montserrat text-[#FF5630]"
                    style={{ textShadow: '0 0 12px rgba(255,86,48,0.5)' }}
                  >
                    {n.value}
                  </span>
                  <span className="mt-0.5 text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider leading-tight">
                    {n.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => handleCTA(CALENDLY_LINK, 'Start a Project')}
                className="px-7 py-3.5 rounded-full font-semibold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: '#FF5630',
                  boxShadow: '0 0 20px rgba(255,86,48,0.4)',
                }}
              >
                Start a Project
              </button>
              <button
                onClick={() => handleCTA('/#services', 'See Our Work')}
                className="px-7 py-3.5 rounded-full font-semibold text-white/80 text-sm transition-all duration-200 hover:text-white hover:border-white/40"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                See Our Work
              </button>
            </div>

            {/* Value props */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'zap' as const, label: 'Results, not responses' },
                { icon: 'users' as const, label: 'Industry experts, AI-native' },
                { icon: 'layout' as const, label: '3D + animation native' },
                { icon: 'check' as const, label: 'Tested & verified every build' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon name={icon} className="w-4 h-4 text-[#FF5630] shrink-0" />
                  <span className="text-xs text-white/50">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* Quality card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/40 font-mono uppercase tracking-widest">Build quality report</span>
              </div>
              <p className="text-sm font-bold text-white mb-4">
                Not vibe-coded. <span style={{ color: '#FF5630' }}>Engineering-grade.</span>
              </p>
              <div className="space-y-2.5">
                {QUALITY_BADGES.map((badge, i) => (
                  <div
                    key={badge.label}
                    className={`flex items-center gap-3 transition-all duration-500 ${i < badgeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
                    >
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/70">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating service card */}
            <div
              className="rounded-2xl p-5 transition-all duration-300 animate-float"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className={`transition-opacity duration-300 ${serviceExiting ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-start gap-3">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ background: 'rgba(255,86,48,0.15)' }}
                  >
                    <Icon name={currentService.icon} className="w-5 h-5 text-[#FF5630]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white">{currentService.name}</h4>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,86,48,0.15)', color: '#FF5630' }}
                      >
                        {currentService.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{currentService.benefit}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live ticker */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,86,48,0.06)',
                border: '1px solid rgba(255,86,48,0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/60 font-mono">Active builds this month</span>
              </div>
              <span className="text-sm font-bold text-[#FF5630]">12</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
