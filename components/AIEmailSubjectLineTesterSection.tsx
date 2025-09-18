import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { InboxIcon, CheckIcon } from './Icon';
import StyledText from './StyledText';
import ViralityMeter from './ViralityMeter';
import { trackEvent } from '../services/analytics';
import { LOADING_MESSAGES } from '../constants';
import DynamicLoader from './DynamicLoader';

interface AnalysisResult {
    score: number;
    analysis: {
        clarity: string;
        urgency: string;
        curiosity: string;
        spamRisk: string;
    };
    suggestions: string[];
}

const SuggestionItem: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg group">
            <span className="text-gray-800 dark:text-white/90">{text}</span>
            <button onClick={handleCopy} className={`text-sm font-semibold p-2 rounded-md transition-all ${copied ? 'bg-green-500/20 text-green-300' : 'bg-white/30 dark:bg-black/30 text-gray-600 dark:text-white/70 opacity-0 group-hover:opacity-100'}`}>
                {copied ? <CheckIcon className="h-4 w-4"/> : 'Copy'}
            </button>
        </div>
    );
};


const AIEmailSubjectLineTesterSection: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [audienceContext, setAudienceContext] = useState('');
    const [topicContext, setTopicContext] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
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
        if (!subject.trim()) {
            setError('Please enter a subject line to analyze.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const systemInstruction = `You are an expert email marketing analyst with a deep understanding of what drives high open rates and avoids spam filters. Your task is to analyze a user's email subject line and provide a detailed breakdown and suggestions for improvement. If the user provides context about the audience or topic, you MUST use it to make your analysis and suggestions far more specific and relevant.

            You MUST return a single, valid JSON object and nothing else.

            The JSON object must have:
            1.  'score': An integer from 0-100 representing the 'Open Rate Potential'. Be critical.
            2.  'analysis': An object with four keys:
                - 'clarity': A one-sentence analysis of how clear the subject line is.
                - 'urgency': A one-sentence analysis of its sense of urgency or lack thereof.
                - 'curiosity': A one-sentence analysis of how well it sparks curiosity.
                - 'spamRisk': A one-sentence analysis of its potential to be flagged as spam, considering words, capitalization, and punctuation.
            3.  'suggestions': An array of exactly 3 improved subject line strings, tailored to the provided context if available.`;

            const userPrompt = `Analyze this subject line: "${subject}"\n${audienceContext ? `Context: For an audience of ${audienceContext}.` : ''}\n${topicContext ? `The email is about ${topicContext}.` : ''}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.INTEGER },
                            analysis: {
                                type: Type.OBJECT,
                                properties: {
                                    clarity: { type: Type.STRING },
                                    urgency: { type: Type.STRING },
                                    curiosity: { type: Type.STRING },
                                    spamRisk: { type: Type.STRING },
                                },
                                required: ['clarity', 'urgency', 'curiosity', 'spamRisk']
                            },
                            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['score', 'analysis', 'suggestions']
                    }
                }
            });

            setResult(JSON.parse(response.text));
            trackEvent('test_subject_line');

        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't analyze the subject line. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const title = "Email Subject Line **Analyzer**";
    const description = "Boost your open rates. Our AI will **score your subject line's potential**, analyze its strengths, and suggest powerful alternatives.";

    return (
        <section ref={ref} className="py-16 sm:py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                     {/* Input Form */}
                    <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat text-center">Analyze Your Subject Line</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="subjectLine" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Enter Subject Line *</label>
                                <input id="subjectLine" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Our weekly newsletter" className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition text-lg" required />
                            </div>
                            <div>
                                <label htmlFor="audienceContext" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Target Audience (Optional)</label>
                                <input id="audienceContext" type="text" value={audienceContext} onChange={e => setAudienceContext(e.target.value)} placeholder="e.g., 'startup founders', 'marketing managers'" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" />
                            </div>
                            <div>
                                <label htmlFor="topicContext" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Email Topic (Optional)</label>
                                <input id="topicContext" type="text" value={topicContext} onChange={e => setTopicContext(e.target.value)} placeholder="e.g., 'announcing a new feature', 'a promotional offer'" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" />
                            </div>
                            {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-8 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                    {loading ? <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <InboxIcon className="h-5 w-5 mr-2" />}
                                    {loading ? 'Analyzing...' : 'Analyze Subject Line'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    <div ref={resultsRef} className="animate-fade-in-fast">
                        {loading && <DynamicLoader messages={LOADING_MESSAGES.SUBJECT_LINE} className="mt-8" />}
                        {!loading && result && (
                            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
                                <div className="flex flex-col items-center text-center">
                                    <h4 className="font-bold text-gray-700 dark:text-white/80">Open Rate Potential</h4>
                                    <div className="my-4">
                                        <ViralityMeter score={result.score} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white">Clarity:</h5>
                                        <p className="text-gray-700 dark:text-white/80 text-sm">{result.analysis.clarity}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white">Urgency:</h5>
                                        <p className="text-gray-700 dark:text-white/80 text-sm">{result.analysis.urgency}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white">Curiosity:</h5>
                                        <p className="text-gray-700 dark:text-white/80 text-sm">{result.analysis.curiosity}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white">Spam Risk:</h5>
                                        <p className="text-gray-700 dark:text-white/80 text-sm">{result.analysis.spamRisk}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                                    <h5 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-3">Suggested Alternatives</h5>
                                    <div className="space-y-2">
                                        {result.suggestions.map((s, i) => <SuggestionItem key={i} text={s} />)}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!loading && !result && (
                            <div className="flex flex-col items-center justify-center text-center bg-white/20 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 h-full min-h-[320px]">
                                <InboxIcon className="h-16 w-16 text-gray-300 dark:text-white/20 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-white/80 font-montserrat">Your Analysis Appears Here</h3>
                                <p className="text-gray-500 dark:text-white/50 mt-2">Enter a subject line to see how it scores.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIEmailSubjectLineTesterSection;