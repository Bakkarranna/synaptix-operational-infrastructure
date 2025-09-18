import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Icon, IconName } from '../Icon';
import { RESOURCE_CATEGORIES, LOADING_MESSAGES, CONTENT_WRITER_TYPES, CONTENT_WRITER_TONES, CONTENT_LENGTHS, CALENDLY_LINK } from '../../constants';
import { BlogPost, saveBlogPost } from '../../services/supabase';
import BlogMarkdownRenderer from '../BlogMarkdownRenderer';
import DynamicLoader from '../DynamicLoader';
import ViralityMeter from '../ViralityMeter';
import TableEditorModal from './TableEditorModal';

interface BlogEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  post: BlogPost | null;
  onOpenLinkManager: () => void;
}

interface QAReport {
    readabilityScore: number;
    seoScore: number;
    keywordDensity: string;
    blueprintCompliance: { item: string; compliant: boolean; }[];
    actionableFeedback: string[];
}

const AIContentWriter: React.FC<{
    onDraftGenerated: (draft: BlogPost) => void;
    onCancel: () => void;
    initialData: BlogPost | null;
}> = ({ onDraftGenerated, onCancel, initialData }) => {
    const [brief, setBrief] = useState({
        topic: initialData?.title || '',
        contentType: CONTENT_WRITER_TYPES[0],
        length: CONTENT_LENGTHS[1],
        tone: CONTENT_WRITER_TONES[0],
        audience: '',
        keywords: initialData?.keywords || '',
        numTables: 1,
        tableDetails: '',
        cta: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBriefChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setBrief(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
        } else {
            setBrief(prev => ({ ...prev, [name]: value }));
        }
    };

    const parseFrontmatter = (markdown: string): { frontmatter: any; content: string } => {
        // Re-architected parser: Pre-process to remove any top-level markdown code block wrappers from the AI.
        // This makes the system resilient to this common AI formatting inconsistency.
        let processedMarkdown = markdown.trim();
        if (processedMarkdown.startsWith('```') && processedMarkdown.endsWith('```')) {
            const lines = processedMarkdown.split('\n');
            processedMarkdown = lines.slice(1, lines.length - 1).join('\n').trim();
        }
    
        // Regex to find the first occurrence of a YAML frontmatter block, not necessarily at the start.
        const frontmatterRegex = /---\s*\n([\s\S]+?)\n---\s*\n/;
        const match = processedMarkdown.match(frontmatterRegex);

        if (!match || typeof match.index === 'undefined') {
            console.error("Malformed AI Response. Full response received:", processedMarkdown);
            throw new Error("Invalid response format: Missing frontmatter. The AI did not provide the required article metadata.");
        }

        const frontmatterContent = match[1];
        // The actual article content starts after the matched frontmatter block.
        const content = processedMarkdown.substring(match.index + match[0].length).trim();

        const frontmatter: { [key: string]: string } = {};
        frontmatterContent.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length > 1) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim().replace(/^"|"$/g, '');
                frontmatter[key] = value;
            }
        });

        return { frontmatter, content };
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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are an elite AI Content Strategy team for Synaptix Studio. Your task is to write or regenerate a blog post based on a provided brief, adhering to the "Synaptix Studio Blog Blueprint".

