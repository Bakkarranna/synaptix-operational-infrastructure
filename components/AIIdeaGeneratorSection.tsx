import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon, IconName, LightbulbIcon } from './Icon';
import StyledText from './StyledText';
import { INDUSTRIES, BUSINESS_SIZES, PRIMARY_GOALS, LOADING_MESSAGES } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { trackEvent } from '../services/analytics';
import DynamicLoader from './DynamicLoader';

interface Idea {
    title: string;
    description: string;
    impact: string;
    firstSteps: string[];
    icon: IconName;
    potentialRisks: string[];
    estimatedTimeframe: string;
    strategicFit: string;
}

const IdeaCard: React.FC<{ idea: Idea; index: number }> = ({ idea, index }) => {
    return (
        <div
            className={`group bg-white/20 dark:bg-black/20 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-500 border border-gray-200 dark:border-white/10 flex flex-col animate-slide-in-up hover:-translate-y-1`}
            style={{ animationDelay: `${index * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 p-3 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-lg mt-1">
                    <Icon name={idea.icon || 'lightbulb'} className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">{idea.title}</h3>
                    <p className="text-gray-700 dark:text-white/80 text-sm mt-1">{idea.description}</p>
                </div>
            </div>
            
            <div className="space-y-4 mt-4 text-sm flex-grow flex flex-col">
                 <div className="flex-grow">
                     <div className="p-3 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-md border border-gray-200 dark:border-white/10">
                        <h4 className="font-bold text-gray-800 dark:text-white text-xs mb-1">Strategic Fit:</h4>
                        <p className="text-gray-600 dark:text-white/80 text-xs italic">{idea.strategicFit}</p>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Potential Impact:</h4>
                        <p className="text-gray-700 dark:text-white/80"><StyledText text={idea.impact} /></p>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Actionable First Steps:</h4>
                        <ul className="space-y-2 list-disc list-inside pl-1 text-gray-700 dark:text-white/80">
                            {idea.firstSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ul>
                    </div>
                     <div className="mt-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Potential Risks:</h4>
                        <ul className="space-y-2 list-disc list-inside pl-1 text-gray-700 dark:text-white/80">
                            {idea.potentialRisks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-center text-xs font-semibold text-gray-500 dark:text-white/70">
                    Estimated Timeframe: {idea.estimatedTimeframe}
                </div>
            </div>
        </div>
    );
};

const AIIdeaGeneratorSection: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const [industry, setIndustry] = useState(INDUSTRIES[0]);
    const [businessSize, setBusinessSize] = useState(BUSINESS_SIZES[0]);
    const [primaryGoal, setPrimaryGoal] = useState(PRIMARY_GOALS[0]);
    const [challenge, setChallenge] = useState('');
    
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ref = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!loading && ideas.length > 0 && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, ideas]);
    
    const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/#ai-strategy');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!challenge.trim()) {
            setError('Please describe your primary challenge.');
            return;
        }

        setError(null);
        setLoading(true);
        setIdeas([]);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const availableIcons: IconName[] = ['zap', 'chat', 'users', 'cart', 'chart-bar', 'phone', 'search', 'rocket', 'lightbulb', 'bolt', 'target'];
            
            const systemPrompt = `You are an expert AI business strategist from Synaptix Studio. Your goal is to provide three distinct, actionable, and high-impact AI automation ideas based on the user's business context.

            For each idea, you MUST provide:
            1. "title": A catchy and clear title for the AI solution.
            2. "description": A brief explanation of what the solution does.
            3. "impact": A tangible business outcome. Frame it around saving money, making money, or improving efficiency. Use markdown-style double asterisks to **bold** key outcomes.
            4. "firstSteps": A JSON array of 2-3 concrete, simple first steps to implement the idea.
            5. "icon": An icon name that best represents the idea. You MUST choose one from this list: ${availableIcons.join(', ')}.
            6. "potentialRisks": An array of 1-2 potential risks or challenges to consider.
            7. "estimatedTimeframe": A realistic timeframe for implementation (e.g., "2-4 Weeks", "1-2 Months").
            8. "strategicFit": A concise, one-sentence explanation for *why* this specific idea is a good fit for the user's provided industry, size, and primary goal.

            Return your response as a valid JSON object containing a single key "ideas" which is an array of objects. Do not include any text outside the JSON structure.
            `;
            
            const userPromptContent = `Here is the business context:
            - Industry: "${industry}"
            - Business Size: "${businessSize}"
            - Primary Goal: "${primaryGoal}"
            - Key Challenge: "${challenge}"
            
            Generate three strategic AI ideas based on this.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPromptContent,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                }
            });
            
            const parsedResponse = JSON.parse(response.text);
            setIdeas(parsedResponse.ideas);
            trackEvent('generate_business_idea', { industry: industry, goal: primaryGoal });

        } catch (err) {
            console.error(err);
            setError('Sorry, we couldn\'t generate ideas right now. Please try a different prompt.');
            setIdeas([]);
        } finally {
            setLoading(false);
        }
    };

    const title = "AI Business **Strategist**";
    const description = "Unsure where to start? Provide some context about your business, and our AI will generate actionable, high-impact strategies for you.";

    return (
        <section
            ref={ref}
            className={`py-16 sm:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
                </div>
                
                <div className="max-w-4xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="industry" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Your Industry</label>
                                <select id="industry" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition">
                                    {INDUSTRIES.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="businessSize" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Business Size</label>
                                <select id="businessSize" value={businessSize} onChange={e => setBusinessSize(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition">
                                    {BUSINESS_SIZES.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="primaryGoal" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Primary Goal</label>
                                <select id="primaryGoal" value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition">
                                    {PRIMARY_GOALS.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="challenge" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Describe your primary challenge *</label>
                            <textarea
                                id="challenge"
                                placeholder="e.g., 'We spend too much time on manual data entry' or 'Our customer support can't keep up with inquiries.'"
                                rows={3}
                                value={challenge}
                                onChange={(e) => setChallenge(e.target.value)}
                                className="w-full pl-4 pr-4 py-3 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition resize-none"
                                required
                            />
                        </div>

                        {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                        
                        <div className="text-center pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-8 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:bg-primary/10 disabled:border-primary/20 disabled:text-gray-500 dark:disabled:text-white/50 disabled:cursor-not-allowed disabled:animate-none flex items-center justify-center mx-auto"
                            >
                               {loading ? <svg className="animate-spin h-5 w-5 text-current mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <LightbulbIcon className="h-5 w-5 mr-2" />}
                               {loading ? 'Generating Strategies...' : 'Generate AI Strategies'}
                            </button>
                        </div>
                    </form>
                </div>

                {loading && <DynamicLoader messages={LOADING_MESSAGES.IDEAS} className="mt-12" />}
                
                {!loading && ideas.length > 0 && (
                     <div ref={resultsRef} className="mt-16 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {ideas.map((idea, index) => (
                                <IdeaCard key={index} idea={idea} index={index} />
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <p className="text-lg text-gray-600 dark:text-white/80 mb-4">These ideas are just the beginning.</p>
                            <a
                              href="#ai-strategy"
                              onClick={handleCTAClick}
                              className="bg-primary text-white font-bold py-3 px-8 text-base rounded-full transition-all transform hover:scale-105 hover:bg-opacity-90 animate-glow inline-block"
                            >
                              Get a Full, Custom AI Plan
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AIIdeaGeneratorSection;