import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon, UsersIcon, SendIcon, PhoneIcon, UploadIcon, XCircleIcon, UserIcon, IconName, ChatIcon, ClipboardIcon, CheckIcon } from './Icon';
import StyledText from './StyledText';
import MarkdownRenderer from './MarkdownRenderer';
import { AGENT_TONES, AGENT_PURPOSES, LOADING_MESSAGES } from '../constants';
import { trackEvent } from '../services/analytics';
import DynamicLoader from './DynamicLoader';

type AgentType = 'chatbot' | 'voice';

interface AgentResult {
    agentType: AgentType;
    agentName: string;
    voiceDescription?: string;
    systemPrompt: string;
    greetingMessage: string;
    sampleInteractions: { user: string; agent: string; }[];
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// --- Helper Components for Demo ---
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ChatbotDemo: React.FC<{ result: AgentResult }> = ({ result }) => {
    const [messages, setMessages] = useState<Message[]>([{ sender: 'ai', text: result.greetingMessage }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: result.systemPrompt
            }
        });
        setChat(chatInstance);
        setMessages([{ sender: 'ai', text: result.greetingMessage }]);
    }, [result]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: input });
            const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
            
            let aiTextResponse = '';
            if (jsonMatch && (jsonMatch[1] || jsonMatch[2])) {
                const jsonString = (jsonMatch[1] || jsonMatch[2]).trim();
                const parsed = JSON.parse(jsonString);
                aiTextResponse = parsed.response;
            } else {
                 // Fallback if the response is not valid JSON
                aiTextResponse = response.text;
            }

            const aiMessage: Message = { sender: 'ai', text: aiTextResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chatbot Demo Error:", error);
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I encountered an error." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                <ChatIcon className="h-8 w-8 text-primary" />
                <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat">{result.agentName}</h4>
                    <p className="text-sm text-gray-600 dark:text-white/70">Live Chat Demo</p>
                </div>
            </div>
            <div ref={scrollRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <UserIcon className="h-6 w-6 text-primary flex-shrink-0" />}
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/30 dark:bg-white/10 text-gray-800 dark:text-white rounded-bl-none'}`}>
                            <MarkdownRenderer content={msg.text} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-2">
                        <UserIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-gray-100 dark:bg-white/10"><span className="h-2 w-2 bg-gray-500 rounded-full inline-block animate-bounce"></span></div>
                    </div>
                )}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-white/10 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="w-full bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition rounded-lg" />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-primary text-white p-3 rounded-lg disabled:opacity-50"><SendIcon className="h-5 w-5"/></button>
            </form>
        </div>
    );
};

