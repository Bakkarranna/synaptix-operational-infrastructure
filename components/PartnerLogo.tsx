
import React, { useState, useEffect } from 'react';

interface PartnerLogoProps {
  name: string;
  domain: string;
}

const BRANDFETCH_CLIENT_ID = '1idyMWHGpXUFWWxXx_q';

const PartnerLogo: React.FC<PartnerLogoProps> = ({ name, domain }) => {
  const [hasError, setHasError] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    setHasError(false);
  }, [domain]);

  const logoUrl = `https://cdn.brandfetch.io/${domain}/logo/${theme}?c=${BRANDFETCH_CLIENT_ID}`;

  if (hasError) {
    return (
      <div className="relative group flex items-center justify-center text-center text-xs font-semibold text-gray-500 dark:text-white/60 h-full w-full">
        {name}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 dark:bg-black/50 dark:border dark:border-white/10 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
          {name}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-black/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group h-full w-full">
      <img
        src={logoUrl}
        alt={`${name} Logo`}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="h-full w-full object-contain filter grayscale group-hover:grayscale-0 dark:invert dark:group-hover:invert-0 transition-all duration-300"
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 dark:bg-black/50 dark:border dark:border-white/10 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        {name}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-black/50"></div>
      </div>
    </div>
  );
};

export default PartnerLogo;
