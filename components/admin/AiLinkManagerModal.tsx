import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icon } from '../Icon';
import { BlogPost, saveBlogPost } from '../../services/supabase';
import DynamicLoader from '../DynamicLoader';
import { LOADING_MESSAGES, NAV_LINKS, RESOURCES_LINKS, AI_TOOLS_NAV_LINKS } from '../../constants';

type LinkCategory = 'Internal Link' | 'Official Website' | 'High-Authority Article' | 'GitHub Repository' | 'Subreddit';

interface AISuggestion {
    textToReplace: string;
    context: string;
    reasoning: string;
    category: LinkCategory;
    url?: string; // For Internal Links
    path?: string; // For GitHub/Subreddit
    searchQuery?: string; // For external articles/websites
}

interface UIManagedSuggestion extends AISuggestion {
    id: number;
    status: 'pending' | 'verified' | 'failed' | 'pre-verified';
    finalUrl: string;
    errorMessage?: string;
}

interface ExistingLink {
    id: number;
    original: string;
    text: string;
    url: string;
}

interface AiLinkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost;
  allPosts: BlogPost[];
  onSave: () => void;
}

// Note: Brave API is now handled server-side through /api/brave endpoint

const searchWithBrave = async (query: string): Promise<string | null> => {
    try {
        const response = await fetch(`/api/brave?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Brave API error for query "${query}": ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Brave API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.web && data.web.results && data.web.results.length > 0) {
            const preferredResult = data.web.results.find((r: any) => 
                r.url && !r.url.includes('youtube.com') && !r.url.includes('twitter.com') && !r.url.includes('linkedin.com')
            );
            return preferredResult ? preferredResult.url : data.web.results[0].url;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch from Brave API for query "${query}":`, error);
        throw error;
    }
};

const Accordion: React.FC<{ title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg transition-all duration-300">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left font-semibold text-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
                <span>{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
            </button>
            {isOpen && (
                <div className="p-3 border-t border-gray-200 dark:border-white/10 animate-fade-in-fast">
                    {children}
                </div>
            )}
        </div>
    );
};

const EditableLinkRow: React.FC<{ link: ExistingLink; onUpdate: (id: number, newText: string, newUrl: string) => void; onDelete: (id: number) => void; }> = ({ link, onUpdate, onDelete }) => {
    const [text, setText] = useState(link.text);
    const [url, setUrl] = useState(link.url);

    const handleBlur = () => {
        if (text !== link.text || url !== link.url) {
            onUpdate(link.id, text, url);
        }
    };

    return (
        <div className="bg-white dark:bg-white/5 p-3 rounded-md border border-gray-200 dark:border-white/10 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-white/80">Anchor Text</label>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded p-1 text-sm text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-white/80">URL</label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded p-1 text-sm text-gray-900 dark:text-white"
                    />
                </div>
            </div>
            <div className="text-right">
                <button onClick={() => onDelete(link.id)} className="text-xs text-red-400 hover:text-red-300 hover:underline">Delete Link</button>
            </div>
        </div>
    );
};

