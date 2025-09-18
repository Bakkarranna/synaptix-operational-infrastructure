import React, { useEffect } from 'react';
import { BlogPost } from '../services/supabase';
import BlogMarkdownRenderer from './BlogMarkdownRenderer';
import { ArrowRightIcon, Icon, IconName } from './Icon';
import { CTA_BUTTONS } from '../constants';

interface ArticlePageProps {
  article: BlogPost;
  allArticles: BlogPost[];
  navigate: (path: string) => void;
}

const getIconForPlatform = (platform: string): IconName => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('medium')) return 'medium';
    if (lowerPlatform.includes('x') || lowerPlatform.includes('twitter')) return 'x';
    if (lowerPlatform.includes('linkedin')) return 'linkedin';
    return 'web';
};


const ArticlePage: React.FC<ArticlePageProps> = ({ article, allArticles, navigate }) => {
  // Guard clause to prevent rendering if article data is not yet available
  if (!article) {
    return null; 
  }

  const otherArticles = allArticles.filter(r => r.slug !== article.slug).slice(0, 3);
  
  useEffect(() => {
    const scriptId = 'article-schema';
    // Remove existing script if it's there to prevent duplicates on navigation
    document.getElementById(scriptId)?.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'image': [article.image],
      'author': {
        '@type': 'Organization',
        'name': 'Synaptix Studio'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Synaptix Studio',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://iili.io/Fkb6akl.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${window.location.href}`
      },
      'description': article.description
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    // Cleanup on component unmount
    return () => {
      document.getElementById(scriptId)?.remove();
    };
}, [article]); // Rerun when the article changes

  return (
    <div className="relative z-10 animate-fade-in">
      <div className="container mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate('/blog')} 
            className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors mb-8 inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Blog
          </button>
          
          <article className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-2xl p-4 sm:p-8 md:p-12">
            <img src={article.image} alt={article.title} className="w-full object-contain rounded-xl shadow-2xl bg-gray-100 dark:bg-black/20"/>
            <div className="mt-8">
              <span className="text-sm font-bold text-primary mb-2 block">{article.category}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-montserrat mb-6">{article.title}</h1>
              
              {article.content ? (
                <BlogMarkdownRenderer content={article.content} />
              ) : (
                 <p className="text-gray-600 dark:text-white/80">Content coming soon.</p>
              )}
              
              {article.externalLinks && article.externalLinks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-900/10 dark:border-white/20">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Read more on:</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {article.externalLinks.map((link, index) => (
                            <a href={link.url} target="_blank" rel="noopener noreferrer" key={index} className="bg-white/30 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/50 dark:hover:bg-black/50 transition-colors flex items-center justify-center gap-2">
                                <Icon name={getIconForPlatform(link.platform)} className="h-5 w-5" />
                                {link.text}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </article>

            <div className="mt-12 pt-8 border-t border-gray-900/10 dark:border-white/20 text-center bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ready to Automate Your Business?</h3>
              <p className="text-gray-600 dark:text-white/80 mb-6 max-w-xl mx-auto">Take the next step. Explore our tools, get a custom strategy, or book a call with our experts today.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {CTA_BUTTONS.map(cta => (
                  <a
                    key={cta.text}
                    href={cta.href}
                    onClick={(e) => {
                      if (!cta.external) {
                        e.preventDefault();
                        navigate(cta.href);
                      }
                    }}
                    target={cta.external ? '_blank' : '_self'}
                    rel={cta.external ? 'noopener noreferrer' : ''}
                    className="w-full sm:w-auto bg-primary text-white font-bold py-3 px-6 text-sm rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow"
                  >
                    {cta.text}
                  </a>
                ))}
              </div>
            </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat mb-6 text-center">Read Next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map(other => (
                 <a
                  key={other.slug}
                  href={`/blog/${other.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/blog/${other.slug}`); }}
                  className="group bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-900/10 dark:border-white/10 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-2"
                >
                  <div className="overflow-hidden">
                    <img src={other.image} alt={other.title} loading="lazy" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-xs font-bold text-primary mb-2">{other.category}</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-2 flex-grow">{other.title}</h3>
                    <div className="mt-auto text-gray-800 dark:text-white font-semibold text-xs flex items-center gap-1 group-hover:text-primary transition-colors">
                      Read More
                      <ArrowRightIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;