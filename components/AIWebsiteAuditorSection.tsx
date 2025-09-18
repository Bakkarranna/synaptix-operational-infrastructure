import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { FileSearchIcon, DownloadIcon, CheckIcon, XCircleIcon } from './Icon';
import StyledText from './StyledText';
import ViralityMeter from './ViralityMeter';
import { saveAuditLead, saveNewsletter } from '../services/supabase';
import MarkdownRenderer from './MarkdownRenderer';
import jsPDF from 'jspdf';
import { trackEvent } from '../services/analytics';
import { LOADING_MESSAGES } from '../constants';
import DynamicLoader from './DynamicLoader';

interface AuditResult {
    executiveSummary: string;
    overallScore: number;
    sections: {
        title: string;
        score: number;
        strengths: string[];
        weaknesses: string[];
    }[];
    recommendations: {
        recommendation: string;
        priority: 'High' | 'Medium' | 'Low';
    }[];
}


interface AIWebsiteAuditorSectionProps {
    navigate: (path: string) => void;
}

const BUSINESS_TYPES = [
    'E-commerce', 
    'B2B SaaS', 
    'Local Service', 
    'Professional Services (e.g., Agency, Consultant)', 
    'Content Publisher / Blog'
];

const Accordion: React.FC<{ title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-gray-900/10 dark:border-white/10 rounded-lg transition-all duration-300">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-black/30 transition-colors">
                <span>{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-900/10 dark:border-white/10 animate-fade-in-fast">
                    {children}
                </div>
            )}
        </div>
    );
};


