import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { CalculatorIcon } from './Icon';
import StyledText from './StyledText';
import MarkdownRenderer from './MarkdownRenderer';
import { trackEvent } from '../services/analytics';
import { LOADING_MESSAGES } from '../constants';
import DynamicLoader from './DynamicLoader';

interface ROICalculatorSectionProps {
  navigate: (path: string) => void;
}

interface Recommendation {
    recommendation: string;
    impact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
}

interface AIResponse {
    savings: {
        value: number;
        justification: string;
    };
    revenue: {
        value: number;
        justification: string;
    };
    timeline: string;
    recommendations: Recommendation[];
    breakEvenAnalysis: string;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const nextValue = Math.floor(progress * (value - startValue) + startValue);
      setCurrentValue(nextValue);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentValue(value); // Ensure final value is exact
      }
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>${currentValue.toLocaleString()}</span>;
};

const RecommendationCard: React.FC<{ rec: Recommendation }> = ({ rec }) => {
    const impactColor: { [key in Recommendation['impact']]: string } = { 
        High: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/20 dark:border-red-500/30', 
        Medium: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/20 dark:border-yellow-500/30', 
        Low: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/20 dark:border-green-500/30' 
    };
    const effortColor: { [key in Recommendation['effort']]: string } = { 
        High: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/20 dark:border-red-500/30', 
        Medium: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/20 dark:border-yellow-500/30', 
        Low: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/20 dark:border-green-500/30' 
    };
    
    return (
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-gray-900/10 dark:border-white/10">
            <p className="text-gray-800 dark:text-white/90 text-sm font-semibold mb-2">{rec.recommendation}</p>
            <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-bold border ${impactColor[rec.impact]}`}>Impact: {rec.impact}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold border ${effortColor[rec.effort]}`}>Effort: {rec.effort}</span>
            </div>
        </div>
    );
};


