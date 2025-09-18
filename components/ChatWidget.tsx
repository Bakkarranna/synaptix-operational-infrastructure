
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { SendIcon, CloseIcon, ChatBubbleIcon, MicrophoneIcon, VolumeUpIcon, VolumeOffIcon, Icon, IconName } from './Icon';
import MarkdownRenderer from './MarkdownRenderer';
import { CALENDLY_LINK } from '../constants';
import { saveChatLog } from '../services/supabase';
import { trackEvent } from '../services/analytics';
import { BlogPost } from '../services/supabase';

interface SocialLink {
  platform: string;
  url: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  navAction?: string | null;
  navActionText?: string | null;
  externalLinks?: SocialLink[] | null;
  isVoiceNote?: boolean;
  audioUrl?: string;
}

interface ChatWidgetProps {
  navigate: (path: string) => void;
  theme: string;
  blogPosts: BlogPost[];
}

const UserVoiceMessage: React.FC<{ message: Message; messageRef: React.RefObject<HTMLDivElement> | null }> = ({ message, messageRef }) => {
  const [showTranscript, setShowTranscript] = useState(false);
  
  return (
    <div ref={messageRef} className="flex items-end gap-2 justify-end animate-fade-in-fast">
      <div className="w-full max-w-[85%] rounded-2xl px-3 py-2 text-white bg-primary rounded-br-none space-y-2">
        {message.audioUrl && <audio src={message.audioUrl} controls className="w-full h-10" />}
        <button 
          onClick={() => setShowTranscript(s => !s)}
          className="text-xs font-semibold text-white/80 hover:text-white underline"
        >
          {showTranscript ? 'Hide Transcription' : 'View Transcription'}
        </button>
        {showTranscript && (
          <div className="text-sm text-white/90 pt-2 border-t border-white/20 mt-2">
            <MarkdownRenderer content={message.text} />
          </div>
        )}
      </div>
    </div>
  )
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ navigate, theme, blogPosts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm the Synaptix AI assistant. My goal is to show you how AI can help your business make more money or cut costs. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([
    "How can AI help my business make more money?",
    "Give me an example of a cost-saving automation.",
    "Book a demo call.",
    "I want to get my free AI strategy plan.",
  ]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const articlesForPrompt = blogPosts.map(post => ({
        title: post.title,
        slug: post.slug,
        description: post.description,
        category: post.category
    })).slice(0, 15); // Limit to recent 15 to keep prompt size manageable

    const articlesKnowledgeBase = articlesForPrompt.length > 0
        ? `
    **6. Blog Articles:**
    - We have a blog with articles on AI Strategy, Automation, Case Studies, and Business Growth.
    - If a user's question can be answered by one of the following articles, you MUST use the "navigateTo" field to direct them to it. The path should be "/blog/[slug]".
    - Here is a list of available articles:
    ${articlesForPrompt.map(p => `- Title: "${p.title}", Slug: "${p.slug}", Description: "${p.description}"`).join('\n    ')}
    `
        : `
    **6. Blog Articles:**
    - We have a blog with articles on AI strategy and automation. You can direct users to the main blog page at "/blog".
    `;

    const systemInstruction = `You are an expert AI assistant for Synaptix Studio, an AI automation agency. Your primary goal is to demonstrate how Synaptix Studio can help businesses achieve tangible financial results, either by making more money or reducing costs. Use the Knowledge Base below to answer questions accurately.

    **KNOWLEDGE BASE:**

    **1. Services & Pricing:**
    - Our pricing is modular and custom-built. We don't sell fixed packages.
    - Clients build a quote by selecting from **Core Services** and optional **Add-Ons**.
    - **Core Services** include: AI Chatbots, AI Voice Agents, AI CRM & Client Portals, Automation Workflows, Custom Web & AI Tools, AI Outreach Systems, AI Content Generators, AI Landing Pages & Funnels, and AI Training & Knowledge Base Bots.
    - Each service has a **one-time setup fee** (for development and deployment) and a **monthly retainer** (for maintenance, support, and platform costs).
    - Our website has an interactive pricing calculator on the '/#pricing' page.
    - We offer a significant discount for paying yearly.

    **2. Partners:**
    - We build our solutions on top of industry-leading technologies.
    - Our partners include major tech companies like **Microsoft, Google, OpenAI, HubSpot, Zapier, Make.com, NVIDIA, and AWS**.
    - There is a 'Partner With Us' page for affiliate and referral programs, which can be navigated to with "/partner".

    **3. Free AI Tools:**
    - We have a "Free Business Tools" page (\`/ai-tools\`) where users can try our AI capabilities. 
    - If a user's request maps directly to a specific tool, you MUST use the "navigateTo" field to direct them to it. The path should be "/ai-tools#[tool-slug]".
    - Here is a list of available tools and their slugs:
      - **Agent Generator** (\`/ai-tools#ai-agent-generator\`): For creating custom AI chatbots or voice agents.
      - **Content Strategist** (\`/ai-tools#viral-content-strategist\`): For generating viral social media content.
      - **Business Strategist** (\`/ai-tools#ai-idea-generator\`): For brainstorming AI automation ideas for a business.
      - **Financial Analyst** (\`/ai-tools#roi-calculator\`): For calculating the ROI of AI implementation.
      - **Ad Copy Generator** (\`/ai-tools#ai-ad-copy-generator\`): For creating ad copy for various platforms.
      - **Subject Line Tester** (\`/ai-tools#ai-subject-line-tester\`): For analyzing and improving email subject lines.
      - **Website Auditor** (\`/ai-tools#ai-website-auditor\`): For getting an AI-powered SEO and UX audit of a website.
      - **Knowledge Base Generator** (\`/ai-tools#ai-knowledge-base-generator\`): For turning a website into a structured knowledge base for AI training.

    **4. Contact & Next Steps:**
    - The best way to get a custom plan is to use the "Free AI Strategy" generator on the '/#ai-strategy' section of the homepage.
    - For a detailed discussion, users can book a free demo call via the Calendly link or use the "Let's Talk" contact form ('/#lets-talk').

    **5. Social Media:**
    - We are active on X (formerly Twitter), LinkedIn, and Instagram.
    - X URL: https://x.com/synaptixstudio
    - LinkedIn URL: https://www.linkedin.com/company/synaptix-studio
    - Instagram URL: https://www.instagram.com/synaptixstudios/
    
    ${articlesKnowledgeBase}
    ---

    **RESPONSE FORMATTING RULES:**

    IMPORTANT: Your entire output, from the very first character to the very last, MUST be a single, valid JSON object and nothing else.

    The JSON object must have FIVE keys:
    1. "response": (string) Your helpful, value-focused answer based on the Knowledge Base. Keep your response concise and easy to read. Use markdown for formatting.
    2. "suggestions": (array of 3-4 strings) Provide relevant, contextual follow-up questions that guide the user toward understanding the value of AI.
    3. "navigateTo": (string | null) If the user's query clearly indicates they want to visit a specific section or page (including a blog article), set this to the appropriate path (e.g., "/#pricing", "/blog/some-article-slug", "/ai-tools#roi-calculator"). Otherwise, set this to null.
    4. "navigateToText": (string | null) If "navigateTo" is not null, provide a short, compelling button text for it (e.g., "View Pricing", "Read Article: [Article Title]", "Try the Financial Analyst"). Otherwise, set this to null.
    5. "externalLinks": (array of objects | null) If the user asks for social media or other external links, populate this array with objects like \`{ "platform": "string", "url": "string" }\`. Otherwise, set it to null.
    
    **CRITICAL RULES:**
    - Your 'response' text MUST NEVER contain navigation paths like '/#pricing' or URLs. Use the 'navigateTo' or 'externalLinks' fields exclusively for actions.
    - When asked about social media, provide the links in the 'externalLinks' field and provide a simple 'response' text like "Here are our social media profiles!".
    - When referring to a blog article, use the format "/blog/[slug]" for the "navigateTo" field and create a "navigateToText" like "Read: [Article Title]".
    `;

    const chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
    setChat(chatInstance);
  }, [blogPosts]);

  useEffect(() => {
    if (isLoading) {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    } else {
        if (lastUserMessageRef.current && messages[messages.length - 1]?.sender === 'ai') {
            lastUserMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
  }, [isOpen]);

  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) {
        return;
    }
    const cleanedText = text.replace(/\*\*|\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => {
        const nextIsMuted = !prev;
        if (nextIsMuted && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        return nextIsMuted;
    });
  };

  const handleNavAction = (action: string) => {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
    if (action === '#book-demo') {
        window.open(CALENDLY_LINK, '_blank');
        trackEvent('book_demo_chat', {});
        const confirmationMessage: Message = { sender: 'ai', text: `Great! I've opened the booking page for you. Is there anything else I can help with?` };
        setMessages(prev => [...prev, confirmationMessage]);
        speak(confirmationMessage.text);
        setCurrentSuggestions([
            "What services do you offer?",
            "How does your pricing work?",
            "Tell me about your partners."
        ]);
    } else if (action) {
        navigate(action);
        setIsOpen(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chat) return;

    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentSuggestions([]);

    try {
        const response = await chat.sendMessage({ message: messageText });
        const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
        if (!jsonMatch || (!jsonMatch[1] && !jsonMatch[2])) {
            throw new Error("No valid JSON object found in response.");
        }
        const jsonString = (jsonMatch[1] || jsonMatch[2]).trim();
        const parsedResponse = JSON.parse(jsonString);

        const aiMessage: Message = {
            sender: 'ai',
            text: parsedResponse.response,
            navAction: parsedResponse.navigateTo,
            navActionText: parsedResponse.navigateToText,
            externalLinks: parsedResponse.externalLinks
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setCurrentSuggestions(parsedResponse.suggestions || []);
        speak(parsedResponse.response);
        
    } catch (error) {
        console.error("Chatbot error:", error);
        const errorMessage: Message = { sender: 'ai', text: "I'm having a little trouble right now. Please try asking in a different way." };
        setMessages(prev => [...prev, errorMessage]);
        speak(errorMessage.text);
    } finally {
        setIsLoading(false);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    finalTranscriptRef.current = '';

    recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscriptRef.current += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setInput(finalTranscriptRef.current + interimTranscript);
    };
    
    recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
        setIsRecording(false);
    };

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioChunksRef.current = [];
                if (finalTranscriptRef.current.trim()) {
                    setMessages(prev => [...prev, {
                        sender: 'user',
                        text: finalTranscriptRef.current,
                        isVoiceNote: true,
                        audioUrl: audioUrl
                    }]);
                    sendMessage(finalTranscriptRef.current);
                }
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            recognitionRef.current.start();
            setIsRecording(true);
        })
        .catch(err => {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check your browser permissions.");
        });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-white/20 dark:bg-black/50 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col animate-slide-in-up-fast">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={theme === 'dark' ? "https://iili.io/Fkb6akl.png" : "https://iili.io/KFWHFZG.png"} alt="Synaptix Studio" className="h-8 w-8 rounded-full" />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-black/50"></span>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Synaptix AI</h3>
                    <p className="text-xs text-gray-500 dark:text-white/60">Your AI Automation Guide</p>
                </div>
            </div>
            <button onClick={handleToggleMute} className="text-gray-500 dark:text-white/70 hover:text-gray-800 dark:hover:text-white p-1">
                {isMuted ? <VolumeOffIcon className="h-5 w-5" /> : <VolumeUpIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => {
              if (msg.isVoiceNote) {
                const isLastUserMessage = index === messages.length - 2 && messages[messages.length - 1]?.sender === 'ai';
                return <UserVoiceMessage key={index} message={msg} messageRef={isLastUserMessage ? lastUserMessageRef : null} />;
              }
              const isLastUserMessage = msg.sender === 'user' && index === messages.length - 2 && messages[messages.length - 1]?.sender === 'ai';
              return (
                <div 
                  key={index}
                  ref={isLastUserMessage ? lastUserMessageRef : null}
                  className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.sender === 'ai' && <ChatBubbleIcon className="h-6 w-6 text-primary flex-shrink-0" />}
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/30 dark:bg-white/10 backdrop-blur-sm text-gray-800 dark:text-white rounded-bl-none'}`}>
                     <MarkdownRenderer content={msg.text} />
                     {msg.navAction && msg.navActionText && (
                        <button onClick={() => handleNavAction(msg.navAction!)} className="mt-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full">
                            {msg.navActionText}
                        </button>
                     )}
                     {msg.externalLinks && (
                       <div className="mt-2 space-x-2">
                         {msg.externalLinks.map(link => (
                            <a href={link.url} key={link.platform} target="_blank" rel="noopener noreferrer" className="inline-block p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20">
                                <Icon name={link.platform.toLowerCase() as IconName} className="h-5 w-5 text-gray-600 dark:text-white"/>
                            </a>
                         ))}
                       </div>
                     )}
                  </div>
                </div>
              )
            })}
             {isLoading && (
              <div className="flex items-start gap-2">
                <ChatBubbleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-bl-none">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-gray-500 dark:bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-500 dark:bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-500 dark:bg-white/70 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
             {!isLoading && currentSuggestions.length > 0 && (
                <div className="space-y-2 pt-4 animate-fade-in">
                    {currentSuggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(suggestion)}
                            className="w-full text-left text-sm p-3 rounded-lg text-gray-700 dark:text-white bg-white/10 dark:bg-white/5 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
          </div>
          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Ask me anything..."
                className="w-full bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-black/10 dark:border-white/20 focus:border-primary dark:focus:border-white/20 focus:ring-0 rounded-lg text-gray-800 dark:text-white px-4 py-2 transition"
                disabled={isLoading}
              />
              {isRecording ? (
                  <button type="button" onClick={stopRecording} className="bg-red-500 text-white p-3 rounded-lg animate-pulse">
                      <MicrophoneIcon className="h-5 w-5"/>
                  </button>
              ) : (
                  <button type="button" onClick={startRecording} className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white p-3 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition">
                      <MicrophoneIcon className="h-5 w-5"/>
                  </button>
              )}
              <button type="submit" disabled={isLoading || !input.trim()} className="bg-primary text-white p-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">
                <SendIcon className="h-5 w-5"/>
              </button>
            </form>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-primary hover:bg-opacity-90 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 animate-glow">
        {isOpen ? <CloseIcon className="h-8 w-8" /> : <ChatBubbleIcon className="h-8 w-8" />}
      </button>
    </div>
  );
};

export default ChatWidget;
