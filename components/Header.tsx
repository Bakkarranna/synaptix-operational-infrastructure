import React, { useState, useEffect, useRef } from 'react';
import { NAV_LINKS, RESOURCES_LINKS } from '../constants';
import { Icon, SunIcon, MoonIcon } from './Icon';

interface HeaderProps {
  navigate: (path: string) => void;
  theme: string;
  toggleTheme: () => void;
  openCalendlyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ navigate, theme, toggleTheme, openCalendlyModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(event.target as Node)) {
        setIsResourcesMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    navigate(href);
    setIsMenuOpen(false);
    setIsResourcesMenuOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        scrolled ? 'w-[90%] max-w-5xl' : 'w-[95%] max-w-6xl'
      }`}
    >
      <div className="relative">
        <nav
          className={`flex justify-between items-center px-3 sm:px-5 py-2 rounded-full border transition-all duration-500 ${
            scrolled
              ? 'bg-white/30 dark:bg-black/50 backdrop-blur-2xl border-gray-900/15 dark:border-white/15 shadow-xl shadow-black/10'
              : 'bg-white/15 dark:bg-black/20 backdrop-blur-xl border-gray-900/10 dark:border-white/10 shadow-lg'
          }`}
        >
          {/* Logo */}
          <a href="/" onClick={handleHomeClick} className="flex items-center shrink-0">
            <img
              src={theme === 'dark' ? 'https://iili.io/Fkb6akl.png' : 'https://iili.io/KFWHFZG.png'}
              alt="Synaptix Studio"
              className="h-8 sm:h-9 w-auto"
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-white/75 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Resources dropdown */}
            <div className="relative" ref={resourcesMenuRef}>
              <button
                type="button"
                onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                aria-label="Toggle resources menu"
                aria-expanded={isResourcesMenuOpen}
                aria-haspopup="menu"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-white/75 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all duration-200 flex items-center gap-1"
              >
                Resources
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isResourcesMenuOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-2xl shadow-black/20 p-1.5 z-20"
                  role="menu"
                  aria-label="Resources menu"
                >
                  {RESOURCES_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-800 dark:text-white/85 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-150 text-sm"
                      role="menuitem"
                    >
                      <Icon name={link.icon} className="h-4 w-4 text-[#FF5630] shrink-0" aria-hidden="true" />
                      <span className="font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {/* Start a Project CTA — desktop only */}
            <button
              type="button"
              onClick={openCalendlyModal}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#FF5630] hover:bg-[#ff6d4a] transition-all duration-200 shadow-[0_0_12px_rgba(255,86,48,0.35)] hover:shadow-[0_0_20px_rgba(255,86,48,0.55)] hover:scale-105 active:scale-95"
            >
              Start a Project
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all duration-200"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full right-0 mt-2 w-64 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-2xl shadow-black/20 p-2 z-40"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col gap-0.5">
              {[...NAV_LINKS, ...RESOURCES_LINKS].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 dark:text-white/85 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-150"
                  role="menuitem"
                >
                  <Icon name={link.icon} className="h-4 w-4 text-[#FF5630] shrink-0" aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              ))}
              <div className="mt-1 pt-1 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => { openCalendlyModal(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#FF5630] hover:bg-[#ff6d4a] transition-all duration-200 shadow-[0_0_12px_rgba(255,86,48,0.35)]"
                >
                  Start a Project
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
