
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BlogPost } from "./src/types";
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import Footer from './components/Footer';
import Background from './components/Background';
import AboutSection from './components/AboutSection';
import MeetTheFounderSection from './components/MeetTheFounderSection';
import LegalPage from './components/LegalPage';
import ChatWidget from './components/ChatWidget';
import LetsTalkSection from './components/LetsTalkSection';
import ResourceCenterSection from './components/ResourceCenterSection';
import TestimonialsSection from './components/TestimonialsSection';
import ProofBar from './components/ProofBar';
import ProcessSection from './components/ProcessSection';
import BuildStandardSection from './components/BuildStandardSection';
import WhyUsSection from './components/WhyUsSection';
import PricingPreview from './components/PricingPreview';
import FinalCTASection from './components/FinalCTASection';
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT, TESTIMONIALS, AI_STRATEGY_ARTICLES, PROJECT_FAQS } from './constants';
import Preloader from './components/Preloader';
import CookieConsentBanner from './components/CookieConsentBanner';
import BlogPage from './components/BlogPage';
import PartnerPage from './components/PartnerPage';
import CareersPage from './components/CareersPage';
import ContactPage from './components/ContactPage';
import WorkPage from './components/WorkPage';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import PricingPage from './components/PricingPage';
import PasswordModal from './components/admin/PasswordModal';
import BlogAdminDashboard from './components/admin/BlogAdminDashboard';
import Sitemap from './components/Sitemap';
import { trackPageView } from './services/analytics';
import { useOnScreen } from './hooks/useOnScreen';
import CalendlyModal from './components/CalendlyModal';
import ArticlePage from './components/ArticlePage';

class SitemapBoundary extends React.Component<{ children: React.ReactNode }, { errored: boolean }> {
  state = { errored: false };
  static getDerivedStateFromError() { return { errored: true }; }
  render() {
    if (this.state.errored) {
      return <pre style={{ whiteSpace: 'pre-wrap' }}>{'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'}</pre>;
    }
    return this.props.children;
  }
}

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0a', color: '#ff5630', minHeight: '100vh' }}>
          <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Runtime Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '14px' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
            {PROJECT_FAQS.map((faq, index) => <AccordionItem key={index} faq={faq} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

interface AppProps {
  convexPostsRaw?: any[] | undefined;
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
    <ProofBar />
    <ServicesSection />
    <ProcessSection />
    <BuildStandardSection />
    <WhyUsSection />
    <TestimonialsSection currentIndex={currentTestimonialIndex} onDotClick={onTestimonialDotClick} />
    <PricingPreview openCalendlyModal={openCalendlyModal} />
    <AboutSection navigate={navigate} />
    <MeetTheFounderSection />
    <ResourceCenterSection navigate={navigate} blogPosts={blogPosts} />
    <FAQSection />
    <FinalCTASection openCalendlyModal={openCalendlyModal} />
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
    return 'dark';
  }

  try {
    // Default to dark mode unless the user has explicitly saved 'light' in localStorage.
    const storedPrefs = window.localStorage.getItem('theme');
    if (storedPrefs === 'light') {
      return 'light';
    }
  } catch (e) {
    console.error("Could not access localStorage to get theme.", e);
  }

  return 'dark';
};


const App: React.FC<AppProps> = ({ convexPostsRaw }) => {
  // Handle sitemap route before any other app logic.
  // This is a special case for search engine crawlers.
  if (window.location.pathname === '/sitemap.xml' && !window.location.hash) {
    return <SitemapBoundary><Sitemap /></SitemapBoundary>;
  }

  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ pathname: '/', hash: '' });
  const blogPosts = useMemo(() => {
    const dbPosts = (convexPostsRaw || []).map((p: any) => ({
      ...p,
      id: p._id,
      externalLinks: p.external_links,
      keywords: Array.isArray(p.keywords) ? p.keywords.join(', ') : (p.keywords || ''),
    })) as BlogPost[];

    const dbSlugs = new Set(dbPosts.map(p => p.slug));
    const newStaticPosts = AI_STRATEGY_ARTICLES.filter(p => !dbSlugs.has(p.slug));
    const allPosts = [...newStaticPosts, ...dbPosts];

    allPosts.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return allPosts;
  }, [convexPostsRaw]);

  const blogFetchStatus = convexPostsRaw === undefined ? 'loading' : 'success';
  const blogLoadingError = null;

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
      title: 'Synaptix Studio | Premium AI-Forward Software & Web Studio',
      description: "We build digital that hits different. Cinematic websites, web apps, mobile apps & software, engineered by AI agents, shipped at speed, priced from $3k."
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
      },
      '/contact': {
        title: 'Start a Project | Synaptix Studio',
        description: 'Tell us about your project. We build premium websites, web apps, mobile apps, and AI systems. Submit your brief and hear back within 24 hours.'
      },
      '/work': {
        title: 'Our Work | Case Studies | Synaptix Studio',
        description: 'See what Synaptix Studio has built. Case studies with real outcomes: Lighthouse scores, conversion rates, and raised rounds. Premium websites, SaaS, mobile apps, and AI systems.'
      },
      '/services': {
        title: 'Services | Premium Web & Software Development | Synaptix Studio',
        description: 'Custom website development, web app and SaaS development, mobile apps (iOS & Android), brand identity, landing pages, and AI agent systems. Delivered faster than traditional studios.'
      },
      '/about': {
        title: 'About | Synaptix Studio: Premium AI-Forward Software Studio',
        description: 'Synaptix Studio is a premium AI-forward software and web studio. Industry experts using the best AI tools to ship faster, without cutting corners on testing, security, or craft.'
      },
      '/pricing': {
        title: 'Pricing | Transparent Web Development Pricing | Synaptix Studio',
        description: 'Fixed-price web development. No hourly rates, no hidden fees. Landing pages from 72h delivery. Web apps, mobile apps, SaaS, AI systems, scoped individually, quoted in 48 hours.'
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

    const validStaticPaths = ['/', '/privacy', '/terms', '/blog', '/partner', '/careers', '/contact', '/work', '/services', '/about', '/pricing'];
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
      case '/contact': return <ContactPage navigate={navigate} />;
      case '/work': return <WorkPage navigate={navigate} openCalendlyModal={openCalendlyModal} />;
      case '/services': return <ServicesPage navigate={navigate} openCalendlyModal={openCalendlyModal} />;
      case '/about': return <AboutPage navigate={navigate} openCalendlyModal={openCalendlyModal} />;
      case '/pricing': return <PricingPage navigate={navigate} openCalendlyModal={openCalendlyModal} />;
      default:
        // By default, render nothing. The 404 useEffect will handle the redirect if needed.
        return null;
    }
  };

  return (
    <RootErrorBoundary>
    <div className="relative animate-fade-in">
      <Background theme={theme} />
      <div className="relative z-10">
        <Header navigate={navigate} theme={theme} toggleTheme={toggleTheme} openCalendlyModal={openCalendlyModal} />
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
    </RootErrorBoundary>
  );
};

export default App;
