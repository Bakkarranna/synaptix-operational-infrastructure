import React, { useState, useEffect, useRef } from 'react';
import { NAV_LINKS, AI_TOOLS_NAV_LINKS, RESOURCES_LINKS } from '../constants';
import { Icon, SunIcon, MoonIcon } from './Icon';

interface HeaderProps {
  navigate: (path: string) => void;
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ navigate, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Lock body scroll when mobile menu is open
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    // Cleanup function to ensure scroll is restored
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(event.target as Node)) {
        setIsResourcesMenuOpen(false);
      }
       // Close mobile menu if clicked outside
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    navigate(href);
    setIsMenuOpen(false); // Close mobile menu on nav
    setIsToolsMenuOpen(false);
    setIsResourcesMenuOpen(false);
  };
  
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/');
  }
  
  const handleToolLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    navigate(`/ai-tools${href}`);
    setIsToolsMenuOpen(false);
    setIsMenuOpen(false);
  };
  
  const handleAiToolsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/ai-tools');
    setIsMenuOpen(false);
    setIsToolsMenuOpen(false);
  };

  return (
    <header className="fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-300 ease-out opacity-100 translate-y-0">
      <div className="container mx-auto px-4 sm:px-0 relative">
        <nav className="bg-white/20 dark:bg-black/30 backdrop-blur-xl rounded-full border border-gray-900/10 dark:border-white/10 shadow-lg px-3 sm:px-4 py-1 flex justify-between items-center">
          <a href="/" onClick={handleHomeClick} className="flex items-center">
            <img 
              src={theme === 'dark' ? "https://iili.io/Fkb6akl.png" : "https://iili.io/KFWHFZG.png"} 
              alt="Synaptix Studio Logo" 
              className="h-8 sm:h-9 w-auto" 
            />
          </a>

          <div className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-xs"
              >
                {link.label}
              </a>
            ))}
             <div className="relative" ref={resourcesMenuRef}>
                <button
                  onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                  className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-xs flex items-center gap-1"
                >
                  Resources
                  <svg className={`w-3 h-3 transition-transform text-gray-700 dark:text-white/80 ${isResourcesMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                 {isResourcesMenuOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 shadow-lg p-2 animate-fade-in-fast z-10">
                    {RESOURCES_LINKS.map(link => (
                        <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="flex items-center gap-3 p-2 rounded-lg text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm"
                        >
                        <Icon name={link.icon} className="h-5 w-5 text-primary" />
                        <span>{link.label}</span>
                        </a>
                    ))}
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative" ref={toolsMenuRef}>
              <div className="flex items-center rounded-full bg-primary/10 dark:bg-cta-highlight/20 border border-primary/30 dark:border-cta-highlight/50 transition-all transform hover:scale-105 dark:animate-glow-red">
                <a
                  href="/ai-tools"
                  onClick={handleAiToolsClick}
                  className="text-primary dark:text-white font-semibold py-1 pl-3 sm:pl-4 pr-2 sm:pr-3 text-xs hover:bg-primary/20 dark:hover:bg-cta-highlight/30 rounded-l-full transition-colors duration-200"
                >
                  <span className="hidden sm:inline">Free Business Tools</span>
                  <span className="sm:hidden">AI Tools</span>
                </a>
                <div className="w-px h-4 bg-primary/30 dark:bg-cta-highlight/50" />
                <button
                  onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                  className="py-1 px-2 sm:px-2.5 hover:bg-primary/20 dark:hover:bg-cta-highlight/30 rounded-r-full transition-colors duration-200"
                  aria-label="Toggle business tools menu"
                >
                  <svg className={`w-3 h-3 transition-transform text-primary dark:text-white ${isToolsMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>
              {isToolsMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 shadow-lg p-2 animate-fade-in-fast z-10">
                  {AI_TOOLS_NAV_LINKS.map(tool => (
                    <a
                      key={tool.href}
                      href={`/ai-tools${tool.href}`}
                      onClick={(e) => handleToolLinkClick(e, tool.href)}
                      className="flex items-center gap-3 p-2 rounded-lg text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm"
                    >
                      <Icon name={tool.icon} className="h-5 w-5 text-primary" />
                      <span>{tool.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl text-gray-600 dark:text-white/80 hover:bg-gray-200/50 dark:hover:bg-white/10 border border-gray-900/10 dark:border-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl text-gray-600 dark:text-white/80 hover:bg-gray-200/50 dark:hover:bg-white/10 border border-gray-900/10 dark:border-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full w-auto right-0 mt-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 shadow-lg p-2 z-40 animate-fade-in-fast"
          >
            <div className="flex flex-col space-y-1">
              {[...NAV_LINKS, ...RESOURCES_LINKS].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <Icon name={link.icon} className="h-5 w-5 text-primary" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;