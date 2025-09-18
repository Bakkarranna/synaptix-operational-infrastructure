import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icon, SunIcon, MoonIcon } from '../Icon';
import BlogEditorModal from './BlogEditorModal';
import { BlogPost, deleteBlogPost, updatePostPerformanceData, PerformanceData } from '../../services/supabase';
import AiLinkManagerModal from './AiLinkManagerModal';
import DynamicLoader from '../DynamicLoader';
import { LOADING_MESSAGES, RESOURCE_CATEGORIES, CALENDLY_LINK, CONTENT_WRITER_TYPES, CONTENT_WRITER_TONES } from '../../constants';
import Modal from '../Modal';
import BlogMarkdownRenderer from '../BlogMarkdownRenderer';

interface BlogAdminDashboardProps {
  initialPosts: BlogPost[];
  onRefreshPosts: () => Promise<void>;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface AIPipelineProps {
  onDraftGenerated: (draft: BlogPost) => void;
  onCancel: () => void;
  initialBrief?: {
      topic: string;
      keywords?: string;
      audience?: string;
  } | null;
}

const AIPublishingPipeline: React.FC<AIPipelineProps> = ({ onDraftGenerated, onCancel, initialBrief }) => {
  const [brief, setBrief] = useState({
    topic: '',
    audience: '',
    keywords: '',
    wordCount: '2500-4000',
    numTables: 1,
    category: RESOURCE_CATEGORIES.filter(c => c !== 'All')[0],
    tones: [] as string[],
    tableDetails: '',
    cta: '',
    numShortTail: 5,
    numLongTail: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuggestingSeo, setIsSuggestingSeo] = useState(false);
  
  useEffect(() => {
    if (initialBrief) {
        setBrief(prev => ({
            ...prev,
            topic: initialBrief.topic,
            keywords: initialBrief.keywords || '',
            audience: initialBrief.audience || '',
        }));
    }
  }, [initialBrief]);

  const handleBriefChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
        setBrief(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
        setBrief(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleToggle = (item: string, list: string[], setter: (newList: string[]) => void) => {
    const newList = list.includes(item)
        ? list.filter(i => i !== item)
        : [...list, item];
    setter(newList);
  };

  const parseFrontmatter = (markdown: string): { frontmatter: any; content: string } => {
    // Re-architected parser: Pre-process to remove any top-level markdown code block wrappers from the AI.
    // This makes the system resilient to this common AI formatting inconsistency.
    let processedMarkdown = markdown.trim();
    if (processedMarkdown.startsWith('```') && processedMarkdown.endsWith('```')) {
        const lines = processedMarkdown.split('\n');
        processedMarkdown = lines.slice(1, lines.length - 1).join('\n').trim();
    }

    // Regex to find a YAML frontmatter block. The opening '---' is now optional to handle AI inconsistencies.
    const frontmatterRegex = /(?:---\s*\n)?([\s\S]+?)\n---\s*\n/;
    const match = processedMarkdown.match(frontmatterRegex);

    if (!match || typeof match.index === 'undefined') {
        console.error("Malformed AI Response. Full response received:", processedMarkdown);
        throw new Error("Invalid response format: Missing frontmatter. The AI did not provide the required article metadata.");
    }

    const frontmatterContent = match[1];
    // The actual article content starts after the matched frontmatter block.
    const content = processedMarkdown.substring(match.index + match[0].length).trim();

    const frontmatter: { [key: string]: string } = {};
    const expectedKeys = ['title', 'slug', 'metaDescription', 'keywords'];
    let hasKeys = false;

    frontmatterContent.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim().replace(/^"|"$/g, '');
            frontmatter[key] = value;
            if(expectedKeys.includes(key)) {
                hasKeys = true;
            }
        }
    });
    
    // Additional validation to ensure we captured a real frontmatter block
    if (!hasKeys) {
        console.error("Malformed AI Response. Parsed block did not contain frontmatter keys. Full response:", processedMarkdown);
        throw new Error("Invalid response format: Missing frontmatter keys. The AI's response structure was incorrect.");
    }

    return { frontmatter, content };
  };

  const handleSuggestSeo = async () => {
    if (!brief.topic.trim()) {
        setError("Please enter a topic first.");
        return;
    }
    setIsSuggestingSeo(true);
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const systemInstruction = `You are an expert SEO and marketing strategist for Synaptix Studio, an AI Automation Agency. For the given article topic, your task is to generate a target audience persona and a strategic list of keywords.

        **CRITICAL REQUIREMENTS:**
        - The keyword list MUST include the mandatory brand keywords: "Synaptix Studio", "AI Automation Agency".

        **OUTPUT FORMAT:**
        You MUST return a single, valid JSON object with two keys:
        1. "audience": A concise paragraph describing the ideal target reader, including their roles, goals, and pain points.
        2. "keywords": A comma-separated string containing exactly ${brief.numShortTail} short-tail keywords and ${brief.numLongTail} long-tail keywords, in addition to the mandatory brand keywords.
        
        **ABSOLUTE FINAL INSTRUCTION:** Your entire response, from the very first character, MUST be the valid JSON object. Do not include any text, explanation, or markdown formatting like \`\`\`json around it.`;
        
        const userPrompt = `Article Topic: "${brief.topic}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction, responseMimeType: 'application/json' }
        });

        // Resilient JSON parsing
        const rawText = response.text;
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
        if (!jsonMatch || (!jsonMatch[1] && !jsonMatch[2])) {
            throw new Error("No valid JSON object found in response.");
        }
        const jsonString = (jsonMatch[1] || jsonMatch[2]).trim();
        const suggestions = JSON.parse(jsonString);

        setBrief(prev => ({
            ...prev,
            audience: suggestions.audience || prev.audience,
            keywords: suggestions.keywords || prev.keywords
        }));

    } catch (e: any) {
        console.error("SEO Suggestion failed:", e);
        setError(`Could not generate SEO suggestions. ${e.message}`);
    } finally {
        setIsSuggestingSeo(false);
    }
  };
  
const cleanupAiContent = (markdown: string): string => {
    let cleaned = markdown.replace(/\[[\d\s,]+\]/g, ''); // Remove stray numerical citations

    const blocks = cleaned.split(/(\n\s*\n)/); // Split by double newlines, keeping the separator
    const cleanedBlocks = blocks.map(block => {
        const trimmedBlock = block.trim();
        // Guard clause: Avoid processing complex structures like tables, code blocks, or anything that already looks like a list.
        if (trimmedBlock.includes('\n') || trimmedBlock.startsWith('```') || trimmedBlock.includes('|') || trimmedBlock.startsWith('*') || trimmedBlock.startsWith('-') || /^\d+\./.test(trimmedBlock)) {
            return block;
        }

        // This regex is designed to find multiple "Label:* Description" patterns within a single paragraph.
        const itemRegex = /((?:\*\*)?[^\n:]+?(?:\*\*)?):\*\s*([^\n]*?)(?=(?:\s+(?:\*\*)?[^\n:]+?(?:\*\*)?:\*)|$)/g;
        
        const items = [...trimmedBlock.matchAll(itemRegex)];

        // Only reformat if we find 2 or more distinct items, which strongly indicates a malformed list.
        if (items.length >= 2) {
            // Find where the list starts to separate any introductory text.
            const firstMatchFullText = items[0][0];
            const firstMatchIndex = trimmedBlock.indexOf(firstMatchFullText);
            
            const intro = trimmedBlock.substring(0, firstMatchIndex).trim();

            let newContent = intro ? `${intro}\n\n` : '';
            newContent += items.map(match => {
                const label = match[1].trim().replace(/\*\*/g, ''); // Clean the label
                const desc = match[2].trim();
                return `* **${label}:** ${desc}`;
            }).join('\n');
            
            // Replace the trimmed block content within the original block to preserve surrounding whitespace.
            return block.replace(trimmedBlock, newContent);
        }

        return block;
    });

    let joinedBlocks = cleanedBlocks.join('');

    // Remove any "References" or "Sources" section at the very end of the article.
    const lines = joinedBlocks.split('\n');
    const referencesIndex = lines.findIndex(line => 
        line.trim().toLowerCase().match(/^(#+\s*(references|sources|bibliography))|^(references:|sources:)/)
    );

    if (referencesIndex !== -1) {
        // To be safe, only remove it if it's one of the last sections in the document.
        if (lines.length - referencesIndex < 30) {
            joinedBlocks = lines.slice(0, referencesIndex).join('\n').trim();
        }
    }

    return joinedBlocks;
};

  const handleGenerate = async () => {
    if (!brief.topic.trim()) {
      setError('Please provide a topic for the article.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const systemInstruction = `You are an elite AI Content Strategy team for Synaptix Studio. Your primary objective is to take a brief and autonomously execute a complete content creation pipeline, resulting in a professional-grade, SEO-optimized article that adheres to the strict "Synaptix Studio Blog Blueprint".

**THE AI PUBLISHING PIPELINE (Your Automated Workflow):**

**Phase 1: Strategy & SEO Research**
1.  **Analyze Brief:** Deeply understand the user's topic ("${brief.topic}"), audience ("${brief.audience}"), and keywords ("${brief.keywords}").
2.  **Keyword Expansion:** Use Google Search to expand on the provided keywords, finding related primary, secondary, and long-tail terms.
3.  **Audience Persona:** If the user's audience description is vague, create a more detailed persona to guide your writing.

**Phase 2: Content Architecture & Drafting**
1.  **SEO Outline:** Create a detailed, hierarchical article outline (H1, H2s, H3s) designed to rank for your generated keywords.
2.  **Drafting:** Write the full article, adhering to a word count of approximately ${brief.wordCount} words. The tone must be professional, insightful, and engaging, incorporating the user's desired tones: "${brief.tones.join(', ')}".
3.  **Call to Action**: Seamlessly integrate this user-provided Call to Action: "${brief.cta}". If none is provided, create a relevant one, like encouraging readers to check out our [Free AI Business Tools](/ai-tools).

**Phase 3: Enrichment & Verification**
1.  **Fact-Checking:** Use Google Search to meticulously verify all factual claims, statistics, or data points. All citations MUST be embedded as inline markdown links.
2.  **Proactive Entity Linking:** As you write, you MUST identify named entities (companies, products, technologies, communities like \`r/ChatGPT\`). You are REQUIRED to use Google Search to find their canonical URL and embed it as an inline markdown link on the first mention.
3.  **Finalization & SEO Polish:** Based on the complete draft, write the final, fully-optimized frontmatter: \`title\`, \`slug\`, \`metaDescription\`, and \`keywords\`.

**CRITICAL BLOG BLUEPRINT & FINAL CHECKLIST (NON-NEGOTIABLE):**

1.  **MANDATORY ELEMENTS:** Your draft **MUST** include: ${brief.numTables} well-structured markdown table(s) with relevant data (based on: "${brief.tableDetails || 'none'}"), **AT LEAST ONE** client testimonial, and a "Frequently Asked Questions" section with **EXACTLY 5** unique FAQs. This is an absolute requirement.

2.  **NO EMPTY HEADINGS:** **EVERY** heading and subheading (e.g., \`##\`, \`###\`) **MUST** be followed by at least one full paragraph of detailed, valuable content. A heading followed immediately by another heading is a validation failure.

3.  **STRICT TABLE FORMATTING:** Every row in a table **MUST** have the same number of columns as the header row. Table cells **MUST** contain concise, structured text. You are **STRICTLY FORBIDDEN** from dumping unstructured data, lists of links, or the pipe symbol ('|') inside a table cell.

4.  **STRICT FAQ FORMATTING:** The "Frequently Asked Questions" section format is **NON-NEGOTIABLE**. It **MUST** be placed directly before the final summary heading. Each question and answer pair **MUST** be on separate lines and formatted EXACTLY like this example:
    \`**Q:** This is the question text.\n**A:** This is the answer text.\`

5.  **CLIENT TESTIMONIAL FORMAT & PLACEMENT:** A testimonial **MUST** use the following custom block format. It is a **block-level element** and is **STRICTLY FORBIDDEN** from being placed inside any other element (like a table or list).
    [TESTIMONIAL_START]
    "The full quote from the client goes here, enclosed in double quotes."
    -- Client Name, Client Title/Company
    [TESTIMONIAL_END]
    
6.  **NO GENERIC CONCLUSION:** The article **MUST** end with a unique, descriptive final heading that summarizes the article's main takeaway. You are **STRICTLY FORBIDDEN** from using the generic word "Conclusion".

7.  **NO NUMERICAL CITATIONS OR RAW URLS:** You are strictly forbidden from using bracketed numerical citations (e.g., \`[1]\`, \`[2]\`). ALL sources **MUST** be cited using inline markdown links. The article body must contain **NO** raw, un-embedded URLs.

8.  **STRICT LIST FORMATTING:** You are **STRICTLY FORBIDDEN** from creating list-like items or definitions within a single paragraph. All list items **MUST** start on a new line with a proper markdown bullet (\`*\`, \`-\`, or \`1.\`).
    *   **FORBIDDEN FORMAT 1:** \`AI for Workflow Orchestration. Zapier:* Connects apps. Make:* Offers visual flows.\`
    *   **FORBIDDEN FORMAT 2:** \`Our expertise lies in: Strategic AI Consultation:* Helping you... Custom AI Solution Development:* Building bespoke...\`
    *   **CORRECT FORMAT:**
        \`Our expertise lies in:

        *   **Strategic AI Consultation:** Helping you identify...
        *   **Custom AI Solution Development:** Building bespoke...\`
        
9.  **NO REFERENCES SECTION:** You are **STRICTLY FORBIDDEN** from adding a "References", "Sources", or "Bibliography" section at the end of the article. All citations MUST be inline markdown links.

**ABSOLUTE FINAL INSTRUCTION:** Your entire response, from the very first character, MUST be the YAML frontmatter block starting with \`---\`. There can be NO text, explanation, or preamble before it. This is a critical validation requirement.

**FINAL OUTPUT FORMAT:** You MUST return a single markdown document with YAML frontmatter.

---
title: "Your Generated Title"
slug: "your-generated-slug"
metaDescription: "Your generated meta description."
keywords: "your, final, keyword, list"
---

# The Full Article Draft Starts Here
## Introduction
[...content...]`;
      
      const userPrompt = `Generate a full article draft based on this brief:
      - Topic: "${brief.topic}"
      - Category: "${brief.category}"
      - Target Audience: "${brief.audience}"
      - Primary Keywords: "${brief.keywords}"
      - Desired Tones: "${brief.tones.join(', ')}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        }
      });
      
      if (!response.text || response.text.trim() === '') {
          console.error("AI response was empty. Full response:", JSON.stringify(response, null, 2));
          const blockReason = response.promptFeedback?.blockReason;
          if (blockReason) {
              throw new Error(`The request was blocked by the API. Reason: ${blockReason}. Please revise your prompt.`);
          }
          throw new Error("The AI returned an empty response. This might be due to a content safety filter or an internal error. Please try again with a different topic.");
      }
      
      const cleanedText = cleanupAiContent(response.text);
      const { frontmatter, content } = parseFrontmatter(cleanedText);

      const newPost: BlogPost = {
        title: frontmatter.title,
        slug: frontmatter.slug,
        description: frontmatter.metaDescription,
        content: content,
        keywords: frontmatter.keywords,
        category: brief.category,
        image: 'https://iili.io/Jbc1Aol.png', // Default image
        externalLinks: []
      };
      onDraftGenerated(newPost);
    } catch (e: any) {
      console.error(e);
      setError(`Failed to generate draft: ${e.message}. The AI's response might not have been in the correct format.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DynamicLoader messages={LOADING_MESSAGES.PUBLISHING_PIPELINE} />;
  }

  return (
    <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4 max-w-3xl mx-auto animate-fade-in-fast text-gray-900 dark:text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="sparkles" className="h-6 w-6 text-primary" />
            AI Publishing Pipeline
        </h3>
        <p className="text-sm text-gray-600 dark:text-white/70">Start with a topic. Our AI team will handle the rest, from SEO research to the final draft.</p>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">Topic *</label>
                <input name="topic" value={brief.topic} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-gray-900 dark:text-white" placeholder="e.g., The Future of AI in Marketing" />
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold">SEO & Targeting</h4>
                    <button onClick={handleSuggestSeo} disabled={isSuggestingSeo || !brief.topic.trim()} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon name="lightbulb" className="h-4 w-4"/>
                        {isSuggestingSeo ? 'Suggesting...' : 'Suggest with AI'}
                    </button>
                </div>
                {isSuggestingSeo && <div className="text-center text-xs">Generating suggestions...</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                         <label className="block text-xs font-bold mb-1">Short-Tail Keywords</label>
                        <input name="numShortTail" type="number" value={brief.numShortTail} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white" />
                    </div>
                     <div className="md:col-span-1">
                         <label className="block text-xs font-bold mb-1">Long-Tail Keywords</label>
                        <input name="numLongTail" type="number" value={brief.numLongTail} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white" />
                    </div>
                     <div className="md:col-span-1">
                        <label className="block text-xs font-bold mb-1">Category</label>
                        <select name="category" value={brief.category} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white">
                            {RESOURCE_CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                
                <textarea name="audience" value={brief.audience} onChange={handleBriefChange} rows={3} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white" placeholder="Describe the Target Audience (optional)..."/>
                <textarea name="keywords" value={brief.keywords} onChange={handleBriefChange} rows={2} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white" placeholder="Specific keywords to include (optional)..."/>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg space-y-4">
                 <h4 className="text-base font-bold">Content Options</h4>
                
                <div>
                    <label className="block text-sm font-bold mb-2">Tone of Voice</label>
                    <div className="flex flex-wrap gap-2">
                        {CONTENT_WRITER_TONES.map(tone => (
                            <button key={tone} type="button" onClick={() => handleToggle(tone, brief.tones, (newList) => setBrief(prev => ({ ...prev, tones: newList })))} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border ${brief.tones.includes(tone) ? 'bg-primary/20 border-primary/50 text-primary dark:text-white' : 'bg-black/5 dark:bg-white/10 border-transparent hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-white/80'}`}>{tone}</button>
                        ))}
                    </div>
                </div>
                 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="wordCount" value={brief.wordCount} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white">
                        <option>1000-1500</option>
                        <option>2500-4000</option>
                        <option>4000+</option>
                    </select>
                    <div>
                        <label className="block text-xs font-bold mb-1">Number of Tables</label>
                        <input name="numTables" type="number" value={brief.numTables} onChange={(e) => setBrief(prev => ({ ...prev, numTables: parseInt(e.target.value) || 0 }))} min="0" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm text-gray-900 dark:text-white" />
                    </div>
                </div>
                <textarea name="tableDetails" value={brief.tableDetails} onChange={handleBriefChange} rows={2} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" placeholder="Details about tables (e.g., 'A table comparing AI models')..." />
                <input name="cta" value={brief.cta} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" placeholder="Call to Action (optional)" />

            </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        <div className="flex gap-4 pt-2">
            <button onClick={onCancel} className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20">Cancel</button>
            <button onClick={handleGenerate} disabled={!brief.topic.trim()} className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">Generate Article</button>
        </div>
    </div>
  );
};

interface ArticleBrief {
    title: string;
    rationale: string;
    keywords: string;
}

interface ContentStrategistViewProps {
    allPosts: BlogPost[];
    onGenerateFromBrief: (brief: { topic: string; keywords: string }) => void;
}

const ContentStrategistView: React.FC<ContentStrategistViewProps> = ({ allPosts, onGenerateFromBrief }) => {
    const [suggestions, setSuggestions] = useState<ArticleBrief[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateStrategy = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const systemInstruction = `You are a world-class SEO and Content Strategist for Synaptix Studio. Your task is to analyze our existing blog content, identify content gaps, and propose three new, high-potential article ideas that will attract our target audience (SMBs, entrepreneurs, tech adopters) and rank on Google.

            **Your Workflow:**
            1.  **Analyze Existing Content:** Review the titles of our current articles to understand our content pillars.
            2.  **Identify Gaps & Opportunities:** Use Google Search to research related topics, "People Also Ask" questions, and competitor content to find valuable, low-competition keywords and topics we haven't covered.
            3.  **Generate Briefs:** Formulate three distinct article suggestions.

            **Output Format:**
            You MUST return a single, valid JSON object with one key: "suggestions". This key should contain an array of exactly three article brief objects. Each object must have:
            - "title": A compelling, SEO-optimized headline for the new article.
            - "rationale": A brief, strategic explanation of *why* this article is a good idea (e.g., "Targets a high-intent keyword with low competition," or "Addresses a common pain point for our audience").
            - "keywords": A comma-separated string of 5-7 primary and long-tail keywords for the article.`;

            const existingTitles = allPosts.map(p => `- "${p.title}"`).join('\n');
            const userPrompt = `Here is a list of our existing blog post titles:\n${existingTitles}\n\nPlease generate three new strategic article suggestions based on your analysis.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    tools: [{ googleSearch: {} }],
                }
            });

            const rawText = response.text;
            const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
            if (!jsonMatch || (!jsonMatch[1] && !jsonMatch[2])) {
                throw new Error("No valid JSON object found in AI response.");
            }
            const jsonString = (jsonMatch[1] || jsonMatch[2]).trim();

            const parsed = JSON.parse(jsonString);
            setSuggestions(parsed.suggestions);
        } catch (e: any) {
            console.error(e);
            setError(`Strategy generation failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-fast">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold">AI Content Strategist</h2>
                <p className="text-gray-600 dark:text-white/70 mt-2">Let our AI analyze your existing content and identify high-impact opportunities. Get data-driven article ideas designed to rank and convert.</p>
                <button onClick={handleGenerateStrategy} disabled={isLoading} className="mt-6 bg-primary text-white font-bold py-2 px-5 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto">
                    <Icon name="lightbulb" className="h-5 w-5" />
                    {isLoading ? 'Analyzing...' : 'Generate New Strategy'}
                </button>
            </div>
            
            {isLoading && <DynamicLoader messages={LOADING_MESSAGES.CONTENT_STRATEGY} className="mt-8" />}
            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
            
            {suggestions.length > 0 && (
                <div className="mt-12 space-y-6">
                    {suggestions.map((brief, index) => (
                        <div key={index} className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{brief.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-white/70 mt-1 italic">**Rationale:** {brief.rationale}</p>
                            <p className="text-xs text-primary font-semibold mt-2">**Keywords:** {brief.keywords}</p>
                            <div className="text-right mt-4">
                                <button
                                    onClick={() => onGenerateFromBrief({ topic: brief.title, keywords: brief.keywords })}
                                    className="bg-green-500/20 text-green-600 dark:text-green-300 font-bold py-2 px-4 rounded-full text-sm hover:bg-green-500/30 flex items-center gap-2 ml-auto"
                                >
                                    <Icon name="sparkles" className="h-4 w-4" />
                                    Generate this Article
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface PerformanceOptimizerViewProps {
    allPosts: BlogPost[];
    onAnalysisComplete: (updatedPost: BlogPost) => void;
}

const PerformanceOptimizerView: React.FC<PerformanceOptimizerViewProps> = ({ allPosts, onAnalysisComplete }) => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedMeta, setGeneratedMeta] = useState<string[]>([]);
    
    const handleAnalyze = async (post: BlogPost) => {
        if (!post || !post.id) return;
        setIsLoading(true);
        setError(null);
        setSelectedPost(post);
        setGeneratedMeta([]);

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const systemInstruction = `You are an expert SEO Performance Analyst. Your task is to analyze a blog post's performance (simulated) and provide a concise, actionable optimization report.

            **Your Workflow:**
            1.  **Simulate Performance Review:** Imagine you are reviewing 30-90 days of performance data for the article (traffic, rankings, CTR, engagement).
            2.  **Generate a Data-Driven Report:** Based on this simulated data and the article's content, create a structured report.

            **Output Format:**
            You MUST return a single, valid JSON object with the following structure:
            - "summary": (string) A brief, high-level summary of the article's performance.
            - "metrics": (array of objects) An array of 2-3 key performance metrics. Each object must have "name" (string, e.g., "Click-Through Rate"), "value" (string, e.g., "2.1% (Below Average)"), and "insight" (string, a brief explanation).
            - "recommendations": (array of objects) An array of 2-3 specific, high-impact optimization recommendations. Each object must have "recommendation" (string) and "priority" (string: "High", "Medium", "Low").`;
            
            const userPrompt = `Analyze the performance of this article:\nTitle: "${post.title}"\nContent Snippet: "${post.content.substring(0, 500)}..."`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction, responseMimeType: 'application/json' }
            });

            const performanceData: PerformanceData = JSON.parse(response.text);
            const updatedPost = await updatePostPerformanceData(post.id, performanceData);
            onAnalysisComplete(updatedPost);
            setSelectedPost(updatedPost);

        } catch(e: any) {
            console.error(e);
            setError(`Performance analysis failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateMeta = async () => {
        if (!selectedPost) return;
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const systemInstruction = `You are an SEO copywriter. Based on the article content, generate 3 new, compelling meta descriptions (under 160 characters) designed to improve click-through rate. Return a JSON object with a single key "descriptions" which is an array of strings.`;
            const userPrompt = `Article Title: ${selectedPost.title}\nContent: ${selectedPost.content.substring(0, 500)}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction, responseMimeType: 'application/json' }
            });
            setGeneratedMeta(JSON.parse(response.text).descriptions);
        } catch (e) {
            console.error("Meta generation failed:", e);
        }
    };
    
    const getTimeAgo = (dateString?: string | null) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="animate-fade-in-fast grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Performance Optimizer</h2>
                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {allPosts.map(post => (
                        <div
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedPost?.id === post.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{post.title}</p>
                            <p className="text-xs text-gray-500 dark:text-white/60">Last analyzed: {getTimeAgo(post.last_analyzed_at)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2">
                {selectedPost ? (
                    <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPost.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-white/60">Last analyzed: {getTimeAgo(selectedPost.last_analyzed_at)}</p>
                             </div>
                             <button onClick={() => handleAnalyze(selectedPost)} disabled={isLoading} className="bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-500/30 flex items-center gap-2">
                                <Icon name="chart-bar" className="h-4 w-4" />
                                {isLoading ? 'Analyzing...' : 'Re-Analyze'}
                             </button>
                        </div>
                        {isLoading && <DynamicLoader messages={LOADING_MESSAGES.PERFORMANCE_ANALYSIS} className="mt-4" />}
                        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                        
                        {selectedPost.performance_data && !isLoading && (
                            <div className="mt-6 space-y-6 animate-fade-in-fast">
                                <div>
                                    <h4 className="font-bold">Performance Summary</h4>
                                    <p className="text-sm text-gray-600 dark:text-white/70">{selectedPost.performance_data.summary}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold">Key Metrics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                        {selectedPost.performance_data.metrics.map(metric => (
                                            <div key={metric.name} className="bg-gray-100 dark:bg-white/5 p-3 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-white/60">{metric.name}</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
                                                <p className="text-xs text-gray-600 dark:text-white/70">{metric.insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="font-bold">High-Impact Recommendations</h4>
                                    <ul className="space-y-2 mt-2">
                                        {selectedPost.performance_data.recommendations.map(rec => (
                                            <li key={rec.recommendation} className="flex items-start gap-2 text-sm">
                                                <span className={`font-bold text-xs px-2 py-0.5 rounded-full mt-0.5 ${rec.priority === 'High' ? 'bg-red-500/20 text-red-400' : rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{rec.priority}</span>
                                                <span className="text-gray-700 dark:text-white/80">{rec.recommendation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                                    <button onClick={handleGenerateMeta} className="text-sm font-semibold text-primary hover:underline">Generate New Meta Descriptions</button>
                                    {generatedMeta.length > 0 && (
                                        <div className="mt-2 space-y-2 text-sm">
                                            {generatedMeta.map((desc, i) => <p key={i} className="p-2 bg-gray-100 dark:bg-white/5 rounded-md">"{desc}"</p>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl text-center p-8">
                        <div>
                            <Icon name="chart-bar" className="h-12 w-12 mx-auto text-gray-400 dark:text-white/30" />
                            <h3 className="mt-2 text-lg font-bold text-gray-700 dark:text-white/80">Select an Article</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-white/60">Choose an article from the left to view its performance data and optimization opportunities.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const BlogAdminDashboard: React.FC<BlogAdminDashboardProps> = ({ initialPosts, onRefreshPosts, onLogout, theme, toggleTheme }) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [view, setView] = useState<'posts' | 'pipeline' | 'strategist' | 'optimizer'>('posts');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLinkManagerOpen, setIsLinkManagerOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [initialBrief, setInitialBrief] = useState<{ topic: string; keywords: string; } | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [postToPreview, setPostToPreview] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // This effect synchronizes the `selectedPost` state with the main `posts` list.
  // This is crucial for ensuring that after a save and refresh, the editor
  // receives the most up-to-date version of the post, not a stale one.
  useEffect(() => {
    if (selectedPost) {
        const updatedPost = posts.find(p => p.slug === selectedPost.slug);
        if (updatedPost) {
            setSelectedPost(updatedPost);
        }
    }
  }, [posts, selectedPost?.slug]);
  
  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };
  
  const handleCreateNew = () => {
    setView('pipeline');
    setInitialBrief(null); // Reset any brief from strategist
  };
  
  const handleGenerateFromBrief = (brief: { topic: string; keywords: string; }) => {
    setInitialBrief(brief);
    setView('pipeline');
  };
  
  const handleSave = async () => {
    setIsEditorOpen(false);
    setIsLinkManagerOpen(false);
    await onRefreshPosts();
  };
  
  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        setDeletingPostId(postId);
        try {
            await deleteBlogPost(postId);
            await onRefreshPosts();
        } catch (e: any) {
            console.error(e);
            alert(`Failed to delete post: ${e.message}`);
        } finally {
            setDeletingPostId(null);
        }
    }
  };

  const onAnalysisComplete = (updatedPost: BlogPost) => {
      setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePreview = (post: BlogPost) => {
    setPostToPreview(post);
    setIsPreviewOpen(true);
  };

  const handleCopyContent = (post: BlogPost) => {
    navigator.clipboard.writeText(post.content);
    setCopiedPostId(post.id!);
    setTimeout(() => {
      setCopiedPostId(null);
    }, 2000);
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-brand-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="bg-white dark:bg-brand-dark/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <img src={theme === 'dark' ? "https://iili.io/Fkb6akl.png" : "https://iili.io/KFWHFZG.png"} alt="Logo" className="h-8"/>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
         <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10">
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button onClick={onLogout} className="text-sm font-semibold text-red-500 hover:text-red-400">Logout</button>
         </div>
      </header>
      
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <nav className="mb-8 flex flex-wrap gap-2">
            {[{id: 'posts', label: 'All Posts', icon: 'pencil'}, {id: 'pipeline', label: 'Create New Post', icon: 'sparkles'}, {id: 'strategist', label: 'AI Content Strategist', icon: 'lightbulb'}, {id: 'optimizer', label: 'Performance Optimizer', icon: 'chart-bar'}].map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                        if (item.id === 'pipeline') {
                            handleCreateNew();
                        } else {
                            setView(item.id as any)
                        }
                    }}
                    className={`px-4 py-2 text-sm font-bold rounded-full flex items-center gap-2 transition-colors ${view === item.id ? 'bg-primary text-white' : 'bg-white dark:bg-black/20 hover:bg-gray-200 dark:hover:bg-black/40'}`}
                >
                    <Icon name={item.icon as any} className="h-4 w-4" />
                    {item.label}
                </button>
            ))}
        </nav>
        
        {view === 'posts' && (
            <div className="animate-fade-in-fast">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Blog Posts ({posts.length})</h2>
                    <button onClick={handleCreateNew} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
                        <Icon name="pencil" className="h-5 w-5"/>
                        Create New Post
                    </button>
                </div>
                 <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-700 dark:text-white/70">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Created</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post.slug} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4 font-bold">{post.title}</td>
                                        <td className="px-6 py-4">{post.category}</td>
                                        <td className="px-6 py-4">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <button onClick={() => handlePreview(post)} className="font-semibold text-green-500 hover:text-green-400">View</button>
                                            <button onClick={() => handleEdit(post)} className="font-semibold text-blue-400 hover:text-blue-300">Edit</button>
                                            <button
                                                onClick={() => handleCopyContent(post)}
                                                className="font-semibold text-gray-500 hover:text-gray-400"
                                            >
                                                {copiedPostId === post.id ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id!)}
                                                disabled={deletingPostId === post.id}
                                                className="font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                                            >
                                                {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        
        {view === 'pipeline' && (
            <AIPublishingPipeline
                onDraftGenerated={(draft) => {
                    setSelectedPost(draft);
                    setIsEditorOpen(true);
                    setView('posts');
                }}
                onCancel={() => setView('posts')}
                initialBrief={initialBrief}
            />
        )}
        
        {view === 'strategist' && <ContentStrategistView allPosts={posts} onGenerateFromBrief={handleGenerateFromBrief} />}
        
        {view === 'optimizer' && <PerformanceOptimizerView allPosts={posts} onAnalysisComplete={onAnalysisComplete} />}

      </div>
      
      <BlogEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        post={selectedPost}
        onOpenLinkManager={() => {
            setIsEditorOpen(false);
            setIsLinkManagerOpen(true);
        }}
      />
      
      {selectedPost && (
          <AiLinkManagerModal
            isOpen={isLinkManagerOpen}
            onClose={() => {
                setIsLinkManagerOpen(false);
                setIsEditorOpen(true); // Re-open editor when link manager is closed
            }}
            post={selectedPost}
            allPosts={posts}
            onSave={handleSave}
          />
      )}
      
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="5xl">
        {postToPreview && (
            <article className="text-gray-900 dark:text-white">
                <img src={postToPreview.image} alt={postToPreview.title} className="w-full object-contain rounded-xl shadow-lg bg-gray-100 dark:bg-black/20 mb-8"/>
                <span className="text-sm font-bold text-primary mb-2 block">{postToPreview.category}</span>
                <h1 className="text-2xl sm:text-3xl font-bold font-montserrat mb-6">{postToPreview.title}</h1>
                <BlogMarkdownRenderer content={postToPreview.content} />
            </article>
        )}
      </Modal>

    </div>
  );
};
export default BlogAdminDashboard;