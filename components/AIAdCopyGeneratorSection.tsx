import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { MegaphoneIcon, ClipboardIcon, CheckIcon, LightbulbIcon } from './Icon';
import StyledText from './StyledText';
import { AD_PLATFORMS, LOADING_MESSAGES } from '../constants';
import { trackEvent } from '../services/analytics';
import DynamicLoader from './DynamicLoader';

interface AdVariation {
    angle: string;
    headline: string;
    body: string;
    imageSuggestion: string;
    ctaSuggestion: string;
}

const AdCard: React.FC<{ ad: AdVariation, index: number }> = ({ ad, index }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        const fullContent = `${ad.headline}\n\n${ad.body}`;
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div 
            className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 relative animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
        >
            <button onClick={handleCopy} className="absolute top-4 right-4 bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-white p-2 rounded-full transition-colors" aria-label="Copy ad text">
                {copied ? <CheckIcon className="h-5 w-5 text-green-500 dark:text-green-300"/> : <ClipboardIcon className="h-5 w-5"/>}
            </button>
            <span className="text-sm font-bold text-primary mb-2">{ad.angle}</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mt-1">{ad.headline}</h4>
            <p className="text-gray-700 dark:text-white/80 mt-3 whitespace-pre-wrap">{ad.body}</p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-3 text-sm">
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-md">
                    <h5 className="font-bold text-gray-800 dark:text-white text-xs mb-1 flex items-center gap-1"><LightbulbIcon className="h-4 w-4"/>Image Suggestion</h5>
                    <p className="text-gray-600 dark:text-white/80 text-xs italic">"{ad.imageSuggestion}"</p>
                </div>
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-md">
                    <h5 className="font-bold text-gray-800 dark:text-white text-xs mb-1">A/B Test CTA Suggestion</h5>
                    <p className="text-gray-600 dark:text-white/80 text-xs">"{ad.ctaSuggestion}"</p>
                </div>
            </div>
        </div>
    );
};

const AIAdCopyGeneratorSection: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [keyBenefits, setKeyBenefits] = useState('');
    const [adPlatform, setAdPlatform] = useState(AD_PLATFORMS[0]);
    
    const [results, setResults] = useState<AdVariation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ref = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!loading && results.length > 0 && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, results]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !targetAudience || !keyBenefits) {
            setError('Please fill out all fields.');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const systemInstruction = `You are an expert direct response copywriter specializing in digital ads. Your task is to generate three distinct, high-converting ad copy variations based on the user's input, specifically tailored for the selected ad platform. Each variation must use a different, clearly labeled marketing angle.

            Valid angles are:
            - "Problem-Agitate-Solve (PAS)": Focus on the customer's pain point.
            - "Benefit-Driven": Directly highlight the positive outcomes.
            - "Social Proof": Reference customer success or popularity.

            When tailoring for the platform, consider its constraints and best practices:
            - **Facebook / Instagram**: More conversational, visual-oriented, can have longer body copy.
            - **Google Ads**: Headline-focused, concise, keyword-driven, strong call to action.
            - **LinkedIn Ads**: Professional tone, focus on B2B benefits, clear value proposition for a business audience.

            For each variation, you MUST also provide:
            - 'imageSuggestion': A descriptive prompt for an AI image generator (like Imagen) that would create a compelling visual for the ad.
            - 'ctaSuggestion': An alternative Call-to-Action for A/B testing.

            You MUST return a single, valid JSON object containing a key "adVariations", which is an array of exactly three ad copy objects. Do not include any text outside the JSON structure.`;

            const userPrompt = `Generate ad copy for this product:
            - Ad Platform: "${adPlatform}"
            - Product Name: "${productName}"
            - Target Audience: "${targetAudience}"
            - Key Benefits: "${keyBenefits}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            adVariations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        angle: { type: Type.STRING },
                                        headline: { type: Type.STRING },
                                        body: { type: Type.STRING },
                                        imageSuggestion: { type: Type.STRING },
                                        ctaSuggestion: { type: Type.STRING }
                                    },
                                    required: ['angle', 'headline', 'body', 'imageSuggestion', 'ctaSuggestion']
                                }
                            }
                        },
                        required: ['adVariations']
                    }
                }
            });

            setResults(JSON.parse(response.text).adVariations);
            trackEvent('generate_ad_copy', { platform: adPlatform });

        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't generate ad copy right now. Please try different inputs.");
        } finally {
            setLoading(false);
        }
    };

    const title = "AI Ad Copy **Generator**";
    const description = "Generate **multiple high-converting ad variations** in seconds. Our AI, trained as a direct response copywriter, provides options for different strategic angles.";

    return (
        <section ref={ref} className="py-16 sm:py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Controls */}
                    <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat text-center">Ad Creative Brief</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Ad Platform *</label>
                                <div className="flex flex-wrap gap-2">
                                    {AD_PLATFORMS.map(p => (
                                        <button key={p} type="button" onClick={() => setAdPlatform(p)} className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${adPlatform === p ? 'bg-primary/20 border border-primary/50 text-primary dark:text-white' : 'bg-white/20 dark:bg-black/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-black/40 text-gray-700 dark:text-white/80 border border-transparent'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="productName" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Product/Service Name *</label>
                                <input id="productName" type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., 'Zenith CRM'" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" required />
                            </div>
                            <div>
                                <label htmlFor="targetAudience" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Target Audience *</label>
                                <input id="targetAudience" type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., 'Small business owners'" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" required />
                            </div>
                            <div>
                                <label htmlFor="keyBenefits" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Key Benefits / Features *</label>
                                <textarea id="keyBenefits" rows={3} value={keyBenefits} onChange={e => setKeyBenefits(e.target.value)} placeholder="e.g., 'Saves 10 hours a week, integrates with all your tools, easy to use.'" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition resize-none" required />
                            </div>
                            {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-8 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                    {loading ? <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <MegaphoneIcon className="h-5 w-5 mr-2" />}
                                    {loading ? 'Generating...' : 'Generate Ad Copy'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Results */}
                    <div ref={resultsRef} className="animate-fade-in-fast">
                        {loading && <DynamicLoader messages={LOADING_MESSAGES.AD_COPY} className="mt-8" />}
                        {!loading && results.length > 0 && (
                            <div className="space-y-6">
                                {results.map((ad, index) => <AdCard key={index} ad={ad} index={index} />)}
                            </div>
                        )}
                        {!loading && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center bg-white/20 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 h-full min-h-[320px]">
                                <MegaphoneIcon className="h-16 w-16 text-gray-300 dark:text-white/20 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-white/80 font-montserrat">Your Ad Creatives Appear Here</h3>
                                <p className="text-gray-500 dark:text-white/50 mt-2">Fill out the brief and let our AI become your copywriter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIAdCopyGeneratorSection;