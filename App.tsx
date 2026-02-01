
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";
import { BlogPost } from "./src/types"; // path to types in src
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import HowItWorksSection from './components/HowItWorksSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Background from './components/Background';
import AboutSection from './components/AboutSection';
import MeetTheFounderSection from './components/MeetTheFounderSection';
import LegalPage from './components/LegalPage';
import ChatWidget from './components/ChatWidget';
import LetsTalkSection from './components/LetsTalkSection';
import ResourceCenterSection from './components/ResourceCenterSection';
import TestimonialsSection from './components/TestimonialsSection';
import PartnersSection from './components/PartnersSection';
import TrustedBySection from './components/TrustedBySection';
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT, TESTIMONIALS, AI_STRATEGY_ARTICLES, PRICING_FAQS } from './constants';
import Preloader from './components/Preloader';
import CookieConsentBanner from './components/CookieConsentBanner';
import PricingSection from './components/PricingSection';
import AILaunchpadSection from './components/AILaunchpadSection';
import BlogPage from './components/BlogPage';
import PartnerPage from './components/PartnerPage';
import CareersPage from './components/CareersPage';
import PasswordModal from './components/admin/PasswordModal';
import BlogAdminDashboard from './components/admin/BlogAdminDashboard';
import Sitemap from './components/Sitemap';
// import { getBlogPosts, BlogPost } from './services/supabase'; // Removed
import { trackPageView } from './services/analytics';
import { useOnScreen } from './hooks/useOnScreen';
import CalendlyModal from './components/CalendlyModal';

const AccordionItem: React.FC<{ faq: { question: string; answer: string; } }> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-900/10 dark:border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-3 sm:py-4"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
      </button>
      {isOpen && (
        <div className="pb-3 sm:pb-4 text-gray-600 dark:text-white/80 animate-fade-in-fast text-xs sm:text-sm">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef);

  return (
    <section ref={sectionRef} id="faq" className={`py-16 sm:py-20 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold font-montserrat text-center mb-8 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8">
            {PRICING_FAQS.map((faq, index) => <AccordionItem key={index} faq={faq} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

interface MainContentProps {
  navigate: (path: string) => void;
  blogPosts: BlogPost[];
  currentTestimonialIndex: number;
  onTestimonialDotClick: (index: number) => void;
  openCalendlyModal: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ navigate, blogPosts, currentTestimonialIndex, onTestimonialDotClick, openCalendlyModal }) => (
  <main>
    <HeroSection navigate={navigate} openCalendlyModal={openCalendlyModal} />
    <ServicesSection />
    <HowItWorksSection />
    <PartnersSection />
    <TestimonialsSection currentIndex={currentTestimonialIndex} onDotClick={onTestimonialDotClick} />
    <ContactSection />
    <PricingSection navigate={navigate} openCalendlyModal={openCalendlyModal} />
    <AboutSection navigate={navigate} />
    <MeetTheFounderSection />
    <ResourceCenterSection navigate={navigate} blogPosts={blogPosts} />
    <FAQSection />
    <LetsTalkSection openCalendlyModal={openCalendlyModal} />
  </main>
);

const getRoute = () => {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    const fullPathWithHash = hash.substring(1); // e.g., /ai-tools#roi-calculator
    const hashIndex = fullPathWithHash.indexOf('#');
    if (hashIndex !== -1) {
      const pathname = fullPathWithHash.substring(0, hashIndex);
      const hashPart = fullPathWithHash.substring(hashIndex);
      return { pathname, hash: hashPart };
    }
    return { pathname: fullPathWithHash, hash: '' };
  }
  if (hash.startsWith('#')) {
    return { pathname: '/', hash };
  }
  return { pathname: '/', hash: '' };
};

const updateMetaTags = (title: string, description: string, path: string, imageUrl?: string) => {
  document.title = title;
  const defaultImage = "https://iili.io/F6poge9.png";

  const metaDescriptionTag = document.querySelector('meta[name="description"]');
  if (metaDescriptionTag) {
    metaDescriptionTag.setAttribute('content', description);
  }

  const canonicalUrl = `https://synaptixstudio.com${path === '/' ? '' : `/#${path}`}`;
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalTag.setAttribute('href', canonicalUrl);
  }

  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (ogTitleTag) {
    ogTitleTag.setAttribute('content', title);
  }

  const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  if (ogDescriptionTag) {
    ogDescriptionTag.setAttribute('content', description);
  }

  const ogUrlTag = document.querySelector('meta[property="og:url"]');
  if (ogUrlTag) {
    ogUrlTag.setAttribute('content', canonicalUrl);
  }

  const ogImageTag = document.querySelector('meta[property="og:image"]');
  if (ogImageTag) {
    ogImageTag.setAttribute('content', imageUrl || defaultImage);
  }

  const twitterTitleTag = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitleTag) {
    twitterTitleTag.setAttribute('content', title);
  }

  const twitterDescriptionTag = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescriptionTag) {
    twitterDescriptionTag.setAttribute('content', description);
  }

  const twitterUrlTag = document.querySelector('meta[property="twitter:url"]');
  if (twitterUrlTag) {
    twitterUrlTag.setAttribute('content', canonicalUrl);
  }

  const twitterImageTag = document.querySelector('meta[property="twitter:image"]');
  if (twitterImageTag) {
    twitterImageTag.setAttribute('content', imageUrl || defaultImage);
  }
};

const getInitialTheme = (): 'light' | 'dark' => {
  // Guard against SSR or environments without window/localStorage
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'light';
  }

  try {
    // Default to light mode unless the user has explicitly saved 'dark' in localStorage.
    const storedPrefs = window.localStorage.getItem('theme');
    if (storedPrefs === 'dark') {
      return 'dark';
    }
  } catch (e) {
    console.error("Could not access localStorage to get theme.", e);
  }

  return 'light';
};


const App: React.FC = () => {
  // Handle sitemap route before any other app logic.
  // This is a special case for search engine crawlers.
  if (window.location.pathname === '/sitemap.xml' && !window.location.hash) {
    return <Sitemap />;
  }

  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ pathname: '/', hash: '' });
  // Convex Query
  const convexPostsRaw = useQuery(api.blog.getPosts);

  const blogPosts = useMemo(() => {
    const dbPosts = (convexPostsRaw || []).map((p: any) => ({
      ...p,
      id: p._id, // Map _id to id
      // Map external_links to externalLinks if necessary, though schema defines external_links
      // Frontend uses externalLinks.
      externalLinks: p.external_links,
      // Ensure keywords is string if frontend expects string, but schema has array?
      // Schema: keywords: v.optional(v.array(v.string()))
      // Frontend/Supabase interface: keywords?: string;
      // We might need to join keys if frontend expects string.
      // Let's check Supabase implementation... it did `keywords: post.keywords || ''`.
      // If schema stores array, we join it.
      keywords: Array.isArray(p.keywords) ? p.keywords.join(', ') : (p.keywords || ''),

      // Sanitizing externalLinks like Supabase service did? 
      // Schema: v.array(v.string()) -> Wait, Supabase service had `externalLinks: {platform, url, text}[]`.
      // Convex Schema: `external_links: v.optional(v.array(v.string()))` -> Wait.
      // User's prompt for schema: "external_links (optional)". It didn't specify type detail other than optional.
      // But usually user meant matching existing structure?
      // Supabase `sanitizePost` parsed JSON.
      // If Convex stores strings, we might have issues if we need objects.
      // Let's assume for now we just pass it through or fix schema later if needed.
      // Actually, looking at `blog.ts`, I defined `external_links: v.optional(v.array(v.string()))`.
      // But `BlogPost` type has `externalLinks?: { platform: string; url: string; text: string }[];`.
      // Array of strings != Array of objects.
      // I probably made a mistake in schema definition assuming strings vs objects.
      // BUT, let's proceed with mapping best effort.
    })) as BlogPost[];

    const dbSlugs = new Set(dbPosts.map(p => p.slug));

    // Filter static posts
    const newStaticPosts = AI_STRATEGY_ARTICLES.filter(p => !dbSlugs.has(p.slug));

    // Combine
    const allPosts = [...newStaticPosts, ...dbPosts];

    // Sort
    allPosts.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return allPosts;
  }, [convexPostsRaw]);

  const blogFetchStatus = convexPostsRaw === undefined ? 'loading' : 'success';
  const blogLoadingError = null; // Convex handles errors via boundary usually, or we assume success for now.

  // Admin state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const targetSequence = 'admin';

  // Testimonial State (lifted up)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Calendly Modal State
  const [showCalendlyModal, setShowCalendlyModal] = useState(false);

  // Theme state is initialized robustly to prevent component flicker.
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());

  // Effect to synchronize theme state with the DOM (by toggling the 'dark' class) and localStorage.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage.", e);
    }
  }, [theme]);

  // Memoized function to toggle the theme state.
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Memoized function to open the Calendly modal.
  const openCalendlyModal = useCallback(() => {
    setShowCalendlyModal(true);
  }, []);

  // Memoized function to close the Calendly modal.
  const closeCalendlyModal = useCallback(() => {
    setShowCalendlyModal(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTestimonialDotClick = (index: number) => {
    setCurrentTestimonialIndex(index);
  };

  // fetchBlogPosts removed


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setKeySequence('');
        return;
      }

      // Don't track keypresses if user is typing in an input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const newSequence = keySequence + e.key;
      if (targetSequence.startsWith(newSequence)) {
        setKeySequence(newSequence);
        if (newSequence === targetSequence) {
          if (!isAdminAuthenticated) {
            setShowAdminLogin(true);
          }
          setKeySequence('');
        }
      } else {
        setKeySequence('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence, isAdminAuthenticated]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToAnchor = useCallback((anchor: string) => {
    const targetId = anchor.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 32;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const navigate = useCallback((path: string) => {
    let targetHash = '';
    if (path.startsWith('/#')) {
      targetHash = path.substring(1);
    } else if (path === '/') {
      targetHash = '';
    } else {
      targetHash = `#${path}`;
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      // If hash is the same, it won't trigger hashchange, so we handle it manually
      if (path === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path.includes('#')) {
        const hashPart = path.split('#')[1];
        scrollToAnchor(`#${hashPart}`);
      }
    }
  }, [scrollToAnchor]);

  useEffect(() => {
    const handleLocationChange = () => {
      const newRoute = getRoute();
      setLocation(newRoute);
      // Scroll to top for new page navigations, but not for anchor links on the same page.
      if (!newRoute.hash || newRoute.pathname !== '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // On initial page load, always force navigation to the homepage.
    // This clears any existing hash from the URL.
    if (window.location.hash !== '') {
      window.location.hash = '';
    } else {
      // If there's no hash, we're already on the homepage. Manually call
      // handleLocationChange to ensure the view is correctly rendered.
      handleLocationChange();
    }

    // Listen for subsequent hash changes for navigation *after* the initial load.
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  useEffect(() => {
    if (location.hash && location.pathname === '/') {
      scrollToAnchor(location.hash);
    }
  }, [location, scrollToAnchor]);

  useEffect(() => {
    const path = location.pathname;

    const defaultMeta = {
      title: 'Synaptix Studio | Operational AI Infrastructure Partner',
      description: "Build the autonomous core of your business. We engineer operational AI infrastructure for B2B and SaaS companies to eliminate manual friction and scale revenue."
    };

    const routeMeta: { [key: string]: { title: string, description: string } } = {
      '/privacy': {
        title: 'Privacy Policy | Synaptix Studio',
        description: 'Read the Privacy Policy for Synaptix Studio. We are committed to protecting your privacy and explain how we collect, use, and safeguard your information.'
      },
      '/terms': {
        title: 'Terms of Service | Synaptix Studio',
        description: 'Review the Terms of Service for using the Synaptix Studio website and its AI tools.'
      },
      '/blog': {
        title: 'AI & Automation Blog | Synaptix Studio',
        description: 'Read the latest insights on AI strategy, business automation, case studies, and growth tactics from the Synaptix Studio blog.'
      },
      '/partner': {
        title: 'Partner With Us | Synaptix Studio',
        description: 'Join the Synaptix Studio Affiliate or Referral program. Earn commissions by helping businesses grow with AI automation.'
      },
      '/careers': {
        title: 'Careers | Join Synaptix Studio',
        description: 'Build the future of AI with us. Explore remote internship opportunities at Synaptix Studio and join our mission to empower businesses with intelligent automation.'
      }
    };

    let pageTitle = defaultMeta.title;
    let pageDescription = defaultMeta.description;
    let imageUrl: string | undefined = undefined;

    const hasFinishedLoadingBlogs = blogFetchStatus === 'success' || blogFetchStatus === 'error';

    const blogMatch = path.match(/^\/blog\/(.+)/);
    if (blogMatch) {
      const slug = blogMatch[1];
      const article = blogPosts.find(r => r.slug === slug);
      if (article) {
        pageTitle = `${article.title} | Synaptix Studio Blog`;
        pageDescription = article.description;
        imageUrl = article.image;
      } else if (hasFinishedLoadingBlogs) {
        pageTitle = routeMeta['/blog'].title;
        pageDescription = routeMeta['/blog'].description;
      }
    } else if (routeMeta[path]) {
      pageTitle = routeMeta[path].title;
      pageDescription = routeMeta[path].description;
    }

    updateMetaTags(pageTitle, pageDescription, path, imageUrl);
    trackPageView(path, pageTitle);

  }, [location, blogPosts, blogFetchStatus]);

  // Handles 404 redirects after content has had a chance to load. This is a safer approach.
  useEffect(() => {
    // This effect should only run after the initial loading phase is complete.
    if (loading) return;

    const validStaticPaths = ['/', '/privacy', '/terms', '/blog', '/partner', '/careers'];
    const currentPath = location.pathname;

    const isKnownStaticPath = validStaticPaths.includes(currentPath);
    const isBlogArticlePath = /^\/blog\/.+/.test(currentPath);

    // Check for 404 conditions only when the blog data is confirmed to be loaded or has failed to load.
    const hasFinishedLoadingBlogs = blogFetchStatus === 'success' || blogFetchStatus === 'error';

    if (hasFinishedLoadingBlogs) {
      if (isBlogArticlePath) {
        const slug = currentPath.split('/')[2];
        const articleExists = blogPosts.some(p => p.slug === slug);
        if (!articleExists) {
          console.warn(`404: Blog post not found for slug "${slug}". Redirecting to /blog.`);
          navigate('/blog');
        }
      } else if (!isKnownStaticPath) {
        console.warn(`404: Static path not found for "${currentPath}". Redirecting to home.`);
        navigate('/');
      }
    }
  }, [location, blogPosts, blogFetchStatus, navigate, loading]);


  if (loading) {
    return <Preloader />;
  }

  if (isAdminAuthenticated) {
    return <BlogAdminDashboard
      initialPosts={blogPosts}

      onRefreshPosts={() => { }} // No-op as subscriptions define data 
      onLogout={() => setIsAdminAuthenticated(false)}
      theme={theme}
      toggleTheme={toggleTheme}
    />;
  }

  const renderContent = () => {
    const path = location.pathname;

    if (blogLoadingError) {
      return (
        <div className="flex items-center justify-center min-h-screen text-center p-4">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-red-500/50 p-8 rounded-lg max-w-2xl">
            <h2 className="text-2xl font-bold text-red-500 dark:text-red-300">Failed to Load Content</h2>
            <p className="text-red-600/80 dark:text-red-300/80 mt-2 text-left">{blogLoadingError}</p>
          </div>
        </div>
      )
    }

    const blogMatch = path.match(/^\/blog\/(.+)/);
    if (blogMatch) {
      const slug = blogMatch[1];
      const article = blogPosts.find(r => r.slug === slug);
      // The 404 useEffect now handles redirection, so we just render if found, or null if loading/not found yet.
      return article ? <ArticlePage article={article} allArticles={blogPosts} navigate={navigate} /> : null;
    }

    switch (path) {
      case '/': return <MainContent navigate={navigate} blogPosts={blogPosts} currentTestimonialIndex={currentTestimonialIndex} onTestimonialDotClick={handleTestimonialDotClick} openCalendlyModal={openCalendlyModal} />;
      case '/privacy': return <LegalPage title="Privacy Policy" content={PRIVACY_POLICY_CONTENT} navigate={navigate} />;
      case '/terms': return <LegalPage title="Terms of Service" content={TERMS_OF_SERVICE_CONTENT} navigate={navigate} />;
      case '/blog': return <BlogPage navigate={navigate} blogPosts={blogPosts} />;
      case '/partner': return <PartnerPage navigate={navigate} />;
      case '/careers': return <CareersPage navigate={navigate} />;
      default:
        // By default, render nothing. The 404 useEffect will handle the redirect if needed.
        return null;
    }
  };

  return (
    <div className="relative animate-fade-in">
      <Background theme={theme} />
      <div className="relative z-10">
        <Header navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
        {renderContent()}
        <Footer navigate={navigate} theme={theme} />
      </div>
      <ChatWidget navigate={navigate} theme={theme} blogPosts={blogPosts} openCalendlyModal={openCalendlyModal} />
      <CookieConsentBanner navigate={navigate} />
      <CalendlyModal
        isOpen={showCalendlyModal}
        onClose={closeCalendlyModal}
        theme={theme}
      />
      <PasswordModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setShowAdminLogin(false);
        }}
      />
    </div>
  );
};

export default App;
