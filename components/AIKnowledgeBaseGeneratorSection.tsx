import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { BookOpenIcon, DownloadIcon, ClipboardIcon, CheckIcon } from './Icon';
import StyledText from './StyledText';
import MarkdownRenderer from './MarkdownRenderer';
import { trackEvent } from '../services/analytics';
import { LOADING_MESSAGES } from '../constants';
import DynamicLoader from './DynamicLoader';

interface KBFAQ {
    question: string;
    answer: string;
}

interface KBArticle {
    title: string;
    content: string;
    faqs: KBFAQ[];
}

interface KBSection {
    title: string;
    articles: KBArticle[];
}

interface KnowledgeBase {
    title: string;
    summary: string;
    metadata: {
        companyName: string;
        toneOfVoice: string;
        primaryServices: string[];
    };
    sections: KBSection[];
}

// FIX: Moved interface definition before component declaration.
interface AIKnowledgeBaseGeneratorSectionProps {
    navigate: (path: string) => void;
}

const Accordion: React.FC<{ title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-lg transition-all duration-300">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-black/30 transition-colors">
                <span>{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-white/10 animate-fade-in-fast">
                    {children}
                </div>
            )}
        </div>
    );
};

const parseMarkdownToKB = (markdown: string): KnowledgeBase => {
    // Clean up potential markdown code blocks and trim whitespace
    const cleanedMarkdown = markdown.replace(/```(json|markdown)?\s*([\s\S]*?)\s*```/g, '$2').trim();
    const lines = cleanedMarkdown.split('\n');
    
    const kb: KnowledgeBase = {
        title: '',
        summary: '',
        metadata: { companyName: '', toneOfVoice: '', primaryServices: [] },
        sections: [],
    };

    let currentSection: KBSection | null = null;
    let currentArticle: KBArticle | null = null;
    let mode: 'summary' | 'metadata' | 'article_content' | 'faqs' | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed === '---') {
            mode = null;
            continue;
        }
        if (!trimmed) continue;
        
        if (trimmed.startsWith('# ')) {
            kb.title = trimmed.substring(2);
            mode = null;
        } else if (trimmed.toLowerCase().startsWith('## summary')) {
            mode = 'summary';
        } else if (trimmed.toLowerCase().startsWith('### metadata')) {
            mode = 'metadata';
        } else if (trimmed.startsWith('## ')) {
            currentSection = { title: trimmed.substring(3), articles: [] };
            kb.sections.push(currentSection);
            currentArticle = null;
            mode = null;
        } else if (trimmed.startsWith('### ')) {
            currentArticle = { title: trimmed.substring(4), content: '', faqs: [] };
            if (!currentSection) {
                // Create a default section if an article appears before a section header
                currentSection = { title: "General Information", articles: [] };
                kb.sections.push(currentSection);
            }
            currentSection.articles.push(currentArticle);
            mode = 'article_content';
        } else if (trimmed.toLowerCase().startsWith('#### faqs')) {
            mode = 'faqs';
        } else {
            switch (mode) {
                case 'summary':
                    kb.summary += `${line}\n`;
                    break;
                case 'metadata':
                    if (trimmed.startsWith('- **CompanyName:**')) kb.metadata.companyName = trimmed.substring(18).trim();
                    else if (trimmed.startsWith('- **ToneOfVoice:**')) kb.metadata.toneOfVoice = trimmed.substring(17).trim();
                    else if (trimmed.startsWith('- **PrimaryServices:**')) kb.metadata.primaryServices = trimmed.substring(20).split(',').map(s => s.trim());
                    break;
                case 'article_content':
                    if (currentArticle) currentArticle.content += `${line}\n`;
                    break;
                case 'faqs':
                    if (currentArticle) {
                        if (trimmed.startsWith('- **Q:**')) {
                            currentArticle.faqs.push({ question: trimmed.substring(8).trim(), answer: '' });
                        } else if (trimmed.startsWith('- **A:**') && currentArticle.faqs.length > 0) {
                            currentArticle.faqs[currentArticle.faqs.length - 1].answer += trimmed.substring(8).trim();
                        } else if (currentArticle.faqs.length > 0) {
                            currentArticle.faqs[currentArticle.faqs.length - 1].answer += `\n${line}`;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
    
    kb.summary = kb.summary.trim();
    kb.sections.forEach(section => {
        section.articles.forEach(article => {
            article.content = article.content.trim();
            article.faqs.forEach(faq => {
                faq.answer = faq.answer.trim();
            });
        });
    });

    return kb;
};

const KnowledgeBaseReport: React.FC<{ kb: KnowledgeBase }> = ({ kb }) => {
    const [copied, setCopied] = useState(false);

    const fullMarkdownContent = `
# ${kb.title}

## Summary
${kb.summary}

### Metadata
- **CompanyName:** ${kb.metadata.companyName}
- **ToneOfVoice:** ${kb.metadata.toneOfVoice}
- **PrimaryServices:** ${kb.metadata.primaryServices.join(', ')}

---

${kb.sections.map(section => `
## ${section.title}
${section.articles.map(article => `
### ${article.title}
${article.content}
${article.faqs.length > 0 ? `
#### FAQs
${article.faqs.map(faq => `
- **Q:** ${faq.question}
- **A:** ${faq.answer}
`).join('\n')}
` : ''}
`).join('\n')}
`).join('\n')}
    `.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(fullMarkdownContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 animate-fade-in relative">
            <div className="absolute top-4 right-4">
                <button onClick={handleCopy} className="bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-white p-2 rounded-full transition-colors flex items-center gap-2 text-xs" aria-label="Copy Markdown">
                    {copied ? <CheckIcon className="h-4 w-4 text-green-500"/> : <ClipboardIcon className="h-4 w-4"/>}
                    {copied ? 'Copied!' : 'Copy Markdown'}
                </button>
            </div>

            <h3 className="text-2xl font-bold font-montserrat text-center mb-6 text-gray-900 dark:text-white">{kb.title}</h3>
            
            <div className="mb-6 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-white/10">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Summary</h4>
                <p className="text-sm text-gray-700 dark:text-white/80">{kb.summary}</p>
            </div>
            
             <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg"><strong className="text-primary">Company:</strong> {kb.metadata.companyName}</div>
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg"><strong className="text-primary">Tone:</strong> {kb.metadata.toneOfVoice}</div>
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg"><strong className="text-primary">Services:</strong> {kb.metadata.primaryServices.join(', ')}</div>
            </div>

            <div className="space-y-6">
                {kb.sections.map((section, i) => (
                    <Accordion key={i} title={section.title} defaultOpen={i === 0}>
                        <div className="space-y-4 p-2">
                            {section.articles.map((article, j) => (
                                <div key={j} className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-4 rounded-md">
                                    <h5 className="font-bold text-lg text-primary">{article.title}</h5>
                                    <div className="prose dark:prose-invert max-w-none text-sm mt-2 text-gray-800 dark:text-white/90">
                                        <MarkdownRenderer content={article.content} />
                                    </div>
                                    {article.faqs.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
                                            <h6 className="font-semibold text-gray-900 dark:text-white mb-2">FAQs</h6>
                                            <div className="space-y-2 text-xs">
                                                {article.faqs.map((faq, k) => (
                                                    <div key={k}>
                                                        <p className="font-bold text-gray-800 dark:text-white/90">Q: {faq.question}</p>
                                                        <p className="text-gray-600 dark:text-white/80">A: {faq.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Accordion>
                ))}
            </div>
        </div>
    );
};

const AIKnowledgeBaseGeneratorSection: React.FC<AIKnowledgeBaseGeneratorSectionProps> = ({ navigate }) => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<KnowledgeBase | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ref = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!loading && result && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, result]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('Please enter a website URL.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are an expert AI business analyst. Your task is to crawl a given website URL, analyze its content, and generate a comprehensive, structured Knowledge Base document in Markdown format.

            **YOUR TASK & OUTPUT FORMAT:**
            Your output MUST be a single, valid markdown document following this exact structure. Do not include any text, preamble, or explanation outside this structure.

            # Knowledge Base for [CompanyName]

            ## Summary
            [A concise, one-paragraph summary of the business.]

            ### Metadata
            - **CompanyName:** [Company Name]
            - **ToneOfVoice:** [e.g., Professional, Friendly, Technical]
            - **PrimaryServices:** [Comma-separated list of key services/products]

            ---

            ## [Logical Section 1, e.g., "Core Services"]
            ### [Article 1 Title, e.g., "AI Chatbot Development"]
            [Detailed content for this article.]
            #### FAQs
            - **Q:** [A relevant question]
            - **A:** [A clear answer]

            ## [Logical Section 2, e.g., "About Us"]
            ### [Article 2 Title, e.g., "Our Mission"]
            [Detailed content for this article.]
            `;

            const userPrompt = `Generate a knowledge base from the website at this URL: ${url}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    tools: [{ googleSearch: {} }],
                }
            });

            const parsedResult = parseMarkdownToKB(response.text);
            setResult(parsedResult);
            trackEvent('generate_knowledge_base', { url_provided: !!url });

        } catch (err) {
            console.error("AI KB Generation Error:", err);
            setError("Sorry, we couldn't generate the knowledge base. The site may be blocking our analysis or the AI returned an unexpected format. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const title = "AI Knowledge Base **Generator**";
    const description = "Instantly turn any website into a structured **Knowledge Base** for training AI agents. Just enter a URL and let our AI do the work.";

    return (
        <section ref={ref} className="py-16 sm:py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
                </div>

                <div className="max-w-4xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="kb-url" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Website URL to Analyze *</label>
                            <input id="kb-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourwebsite.com/about" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition" required />
                        </div>
                        {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-6 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                <BookOpenIcon className="h-5 w-5 mr-2"/>
                                {loading ? 'Analyzing & Building...' : 'Generate Knowledge Base'}
                            </button>
                        </div>
                    </form>
                </div>

                 <div ref={resultsRef} className="mt-8 max-w-5xl mx-auto">
                    {loading && <DynamicLoader messages={LOADING_MESSAGES.KNOWLEDGE_BASE} className="mt-12" />}
                    {!loading && result && (
                        <KnowledgeBaseReport kb={result} />
                    )}
                </div>
            </div>
        </section>
    );
};

export default AIKnowledgeBaseGeneratorSection;