const ROICalculatorSection: React.FC<ROICalculatorSectionProps> = ({ navigate }) => {
  const [tickets, setTickets] = useState(500);
  const [timeToResolve, setTimeToResolve] = useState(10); // in minutes
  const [avgWage, setAvgWage] = useState(25); // in USD per hour
  const [leads, setLeads] = useState(100);
  const [conversionRate, setConversionRate] = useState(3); // in percent
  const [avgDealValue, setAvgDealValue] = useState(2000); // in USD

  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef);

  useEffect(() => {
    if (!loading && aiResponse && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, aiResponse]);
  
  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/#lets-talk');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAiResponse(null);
    
    try {
        // FIX: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY` to align with coding guidelines and fix environment variable access errors.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `You are a sophisticated AI Financial Analyst for Synaptix Studio. Your task is to analyze a potential client's business metrics and generate a compelling, data-driven ROI projection. You MUST return a single, valid JSON object and nothing else.

        Your calculations should be based on these assumptions unless specified otherwise:
        - AI can automate 70% of support inquiries.
        - AI can improve lead conversion rates by a relative 25% (e.g., from 3% to 3.75%).
        - A typical 'Growth Engine' project costs around $4,500 (one-time).

        The JSON output must contain:
        1. "savings": An object with "value" (integer) and "justification" (string).
        2. "revenue": An object with "value" (integer) and "justification" (string).
        3. "timeline": A brief, realistic implementation timeline string.
        4. "recommendations": A JSON array of 2-3 specific, strategic recommendations. Each object MUST have "recommendation" (string), "impact" (a string: "High", "Medium", or "Low"), and "effort" (a string: "High", "Medium", or "Low").
        5. "breakEvenAnalysis": A string explaining the estimated time to break even on a $4,500 investment, based on the combined monthly savings and revenue growth.`;

        const userPrompt = `Analyze the following business metrics:
        - Monthly Support Inquiries: ${tickets}
        - Average Time to Resolve a Ticket (minutes): ${timeToResolve}
        - Average Employee Hourly Wage ($): ${avgWage}
        - Monthly New Leads: ${leads}
        - Current Lead Conversion Rate (%): ${conversionRate}
        - Average Deal Value ($): ${avgDealValue}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
            }
        });

        if (!response.text) {
            throw new Error('AI response was empty');
        }
        const parsedResponse = JSON.parse(response.text);
        setAiResponse(parsedResponse);
        trackEvent('calculate_roi');
    } catch (err) {
        console.error("AI analysis error:", err);
        setError("Sorry, we couldn't generate the AI analysis at this time. Please adjust your inputs or try again later.");
    } finally {
        setLoading(false);
    }
  };


  const title = "AI Financial **Analyst**";
  const description = "Move beyond estimates. Input your core business metrics and let our AI conduct a detailed ROI analysis, forecasting your potential savings and growth.";

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="container mx-auto px-6">
        <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto"><StyledText text={description} /></p>
        </div>

        <div className="max-w-6xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Cost Savings Inputs */}
                    <div className="space-y-6 p-6 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-900/10 dark:border-white/10">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg text-center">Cost Savings Inputs</h4>
                        <div>
                            <label htmlFor="tickets" className="flex justify-between font-bold text-gray-800 dark:text-white/90 text-sm mb-2"><span>Monthly Support Tickets</span><span className="text-primary">{tickets}</span></label>
                            <input id="tickets" type="range" min="10" max="10000" step="10" value={tickets} onChange={(e) => setTickets(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                        <div>
                            <label htmlFor="timeToResolve" className="flex justify-between font-bold text-gray-800 dark:text-white/90 text-sm mb-2"><span>Time to Resolve (mins)</span><span className="text-primary">{timeToResolve}</span></label>
                            <input id="timeToResolve" type="range" min="1" max="60" value={timeToResolve} onChange={(e) => setTimeToResolve(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                         <div>
                            <label htmlFor="avgWage" className="block font-bold text-gray-800 dark:text-white/90 text-sm mb-2">Avg. Employee Hourly Wage ($)</label>
                            <input id="avgWage" type="number" min="10" value={avgWage} onChange={(e) => setAvgWage(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-gray-900/10 bg-white/20 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition" />
                        </div>
                    </div>
                    {/* Revenue Growth Inputs */}
                    <div className="space-y-6 p-6 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-900/10 dark:border-white/10">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg text-center">Revenue Growth Inputs</h4>
                        <div>
                            <label htmlFor="leads" className="flex justify-between font-bold text-gray-800 dark:text-white/90 text-sm mb-2"><span>Monthly New Leads</span><span className="text-primary">{leads}</span></label>
                            <input id="leads" type="range" min="10" max="5000" step="10" value={leads} onChange={(e) => setLeads(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                        <div>
                            <label htmlFor="conversionRate" className="flex justify-between font-bold text-gray-800 dark:text-white/90 text-sm mb-2"><span>Conversion Rate (%)</span><span className="text-primary">{conversionRate}%</span></label>
                            <input id="conversionRate" type="range" min="1" max="50" value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                         <div>
                            <label htmlFor="avgDealValue" className="block font-bold text-gray-800 dark:text-white/90 text-sm mb-2">Avg. Deal Value ($)</label>
                            <input id="avgDealValue" type="number" min="100" step="100" value={avgDealValue} onChange={(e) => setAvgDealValue(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-gray-900/10 bg-white/20 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition" />
                        </div>
                    </div>
                     {/* CTA */}
                    <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                         <h4 className="font-bold text-gray-900 dark:text-white text-lg text-center">Ready for Your Analysis?</h4>
                         <p className="text-gray-600 dark:text-white/70 text-sm text-center my-4">Our AI will process your inputs to create a detailed financial projection.</p>
                         <button 
                            type="submit"
                            disabled={loading}
                            className="bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-3 px-8 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 w-full justify-center"
                        >
                           <CalculatorIcon className="h-5 w-5"/>
                           {loading ? 'Analyzing...' : 'Calculate My ROI'}
                        </button>
                    </div>
                </div>
            </form>

            {loading && <DynamicLoader messages={LOADING_MESSAGES.ROI} className="mt-12" />}
            {error && <p className="text-center text-red-400 mt-8 text-sm" role="alert">{error}</p>}
            
            {aiResponse && (
                <div ref={resultsRef} className="animate-fade-in mt-12 pt-8 border-t border-gray-900/10 dark:border-white/20">
                    <div className="text-center mb-12">
                        <p className="font-bold text-gray-600 dark:text-white/70 text-base">Estimated Annual ROI</p>
                        <div className="text-4xl md:text-6xl font-bold text-primary my-2">
                            <AnimatedNumber value={(aiResponse.savings.value || 0) + (aiResponse.revenue.value || 0)} />
                        </div>
                         <div className="flex justify-center gap-8 text-base">
                            <div>
                                <span className="text-gray-500 dark:text-white/60">Savings: </span>
                                <span className="font-bold text-green-500 dark:text-green-400"><AnimatedNumber value={aiResponse.savings.value || 0} /></span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-white/60">Revenue: </span>
                                <span className="font-bold text-green-500 dark:text-green-400"><AnimatedNumber value={aiResponse.revenue.value || 0} /></span>
                            </div>
                        </div>
                         <div className="mt-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg inline-block">
                             <h4 className="font-bold text-gray-900 dark:text-white text-base">Break-Even Analysis</h4>
                             <p className="text-gray-700 dark:text-white/80">{aiResponse.breakEvenAnalysis}</p>
                         </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-gray-900/10 dark:border-white/10">
                             <h3 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-4">Cost Savings Breakdown</h3>
                             <MarkdownRenderer content={aiResponse.savings.justification} />
                        </div>
                         <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-gray-900/10 dark:border-white/10">
                             <h3 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-4">Revenue Growth Breakdown</h3>
                             <MarkdownRenderer content={aiResponse.revenue.justification} />
                        </div>
                    </div>
                    
                    <div className="mt-8 bg-white/20 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-gray-900/10 dark:border-white/10">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-4">Proposed Timeline & Recommendations</h3>
                        <p className="text-gray-700 dark:text-white/80 mb-4"><span className="font-bold">Timeline:</span> {aiResponse.timeline}</p>
                        <div className="text-gray-700 dark:text-white/80 space-y-3">
                             <p className="font-bold">Key Recommendations:</p>
                             <div className="space-y-3">
                                {aiResponse.recommendations.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
                             </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <a href="#lets-talk" onClick={handleCTAClick} className="bg-primary text-white font-bold py-3 px-8 text-lg rounded-full transition-all transform hover:scale-105 hover:bg-opacity-90 animate-glow inline-block">
                            Book a Free Consultation
                        </a>
                    </div>
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default ROICalculatorSection;