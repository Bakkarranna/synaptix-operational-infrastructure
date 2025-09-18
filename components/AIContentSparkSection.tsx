import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { SparklesIcon, ClipboardIcon, CheckIcon, Icon, IconName, EditIcon, TrophyIcon, LightbulbIcon } from './Icon';
import StyledText from './StyledText';
import { CONTENT_TYPES, CONTENT_LENGTHS, TONES_OF_VOICE, LOADING_MESSAGES } from '../constants';
import ViralityMeter from './ViralityMeter';
import { trackEvent } from '../services/analytics';
import DynamicLoader from './DynamicLoader';

interface GeneratedContent {
    hook: string;
    hookVariations: string[];
    body: string;
    cta: string;
    viralityScore: number;
    justification: string;
    hashtags: string[];
    adaptations: { platform: string; text: string; }[];
    imageIdea: string;
}

const AIContentSparkSection: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [contentType, setContentType] = useState(CONTENT_TYPES[0].name);
    const [contentLength, setContentLength] = useState(CONTENT_LENGTHS[1]);
    const [tone, setTone] = useState(TONES_OF_VOICE[0]);
    const [audience, setAudience] = useState('');
    const [cta, setCta] = useState('');

    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [editableHook, setEditableHook] = useState('');
    const [editableBody, setEditableBody] = useState('');
    const [editableCta, setEditableCta] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!loading && generatedContent && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, generatedContent]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic to generate content.');
            return;
        }

        setError(null);
        setLoading(true);
        setGeneratedContent(null);
        setCopied(false);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemInstruction = `You are a world-class Viral Content Strategist and Growth Hacker. Your task is to generate exceptionally high-quality, engaging content based on user inputs, designed for maximum social media impact.

You MUST return your response as a single, valid JSON object, and nothing else. Adhere strictly to the provided JSON schema.

Your core philosophy is that all great content has three parts:
1.  A "Hook": An irresistible, scroll-stopping opening.
2.  The "Body": The core message that delivers value, emotion, or information.
3.  A "Call to Action (CTA)": A clear, compelling next step.

Your JSON output must contain:
- "hook": The BEST short, powerful sentence or question (1-2 lines).
- "hookVariations": An array of 2 other powerful hooks for A/B testing.
- "body": The main content, formatted with markdown for readability (use \\n for new lines).
- "cta": A clear call-to-action. If the user provides one, adapt it. If not, create a contextually relevant one.
- "viralityScore": An integer score from 1 to 100, representing your expert assessment of the content's potential to go viral. Be critical and honest.
- "justification": A brief, insightful explanation for your virality score, explaining what's good and what could be better.
- "hashtags": An array of 3-5 relevant, lowercase hashtags.
- "adaptations": An array of 2 objects, each for a different platform ("Twitter" and "Instagram Story Idea"). Each object should have "platform" and "text" keys, where text is a very short, adapted version of the main content suitable for that platform.
- "imageIdea": A string containing a descriptive, visually compelling prompt for an AI image generator (like Midjourney or Imagen) that would complement the post.`;
            
            const userPrompt = `Generate content based on these parameters:
- Topic: "${topic}"
- Content Type: "${contentType}"
- Desired Length: "${contentLength}"
- Target Audience: "${audience || 'general audience'}"
- Tone of Voice: "${tone}"
- User-provided Call-to-Action: "${cta || 'None provided'}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                }
            });

            const parsedContent = JSON.parse(response.text);
            setGeneratedContent(parsedContent);
            setEditableHook(parsedContent.hook);
            setEditableBody(parsedContent.body);
            setEditableCta(parsedContent.cta);
            trackEvent('generate_content_spark', { content_type: contentType, tone: tone });

        } catch (err) {
            console.error(err);
            setError('Sorry, we had trouble generating content. The AI may have provided an invalid response. Please try a different topic or adjust your inputs.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCopy = () => {
        const fullContent = `${editableHook}\n\n${editableBody}\n\n${editableCta}\n\n${generatedContent?.hashtags.map(h => `#${h}`).join(' ')}`;
        navigator.clipboard.writeText(fullContent.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const title = "Viral Content **Strategist**";
    const description = "Go beyond simple generation. Craft **high-impact content** with an AI co-pilot that thinks like a growth hacker.";

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

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Controls */}
                    <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat text-center">Your Content Brief</h3>
                        
                        <div>
                            <label htmlFor="topic" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Topic / Keyword *</label>
                            <input id="topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., The future of remote work" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" required />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contentType" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Content Type</label>
                                <select id="contentType" value={contentType} onChange={e => setContentType(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition">
                                    {CONTENT_TYPES.map(type => <option key={type.name}>{type.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="contentLength" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Content Length</label>
                                <select id="contentLength" value={contentLength} onChange={e => setContentLength(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition">
                                    {CONTENT_LENGTHS.map(len => <option key={len}>{len}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="tone" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Tone of Voice</label>
                            <div className="flex flex-wrap gap-2">
                                {TONES_OF_VOICE.map(t => (
                                    <button key={t} type="button" onClick={() => setTone(t)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${tone === t ? 'bg-primary/20 border border-primary/50 text-primary dark:text-white' : 'bg-white/20 dark:bg-black/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-black/40 text-gray-700 dark:text-white/80 border border-transparent'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="audience" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Target Audience</label>
                            <input id="audience" type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., SaaS founders, marketing managers" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" />
                        </div>
                        
                        <div>
                            <label htmlFor="cta" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Call to Action (Optional)</label>
                            <input id="cta" type="text" value={cta} onChange={e => setCta(e.target.value)} placeholder="e.g., 'Visit our website to learn more!'" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" />
                        </div>

                        {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                        
                        <div className="text-center pt-2">
                             <button onClick={handleGenerate} disabled={loading} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-8 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:bg-primary/10 disabled:border-primary/20 disabled:text-gray-500 dark:disabled:text-white/50 disabled:cursor-not-allowed disabled:animate-none flex items-center justify-center mx-auto">
                                {loading ? <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="h-5 w-5 mr-2" />}
                                {loading ? 'Generating...' : 'Generate Content'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div ref={resultsRef} className="animate-fade-in-fast">
                        {loading && <DynamicLoader messages={LOADING_MESSAGES.CONTENT_SPARK} />}
                        {!loading && generatedContent && (
                            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 space-y-6 relative">
                                <button onClick={handleCopy} className="absolute top-4 right-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white p-2 rounded-full transition-colors flex items-center gap-2 text-xs" aria-label="Copy to clipboard">
                                    {copied ? <CheckIcon className="h-4 w-4 text-green-400"/> : <ClipboardIcon className="h-4 w-4"/>}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>

                               <div className="flex flex-col items-center text-center">
                                   <ViralityMeter score={generatedContent.viralityScore} />
                                   <p className="text-gray-600 dark:text-white/70 italic text-sm mt-4 max-w-xs">{generatedContent.justification}</p>
                               </div>

                               <div className="space-y-4">
                                   <EditableField label="Top Hook" value={editableHook} onChange={setEditableHook} icon="rocket" />
                                   <HookVariations hooks={generatedContent.hookVariations} onSelect={setEditableHook} />
                                   <EditableField label="Body" value={editableBody} onChange={setEditableBody} icon="file-text" isTextarea={true} />
                                   <EditableField label="Call to Action" value={editableCta} onChange={setEditableCta} icon="target" />
                               </div>

                               <div>
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Suggested Hashtags:</h4>
                                   <p className="text-primary text-sm font-semibold">{generatedContent.hashtags.map(h => `#${h}`).join(' ')}</p>
                               </div>

                               <ImageIdea idea={generatedContent.imageIdea} />
                               <PlatformAdaptations adaptations={generatedContent.adaptations} />
                            </div>
                        )}
                        {!loading && !generatedContent && (
                             <div className="flex flex-col items-center justify-center text-center bg-white/20 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 h-full min-h-[320px]">
                                <SparklesIcon className="h-16 w-16 text-gray-300 dark:text-white/20 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-white/80 font-montserrat">Your Content Awaits</h3>
                                <p className="text-gray-500 dark:text-white/50 mt-2">Fill out the brief on the left and let our AI work its magic.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

interface EditableFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: IconName;
    isTextarea?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, onChange, icon, isTextarea }) => {
    const InputComponent = isTextarea ? 'textarea' : 'input';
    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                <Icon name={icon} className="h-4 w-4" />
                <span>{label}</span>
            </label>
            <div className="relative group">
                <InputComponent
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/20 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white/90 focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-colors hover:bg-white/30 dark:hover:bg-black/30"
                    rows={isTextarea ? 5 : undefined}
                />
                <EditIcon className="absolute top-2 right-2 h-4 w-4 text-gray-400 dark:text-white/30 group-hover:text-gray-500 dark:group-hover:text-white/60 transition-colors" />
            </div>
        </div>
    )
};

