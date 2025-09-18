

import React, { useState, useEffect } from 'react';
import StyledText from './StyledText';

interface CookieConsentBannerProps {
  navigate: (path: string) => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ navigate }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Wait a bit before showing the banner to not be too intrusive on load
    const timer = setTimeout(() => {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        setVisible(true);
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
  };
  
  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      navigate('/privacy');
  }

  if (!visible) {
    return null;
  }

  const consentText = 'We use cookies to enhance your browsing experience and analyze site traffic. By clicking **Accept**, you consent to our use of cookies. Read our ';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 animate-slide-in-up">
      <div className="bg-white/20 dark:bg-black/50 backdrop-blur-md rounded-xl border border-gray-900/10 dark:border-white/10 shadow-lg px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-800 dark:text-white/80 text-center sm:text-left">
          <StyledText text={consentText} />
          <a href="/privacy" onClick={handlePrivacyClick} className="font-bold text-primary hover:underline">Privacy Policy</a>.
        </p>
        <button
          onClick={handleAccept}
          className="bg-primary flex-shrink-0 text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-opacity-90 transition-all transform hover:scale-105"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;