const VoiceAgentDemo: React.FC<{ result: AgentResult }> = ({ result }) => {
    const [isListening, setIsListening] = useState(false);
    const [agentResponse, setAgentResponse] = useState(result.greetingMessage);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        speak(result.greetingMessage);
    }, [result]);

    const speak = (text: string) => {
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    };

    const handleListen = async () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (e: any) => console.error(e);
        recognitionRef.current.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            recognitionRef.current.stop();
            setIsListening(false);
            
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: result.systemPrompt }
            });
            const response = await chat.sendMessage({ message: transcript });
            
            setAgentResponse(response.text);
            speak(response.text);
        };
        
        recognitionRef.current.start();
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center h-[500px]">
            <PhoneIcon className={`h-16 w-16 mb-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
            <h4 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat">{result.agentName}</h4>
            <p className="text-sm text-gray-600 dark:text-white/70 mb-6">{result.voiceDescription}</p>
            <p className="flex-grow text-gray-800 dark:text-white/90 text-lg">{agentResponse}</p>
            <button onClick={handleListen} className={`px-8 py-4 rounded-full font-bold text-white transition-colors ${isListening ? 'bg-red-500' : 'bg-primary'}`}>
                {isListening ? 'Listening...' : 'Tap to Speak'}
            </button>
        </div>
    );
};

const VoiceAgentSimulation: React.FC<{ result: AgentResult }> = ({ result }) => {
    const [messages, setMessages] = useState<Message[]>([{ sender: 'ai', text: result.greetingMessage }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: result.systemPrompt }
            });
            const response = await chat.sendMessage({ message: input });
            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Voice Sim Error:", error);
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I encountered an error." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl flex flex-col h-[500px]">
             <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                <PhoneIcon className="h-8 w-8 text-primary" />
                <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat">{result.agentName}</h4>
                    <p className="text-sm text-gray-600 dark:text-white/70">Voice Agent (Text Simulation)</p>
                </div>
            </div>
            <div className="p-2 text-center text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">Your browser doesn't support voice APIs. This is a text-based simulation.</div>
            <div ref={scrollRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <UserIcon className="h-6 w-6 text-primary flex-shrink-0" />}
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/30 dark:bg-white/10 text-gray-800 dark:text-white rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-white/10 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your response..." className="w-full bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition rounded-lg" />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-primary text-white p-3 rounded-lg disabled:opacity-50"><SendIcon className="h-5 w-5"/></button>
            </form>
        </div>
    );
};

const BlueprintDisplay: React.FC<{ result: AgentResult }> = ({ result }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(result.systemPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat">Agent Blueprint</h4>
            <div className="space-y-4 text-sm">
                <p><strong className="text-gray-800 dark:text-white/90">Agent Name:</strong> <span className="text-gray-600 dark:text-white/80">{result.agentName}</span></p>
                {result.voiceDescription && <p><strong className="text-gray-800 dark:text-white/90">Voice:</strong> <span className="text-gray-600 dark:text-white/80">{result.voiceDescription}</span></p>}
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block font-bold text-gray-800 dark:text-white">System Prompt</label>
                        <button onClick={handleCopy} className="text-xs font-semibold p-2 rounded-md transition-all flex items-center gap-1 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/70">
                            {copied ? <CheckIcon className="h-4 w-4 text-green-500"/> : <ClipboardIcon className="h-4 w-4"/>}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <pre className="w-full bg-black/5 dark:bg-black/50 border border-gray-200 dark:border-white/20 rounded-md p-3 font-mono text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">{result.systemPrompt}</pre>
                </div>

                <div>
                    <h5 className="font-bold text-gray-800 dark:text-white">Sample Interactions</h5>
                    <div className="mt-2 space-y-2">
                        {result.sampleInteractions.map((interaction, i) => (
                            <div key={i} className="p-2 bg-black/5 dark:bg-white/5 rounded-md text-xs">
                                <p><span className="font-bold text-primary">User:</span> <span className="text-gray-700 dark:text-white/80">{interaction.user}</span></p>
                                <p><span className="font-bold">Agent:</span> <span className="text-gray-700 dark:text-white/80">{interaction.agent}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AIAgentGeneratorSection: React.FC = () => {
    const [agentType, setAgentType] = useState<AgentType>('chatbot');
    const [businessDetails, setBusinessDetails] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [selectedTones, setSelectedTones] = useState<string[]>([]);
    const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);

    const [result, setResult] = useState<AgentResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceApiSupported, setIsVoiceApiSupported] = useState(true);
    const [trainingText, setTrainingText] = useState('');

    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollPositionRef = useRef<number | null>(null);

    React.useLayoutEffect(() => {
        if (scrollPositionRef.current !== null && !loading && result) {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
            scrollPositionRef.current = null;
        }
    }, [loading, result]);
    
    useEffect(() => {
        const isSupported = 'speechSynthesis' in window && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
        setIsVoiceApiSupported(isSupported);
    }, []);

    const handleToggle = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        const newList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setter(newList);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleTrainAgent = () => {
        if (!trainingText.trim() || !result) return;
        
        const updatedSystemPrompt = `${result.systemPrompt}\n\n**Additional Live Training Data:**\n- ${trainingText}`;
        
        setResult(prevResult => prevResult ? {
            ...prevResult,
            systemPrompt: updatedSystemPrompt
        } : null);
        
        setTrainingText('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessDetails.trim() && !file) {
            setError('Please provide your business details or upload a document.');
            return;
        }

        scrollPositionRef.current = window.scrollY;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `import.meta.env.VITE_GEMINI_API_KEY` to align with coding guidelines and fix environment variable access errors.
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
             const systemInstruction = `You are an AI Agent Architect at Synaptix Studio. Your task is to design a complete personality and operational blueprint for a bespoke AI agent (voice or chatbot) based on client specifications. Your output MUST be a single, valid JSON object, and nothing else.

            The JSON object must contain:
            - 'agentType': The type of agent requested ('voice' or 'chatbot').
            - 'agentName': A creative, professional name for the agent.
            - 'voiceDescription': If the agentType is 'voice', this is a brief, evocative description of the agent's voice. If 'chatbot', this MUST be an empty string.
            - 'systemPrompt': A detailed, robust system prompt that will be used to initialize the AI agent. This prompt must define the agent's persona, its knowledge base (from the business details, website, and files), its goals, and constraints. This prompt should be much more detailed and include rules for handling ambiguity and unknown information.
                - **IMPORTANT FOR CHATBOTS**: If the agentType is 'chatbot', the systemPrompt you generate MUST instruct the agent to ALWAYS respond in a valid JSON format with two keys: "response" (the string answer, formatted using markdown) and "suggestions" (an array of 3-4 relevant string follow-up questions that guide the user). It should also include a rule: "If the user's query is ambiguous, ask a clarifying question before providing an answer."
                - **IMPORTANT FOR VOICE AGENTS**: If the agentType is 'voice', the systemPrompt should instruct the agent to respond with just a simple, conversational string, NOT JSON. It should include rules like "Keep responses concise and clear." and "If you don't know an answer, politely state that you don't have that information."
            - 'greetingMessage': The first thing the agent says to the user. It should be welcoming and state its purpose.
            - 'sampleInteractions': An array of 3-4 sample back-and-forth interactions (each with a 'user' query and an 'agent' response) that showcase the agent's primary capabilities. For chatbots, the 'agent' response MUST be the plain string content from the "response" key of their hypothetical JSON output.`;
            
            let userPrompt = `Design an AI agent with the following specifications:
            - Agent Type: ${agentType}
            - Business Details: ${businessDetails}
            - Website URL (for context): ${websiteUrl || 'Not provided'}
            - Desired Tones: ${selectedTones.join(', ') || 'neutral'}
            - Key Purposes: ${selectedPurposes.join(', ') || 'general assistance'}`;
            
            const contentParts: any[] = [{ text: userPrompt }];

            if (file) {
                const base64File = await fileToBase64(file);
                contentParts.push({
                    inlineData: {
                        mimeType: file.type,
                        data: base64File
                    }
                });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: contentParts },
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                }
            });
            
            const rawText = response.text;
            const cleanedJsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            setResult(JSON.parse(cleanedJsonString));
            trackEvent('generate_ai_agent', { agent_type: agentType });

        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't generate your AI agent demo. Please try different inputs or simplify your request.");
        } finally {
            setLoading(false);
        }
    };
    
    const title = "AI Agent **Generator**";
    const description = "Experience a live demo of a bespoke **AI Agent** trained on your business data. Choose between a **Voice Agent** or a **Chatbot**, provide your details, and see its potential in real-time.";

    return (
        <section ref={ref} className="py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:bg-clip-text dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
                    <p className="mt-4 text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Controls */}
                    <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 sm:p-8 space-y-6 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat text-center">Design Your AI Agent</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Agent Type</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                                    <button type="button" onClick={() => setAgentType('chatbot')} className={`px-4 py-2 rounded-md font-semibold transition-colors text-gray-800 dark:text-white ${agentType === 'chatbot' ? 'bg-primary/20 border border-primary/50' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>Chatbot</button>
                                    <button type="button" onClick={() => setAgentType('voice')} className={`px-4 py-2 rounded-md font-semibold transition-colors text-gray-800 dark:text-white ${agentType === 'voice' ? 'bg-primary/20 border border-primary/50' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>Voice Agent</button>
                                </div>
                            </div>

                            <div>
                               <label htmlFor="businessDetails" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Business Details & Knowledge Base *</label>
                               <textarea id="businessDetails" rows={4} value={businessDetails} onChange={e => setBusinessDetails(e.target.value)} placeholder="Paste your generated Knowledge Base here, or describe your business, what you sell, and any key information..." className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition resize-none" />
                            </div>

                            <div>
                                <label htmlFor="file-upload" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Or Upload a Document</label>
                                <input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gray-400 dark:border-white/30 bg-white/60 dark:bg-white/10 backdrop-blur-sm text-gray-600 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/20 hover:border-gray-500 dark:hover:border-white/50 transition">
                                    <UploadIcon className="h-5 w-5" />
                                    <span>{file ? file.name : 'Click to upload (PDF, DOCX, TXT)'}</span>
                                </button>
                                {file && <button type="button" onClick={() => setFile(null)} className="text-xs text-red-400 hover:underline mt-2 flex items-center gap-1 mx-auto"><XCircleIcon className="h-3 w-3" /> Remove file</button>}
                            </div>
                            
                             <div>
                                <label htmlFor="websiteUrl" className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Website URL (for analysis)</label>
                                <input id="websiteUrl" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Agent Tone</label>
                                <div className="flex flex-wrap gap-2">
                                    {AGENT_TONES.map(t => <button key={t} type="button" onClick={() => handleToggle(t, selectedTones, setSelectedTones)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border ${selectedTones.includes(t) ? 'bg-primary/20 border-primary/50 text-primary dark:text-white' : 'bg-black/5 dark:bg-white/10 border-transparent hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-white/80'}`}>{t}</button>)}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Agent Purpose</label>
                                <div className="flex flex-wrap gap-2">
                                    {AGENT_PURPOSES.map(p => <button key={p} type="button" onClick={() => handleToggle(p, selectedPurposes, setSelectedPurposes)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border ${selectedPurposes.includes(p) ? 'bg-primary/20 border-primary/50 text-primary dark:text-white' : 'bg-black/5 dark:bg-white/10 border-transparent hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-white/80'}`}>{p}</button>)}
                                </div>
                            </div>

                            {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}
                            
                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-8 text-lg rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                    <UsersIcon className="h-5 w-5 mr-2" />
                                    {loading ? 'Generating...' : 'Generate Demo Agent'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Results */}
                    <div className="animate-fade-in-fast">
                        {loading && <DynamicLoader messages={LOADING_MESSAGES.AGENT} className="mt-8" />}
                        {!loading && result && (
                           <div className="space-y-8">
                                {/* Live Demo Section */}
                                <div>
                                    {result.agentType === 'chatbot' ? (
                                        <ChatbotDemo result={result} />
                                    ) : isVoiceApiSupported ? (
                                        <VoiceAgentDemo result={result} />
                                    ) : (
                                        <VoiceAgentSimulation result={result} />
                                    )}
                                </div>

                                {/* Live Training Section */}
                                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat">Live Training</h4>
                                    <p className="text-sm text-gray-600 dark:text-white/70">Add new information to the agent's knowledge base. The agent in the demo will immediately learn it and reset for testing.</p>
                                    <textarea
                                        value={trainingText}
                                        onChange={(e) => setTrainingText(e.target.value)}
                                        rows={5}
                                        placeholder="e.g., 'We are running a 25% off sale this week for all new customers.'"
                                        className="w-full px-4 py-2 rounded-lg border border-black/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50 dark:focus:ring-white focus:border-transparent transition resize-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTrainAgent}
                                        disabled={!trainingText.trim()}
                                        className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2 rounded-full hover:bg-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        Train Agent
                                    </button>
                                </div>
                                
                                {/* Blueprint Section */}
                                <BlueprintDisplay result={result} />
                            </div>
                        )}
                        {!loading && !result && (
                             <div className="flex flex-col items-center justify-center text-center bg-white/20 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 h-full min-h-[320px] sticky top-24">
                                <UsersIcon className="h-16 w-16 text-gray-300 dark:text-white/20 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-white/80 font-montserrat">Your AI Agent Demo Appears Here</h3>
                                <p className="text-gray-500 dark:text-white/50 mt-2">Fill out the brief and we'll build a custom demo for you to experience.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIAgentGeneratorSection;
