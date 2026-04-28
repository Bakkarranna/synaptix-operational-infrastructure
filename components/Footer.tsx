import React, { useState } from 'react';
import { Icon, SendIcon, CheckCircleIcon } from './Icon';
import { NAV_LINKS, RESOURCES_LINKS, SOCIAL_LINKS } from '../constants';
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { trackEvent } from '../services/analytics';

interface FooterProps {
  navigate: (path: string) => void;
  theme: string;
}

const SERVICES_FOOTER = [
  { label: 'Animated Websites', href: '/#services' },
  { label: 'Web Apps & SaaS', href: '/#services' },
  { label: 'Mobile Applications', href: '/#services' },
  { label: 'Landing Pages', href: '/#services' },
  { label: 'AI Agent Systems', href: '/#services' },
  { label: 'AI Marketing', href: '/#services' },
];

const Footer: React.FC<FooterProps> = ({ navigate, theme }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitNewsletter = useMutation(api.forms.submitNewsletter);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      await submitNewsletter({ email });
      setSubmitted(true);
      trackEvent('subscribe_newsletter', { section: 'footer' });
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Could not subscribe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <footer className="bg-white/10 dark:bg-black/20 backdrop-blur-md border-t border-gray-900/8 dark:border-white/8">
      <div className="container mx-auto px-6 pt-16 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">

          {/* Brand col */}
          <div className="lg:col-span-1">
            <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="inline-block">
              <img
                src={theme === 'dark' ? 'https://iili.io/Fkb6akl.png' : 'https://iili.io/KFWHFZG.png'}
                alt="Synaptix Studio"
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-4 text-gray-600 dark:text-white/55 text-sm leading-relaxed max-w-xs">
              Premium AI-forward software & web studio. We build digital that hits different.
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-white/35">
              US · UK · UAE · AU
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[#FF5630]/10 dark:hover:bg-[#FF5630]/15 border border-transparent hover:border-[#FF5630]/30 transition-all duration-200 group"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <Icon name={social.icon} className="h-4 w-4 text-gray-600 dark:text-white/60 group-hover:text-[#FF5630] transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links grid — 3 cols */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">

            {/* Services */}
            <div>
              <h4 className="font-bold text-xs font-montserrat tracking-wider uppercase text-gray-900 dark:text-white mb-4">Services</h4>
              <ul className="space-y-2.5">
                {SERVICES_FOOTER.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className="text-gray-600 dark:text-white/55 hover:text-[#FF5630] dark:hover:text-[#FF5630] transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-xs font-montserrat tracking-wider uppercase text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-gray-600 dark:text-white/55 hover:text-[#FF5630] dark:hover:text-[#FF5630] transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                {RESOURCES_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-gray-600 dark:text-white/55 hover:text-[#FF5630] dark:hover:text-[#FF5630] transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="/privacy" onClick={(e) => handleLinkClick(e, '/privacy')} className="text-gray-600 dark:text-white/55 hover:text-[#FF5630] dark:hover:text-[#FF5630] transition-colors text-sm">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" onClick={(e) => handleLinkClick(e, '/terms')} className="text-gray-600 dark:text-white/55 hover:text-[#FF5630] dark:hover:text-[#FF5630] transition-colors text-sm">Terms of Service</a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold text-xs font-montserrat tracking-wider uppercase text-gray-900 dark:text-white mb-4">Newsletter</h4>
              <p className="text-sm text-gray-600 dark:text-white/55 mb-4 leading-relaxed">
                Premium build insights. No fluff. 1,000+ founders subscribed.
              </p>
              <form onSubmit={handleSubscribe}>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/35 focus:ring-2 focus:ring-[#FF5630]/40 focus:border-transparent transition-all outline-none"
                    aria-label="Email for newsletter"
                  />
                  <button
                    type="submit"
                    disabled={loading || submitted}
                    className="shrink-0 bg-[#FF5630] text-white p-2.5 rounded-lg hover:bg-[#ff6d4a] transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center shadow-[0_0_12px_rgba(255,86,48,0.35)]"
                    aria-label="Subscribe"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : submitted ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                {submitted && <p className="text-green-400 text-xs mt-2">Subscribed. Welcome aboard.</p>}
              </form>

              <div className="mt-6">
                <a
                  href="mailto:hello@synaptixstudio.com"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/55 hover:text-[#FF5630] dark:hover:text-[#FF5630] transition-colors"
                >
                  <Icon name="email" className="h-4 w-4 shrink-0" />
                  hello@synaptixstudio.com
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-900/8 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-white/35">
            &copy; {new Date().getFullYear()} Synaptix Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
            <span>Built by</span>
            <span className="font-bold text-[#FF5630]">Synaptix Studio</span>
            <span>: agentic speed, premium craft.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