const RecommendationCard: React.FC<{ rec: AuditResult['recommendations'][0] }> = ({ rec }) => {
    const priorityColor: { [key in AuditResult['recommendations'][0]['priority']]: string } = {
        High: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/20 dark:border-red-500/30',
        Medium: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/20 dark:border-yellow-500/30',
        Low: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/20 dark:border-green-500/30'
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-gray-900/10 dark:border-white/10">
            <p className="text-gray-800 dark:text-white/90 text-sm font-semibold mb-2">{rec.recommendation}</p>
            <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-bold border ${priorityColor[rec.priority]}`}>Priority: {rec.priority}</span>
            </div>
        </div>
    );
};

const AuditDetailCard: React.FC<{ strengths: string[]; weaknesses: string[] }> = ({ strengths, weaknesses }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">Strengths</h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-white/90">
                    {strengths.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h5 className="font-semibold text-red-600 dark:text-red-400 mb-2">Weaknesses / Opportunities</h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-white/90">
                    {weaknesses.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <span><StyledText text={item} /></span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const Report: React.FC<{ result: AuditResult; url: string }> = ({ result, url }) => {
    let hostname = 'your website';
    try {
        const parsedUrl = new URL(url);
        hostname = parsedUrl.hostname;
    } catch (e) {
        console.warn("Could not parse URL for display in Report component:", url);
    }

    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 15;

        const addText = (text: string, size = 10, isBold = false) => {
            if (y > 280) {
                doc.addPage();
                y = 15;
            }
            doc.setFontSize(size);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 15, y);
            y += (splitText.length * (size / 2.5)) + 2; // Approximate line height + spacing
        };

        addText(`Strategic Audit for ${hostname}`, 18, true);
        y += 5;
        
        addText("Executive Summary", 14, true);
        addText(result.executiveSummary, 10);
        y += 5;

        addText("Actionable Recommendations", 14, true);
        result.recommendations.forEach(rec => {
            addText(`[${rec.priority}] ${rec.recommendation}`, 10);
        });
        y += 5;

        result.sections.forEach(section => {
            addText(`${section.title} Analysis (Score: ${section.score}/100)`, 14, true);
            y += 2;
            addText("Strengths:", 12, true);
            section.strengths.forEach(s => addText(`- ${s}`, 10));
            y += 3;
            addText("Weaknesses:", 12, true);
            section.weaknesses.forEach(w => addText(`- ${w.replace(/\*\*/g, '')}`, 10));
            y += 5;
        });

        doc.save(`website_audit_${hostname}.pdf`);
        trackEvent('download_audit_pdf');
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 text-gray-900 dark:text-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-12 relative">
            <button onClick={handleDownload} className="absolute top-4 right-4 bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-white p-2 rounded-full transition-colors flex items-center gap-2 text-xs" aria-label="Download as PDF">
                <DownloadIcon className="h-4 w-4" />
                <span>Download PDF</span>
            </button>

            <h3 className="text-2xl font-bold font-montserrat text-center mb-2 text-gray-900 dark:text-white">Strategic Audit for</h3>
            <p className="text-lg font-semibold text-primary text-center mb-8">{hostname}</p>
            
            <div className="text-center mb-12 bg-white/20 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-gray-900/10 dark:border-white/10">
                 <h4 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-4">Executive Summary</h4>
                 <div className="prose dark:prose-invert max-w-none mx-auto text-gray-700 dark:text-white/80">
                    <MarkdownRenderer content={result.executiveSummary} />
                 </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-8 text-center mb-12">
                <div><h4 className="font-bold text-gray-700 dark:text-white/80 mb-2 text-sm">Overall</h4><ViralityMeter score={result.overallScore} /></div>
                {result.sections.map(section => (
                     <div key={section.title}><h4 className="font-bold text-gray-700 dark:text-white/80 mb-2 text-sm">{section.title}</h4><ViralityMeter score={section.score} /></div>
                ))}
            </div>

            <div className="space-y-6">
                <Accordion title="Actionable Recommendations" defaultOpen={true}>
                    <div className="space-y-3 p-2">
                        {result.recommendations.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
                    </div>
                </Accordion>
                {result.sections.map((section, i) => (
                    <Accordion key={i} title={`${section.title} Analysis`}>
                        <AuditDetailCard strengths={section.strengths} weaknesses={section.weaknesses} />
                    </Accordion>
                ))}
            </div>
        </div>
    );
};

const parseAuditMarkdown = (markdown: string): AuditResult => {
    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    const result: AuditResult = {
        executiveSummary: '',
        overallScore: 0,
        sections: [],
        recommendations: [],
    };

    let currentSection: AuditResult['sections'][0] | null = null;
    let currentMode: 'summary' | 'strengths' | 'weaknesses' | 'recommendations' | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('# Executive Summary')) {
            currentMode = 'summary';
            continue;
        }

        const overallScoreMatch = trimmedLine.match(/## Overall Score: (\d+)\/100/);
        if (overallScoreMatch) {
            result.overallScore = parseInt(overallScoreMatch[1], 10);
            currentMode = null;
            continue;
        }

        const sectionMatch = trimmedLine.match(/## (.*?) \(Score: (\d+)\/100\)/);
        if (sectionMatch) {
            currentSection = {
                title: sectionMatch[1].trim(),
                score: parseInt(sectionMatch[2], 10),
                strengths: [],
                weaknesses: [],
            };
            result.sections.push(currentSection);
            currentMode = null;
            continue;
        }
        
        if (trimmedLine.startsWith('## Actionable Recommendations')) {
            currentMode = 'recommendations';
            currentSection = null;
            continue;
        }
        
        if (trimmedLine.startsWith('### Strengths')) {
            currentMode = 'strengths';
            continue;
        }
        
        if (trimmedLine.startsWith('### Weaknesses')) {
            currentMode = 'weaknesses';
            continue;
        }
        
        if (currentMode === 'summary') {
            result.executiveSummary += `${trimmedLine}\n`;
        } else if (currentMode === 'strengths' && currentSection && (trimmedLine.startsWith('*') || trimmedLine.startsWith('-'))) {
            currentSection.strengths.push(trimmedLine.substring(1).trim());
        } else if (currentMode === 'weaknesses' && currentSection && (trimmedLine.startsWith('*') || trimmedLine.startsWith('-'))) {
            currentSection.weaknesses.push(trimmedLine.substring(1).trim());
        } else if (currentMode === 'recommendations' && (trimmedLine.startsWith('*') || trimmedLine.startsWith('-'))) {
            const recMatch = trimmedLine.match(/\[(High|Medium|Low)\]\s*(.*)/);
            if (recMatch) {
                result.recommendations.push({
                    priority: recMatch[1] as 'High' | 'Medium' | 'Low',
                    recommendation: recMatch[2].trim(),
                });
            }
        }
    }

    result.executiveSummary = result.executiveSummary.trim();
    return result;
};


const AIWebsiteAuditorSection: React.FC<AIWebsiteAuditorSectionProps> = ({ navigate }) => {
    const [url, setUrl] = useState('');
    const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<AuditResult | null>(null);
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

    const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/#lets-talk');
    };

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
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const systemInstruction = `You are a world-class SEO, Conversion Rate Optimization (CRO), and UX specialist. Your task is to conduct a professional audit of a given website URL and provide a structured report in Markdown format. Use Google Search extensively to analyze the website.

**YOUR TASK & OUTPUT FORMAT:**
Your output MUST be a single, valid markdown document following this exact structure. Do not include any text, preamble, or explanation outside this structure.

# Executive Summary
[A concise, high-level summary of the website's overall health and key opportunities.]

## Overall Score: [A single number, e.g., 85]/100

## Technical SEO & Performance (Score: [score]/100)
### Strengths
* [Strength 1]
* [Strength 2]
### Weaknesses / Opportunities
* [Weakness 1]
* [Weakness 2, use **bold markdown** for key terms]

## User Experience (UX) & Conversion (Score: [score]/100)
### Strengths
* [Strength 1]
* [Strength 2]
### Weaknesses / Opportunities
* [Weakness 1]
* [Weakness 2]

## Content & Authority (Score: [score]/100)
### Strengths
* [Strength 1]
* [Strength 2]
### Weaknesses / Opportunities
* [Weakness 1]
* [Weakness 2]

## Actionable Recommendations
* [High] A high-priority recommendation.
* [Medium] A medium-priority recommendation.
* [Low] A low-priority recommendation.`;

            const userPrompt = `Audit the website at this URL: ${url}. The business is in the "${businessType}" industry. Focus your analysis accordingly.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    tools: [{ googleSearch: {} }],
                }
            });
            
            const parsedResult = parseAuditMarkdown(response.text);

            await saveAuditLead({ Website: url, Report: JSON.stringify(parsedResult) });

            if (email.trim()) {
                await saveNewsletter({ Email: email.trim() });
            }

            setResult(parsedResult);
            trackEvent('generate_website_audit', { business_type: businessType });

        } catch (err: any) {
            console.error("AI audit error:", err);
            setError("Sorry, we couldn't generate the audit. The site might be blocking our analysis or the AI returned an unexpected format. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const title = "AI Website **Auditor**";
    const description = "Get an instant, **AI-powered strategic audit** of your website. Our auditor analyzes SEO, user experience, and conversion optimization to give you actionable insights.";

    return (
        <section ref={ref} className="py-16 sm:py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
                </div>

                <div className="max-w-4xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="website-url" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Website URL *</label>
                                <input id="website-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourwebsite.com" className="w-full px-4 py-2 rounded-lg border border-gray-900/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-white/60 focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition" required />
                            </div>
                            <div>
                                <label htmlFor="business-type" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Business Type</label>
                                <select id="business-type" value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-900/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition">
                                    {BUSINESS_TYPES.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="audit-email" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Your Email (Optional, to save your report)</label>
                            <input id="audit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full px-4 py-2 rounded-lg border border-gray-900/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-white/60 focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition" />
                        </div>
                        {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                        <div className="pt-2">
                             <button type="submit" disabled={loading} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-6 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                <FileSearchIcon className="h-5 w-5 mr-2"/>
                                {loading ? 'Auditing Your Website...' : 'Start Free Audit'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div ref={resultsRef} className="mt-8 max-w-5xl mx-auto">
                    {loading && <DynamicLoader messages={LOADING_MESSAGES.WEBSITE_AUDIT} className="mt-12" />}
                    {!loading && result && (
                        <div className="animate-fade-in space-y-8">
                            <Report result={result} url={url} />
                            <div className="text-center">
                                <a href="#lets-talk" onClick={handleCTAClick} className="bg-primary text-white font-bold py-3 px-8 text-lg rounded-full transition-all transform hover:scale-105 hover:bg-opacity-90 animate-glow inline-block">
                                    Book a Call to Implement These Changes
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AIWebsiteAuditorSection;
