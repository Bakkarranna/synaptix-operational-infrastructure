

import React, { useState, useMemo } from 'react';
import { RESOURCE_CATEGORIES } from '../constants';
import { ArrowRightIcon, SearchIcon } from './Icon';
import StyledText from './StyledText';
import { BlogPost } from '../src/types';

interface BlogPageProps {
  blogPosts: BlogPost[];
  navigate: (path: string) => void;
}

const BlogCard: React.FC<{ resource: BlogPost; navigate: (path: string) => void }> = ({ resource, navigate }) => (
  <a
    href={`/blog/${resource.slug}`}
    onClick={(e) => { e.preventDefault(); navigate(`/blog/${resource.slug}`); }}
    className="group bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-900/10 dark:border-white/10 overflow-hidden flex gap-4 cursor-pointer hover:-translate-y-1 h-24 sm:h-32"
    role="button"
  >
    <img src={resource.image} alt={`Image for article titled "${resource.title}"`} loading="lazy" decoding="async" className="w-24 h-24 sm:w-32 sm:h-32 object-cover bg-gray-100 dark:bg-black/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
    <div className="p-4 flex-grow flex flex-col justify-center">
      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full self-start mb-2">{resource.category}</span>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white font-montserrat group-hover:text-primary transition-colors leading-tight">{resource.title}</h3>
    </div>
  </a>
);

const FeaturedBlogCard: React.FC<{ resource: BlogPost; navigate: (path: string) => void }> = ({ resource, navigate }) => (
  <a
    href={`/blog/${resource.slug}`}
    onClick={(e) => { e.preventDefault(); navigate(`/blog/${resource.slug}`); }}
    className="group bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-900/10 dark:border-white/10 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-2"
    role="button"
  >
    <div className="overflow-hidden aspect-video bg-gray-100 dark:bg-black/20">
      <img src={resource.image} alt={`Image for article titled "${resource.title}"`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xs sm:text-sm font-bold text-primary">Featured Article</span>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{resource.category}</span>
      </div>
      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-4 flex-grow">{resource.title}</h2>
      <p className="text-gray-600 dark:text-white/80 text-sm line-clamp-3 mb-6">{resource.description}</p>
      <div className="mt-auto text-sm text-gray-800 dark:text-white font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
        Read More
        <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  </a>
);


const BlogPage: React.FC<BlogPageProps> = ({ blogPosts, navigate }) => {
  const [activeCategory, setActiveCategory] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    let articles: BlogPost[] = [];

    if (activeCategory === 'Featured') {
      // Sort all posts by date, newest first
      const articlesByDate = [...blogPosts].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      const featuredPosts: BlogPost[] = [];
      const usedCategories = new Set<string>();
      const usedSlugs = new Set<string>();
      const MAX_FEATURED = 4; // Total number of featured articles to show

      // Step 1: Pick the latest unique article from each category to ensure diversity
      for (const post of articlesByDate) {
        if (post.category && !usedCategories.has(post.category) && !usedSlugs.has(post.slug)) {
          featuredPosts.push(post);
          usedCategories.add(post.category);
          usedSlugs.add(post.slug);
        }
      }

      // Step 2: If we still need more articles, fill up with the latest remaining ones
      if (featuredPosts.length < MAX_FEATURED) {
        for (const post of articlesByDate) {
          if (featuredPosts.length >= MAX_FEATURED) break;
          if (!usedSlugs.has(post.slug)) {
            featuredPosts.push(post);
            usedSlugs.add(post.slug);
          }
        }
      }

      // Step 3: Ensure the list is sorted by date again to have the absolute latest as the main feature
      // and take only up to MAX_FEATURED
      articles = featuredPosts
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, MAX_FEATURED);

    } else if (activeCategory === 'Latest') {
      articles = [...blogPosts];
    } else {
      articles = blogPosts.filter(post => post.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      articles = articles.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.keywords || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return articles;
  }, [blogPosts, activeCategory, searchQuery]);

  const title = "Synaptix Studio **Blog**";
  const description = "Your central hub for AI strategy, automation insights, case studies, and business growth tactics. Explore our articles to stay on the cutting edge.";

  return (
    <>
      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-6 pt-24 sm:pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-colors mb-4 inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:bg-clip-text dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h1>
            <p className="mt-4 text-base text-gray-600 dark:text-white/80"><StyledText text={description} /></p>
          </div>

          <div className="max-w-xl mx-auto mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-white/50" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, category, or keyword..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-900/10 bg-white/30 dark:bg-black/30 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-12 animate-fade-in">
            {RESOURCE_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === category ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white shadow-md' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="animate-fade-in-fast">
            {filteredArticles.length > 0 ? (
              <>
                {activeCategory === 'Featured' ? (
                  <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {filteredArticles.map((resource) => (
                        <FeaturedBlogCard key={resource.slug} resource={resource} navigate={navigate} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredArticles.map((resource) => (
                      <BlogCard key={resource.slug} resource={resource} navigate={navigate} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-white/80">
                  {searchQuery ? `No articles found for "${searchQuery}"` : 'No articles found in this category.'}
                </h2>
                <p className="text-gray-500 dark:text-white/60 mt-2">
                  {searchQuery ? 'Try a different search term or clear the search.' : 'Try selecting another category to explore more content.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;