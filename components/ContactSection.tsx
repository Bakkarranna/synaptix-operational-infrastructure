import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { WebIcon, TargetIcon, EmailIcon, UserIcon, DownloadIcon, ClipboardIcon, CheckIcon } from './Icon';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';
import { CALENDLY_LINK, LOADING_MESSAGES } from '../constants';
import { saveStrategyLead } from '../services/supabase';
import MarkdownRenderer from './MarkdownRenderer';
import { trackEvent } from '../services/analytics';
import jsPDF from 'jspdf';
import DynamicLoader from './DynamicLoader';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', websiteUrl: '', businessNeeds: '' });
  const [loading, setLoading] =useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  useEffect(() => {
    if (!loading && aiResponse && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, aiResponse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessNeeds || !formData.email || !formData.name) {
      setError('Please provide your name, email, and describe your business goals.');
      return;
    }
    
    setError(null);
    setLoading(true);
    setAiResponse(null);

    console.log("Submitting AI Strategy Lead form data...");

    try {
      // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY` to align with coding guidelines and fix environment variable access errors.
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Act as an expert AI automation consultant from Synaptix Studio. The user, **${formData.name}**, has provided their email "${formData.email}", their website URL: "${formData.websiteUrl}", and described their needs as: "${formData.businessNeeds}".

      Your task is to generate a detailed, high-level AI strategy document for them. Your analysis MUST be laser-focused on ROI. Use Google Search to analyze their website URL (if provided) and their business description to understand their industry, services, and current state.

      The entire strategy should be framed around two core business objectives: **1) How can they make more money?** and **2) How can they save money?**

      The output should be structured with the following sections. Format the response using markdown. Use double asterisks for both bolding key terms and for section titles (e.g., **Business Analysis**). Use numbered lists for action items or strategies.

      **Business Analysis**
      * Briefly summarize your understanding of their business.

      **Key ROI Opportunities**
      * Identify 2-3 specific, high-impact areas where AI can drive revenue or create cost savings.

      **High-Level AI Strategy**
      1. For each opportunity, propose a concrete AI solution.
      2. Estimate the potential financial impact where possible.

      **The Synaptix Advantage**
      * Briefly explain why Synaptix Studio is the right partner.

      **Next Steps**
      * End with a strong call to action, encouraging them to book a detailed discovery call. Format this call to action as a markdown link, for example: [Book your free discovery call now](${CALENDLY_LINK}).

      Keep the tone professional, insightful, and focused on tangible business value.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}]
        }
      });
      const generatedText = response.text;
      if (!generatedText) {
        throw new Error('AI response was empty');
      }

      await saveStrategyLead({
        Name: formData.name,
        Email: formData.email,
        Website: formData.websiteUrl,
        BusinessDetails: formData.businessNeeds,
        AIResponse: generatedText
      });
      console.log("AI Strategy Lead data submitted to Supabase successfully. This confirms the backend connection is working.");

      setAiResponse(generatedText);
      trackEvent('generate_ai_strategy', { website_provided: !!formData.websiteUrl });

    } catch (err) {
      console.error(err);
      setError('Sorry, we couldn\'t generate a strategy right now. Please try again later.');
      setAiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    trackEvent('copy_ai_strategy_report');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!aiResponse) return;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });
    const logoUrl = 'https://iili.io/FtKRjbn.png';
    const margin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = doc.internal.pageSize.getWidth() - (margin * 2);
    let yPos = 15;

    const addFooterToAllPages = () => {
        const pageCount = (doc.internal as any).pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            const footerText = 'Created by www.synaptixstudio.com';
            doc.textWithLink(footerText, margin, pageHeight - 10, { url: 'https://synaptixstudio.com' });
        }
    };
    
    const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > pageHeight - 15) { // 15mm footer margin
            doc.addPage();
            yPos = margin;
        }
    };

    // Rich text renderer that handles inline bolding and color for a single line of text
    const renderRichLine = (line: string, x: number, y: number) => {
        const parts = line.split(/(\*\*.*?\*\*)/g).filter(part => part);
        let currentX = x;

        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#FF5630'); // Orange color for bold text
                const boldText = part.slice(2, -2);
                doc.text(boldText, currentX, y);
                currentX += doc.getStringUnitWidth(boldText) * doc.getFontSize() / doc.internal.scaleFactor;
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0); // Black color for normal text
                doc.text(part, currentX, y);
                currentX += doc.getStringUnitWidth(part) * doc.getFontSize() / doc.internal.scaleFactor;
            }
        });
    };

    const addContent = () => {
      // Start content below the logo with more space
      yPos = 45; 

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Your Custom AI Strategy Report', margin, yPos);
      yPos += 15;
      
      const lines = aiResponse.split('\n');

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          checkPageBreak(5);
          yPos += 5;
          return;
        }

        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          const text = trimmedLine.slice(2, -2);
          checkPageBreak(12);
          yPos += 7; 
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          const splitText = doc.splitTextToSize(text, usableWidth);
          doc.text(splitText, margin, yPos);
          yPos += (splitText.length * 6) + 2;
        } else if (trimmedLine.match(/^(\* |-\s*|\d+\.\s*)/)) {
          const itemText = trimmedLine.replace(/^(\* |-\s*|\d+\.\s*)/, '');
          const bullet = '• ';
          doc.setFontSize(11);
          const bulletWidth = doc.getStringUnitWidth(bullet) * doc.getFontSize() / doc.internal.scaleFactor;
          const textWidth = usableWidth - 5 - bulletWidth;
          
          const textLines = doc.splitTextToSize(itemText, textWidth);
          checkPageBreak(textLines.length * 5 + 2);
          yPos += 2;
          
          textLines.forEach((textLine: string, index: number) => {
              if (index === 0) {
                  doc.setFont('helvetica', 'bold'); // bullet point bold
                  doc.setTextColor(0,0,0);
                  doc.text(bullet, margin + 5, yPos);
              }
              renderRichLine(textLine, margin + 5 + bulletWidth, yPos);
              yPos += 5; // Move to next line
          });
        } else {
          doc.setFontSize(11);
          const textLines = doc.splitTextToSize(trimmedLine, usableWidth);
          checkPageBreak(textLines.length * 5 + 4);
          yPos += 4;
          textLines.forEach((textLine: string) => {
              renderRichLine(textLine, margin, yPos);
              yPos += 5; // Move to next line
          });
        }
      });

      addFooterToAllPages();
      doc.save(`AI_Strategy_Report_${formData.name.replace(/\s/g, '_') || 'Synaptix_Studio'}.pdf`);
      trackEvent('download_ai_strategy_pdf');
    };
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;
    img.onload = () => {
      try {
        const imgProps = doc.getImageProperties(img);
        const imgWidth = 50;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(img, 'PNG', margin, 15, imgWidth, imgHeight);
      } catch (e) {
        console.error("jsPDF could not process the image, maybe it's not loaded yet.", e);
      }
      addContent();
    };
    img.onerror = (e) => {
      console.error("Error loading logo for PDF:", e);
      addContent(); // Proceed without logo if it fails
    };
  };
  
  const heading = "Get Your **Free AI Strategy**";
  const description = "Tell us about your business, and our AI will analyze your web presence and generate a **custom plan for you** in seconds.";


  return (
    <section 
      ref={ref}
      id="ai-strategy" 
      className={`py-16 sm:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="container mx-auto px-6">
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto">
            <>
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={heading} /></h2>
                <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80">
                  <StyledText text={description} />
                </p>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="AI Strategy Generation Form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group flex items-center gap-4 px-4 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                        <UserIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0" aria-hidden="true" />
                        <label htmlFor="contact-name" className="sr-only">Your Full Name</label>
                        <input 
                            id="contact-name"
                            type="text" 
                            name="name" 
                            placeholder="Your Name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-800 placeholder-gray-500 dark:text-white dark:placeholder-white/60" 
                            required
                            aria-label="Enter your full name"
                            aria-required="true"
                        />
                    </div>
                    <div className="group flex items-center gap-4 px-4 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                        <EmailIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0" aria-hidden="true" />
                        <label htmlFor="contact-email" className="sr-only">Your Business Email Address</label>
                        <input 
                            id="contact-email"
                            type="email" 
                            name="email" 
                            placeholder="Your Business Email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-800 placeholder-gray-500 dark:text-white dark:placeholder-white/60" 
                            required
                            aria-label="Enter your business email address"
                            aria-required="true"
                        />
                    </div>
                </div>
                 <div className="group flex items-center gap-4 px-4 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                      <WebIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0" aria-hidden="true" />
                      <label htmlFor="contact-website" className="sr-only">Your Website URL (Optional)</label>
                      <input 
                          id="contact-website"
                          type="text" 
                          name="websiteUrl" 
                          placeholder="Your Website URL (Optional)" 
                          value={formData.websiteUrl} 
                          onChange={handleInputChange} 
                          className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-800 placeholder-gray-500 dark:text-white dark:placeholder-white/60"
                          aria-label="Enter your website URL (optional)"
                      />
                </div>
                <div className="group flex items-start gap-4 px-4 py-3 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                  <TargetIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0 mt-1" aria-hidden="true" />
                  <label htmlFor="contact-business-needs" className="sr-only">Describe your business, goals, and challenges</label>
                  <textarea 
                      id="contact-business-needs"
                      name="businessNeeds" 
                      placeholder="Describe your business, goals, and challenges..." 
                      rows={5} 
                      value={formData.businessNeeds} 
                      onChange={handleInputChange} 
                      className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500 dark:text-white dark:placeholder-white/60 resize-none" 
                      required
                      aria-label="Describe your business needs, goals, and challenges"
                      aria-required="true"
                  ></textarea>
                </div>
                
                {error && <p className="text-center text-red-400 text-sm" role="alert" aria-live="polite">{error}</p>}
                
                <div className="text-center pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    aria-label={loading ? "Generating your AI strategy plan" : "Generate your custom AI strategy plan"}
                    className="bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2.5 px-8 text-xs sm:py-2.5 sm:px-10 sm:text-sm rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:bg-primary/10 disabled:border-primary/20 disabled:text-gray-500 dark:disabled:text-white/50 disabled:cursor-not-allowed disabled:animate-none flex items-center justify-center mx-auto"
                  >
                    {loading ? 'Generating Plan...' : 'Generate My AI Plan'}
                  </button>
                </div>
              </form>
            </>
          
          {loading && <DynamicLoader messages={LOADING_MESSAGES.STRATEGY} className="mt-12" />}

          {aiResponse && !error && (
            <div ref={resultsRef} className="text-left animate-fade-in mt-12 pt-8 border-t border-gray-200 dark:border-white/20" aria-live="polite">
              <MarkdownRenderer content={aiResponse} />
              <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                  <button 
                      onClick={handleDownload} 
                      aria-label="Download your AI strategy report as PDF"
                      className="w-full sm:w-auto bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white font-bold py-2.5 px-6 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                      <DownloadIcon className="h-5 w-5" aria-hidden="true" />
                      Download PDF
                  </button>
                  <button 
                      onClick={handleCopy} 
                      aria-label={copied ? "Report copied to clipboard" : "Copy AI strategy report to clipboard"}
                      className="w-full sm:w-auto bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white font-bold py-2.5 px-6 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                      {copied ? <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" /> : <ClipboardIcon className="h-5 w-5" aria-hidden="true" />}
                      {copied ? 'Copied!' : 'Copy Report'}
                  </button>
                  <a 
                      href={CALENDLY_LINK} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Book a free demo call with Synaptix Studio"
                      className="w-full sm:w-auto bg-primary text-white font-bold py-2.5 px-6 text-sm rounded-full transition-all transform hover:scale-105 hover:bg-opacity-90 animate-glow inline-block"
                  >
                    Book a Free Demo Call
                  </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default ContactSection;