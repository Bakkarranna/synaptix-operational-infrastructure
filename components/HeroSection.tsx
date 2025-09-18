import React, { useState, useEffect, useMemo } from 'react';
import StyledText from './StyledText';
import { trackEvent } from '../services/analytics';
import { saveNewsletter } from '../services/supabase';
import { PARTNERS, SOCIAL_LINKS, FLOATING_SERVICES, TRUSTED_BY_CLIENTS, CALENDLY_LINK } from '../constants';
import { Icon, SendIcon, CheckCircleIcon, GiftIcon, LightbulbIcon, BoltIcon, WebIcon } from './Icon';
import InteractiveNetwork from './InteractiveNetwork';
import PartnerLogo from './PartnerLogo';

interface HeroSectionProps {
  navigate: (path: string) => void;
}

interface RightColumnContentProps {
  navigate: (path: string) => void;
}

const RightColumnContent: React.FC<RightColumnContentProps> = ({ navigate }) => {
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
    const [exiting, setExiting] = useState(false);
    const [clientLogoPage, setClientLogoPage] = useState(0);
    const [logosExiting, setLogosExiting] = useState(false);
    const logosPerPage = 4;
    const totalLogoPages = Math.ceil(TRUSTED_BY_CLIENTS.length / logosPerPage);
    const [leadsCaptured, setLeadsCaptured] = useState(127);

    useEffect(() => {
        const serviceTimer = setInterval(() => {
            setExiting(true);
            setTimeout(() => {
                setCurrentServiceIndex(prev => (prev + 1) % FLOATING_SERVICES.length);
                setExiting(false);
            }, 300); // fade out duration
        }, 5000); // change every 5 seconds
        return () => clearInterval(serviceTimer);
    }, []);

    // FIX: Corrected the useEffect for the logo carousel.
    // The original code had an unclosed useEffect and an invalid setInterval call, causing multiple errors.
    // The logic is now fixed to cycle logos every 4 seconds with a proper cleanup function.
    useEffect(() => {
        if (totalLogoPages <= 1) return; // Don't run carousel if not enough logos to paginate

        const logoTimer = setInterval(() => {
            setLogosExiting(true);
            setTimeout(() => {
                setClientLogoPage(prev => (prev + 1) % totalLogoPages);
                setLogosExiting(false);
            }, 400); // Animation duration
        }, 4000); // change every 4 seconds
        return () => clearInterval(logoTimer);
    }, [totalLogoPages]);

    const currentService = FLOATING_SERVICES[currentServiceIndex];
    const logosToShow = TRUSTED_BY_CLIENTS.slice(
        clientLogoPage * logosPerPage,
        (clientLogoPage + 1) * logosPerPage
    );

    useEffect(() => {
        const tickerInterval = setInterval(() => {
            setLeadsCaptured(prev => prev + Math.floor(Math.random() * 3));
        }, 4500); // update every 4.5 seconds
        return () => clearInterval(tickerInterval);
    }, []);

    return (
        <div className="hidden md:flex flex-col justify-center items-center gap-3 animate-slide-in-right w-full">

            {/* 1. Dynamic Floating Services Card */}
            <a
                href={currentService.targetId}
                onClick={(e) => { e.preventDefault(); navigate(currentService.targetId); }}
                className="block w-full bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xl animate-float transition-all duration-300 group hover:shadow-primary/20 hover:border-primary/30 hover:animate-glow"
            >
                <div className={`transition-opacity duration-300 space-y-3 ${exiting ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Icon name={currentService.icon} className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{currentService.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-white/80">{currentService.benefit}</p>
                        </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="w-full h-px bg-gray-200 dark:bg-white/10" />

                    {/* Pricing & CTA */}
                    <div className="flex justify-between items-center">
                         <div>
                            <p className="text-xs text-gray-600 dark:text-white/80">One-Time Setup</p>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                                ${currentService.setupFeeRange.min.toLocaleString()} - ${currentService.setupFeeRange.max.toLocaleString()}
                            </p>
                         </div>
                         <div className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                            Explore
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                         </div>
                    </div>
                </div>
            </a>


            {/* 2. Social Proof Mini-Block */}
            <div className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-center gap-1.5">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Trusted by 50+ Businesses</p>
                </div>
                <div className={`grid grid-cols-4 gap-4 items-center justify-items-center py-2 transition-opacity duration-300 min-h-[32px] ${logosExiting ? 'opacity-0' : 'opacity-100'}`}>
                    {logosToShow.map(client => (
                        <div key={client.name} className="h-6 w-full flex items-center justify-center">
                            <PartnerLogo name={client.name} domain={client.domain} />
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-200 dark:border-white/10 pt-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white/90 flex items-center justify-center gap-1.5">
                        <WebIcon className="h-4 w-4" /> 
                        Serving clients globally
                    </p>
                </div>
            </div>

            {/* 3. Offer/Value Proposition */}
            <div className="w-full grid grid-cols-2 gap-3">
                <a 
                    href={CALENDLY_LINK} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-primary/30 rounded-2xl p-4 shadow-xl text-center transition-all duration-300 transform hover:-translate-y-1 animate-glow flex flex-col items-center justify-center"
                >
                    <LightbulbIcon className="h-6 w-6 text-primary mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Free AI Strategy Session</p>
                    <div className="mt-2 text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                        Book Now
                        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </a>
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-3 shadow-xl group hover:border-primary/30 transition-all duration-300 hover:animate-glow flex flex-col h-full justify-center">
                    <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white/90 flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-primary"/> One-Time Setup Fee</p>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white/90 flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-primary"/> Monthly Maintenance</p>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white/90 flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-primary"/> No hidden costs</p>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white/90 flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-primary"/> No bloated retainers</p>
                    </div>
                </div>
            </div>

            {/* 4. Interactive Element */}
            <div className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-2 shadow-xl flex items-center justify-center">
                 <p className="text-xs font-mono font-semibold text-gray-800 dark:text-white/90">
                    <span className="text-green-500">● Live</span> | Leads captured this week: <span className="text-primary">{leadsCaptured}+</span>
                </p>
            </div>
        </div>
    );
};


const HeroSection: React.FC<HeroSectionProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for partner logo carousel
  const [partnerPage, setPartnerPage] = useState(0);
  const [partnerLogosExiting, setPartnerLogosExiting] = useState(false);

  // State for animated button text
  const [buttonTextIndex, setButtonTextIndex] = useState(0);

  const buttonTexts = useMemo(() => ["Subscribe", "Get AI Insights", "Stay Ahead"], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setButtonTextIndex(prev => (prev + 1) % buttonTexts.length);
    }, 2500); // Change text every 2.5 seconds

    return () => clearInterval(interval);
  }, [buttonTexts.length]);

  const currentButtonText = buttonTexts[buttonTextIndex];


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await saveNewsletter({ Email: email });
      setSubmitted(true);
      trackEvent('subscribe_newsletter', { section: 'hero' });
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError("Could not subscribe. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const taglines = React.useMemo(() => [
    "Your business could be smarter. Let's **automate that!**",
    "We build AI that **actually saves you money.**",
    "Unlock your growth with **intelligent automation.**",
    "Meet your new, tireless **AI workforce.**",
    "Unleash **AI Agents**. Unlock **Growth**.",
    "From Voicebots to Web Apps – We **Automate It All**."
  ], []);

  const [taglineIndex, setTaglineIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  
  const typingSpeed = 75;
  const deletingSpeed = 40;
  const pauseDuration = 1200;
  const postDeletionPause = 300;

  useEffect(() => {
    const currentTagline = taglines[taglineIndex % taglines.length];

    if (!isDeleting && subIndex < currentTagline.length) {
      const timeout = setTimeout(() => {
        setSubtitle(currentTagline.substring(0, subIndex + 1));
        setSubIndex(subIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && subIndex === currentTagline.length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && subIndex > 0) {
      const timeout = setTimeout(() => {
        setSubtitle(currentTagline.substring(0, subIndex - 1));
        setSubIndex(subIndex - 1);
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && subIndex === 0) {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setTaglineIndex(prevIndex => prevIndex + 1);
      }, postDeletionPause);
      return () => clearTimeout(timeout);
    }
  }, [subIndex, isDeleting, taglineIndex, taglines]);
  
  // Partner carousel logic
  const partnersPerPage = 5;
  const totalPartnerPages = Math.ceil(PARTNERS.length / partnersPerPage);

  useEffect(() => {
      if (totalPartnerPages <= 1) return;
      const timer = setInterval(() => {
          setPartnerLogosExiting(true);
          setTimeout(() => {
            setPartnerPage(prev => (prev + 1) % totalPartnerPages);
            setPartnerLogosExiting(false);
          }, 300);
      }, 8000); // A slow but dynamic rotation
      return () => clearInterval(timer);
  }, [totalPartnerPages]);

  const partnersToShow = PARTNERS.slice(
      partnerPage * partnersPerPage,
      (partnerPage + 1) * partnersPerPage
  );

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 sm:pt-24 pb-40 lg:pb-32">
        <div className="container mx-auto px-6 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-center">
                {/* Left Column: Main Content */}
                <div className="text-center lg:text-left animate-slide-in-up md:col-span-1 lg:col-span-2">
                    <div className="inline-flex items-center gap-2 py-1 px-3 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full border-gray-200 dark:border-white/10 text-xs text-gray-800 dark:text-white/80 mb-4 animate-glow">
                        <Icon name="zap" className="h-4 w-4 text-primary" />
                        <span>Join the Community of Innovators</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-pixel !leading-tight tracking-normal">
                        <span className="bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">
                        Synaptix Studio: The Future of Smart Business
                        </span>
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-gray-800 dark:text-white/90 font-bold min-h-6">
                        <StyledText text={subtitle} />
                        <span className="inline-block w-[3px] h-5 bg-primary ml-1 align-bottom animate-blink"></span>
                    </p>
                    
                    <form onSubmit={handleSubscribe} className="mt-8 relative max-w-lg mx-auto lg:mx-0">
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@company.com"
                            className="w-full pl-5 pr-28 sm:pr-40 py-2 sm:py-3 text-sm rounded-full border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-md text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition dark:border-white/10 dark:focus:ring-white"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || submitted} 
                            className="absolute top-1/2 right-1.5 -translate-y-1/2 bg-primary/90 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-full hover:bg-primary transition-all transform hover:scale-105 disabled:bg-primary/50 disabled:scale-100 flex items-center justify-center min-w-[100px] sm:min-w-[145px] h-[80%] animate-glow overflow-hidden text-xs sm:text-sm"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            ) : submitted ? (
                                <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                                <span key={buttonTextIndex} className="animate-fade-in-fast">
                                    {currentButtonText}
                                </span>
                            )}
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                    {submitted && <p className="text-green-500 dark:text-green-300 text-xs mt-2">Success! Thanks for subscribing.</p>}
                     {/* NEW CTA Buttons */}
                    <div className="mt-6 flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                      <a
                          href="/#ai-strategy"
                          onClick={(e) => { e.preventDefault(); navigate('/#ai-strategy'); }}
                          className="text-center bg-primary text-white font-bold py-2 px-4 sm:py-2.5 sm:px-6 text-xs sm:text-sm rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow"
                      >
                          Get Your Free AI Strategy
                      </a>
                      {/* Explore AI Tools - Desktop Only */}
                      <a
                          href="/ai-tools"
                          onClick={(e) => { e.preventDefault(); navigate('/ai-tools'); }}
                          className="hidden lg:inline-block text-center bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2 px-4 sm:py-2.5 sm:px-6 text-xs sm:text-sm rounded-full transition-all transform hover:scale-105 hover:bg-primary/30"
                      >
                          Explore AI Tools
                      </a>
                      {/* Book a Demo - Mobile/Tablet Only */}
                      <a
                          href={CALENDLY_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lg:hidden text-center bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2 px-4 sm:py-2.5 sm:px-6 text-xs sm:text-sm rounded-full transition-all transform hover:scale-105 hover:bg-primary/30"
                      >
                          Book a Free Demo
                      </a>
                  </div>
                </div>

                {/* Middle Column: Interactive Network */}
                <div className="hidden lg:flex items-center justify-center lg:col-span-1 animate-fade-in">
                    <InteractiveNetwork navigate={navigate} />
                </div>

                {/* Right Column: Cards */}
                <div className="md:col-span-1 lg:col-span-2">
                    <RightColumnContent navigate={navigate} />
                </div>
            </div>
      </div>
      
      {/* Bottom alignment container */}
      <div className="absolute bottom-10 inset-x-0 z-20 px-24 hidden lg:flex items-baseline">
        {/* Left: Follow us on */}
        <div className="w-1/3 text-left animate-fade-in">
            <h4 className="font-bold text-xs text-gray-600 dark:text-white/70 tracking-wider uppercase mb-2">Follow us on</h4>
            <div className="flex items-center space-x-4">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-6 group"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <Icon name={social.icon}/>
                </a>
              ))}
            </div>
        </div>

        {/* Center: POWERING SOLUTIONS WITH */}
        <div className="w-1/3 text-center animate-fade-in">
            <h4 className="font-bold text-xs text-gray-600 dark:text-white/70 tracking-wider uppercase mb-2">POWERING SOLUTIONS WITH</h4>
            <div
              className={`flex justify-center items-center h-12 gap-x-4 transition-opacity duration-300 min-h-[48px] ${partnerLogosExiting ? 'opacity-0' : 'opacity-100'}`}
            >
                {partnersToShow.map(partner => (
                    <div key={partner.name} className="group flex-shrink-0 h-10 w-20 flex items-center justify-center">
                        <PartnerLogo
                            name={partner.name}
                            domain={partner.domain}
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Get in Touch */}
        <div className="w-1/3 text-right animate-fade-in">
            <h4 className="font-bold text-xs text-gray-600 dark:text-white/70 tracking-wider uppercase mb-2">Get in Touch</h4>
            <a href="mailto:info@synaptixstudio.com" className="font-semibold text-sm text-gray-800 dark:text-white/90 hover:text-primary transition-colors flex items-center justify-end gap-2">
                <Icon name="email" className="h-4 w-4" />
                info@synaptixstudio.com
            </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