**THE BLUEPRINT (Your Core Directives):**
1.  **Purpose:** Attract SMBs and entrepreneurs, establish authority in AI automation, and generate qualified leads.
2.  **SEO & Linking:**
    *   Use the provided keywords naturally throughout the text.
    *   Use Google Search to find high-authority sources for any statistics and embed them as inline markdown links. **Strictly forbid** creating a "Sources" section. All citations must be inline.
    *   **Proactive Entity Linking:** As you write, you MUST identify named entities (companies, products, technologies, communities like \`r/ChatGPT\`). You are REQUIRED to use Google Search to find their canonical URL and embed it as an inline markdown link on the first mention.
3.  **Call to Action:** Seamlessly integrate the user-provided Call to Action ("${brief.cta}"). If none is provided, create a relevant one like encouraging readers to check out our [Free AI Business Tools](/ai-tools) or to [Book a free AI Strategy Call](${CALENDLY_LINK}).

**CRITICAL BLOG BLUEPRINT & FINAL CHECKLIST (NON-NEGOTIABLE):**

1.  **MANDATORY ELEMENTS:** Your draft **MUST** include: ${brief.numTables} well-structured markdown table(s) on ${brief.tableDetails || 'relevant topics'}, **AT LEAST ONE** client testimonial, and a "Frequently Asked Questions" section with **EXACTLY 5** unique FAQs. This is an absolute requirement.

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

**OUTPUT FORMAT:**
You MUST return a single markdown document with YAML frontmatter.

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
            - Content Type: "${brief.contentType}"
            - Target Audience: "${brief.audience}"
            - Desired Tone: "${brief.tone}"
            - Primary Keywords: "${brief.keywords}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction, tools: [{ googleSearch: {} }] }
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
                keywords: frontmatter.keywords,
                content: content,
                category: RESOURCE_CATEGORIES.includes(brief.contentType) ? brief.contentType : 'AI Strategy',
                image: initialData?.image || 'https://iili.io/Jbc1Aol.png',
                externalLinks: []
            };
            onDraftGenerated(newPost);
        } catch (e: any) {
            console.error(e);
            setError(`Failed to generate draft: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-6"><DynamicLoader messages={LOADING_MESSAGES.PUBLISHING_PIPELINE} /></div>;
    }

    return (
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar h-full text-gray-900 dark:text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Icon name="sparkles" className="h-6 w-6 text-primary" />
                AI Content Writer
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70">Provide a strategic brief and let our AI create a high-quality first draft for you in moments.</p>

            <div className="space-y-4">
                <input name="topic" value={brief.topic} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2" placeholder="Primary Topic or Title *" />
                <textarea name="audience" value={brief.audience} onChange={handleBriefChange} rows={3} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" placeholder="Describe the Target Audience (e.g., 'SaaS founders looking to increase user retention')..." />
                <input name="keywords" value={brief.keywords} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" placeholder="Comma-separated keywords..." />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select name="contentType" value={brief.contentType} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm">
                        {CONTENT_WRITER_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                    <select name="length" value={brief.length} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm">
                        {CONTENT_LENGTHS.map(len => <option key={len} value={`${len} (~${len === 'Short' ? 800 : len === 'Medium' ? 1500 : 2500} words)`}>{`${len} (~${len === 'Short' ? 800 : len === 'Medium' ? 1500 : 2500} words)`}</option>)}
                    </select>
                    <select name="tone" value={brief.tone} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm">
                        {CONTENT_WRITER_TONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-1">Number of Tables</label>
                        <input name="numTables" type="number" value={brief.numTables} onChange={handleBriefChange} min="0" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" />
                    </div>
                    <input name="tableDetails" value={brief.tableDetails} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm self-end" placeholder="Details about tables (optional)" />
                </div>
                <input name="cta" value={brief.cta} onChange={handleBriefChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" placeholder="Call to Action (optional)" />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex gap-4 pt-2">
                <button onClick={onCancel} className="w-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20">Cancel</button>
                <button onClick={handleGenerate} disabled={!brief.topic.trim()} className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">Generate Draft</button>
            </div>
        </div>
    );
};

const Tool: React.FC<{ icon: IconName; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className={`bg-white dark:bg-white/5 p-3 rounded-lg`}>
        <p className="font-semibold flex items-center gap-2">
            <Icon name={icon} className="h-5 w-5 text-primary"/>
            {title}
        </p>
        <div className={`mt-2`}>{children}</div>
    </div>
);

interface AIToolkitProps {
    postData: BlogPost;
    onOpenLinkManager: () => void;
    onContentUpdate: (newContent: string) => void;
    onKeywordsUpdate: (newKeywords: string) => void;
    onFullPostUpdate: (updates: Partial<BlogPost>) => void;
}

interface AIToolkitHandles {
  runAllAnalyses: () => void;
}

const AIToolkit = forwardRef<AIToolkitHandles, AIToolkitProps>(({ postData, onOpenLinkManager, onContentUpdate, onKeywordsUpdate, onFullPostUpdate }, ref) => {
    const [qaReport, setQaReport] = useState<QAReport | null>(null);
    const [isCheckingQa, setIsCheckingQa] = useState(false);
    
    // State for Keyword Suggester
    const [shortTailCount, setShortTailCount] = useState(3);
    const [longTailCount, setLongTailCount] = useState(5);
    const [suggestedKeywords, setSuggestedKeywords] = useState<{ short_tail: string[], long_tail: string[] } | null>(null);
    const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
    const [isInsertingKeywords, setIsInsertingKeywords] = useState(false);

    // State for Audience Suggester
    const [suggestedAudience, setSuggestedAudience] = useState<string | null>(null);
    const [isSuggestingAudience, setIsSuggestingAudience] = useState(false);
    
    // State for Content Improver
    const [isImprovingContent, setIsImprovingContent] = useState(false);

    // State for Headline Analyzer
    const [headlineReport, setHeadlineReport] = useState<{ score: number, justification: string, suggestions: { headline: string, score: number, metaDescription: string }[] } | null>(null);
    const [isAnalyzingHeadline, setIsAnalyzingHeadline] = useState(false);

    const handleRunQaCheck = async () => {
        setIsCheckingQa(true);
        setQaReport(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a meticulous AI Quality Assurance Co-Pilot for a blog. Your task is to analyze a provided article draft against the "Synaptix Studio Blog Blueprint" and return a structured QA report.

**BLUEPRINT RULES FOR ANALYSIS:**
- **Keywords:** The article must use the provided keywords. You will calculate the keyword density for the first primary keyword.
- **Structure:** Must contain at least one markdown table, exactly 5 FAQs, and a final, descriptive summary heading (NOT the word "Conclusion").
- **Readability:** Should be professional yet scannable. Short paragraphs are preferred.

**OUTPUT FORMAT:**
You MUST return a single, valid JSON object with the following structure:
- "readabilityScore": (integer, 0-100) A score based on clarity, sentence structure, and scannability.
- "seoScore": (integer, 0-100) A score based on keyword usage, structure, and title strength.
- "keywordDensity": (string) A percentage string (e.g., "1.2%") for the primary keyword. If no keywords are provided, return "N/A".
- "blueprintCompliance": (array of objects) Each object must have "item" (string, e.g., "Contains 1+ Table") and "compliant" (boolean).
- "actionableFeedback": (array of strings) Provide 2-3 specific, constructive suggestions for improvement.`;
            
            const userPrompt = `Analyze this article draft:
            - Primary Keywords: "${postData.keywords || 'Not provided'}"
            - Article Title: "${postData.title}"
            - Article Content:
            ---
            ${postData.content}
            ---`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction, responseMimeType: 'application/json' }
            });

            setQaReport(JSON.parse(response.text));
        } catch (e: any) {
            console.error(`QA Check Failed: ${e.message}`);
        } finally {
            setIsCheckingQa(false);
        }
    };
    
    const handleImproveContent = async () => {
        if (!qaReport || qaReport.actionableFeedback.length === 0) return;
        setIsImprovingContent(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are an expert content editor. Your task is to rewrite the provided blog article to incorporate the specified actionable feedback. Preserve the original markdown formatting. Return ONLY the full, rewritten article text.`;
            const userPrompt = `**Actionable Feedback to Implement:**\n- ${qaReport.actionableFeedback.join('\n- ')}\n\n**Original Article:**\n---\n${postData.content}\n---`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction }
            });
            onContentUpdate(response.text);
        } catch (e) {
            console.error("Content improvement failed:", e);
        } finally {
            setIsImprovingContent(false);
        }
    };

    const handleAnalyzeHeadline = async () => {
        setIsAnalyzingHeadline(true);
        setHeadlineReport(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a world-class viral marketing expert from platforms like BuzzFeed and Upworthy, now working as an SEO copywriter for Synaptix Studio, an AI Automation Agency. Your task is to analyze a blog post headline, provide a professional-grade score, and suggest superior, SEO-optimized alternatives based on proven virality formulas.

**MANDATORY BRAND KEYWORDS:**
All suggested headlines AND meta descriptions MUST naturally include at least one of these keywords: "Synaptix Studio", "AI Automation".

**YOUR ANALYSIS CRITERIA:**
You will score the original headline based on:
1.  **Clarity & Benefit:** Is the value proposition immediately obvious?
2.  **Emotional Resonance:** Does it evoke curiosity, urgency, or another strong emotion?
3.  **SEO Value:** Does it contain relevant keywords?
4.  **Uniqueness:** Is it memorable and distinct?

**OUTPUT FORMAT:**
You MUST return a single, valid JSON object with the following structure:
- "score": (integer, 0-100) The virality score of the original headline, based on your expert criteria.
- "justification": (string) A brief, professional explanation for the score, referencing the analysis criteria.
- "suggestions": (array of 3 objects) Each object represents a different strategic angle:
  - "headline": (string) The new, improved headline.
  - "score": (integer, 0-100) The improved virality score.
  - "metaDescription": (string) A compelling, SEO-optimized meta description (under 160 characters) that complements the new headline and includes a brand keyword.`;
            
            const userPrompt = `Original Headline: "${postData.title}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction, responseMimeType: 'application/json', seed: 42 }
            });
            setHeadlineReport(JSON.parse(response.text));
        } catch (e) {
            console.error("Headline analysis failed:", e);
        } finally {
            setIsAnalyzingHeadline(false);
        }
    };
    
    useImperativeHandle(ref, () => ({
        runAllAnalyses: () => {
            handleRunQaCheck();
            handleAnalyzeHeadline();
        }
    }));
    
    const handleUseHeadline = (suggestion: { headline: string; metaDescription: string }) => {
        const newSlug = suggestion.headline
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
            .replace(/\s+/g, '-')          // replace spaces with hyphens
            .replace(/-+/g, '-')           // replace multiple hyphens with a single one
            .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
            .slice(0, 70);                 // truncate
        
        // Find and replace H1 in content
        const newContent = postData.content.replace(/^# .*/m, `# ${suggestion.headline}`);

        onFullPostUpdate({
            title: suggestion.headline,
            slug: newSlug,
            description: suggestion.metaDescription,
            content: newContent,
        });
        setHeadlineReport(null);
    };

    const handleSuggestAudience = async () => {
        setIsSuggestingAudience(true);
        setSuggestedAudience(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a marketing strategist. Based on the article title and content, create a detailed target audience persona. Describe their role, goals, and pain points in a concise paragraph. Return ONLY the descriptive paragraph as a string.`;
            const userPrompt = `Article Title: ${postData.title}\nContent Snippet: ${postData.content.substring(0, 500)}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction }
            });
            setSuggestedAudience(response.text);
        } catch (e) {
            console.error("Audience suggestion failed:", e);
        } finally {
            setIsSuggestingAudience(false);
        }
    };

    const handleGenerateKeywords = async () => {
        setIsGeneratingKeywords(true);
        setSuggestedKeywords(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are an expert SEO analyst for Synaptix Studio, an AI Automation Agency. Your task is to generate a strategic list of keywords for a blog article.

**MANDATORY BRAND KEYWORDS:**
Your suggestions MUST include the following brand keywords: "Synaptix Studio", "AI Automation Agency".

**TASK:**
Based on the article's topic, generate:
-   ${shortTailCount} short-tail keywords (1-2 words).
-   ${longTailCount} long-tail keywords (3+ words).

**OUTPUT FORMAT:**
You MUST return a single, valid JSON object with two keys: "short_tail" (an array of strings) and "long_tail" (an array of strings).`;
            
            const userPrompt = `Article Topic: "${postData.title}"\nArticle Snippet: "${postData.content.substring(0, 500)}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction, responseMimeType: 'application/json' }
            });

            setSuggestedKeywords(JSON.parse(response.text));
        } catch (e) {
            console.error("Keyword generation failed:", e);
        } finally {
            setIsGeneratingKeywords(false);
        }
    };

    const handleInsertKeywords = async () => {
        if (!suggestedKeywords) return;
        setIsInsertingKeywords(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const allKeywords = [...suggestedKeywords.short_tail, ...suggestedKeywords.long_tail];
            const systemInstruction = `You are an expert SEO copywriter. Your task is to rewrite the provided article to naturally and seamlessly integrate the given list of keywords.

**CRITICAL RULES:**
1.  **Maintain the Original Meaning:** Do not alter the core message, arguments, or structure of the article.
2.  **Natural Integration:** Keywords should be woven into the text fluidly. Avoid "keyword stuffing." If a keyword doesn't fit naturally, it's better to omit it than to force it.
3.  **Preserve Markdown:** The original markdown formatting (headings, lists, bold text) must be preserved.
4.  **Return ONLY the Article:** Your response must be ONLY the full, rewritten article text. Do not include any preambles, apologies, or postscripts.`;
            
            const userPrompt = `**Keywords to integrate:**\n${allKeywords.join(', ')}\n\n**Original Article:**\n---\n${postData.content}\n---`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction }
            });
            onContentUpdate(response.text);
        } catch (e) {
            console.error("Keyword insertion failed:", e);
        } finally {
            setIsInsertingKeywords(false);
        }
    };
    
    return (
        <div className="space-y-4 text-gray-900 dark:text-white">
            <Tool icon="check-circle" title="AI QA Report">
                {isCheckingQa && <DynamicLoader messages={LOADING_MESSAGES.QA_CHECK} />}
                {qaReport && !isCheckingQa && (
                    <div className="space-y-4 animate-fade-in-fast">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-xs font-bold text-gray-600 dark:text-white/70">Readability</p>
                                <ViralityMeter score={qaReport.readabilityScore} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-600 dark:text-white/70">SEO Score</p>
                                <ViralityMeter score={qaReport.seoScore} />
                            </div>
                        </div>
                        <div className="text-xs bg-gray-100 dark:bg-black/50 p-2 rounded-md text-center">
                           <span className="font-bold">Primary Keyword Density:</span> {qaReport.keywordDensity}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold mb-1">Blueprint Compliance:</h4>
                            <ul className="space-y-1 text-xs">
                                {qaReport.blueprintCompliance.map(item => (
                                    <li key={item.item} className="flex items-center gap-2">
                                        {item.compliant ? <Icon name="check" className="h-4 w-4 text-green-400"/> : <Icon name="close" className="h-4 w-4 text-red-400"/>}
                                        {item.item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h4 className="text-xs font-bold mb-1">Actionable Feedback:</h4>
                            <ul className="space-y-1 text-xs list-disc list-inside">
                                {qaReport.actionableFeedback.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <button onClick={handleImproveContent} disabled={isImprovingContent} className="w-full bg-green-500/20 border border-green-500/50 text-green-600 dark:text-green-300 font-bold py-2 rounded-full text-sm disabled:opacity-50">
                            {isImprovingContent ? 'Improving...' : 'Improve Content with AI'}
                        </button>
                        {isImprovingContent && <DynamicLoader messages={LOADING_MESSAGES.CONTENT_IMPROVER} />}
                    </div>
                )}
                <button onClick={handleRunQaCheck} disabled={isCheckingQa} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2 rounded-full text-sm mt-2 disabled:opacity-50">
                    {isCheckingQa ? 'Checking...' : 'Run QA Check'}
                </button>
            </Tool>

             <Tool icon="trophy" title="Headline Virality Analyzer">
                {isAnalyzingHeadline && <DynamicLoader messages={LOADING_MESSAGES.HEADLINE_ANALYZER} />}
                {headlineReport && !isAnalyzingHeadline && (
                    <div className="space-y-4 animate-fade-in-fast">
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-600 dark:text-white/70">Current Headline Score</p>
                            <ViralityMeter score={headlineReport.score} />
                            <p className="text-xs italic text-gray-500 dark:text-white/60 mt-2">{headlineReport.justification}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold mb-1">Suggestions:</h4>
                            <div className="space-y-2">
                                {headlineReport.suggestions.map((s, i) => (
                                    <div key={i} className="p-2 bg-gray-100 dark:bg-black/50 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm">{s.headline} <span className="font-bold text-green-400">({s.score})</span></p>
                                                <p className="text-xs italic text-gray-500 dark:text-white/60 mt-1">{s.metaDescription}</p>
                                            </div>
                                            <button onClick={() => handleUseHeadline(s)} className="text-xs font-bold bg-green-500/20 text-green-300 px-2 py-1 rounded-full flex-shrink-0 ml-2">Use</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                 <button onClick={handleAnalyzeHeadline} disabled={isAnalyzingHeadline} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2 rounded-full text-sm mt-2 disabled:opacity-50">
                    {isAnalyzingHeadline ? 'Analyzing...' : 'Analyze Headline'}
                </button>
            </Tool>

            <Tool icon="link" title="Link Manager">
                <p className="text-xs text-gray-600 dark:text-white/70 mb-2">Find internal & external linking opportunities to boost SEO.</p>
                <button onClick={onOpenLinkManager} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2 rounded-full text-sm">Open Link Manager</button>
            </Tool>
            
            <Tool icon="users" title="AI Audience Suggester">
                {isSuggestingAudience && <DynamicLoader messages={LOADING_MESSAGES.AUDIENCE_SUGGESTER} />}
                {suggestedAudience && !isSuggestingAudience && (
                    <p className="text-xs bg-gray-100 dark:bg-black/50 p-2 rounded-md animate-fade-in-fast">{suggestedAudience}</p>
                )}
                <button onClick={handleSuggestAudience} disabled={isSuggestingAudience} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2 rounded-full text-sm mt-2 disabled:opacity-50">
                    {isSuggestingAudience ? 'Suggesting...' : 'Suggest Audience'}
                </button>
            </Tool>

            <Tool icon="key" title="AI Keyword Engine">
                <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <label className="font-bold">Short-Tail</label>
                            <input type="number" value={shortTailCount} onChange={(e) => setShortTailCount(parseInt(e.target.value, 10))} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded p-1"/>
                        </div>
                        <div>
                            <label className="font-bold">Long-Tail</label>
                            <input type="number" value={longTailCount} onChange={(e) => setLongTailCount(parseInt(e.target.value, 10))} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded p-1"/>
                        </div>
                    </div>
                    <button onClick={handleGenerateKeywords} disabled={isGeneratingKeywords} className="w-full bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2 rounded-full text-sm disabled:opacity-50">
                        {isGeneratingKeywords ? 'Generating...' : 'Generate Keywords'}
                    </button>
                    {isGeneratingKeywords && <DynamicLoader messages={LOADING_MESSAGES.KEYWORD_SUGGESTER} />}
                    {suggestedKeywords && !isGeneratingKeywords && (
                        <div className="space-y-3 animate-fade-in-fast">
                             <div>
                                <h5 className="text-xs font-bold">Short-Tail:</h5>
                                <p className="text-xs bg-gray-100 dark:bg-black/50 p-2 rounded-md">{suggestedKeywords.short_tail.join(', ')}</p>
                             </div>
                             <div>
                                <h5 className="text-xs font-bold">Long-Tail:</h5>
                                <p className="text-xs bg-gray-100 dark:bg-black/50 p-2 rounded-md">{suggestedKeywords.long_tail.join(', ')}</p>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => onKeywordsUpdate([...suggestedKeywords.short_tail, ...suggestedKeywords.long_tail].join(', '))} className="w-full text-xs font-bold bg-blue-500/20 text-blue-300 py-1 rounded-full">Update Keyword List</button>
                                <button onClick={handleInsertKeywords} disabled={isInsertingKeywords} className="w-full text-xs font-bold bg-green-500/20 text-green-300 py-1 rounded-full disabled:opacity-50">
                                    {isInsertingKeywords ? 'Inserting...' : 'Insert into Article'}
                                </button>
                             </div>
                             {isInsertingKeywords && <DynamicLoader messages={LOADING_MESSAGES.KEYWORD_INSERTER} />}
                        </div>
                    )}
                </div>
            </Tool>
        </div>
    );
});

const BlogEditorModal: React.FC<BlogEditorModalProps> = ({ isOpen, onClose, onSave, post, onOpenLinkManager }) => {
  const [formData, setFormData] = useState<Omit<BlogPost, 'slug' | 'id' | 'created_at'>>({
    title: '', description: '', category: 'AI Strategy', image: '', content: '', keywords: '', externalLinks: []
  });
  const [slug, setSlug] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [selection, setSelection] = useState<{ start: number, end: number, text: string } | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [view, setView] = useState<'editor' | 'writer'>('editor');
  const toolkitRef = useRef<AIToolkitHandles>(null);


  // State for Table Editor
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [selectedTableMarkdown, setSelectedTableMarkdown] = useState('');
  const [tableSelectionPosition, setTableSelectionPosition] = useState<{ start: number; end: number } | null>(null);
  
  // This effect initializes the form ONLY when the `post` prop changes.
  // It no longer depends on `isOpen`, fixing the state-reset bug.
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
        category: post.category,
        image: post.image,
        content: post.content,
        keywords: post.keywords || '',
        externalLinks: post.externalLinks || []
      });
      setSlug(post.slug);
      setView('editor');
    } else {
      // Reset form for a new post
      setFormData({ title: '', description: '', category: 'AI Strategy', image: '', content: '', keywords: '', externalLinks: [] });
      setSlug('');
      setView('writer'); // Default to writer for new posts
    }
    // Reset other UI states as well
    setIsPreview(false);
    setSelection(null);
    setSelectedTableMarkdown('');
    setTableSelectionPosition(null);
  }, [post]);

  // This effect handles side-effects when the modal opens, without re-initializing state.
  useEffect(() => {
    if (isOpen && post?.id) {
      // Automatically run analyses for existing posts when modal opens
      setTimeout(() => {
          toolkitRef.current?.runAllAnalyses();
      }, 500); // Small delay to allow modal animation
    }
  }, [isOpen, post?.id]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePublish = async () => {
    if (!formData.title.trim() || !slug.trim()) {
      alert('Title and Slug are required.');
      return;
    }
    const finalPost: BlogPost = { ...formData, slug };
    if (post?.id) { finalPost.id = post.id; }
    
    try {
        await saveBlogPost(finalPost);
        onSave();
    } catch (e: any) {
        console.error("Failed to save post:", e);
        alert(`Failed to save post: ${e.message}`);
    }
  };

  const handleSelect = () => {
    const textarea = contentRef.current;
    if (textarea) {
        const { selectionStart, selectionEnd, value } = textarea;
        const selectedText = value.substring(selectionStart, selectionEnd);

        // General selection for link embedding
        if (selectedText) {
            setSelection({ start: selectionStart, end: selectionEnd, text: selectedText });
        } else {
            setSelection(null);
        }

        // Table selection for table editor
        const trimmedSelection = selectedText.trim();
        if (trimmedSelection.includes('|') && trimmedSelection.includes('---') && trimmedSelection.includes('\n')) {
            setSelectedTableMarkdown(trimmedSelection);
            setTableSelectionPosition({ start: selectionStart, end: selectionEnd });
        } else {
            setSelectedTableMarkdown('');
            setTableSelectionPosition(null);
        }
    }
  };

  const handleEmbedLink = () => {
    if (!selection || !contentRef.current) return;

    const url = prompt('Enter the URL to link to:', 'https://');
    if (url) {
        const { start, end, text } = selection;
        const newLink = `[${text}](${url})`;
        const newContent =
            formData.content.substring(0, start) +
            newLink +
            formData.content.substring(end);

        setFormData(prev => ({ ...prev, content: newContent }));

        setSelection(null);
        setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.focus();
                contentRef.current.selectionStart = contentRef.current.selectionEnd = start + newLink.length;
            }
        }, 0);
    }
  };

  const handleTableUpdate = (newMarkdown: string) => {
    if (tableSelectionPosition) {
        const { start, end } = tableSelectionPosition;
        const newContent =
            formData.content.substring(0, start) +
            newMarkdown +
            formData.content.substring(end);

        setFormData(prev => ({ ...prev, content: newContent }));

        // Reset state and close modal
        setSelectedTableMarkdown('');
        setTableSelectionPosition(null);
        setIsTableEditorOpen(false);
    }
  };

  const handleDraftGenerated = (draft: BlogPost) => {
    setFormData({
        title: draft.title,
        description: draft.description,
        category: draft.category,
        image: draft.image,
        content: draft.content,
        keywords: draft.keywords || '',
        externalLinks: draft.externalLinks || []
    });
    setSlug(draft.slug);
    setView('editor');
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[101] flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
        <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-6xl m-4 relative animate-slide-in-up-fast flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <header className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center flex-shrink-0 text-gray-900 dark:text-white">
            <h2 className="text-xl font-bold">{post?.id ? 'Edit Post' : 'Create New Post'}</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"><Icon name="close" className="h-6 w-6" /></button>
          </header>
          
          {view === 'writer' ? (
                <AIContentWriter
                    onDraftGenerated={handleDraftGenerated}
                    onCancel={() => post ? setView('editor') : onClose()}
                    initialData={post}
                />
            ) : (
             <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 overflow-hidden text-gray-900 dark:text-white">
                {/* Editor Side */}
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl font-semibold mb-2 flex justify-between items-center">
                        Content Editor
                        <button onClick={() => setView('writer')} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            <Icon name="sparkles" className="h-4 w-4"/>
                            Regenerate with AI
                        </button>
                    </h3>
                    <div>
                        <label className="block text-sm font-bold mb-1">Title</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">URL Slug</label>
                        <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Meta Description (for SEO)</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Keywords (comma-separated)</label>
                        <input name="keywords" value={formData.keywords} onChange={handleInputChange} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2">
                                {RESOURCE_CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Banner Image URL</label>
                            <input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2" />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold">Content (Markdown)</label>
                            <div>
                                {selectedTableMarkdown ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsTableEditorOpen(true)}
                                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md"
                                    >
                                        <Icon name="gear" className="h-4 w-4" />
                                        Edit Table
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleEmbedLink}
                                        disabled={!selection}
                                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <Icon name="link" className="h-4 w-4" />
                                        Embed Link
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea name="content" ref={contentRef} onSelect={handleSelect} value={formData.content} onChange={handleInputChange} rows={15} className="w-full bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-md p-2 font-mono text-sm" placeholder="Write your article here..."/>
                    </div>
                </div>
                
                {/* AI Co-Pilot & Preview Side */}
                <div className="bg-gray-50 dark:bg-black/20 p-6 space-y-4 overflow-y-auto custom-scrollbar border-l border-gray-200 dark:border-white/10 flex flex-col">
                    <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">AI Toolkit & Preview</h3>
                    <div className="flex gap-2 p-1 bg-gray-200 dark:bg-black/50 rounded-lg">
                        <button onClick={() => setIsPreview(false)} className={`px-3 py-1 text-sm rounded ${!isPreview ? 'bg-primary text-white' : 'text-gray-700 dark:text-white'}`}>AI Toolkit</button>
                        <button onClick={() => setIsPreview(true)} className={`px-3 py-1 text-sm rounded ${isPreview ? 'bg-primary text-white' : 'text-gray-700 dark:text-white'}`}>Preview</button>
                    </div>
                    </div>
                    
                    {isPreview ? (
                        <div className="animate-fade-in flex-grow overflow-y-auto custom-scrollbar p-4 bg-white dark:bg-black/20 rounded-lg">
                            {formData.image && <img src={formData.image} alt={formData.title} className="w-full h-56 object-cover rounded-lg mb-4"/>}
                            <h1 className="text-3xl font-bold font-montserrat mb-4">{formData.title}</h1>
                            <span className="text-sm font-bold text-primary mb-4 block">{formData.category}</span>
                            <BlogMarkdownRenderer content={formData.content} />
                        </div>
                    ) : (
                    <div className="animate-fade-in flex-grow">
                        <AIToolkit
                            ref={toolkitRef}
                            postData={{...formData, slug}}
                            onOpenLinkManager={onOpenLinkManager}
                            onContentUpdate={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
                            onKeywordsUpdate={(newKeywords) => setFormData(prev => ({...prev, keywords: newKeywords}))}
                             onFullPostUpdate={(updates) => {
                                setFormData(prev => ({ ...prev, ...updates }));
                                if (updates.slug) {
                                    setSlug(updates.slug);
                                }
                            }}
                        />
                    </div>
                    )}
                </div>
            </main>
          )}

          {view === 'editor' && (
             <footer className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end items-center flex-shrink-0">
              <div className="flex gap-4">
                  <button onClick={onClose} className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20">Cancel</button>
                  <button onClick={handlePublish} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
                      <Icon name="rocket" className="h-5 w-5"/>
                      Publish
                  </button>
              </div>
          </footer>
          )}
        </div>
      </div>
      <TableEditorModal
        isOpen={isTableEditorOpen}
        onClose={() => setIsTableEditorOpen(false)}
        initialMarkdown={selectedTableMarkdown}
        onUpdateTable={handleTableUpdate}
      />
    </>
  );
};

export default BlogEditorModal;