const HookVariations: React.FC<{ hooks: string[], onSelect: (hook: string) => void }> = ({ hooks, onSelect }) => (
    <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
            <TrophyIcon className="h-4 w-4" />
            <span>A/B Test Hooks</span>
        </h4>
        <div className="space-y-2">
            {hooks.map((hook, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(hook)}
                    className="w-full text-left p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-black/30 transition-colors text-sm text-gray-700 dark:text-white/80"
                >
                   "{hook}"
                </button>
            ))}
        </div>
    </div>
);

const ImageIdea: React.FC<{ idea: string }> = ({ idea }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(idea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pt-4 border-t border-gray-200 dark:border-white/10">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><LightbulbIcon className="h-4 w-4"/>Image Idea</h4>
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg group relative">
                 <p className="text-gray-700 dark:text-white/80 text-sm italic">"{idea}"</p>
                 <button onClick={handleCopy} className={`absolute top-2 right-2 text-xs font-semibold p-1 rounded-md transition-all ${copied ? 'bg-green-500/20 text-green-300' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/70 opacity-0 group-hover:opacity-100'}`}>
                    {copied ? <CheckIcon className="h-4 w-4"/> : 'Copy'}
                 </button>
            </div>
        </div>
    );
};

const PlatformAdaptations: React.FC<{ adaptations: { platform: string; text: string }[] }> = ({ adaptations }) => (
    <div className="pt-4 border-t border-gray-200 dark:border-white/10">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Campaign Expansions</h4>
        <div className="space-y-3">
            {adaptations.map((item, i) => (
                <div key={i} className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg">
                    <h5 className="font-bold text-primary text-xs">{item.platform}</h5>
                    <p className="text-gray-700 dark:text-white/80 text-sm mt-1">"{item.text}"</p>
                </div>
            ))}
        </div>
    </div>
);

export default AIContentSparkSection;