

import React, { useState, useRef, useMemo } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { ArrowRightIcon } from './Icon';
import StyledText from './StyledText';
import { BlogPost } from '../services/supabase';

interface ResourceCenterSectionProps {
  blogPosts: BlogPost[];
  navigate: (path: string) => void;
}

const ResourceCard: React.FC<{ resource: BlogPost; index: number; navigate: (path: string) => void }> = ({ resource, index, navigate }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const isVisible = useOnScreen(ref);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/blog/${resource.slug}`);
  };

  return (
    <a
      href={`/blog/${resource.slug}`}
      onClick={handleClick}
      ref={ref}
      className={`group bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-900/10 dark:border-white/10 overflow-hidden cursor-pointer hover:-translate-y-2 hover:border-primary/30 dark:hover:border-primary/30 hover:animate-glow ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      flex flex-row sm:flex-col gap-4 sm:gap-0 h-32 sm:h-auto`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <img
        src={resource.image}
        alt={`Image for article titled "${resource.title}"`}
        loading="lazy"
        decoding="async"
        className="w-32 h-32 sm:w-full sm:h-auto sm:aspect-video object-cover bg-gray-100 dark:bg-black/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
      />
      <div className="p-4 flex flex-col flex-grow justify-center sm:justify-start">
        <span className="text-xs font-bold text-primary mb-2">{resource.category}</span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white font-montserrat mb-2 sm:flex-grow line-clamp-3 sm:line-clamp-none leading-tight">{resource.title}</h3>
        <p className="text-gray-600 dark:text-white/80 text-xs mb-4 hidden sm:block">{resource.description}</p>
        <div className="mt-auto text-sm text-gray-800 dark:text-white font-semibold items-center gap-2 group-hover:text-primary transition-colors hidden sm:flex">
          Read More
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
};

const ResourceCenterSection: React.FC<ResourceCenterSectionProps> = ({ blogPosts, navigate }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef);

  const featuredResources = useMemo(() => {
    if (!blogPosts || blogPosts.length === 0) {
      return [];
    }
    const articlesByDate = [...blogPosts].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });

    const featuredPosts: BlogPost[] = [];
    const usedCategories = new Set<string>();
    const usedSlugs = new Set<string>();
    const MAX_FEATURED = 4;

    for (const post of articlesByDate) {
        if (post.category && !usedCategories.has(post.category) && !usedSlugs.has(post.slug)) {
            featuredPosts.push(post);
            usedCategories.add(post.category);
            usedSlugs.add(post.slug);
        }
    }

    if (featuredPosts.length < MAX_FEATURED) {
        for (const post of articlesByDate) {
            if (featuredPosts.length >= MAX_FEATURED) break;
            if (!usedSlugs.has(post.slug)) {
                featuredPosts.push(post);
                usedSlugs.add(post.slug);
            }
        }
    }
    
    return featuredPosts
        .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, MAX_FEATURED);
  }, [blogPosts]);
  
  const description = "Explore our latest insights on AI, automation, and business growth. **Handpicked articles** to keep you ahead of the curve.";
  const title = "From Our **Featured Articles**";

  return (
    <>
      <section id="blog-preview" ref={sectionRef} className="py-20">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-2xl md:text-3xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
            <p className="mt-4 text-base text-gray-600 dark:text-white/80 max-w-2xl mx-auto">
              <StyledText text={description} />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredResources.map((resource, index) => (
              <ResourceCard 
                key={resource.slug} 
                resource={resource} 
                index={index} 
                navigate={navigate} 
              />
            ))}
          </div>

          <div className="text-center mt-16">
             <button
              onClick={() => navigate('/blog')}
              className="bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2.5 px-8 text-sm rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow"
            >
              View All Articles
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ResourceCenterSection;