const getCategoryBadgeColor = (category: LinkCategory) => {
    switch (category) {
        case 'Internal Link': return 'bg-blue-500/20 text-blue-300';
        case 'Official Website': return 'bg-green-500/20 text-green-300';
        case 'High-Authority Article': return 'bg-purple-500/20 text-purple-300';
        case 'GitHub Repository': return 'bg-gray-400/20 text-gray-300';
        case 'Subreddit': return 'bg-orange-500/20 text-orange-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};

const SuggestionCard: React.FC<{ suggestion: UIManagedSuggestion; onApply: (suggestion: UIManagedSuggestion) => void; onRetry: (suggestion: UIManagedSuggestion) => void; }> = ({ suggestion, onApply, onRetry }) => (
    <div className="bg-white dark:bg-white/5 p-3 rounded-md border border-gray-200 dark:border-white/10">
        <div className="flex justify-between items-start mb-1">
            <p className="text-sm text-gray-900 dark:text-white flex-grow pr-2">Suggesting link for: <span className="text-primary font-semibold">{suggestion.textToReplace}</span></p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${getCategoryBadgeColor(suggestion.category)}`}>{suggestion.category}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-white/70 italic mt-1">Context: "...{suggestion.context}..."</p>
        <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Reasoning: {suggestion.reasoning}</p>
        <div className="mt-2 flex justify-between items-center">
            <div className="text-sm min-h-[20px] overflow-hidden">
                {suggestion.status === 'pending' && <span className="text-gray-500 dark:text-white/60 flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Verifying link...</span>}
                {(suggestion.status === 'verified' || suggestion.status === 'pre-verified') && <a href={suggestion.finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{suggestion.finalUrl}</a>}
                {suggestion.status === 'failed' && <span className="text-red-400">{suggestion.errorMessage}</span>}
            </div>
            {(suggestion.status === 'verified' || suggestion.status === 'pre-verified') && <button onClick={() => onApply(suggestion)} className="bg-green-500/20 text-green-600 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full hover:bg-green-500/30 flex-shrink-0 ml-2">Apply</button>}
            {suggestion.status === 'failed' && suggestion.searchQuery && <button onClick={() => onRetry(suggestion)} className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 text-xs font-bold px-3 py-1 rounded-full hover:bg-yellow-500/30 flex-shrink-0 ml-2">Retry</button>}
        </div>
    </div>
);

const AiLinkManagerModal: React.FC<AiLinkManagerModalProps> = ({ isOpen, onClose, post, allPosts, onSave }) => {
  const [content, setContent] = useState(post.content);
  const [existingInternalLinks, setExistingInternalLinks] = useState<ExistingLink[]>([]);
  const [existingExternalLinks, setExistingExternalLinks] = useState<ExistingLink[]>([]);
  
  const [internalSuggestions, setInternalSuggestions] = useState<UIManagedSuggestion[]>([]);
  const [externalSuggestions, setExternalSuggestions] = useState<UIManagedSuggestion[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parseLinksFromContent = useCallback(() => {
    const internal: ExistingLink[] = [];
    const external: ExistingLink[] = [];
    let match;
    let idCounter = 0;
    const localRegex = new RegExp(linkRegex);
    while ((match = localRegex.exec(content)) !== null) {
        const url = match[2];
        const linkData: ExistingLink = {
            id: idCounter++,
            original: match[0],
            text: match[1],
            url: url,
        };
        if (url.startsWith('/blog/') || !url.startsWith('http')) {
            internal.push(linkData);
        } else {
            external.push(linkData);
        }
    }
    setExistingInternalLinks(internal);
    setExistingExternalLinks(external);
  }, [content]);

  useEffect(() => {
    if (isOpen) {
      setContent(post.content);
    } else {
      setInternalSuggestions([]);
      setExternalSuggestions([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, post]);
  
  useEffect(() => {
    parseLinksFromContent();
  }, [content, parseLinksFromContent]);

  const handleUpdateLink = (id: number, newText: string, newUrl: string) => {
    const linkToUpdate = [...existingInternalLinks, ...existingExternalLinks].find(link => link.id === id);
    if (!linkToUpdate) return;
    const newLinkMarkdown = `[${newText}](${newUrl})`;
    setContent(prevContent => prevContent.replace(linkToUpdate.original, newLinkMarkdown));
  };
  
  const handleDeleteLink = (id: number) => {
    const linkToDelete = [...existingInternalLinks, ...existingExternalLinks].find(link => link.id === id);
    if (!linkToDelete) return;
    setContent(prevContent => prevContent.replace(linkToDelete.original, linkToDelete.text));
  };
  
  const handleApplySuggestion = (suggestion: UIManagedSuggestion) => {
    const { textToReplace, finalUrl } = suggestion;
    
    // This logic prevents nesting errors like [[text]...](...) by cleaning the text before creating a new link.
    const plainText = textToReplace.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').replace(/\*\*/g, '');
    const isBolded = textToReplace.includes('**');
    
    // Critical check: do not apply a link to text that is already inside an anchor.
    const contentWithoutAnchors = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text) => ' '.repeat(text.length));
    if (contentWithoutAnchors.indexOf(textToReplace) === -1) {
        alert(`Could not apply suggestion. The text "${plainText}" appears to already be part of a link.`);
        return;
    }
    
    let newLinkMarkdown = `[${plainText}](${finalUrl})`;
    if (isBolded) {
        newLinkMarkdown = `**${newLinkMarkdown}**`;
    }

    const replaceFirst = (str: string, find: string, replace: string) => {
        const index = str.indexOf(find);
        if (index === -1) return str;
        return str.substring(0, index) + replace + str.substring(index + find.length);
    };

    const updatedContent = replaceFirst(content, textToReplace, newLinkMarkdown);

    if (updatedContent !== content) {
        setContent(updatedContent);
        if (suggestion.category === 'Internal Link') {
            setInternalSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        } else {
            setExternalSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        }
    } else {
        alert(`Could not find the exact text "${textToReplace}" to replace. It might already be a link or have been changed.`);
    }
  };

  const handleApplyAll = (type: 'internal' | 'external') => {
    let newContent = content;
    const suggestionsToApply = (type === 'internal' ? internalSuggestions : externalSuggestions).filter(s => s.status === 'verified' || s.status === 'pre-verified');
    
    suggestionsToApply.forEach(suggestion => {
        const { textToReplace, finalUrl } = suggestion;
        
        const plainText = textToReplace.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').replace(/\*\*/g, '');
        const isBolded = textToReplace.includes('**');
        
        const contentWithoutAnchors = newContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text) => ' '.repeat(text.length));
        if (contentWithoutAnchors.indexOf(textToReplace) === -1) {
            console.warn(`Skipping suggestion for "${plainText}" as it appears to already be linked.`);
            return;
        }

        let newLinkMarkdown = `[${plainText}](${finalUrl})`;
        if (isBolded) {
            newLinkMarkdown = `**${newLinkMarkdown}**`;
        }

        const replaceFirst = (str: string, find: string, replace: string) => {
            const index = str.indexOf(find);
            if (index === -1) return str;
            return str.substring(0, index) + replace + str.substring(index + find.length);
        };
        newContent = replaceFirst(newContent, textToReplace, newLinkMarkdown);
    });
    
    setContent(newContent);
    if (type === 'internal') {
        setInternalSuggestions(prev => prev.filter(s => s.status !== 'verified' && s.status !== 'pre-verified'));
    } else {
        setExternalSuggestions(prev => prev.filter(s => s.status !== 'verified' && s.status !== 'pre-verified'));
    }
  };
  
  const verifyExternalSuggestion = useCallback(async (suggestion: UIManagedSuggestion) => {
    setExternalSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, status: 'pending', errorMessage: undefined } : s));
    try {
        const url = await searchWithBrave(suggestion.searchQuery!);
        setExternalSuggestions(prev => prev.map(s => {
            if (s.id === suggestion.id) {
                return url
                    ? { ...s, status: 'verified', finalUrl: url }
                    : { ...s, status: 'failed', errorMessage: 'Link not found via search.' };
            }
            return s;
        }));
    } catch (e) {
         setExternalSuggestions(prev => prev.map(s => {
            if (s.id === suggestion.id) {
                return { ...s, status: 'failed', errorMessage: 'Failed to fetch' };
            }
            return s;
        }));
    }
  }, []);

  const findInternalLinkOpportunities = useCallback((contentToScan: string, sitemap: { title: string; url: string }[]): UIManagedSuggestion[] => {
    let suggestions: UIManagedSuggestion[] = [];
    let idCounter = 0;
    
    const contentWithoutAnchors = contentToScan.replace(/\[([^\]]+)\]\([^)]+\)/g, (_, text) => ' '.repeat(text.length));

    sitemap.forEach(page => {
        if (!page.title || page.title.length < 5) return;
        
        const escapedTitle = page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const keywordRegex = new RegExp(`\\b(${escapedTitle})\\b`, 'gi');

        let match;
        while ((match = keywordRegex.exec(contentWithoutAnchors)) !== null) {
             const foundText = match[1];
             const contextStart = Math.max(0, match.index - 30);
             const contextEnd = Math.min(contentToScan.length, match.index + foundText.length + 30);
             const context = contentToScan.substring(contextStart, contextEnd).replace(/\n/g, ' ');

             suggestions.push({
                id: Date.now() + idCounter++,
                textToReplace: foundText,
                context,
                reasoning: `Links to the "${page.title}" page.`,
                category: 'Internal Link',
                url: page.url,
                finalUrl: page.url,
                status: 'pre-verified'
             });
        }
    });
    
    const uniqueSuggestions = Array.from(new Map(suggestions.map(item => [item.textToReplace.toLowerCase(), item])).values());
    return uniqueSuggestions;
  }, []);

  const fetchExternalSuggestions = async (ai: GoogleGenAI): Promise<AISuggestion[]> => {
      const systemInstruction = `You are an expert External Link Strategist. Your task is to analyze an article and suggest high-value external links to improve its SEO and user experience. You have no knowledge of the internal sitemap.

      **YOUR TASK & OUTPUT FORMAT:**
      Your entire response MUST be a single, valid JSON object with one key: "suggestions".
      "suggestions" is an array of objects. Each object represents a single link suggestion and MUST have the following structure:
      {
        "textToReplace": "The exact, verbatim text from the article to be linked.",
        "context": "A short snippet of the surrounding text for context.",
        "reasoning": "A brief, strategic justification for this link.",
        "category": "Must be ONE of: 'Official Website', 'High-Authority Article', 'GitHub Repository', 'Subreddit'.",
        "path": "[ONLY for 'GitHub Repository' or 'Subreddit'] The path ONLY (e.g., 'openai/gpt-3' or 'r/LocalLLaMA').",
        "searchQuery": "[ONLY for 'Official Website' or 'High-Authority Article'] An expert-level Google search query to find the best resource."
      }
      
      **CRITICAL RULES & GUIDELINES:**
      1.  **CATEGORIZE EVERYTHING:** Every suggestion MUST have a valid 'category'.
      2.  **HANDLE CATEGORIES CORRECTLY:**
          *   If **'GitHub Repository'** or **'Subreddit'**: Provide the 'path' ONLY. Do not provide a searchQuery.
          *   If **'Official Website'** or **'High-Authority Article'**: Provide the 'searchQuery'. Do not provide a path.
      3.  **PRIORITIZE BOLD TEXT:** Text in **double asterisks** is a high-priority candidate for an authoritative external link.
      4.  **SURGICAL TEXT MATCHING:** 'textToReplace' MUST be an exact, character-for-character match.
      5.  **NO RE-LINKING:** Do NOT suggest a link for text that is already part of a markdown link.
      6.  **NO SELF-LINKING:** You are STRICTLY FORBIDDEN from suggesting any links to 'synaptixstudio.com', 'synaptix.studio', or any other variation of the company's own domain. This is the job of the internal link system. Your focus is exclusively on third-party external sites.`;

      const userPrompt = `Analyze this article and suggest ONLY external links based on my strict rules:\n---\n${content}\n---`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userPrompt,
          config: { systemInstruction, responseMimeType: 'application/json' }
      });
      if (!response.text) {
          throw new Error('AI response was empty');
      }
      return JSON.parse(response.text).suggestions || [];
  };

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setInternalSuggestions([]);
    setExternalSuggestions([]);
    
    try {
        const sitemap = [
            ...allPosts.filter(p => p.slug !== post.slug).map(p => ({ title: p.title, url: `/blog/${p.slug}` })),
            ...NAV_LINKS.map(l => ({ title: l.label, url: l.href })),
            ...RESOURCES_LINKS.map(l => ({ title: l.label, url: l.href })),
            ...AI_TOOLS_NAV_LINKS.map(l => ({ title: l.label, url: `/ai-tools${l.href}` })),
            { title: "Privacy Policy", url: "/privacy" },
            { title: "Terms of Service", url: "/terms" },
            { title: "Synaptix Studio", url: "https://www.synaptixstudio.com/"},
            { title: "AI Automation Agency", url: "https://www.synaptixstudio.com/#services"}
        ];
        
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const [internalRes, externalRes] = await Promise.all([
            Promise.resolve(findInternalLinkOpportunities(content, sitemap)),
            fetchExternalSuggestions(ai)
        ]);

        setInternalSuggestions(internalRes);

        const externalSugs = externalRes.map((s, i) => {
            const base = { ...s, id: i + internalRes.length };
            if (s.category === 'GitHub Repository') return { ...base, status: 'pre-verified', finalUrl: `https://github.com/${s.path}` };
            if (s.category === 'Subreddit') return { ...base, status: 'pre-verified', finalUrl: `https://www.reddit.com/${s.path}` };
            return { ...base, status: 'pending', finalUrl: '' };
        }) as UIManagedSuggestion[];
        setExternalSuggestions(externalSugs);

        await Promise.all(externalSugs.filter(s => s.status === 'pending').map(verifyExternalSuggestion));

    } catch (err: any) {
        console.error("AI Link Suggestion Error:", err);
        setError("The AI failed to generate suggestions. You can try again or proceed manually.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFinalizeAndSave = async () => {
    try {
        await saveBlogPost({ ...post, content });
        onSave();
    } catch(e: any) {
        alert(`Failed to save changes: ${e.message}`);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[102] flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-4xl m-4 relative animate-slide-in-up-fast flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Icon name="link" className="h-6 w-6 text-primary"/>
            <h2 className="text-xl font-bold truncate pr-4 text-gray-900 dark:text-white">Link Hub for "{post.title}"</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"><Icon name="close" className="h-6 w-6" /></button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            <Accordion title={<>Existing Links ({existingInternalLinks.length + existingExternalLinks.length})</>} defaultOpen={true}>
                 <div className="space-y-4 p-2">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Internal Links ({existingInternalLinks.length})</h4>
                        <div className="space-y-3">
                            {existingInternalLinks.map(link => (
                                <EditableLinkRow key={link.id} link={link} onUpdate={handleUpdateLink} onDelete={handleDeleteLink} />
                            ))}
                            {existingInternalLinks.length === 0 && <p className="text-center text-sm text-gray-500 dark:text-white/60 p-4">No internal links found.</p>}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">External Links ({existingExternalLinks.length})</h4>
                        <div className="space-y-3">
                            {existingExternalLinks.map(link => (
                                <EditableLinkRow key={link.id} link={link} onUpdate={handleUpdateLink} onDelete={handleDeleteLink} />
                            ))}
                             {existingExternalLinks.length === 0 && <p className="text-center text-sm text-gray-500 dark:text-white/60 p-4">No external links found.</p>}
                        </div>
                    </div>
                 </div>
            </Accordion>
            
             <Accordion title={<>AI Link Suggester</>}>
                <div className="p-2 space-y-4">
                    <button onClick={fetchSuggestions} disabled={isLoading} className="w-full bg-gray-200 dark:bg-white/10 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 flex items-center justify-center gap-2 text-sm text-gray-900 dark:text-white mt-4">
                        <Icon name="sparkles" className="h-5 w-5"/>
                        {isLoading ? 'Searching...' : 'Get New Suggestions'}
                    </button>
                    {isLoading ? <DynamicLoader messages={LOADING_MESSAGES.LINK_MANAGER} /> : (
                        <>
                            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
                            
                            {/* Internal Suggestions */}
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Internal Link Suggestions ({internalSuggestions.length})</h4>
                                    <button onClick={() => handleApplyAll('internal')} disabled={!internalSuggestions.some(s => s.status === 'pre-verified')} className="text-xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full disabled:opacity-50">Apply All</button>
                                </div>
                                {internalSuggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} onApply={handleApplySuggestion} onRetry={() => {}} />)}
                            </div>

                            {/* External Suggestions */}
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-gray-900 dark:text-white">External Link Suggestions ({externalSuggestions.length})</h4>
                                    <button onClick={() => handleApplyAll('external')} disabled={!externalSuggestions.some(s => s.status === 'verified' || s.status === 'pre-verified')} className="text-xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full disabled:opacity-50">Apply All Verified</button>
                                </div>
                                {externalSuggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} onApply={handleApplySuggestion} onRetry={verifyExternalSuggestion} />)}
                            </div>
                        </>
                    )}
                </div>
            </Accordion>
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end items-center flex-shrink-0">
          <div className="flex gap-4">
            <button onClick={onClose} className="bg-gray-200 dark:bg-white/10 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white">Cancel</button>
            <button onClick={handleFinalizeAndSave} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
                <Icon name="check" className="h-5 w-5"/>
                Finalize & Save Changes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
export default AiLinkManagerModal;
