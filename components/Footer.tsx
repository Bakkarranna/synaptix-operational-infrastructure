import React, { useState } from 'react';
import { Icon, SendIcon, CheckCircleIcon } from './Icon';
import { NAV_LINKS, RESOURCES_LINKS, SOCIAL_LINKS } from '../constants';
// import { saveNewsletter } from '../services/supabase'; // Removed
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { trackEvent } from '../services/analytics';

interface FooterProps {
  navigate: (path: string) => void;
  theme: string;
}

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
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await submitNewsletter({ email: email });
      setSubmitted(true);
      trackEvent('subscribe_newsletter', { section: 'footer' });
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError("Could not subscribe. Please try again.");
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
    <footer className="bg-white/20 dark:bg-black/30 backdrop-blur-md">
      <div className="container mx-auto px-6 py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-1">
            <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="inline-block">
              <img src={theme === 'dark' ? "https://iili.io/Fkb6akl.png" : "https://iili.io/KFWHFZG.png"} alt="Synaptix Studio Logo" className="h-8 w-auto" />
            </a>
            <p className="mt-4 text-gray-600 dark:text-white/60 text-sm max-w-xs">Operational Infrastructure for the Autonomous Era.</p>

            <div className="mt-8">
              <h4 className="font-bold text-sm font-montserrat text-gray-800 dark:text-white mb-1">Join Our Newsletter</h4>
              <p className="text-sm text-gray-600 dark:text-white/70 mb-3">Join 1,000+ founders getting weekly AI growth hacks.</p>
              <form onSubmit={handleSubscribe} className="max-w-sm">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full px-4 py-2 text-sm rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition dark:border-white/10"
                    aria-label="Email for newsletter"
                  />
                  <button type="submit" disabled={loading || submitted} className="flex-shrink-0 bg-primary/90 text-white p-2.5 rounded-lg hover:bg-primary transition-all transform hover:scale-105 disabled:bg-primary/50 disabled:scale-100 flex items-center justify-center animate-glow">
                    {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : submitted ? <CheckCircleIcon className="h-5 w-5" /> : <SendIcon className="h-5 w-5" />}
                  </button>
                </div>
              </form>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              {submitted && <p className="text-green-500 dark:text-green-300 text-xs mt-2">Success! Thank you for subscribing.</p>}
            </div>
          </div>

          {/* Column 2: Links (with nested grid) */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-2">
            <div>
              <h4 className="font-bold text-sm font-montserrat text-gray-800 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {NAV_LINKS.map(link => (
                  <li key={link.href}><a href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white transition-colors text-sm">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm font-montserrat text-gray-800 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {RESOURCES_LINKS.map(link => (
                  <li key={link.href}><a href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white transition-colors text-sm">{link.label}</a></li>
                ))}
                <li><a href="/privacy" onClick={(e) => handleLinkClick(e, '/privacy')} className="text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="/terms" onClick={(e) => handleLinkClick(e, '/terms')} className="text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm font-montserrat text-gray-800 dark:text-white mb-4">Get in Touch</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:info@synaptixstudio.com" className="text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white transition-colors text-sm flex items-center gap-2">
                    <Icon name="email" className="h-5 w-5" />
                    info@synaptixstudio.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-white/20 sm:flex sm:items-center sm:justify-between">
          <p className="text-center text-sm text-gray-500 dark:text-white/50 sm:text-left">
            &copy; {new Date().getFullYear()} Synaptix Studio. All Rights Reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-4 sm:mt-0">
            {SOCIAL_LINKS.map(social => (
              <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="block h-6 group" aria-label={`Follow us on ${social.name}`}>
                <Icon name={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
