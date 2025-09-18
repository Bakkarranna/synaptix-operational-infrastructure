import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useOnScreen } from '../hooks/useOnScreen';
import { ClipboardListIcon } from './Icon';
import StyledText from './StyledText';
import MarkdownRenderer from './MarkdownRenderer';
import { QUIZ_QUESTIONS } from '../constants';
import ViralityMeter from './ViralityMeter';

interface QuizResult {
    automationScore: number;
    maturityLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Nascent';
    detailedAnalysis: string;
    topOpportunities: {
        title: string;
        description: string;
        impact: string;
        firstSteps: string[];
    }[];
}

interface AIQuizSectionProps {
    navigate: (path: string) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="relative overflow-hidden w-full max-w-4xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10 mx-auto" />
        <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10 mx-auto" />
        
        <div className="space-y-4 pt-6">
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-300/10 dark:via-white/10 to-transparent" />
    </div>
);

const AIQuizSection: React.FC<AIQuizSectionProps> = ({ navigate }) => {
    const [quizState, setQuizState] = useState<'idle' | 'in-progress' | 'loading' | 'results'>('idle');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, '-120px');

    const handleAnswer = (answer: string) => {
        setIsExiting(true);
        setTimeout(() => {
            const newAnswers = [...answers, answer];
            setAnswers(newAnswers);

            if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                setQuizState('loading');
                generateReport(newAnswers);
            }
            setIsExiting(false);
        }, 300); // Duration of fade-out animation
    };

    const generateReport = async (finalAnswers: string[]) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a professional business automation consultant. Your task is to analyze a user's answers to a business health quiz and provide a detailed, actionable report.

            You MUST return a single, valid JSON object and nothing else.

            The JSON must contain:
            1. "automationScore": An integer from 0 to 100, where 100 is highly automated.
            2. "maturityLevel": A string assessing the business's automation maturity. Must be one of: "Nascent", "Beginner", "Intermediate", "Advanced".
            3. "detailedAnalysis": A markdown-formatted paragraph summarizing the user's current situation based on their answers. If you mention a specific tool or concept that could be beneficial, link to a high-authority external resource for it using markdown format \`[text](url)\`.
            4. "topOpportunities": An array of exactly THREE objects, each representing a key area for AI automation improvement. Each object must have:
               - "title": A clear title for the opportunity.
               - "description": An explanation of the problem based on their answers.
               - "impact": The tangible business benefit of implementing the solution.
               - "firstSteps": An array of 2-3 simple, actionable first steps the user can take.`;
            
            const userPrompt = `Here are the user's quiz answers:\n${QUIZ_QUESTIONS.map((q, i) => `Q: ${q.question}\nA: ${finalAnswers[i]}`).join('\n\n')}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                }
            });

            setResult(JSON.parse(response.text));
            setQuizState('results');
        } catch (err) {
            console.error(err);
            setError("We couldn't generate your report. Please try again.");
            setQuizState('idle'); // Reset on error
        }
    };

    const restartQuiz = () => {
        setIsExiting(true);
        setTimeout(() => {
            setQuizState('idle');
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setResult(null);
            setError(null);
            setIsExiting(false);
        }, 300);
    };
    
    const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/#ai-strategy');
    };
    
    const renderContent = () => {
        const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
        
        switch (quizState) {
            case 'idle':
                return (
                    <div className={`max-w-3xl mx-auto text-center ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}`}>
                        <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text="Are You **AI-Ready?**" /></h2>
                        <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80"><StyledText text="Take our **1-minute quiz** to discover your business's automation score and unlock your top AI opportunities." /></p>
                        <button onClick={() => setQuizState('in-progress')} className="mt-6 bg-primary/20 border border-primary/50 text-primary dark:text-white font-bold py-2.5 px-6 text-base rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow flex items-center justify-center mx-auto">
                            <ClipboardListIcon className="h-5 w-5 mr-2" />
                            Start the Quiz
                        </button>
                    </div>
                );
            case 'in-progress':
                return (
                    <div className="w-full max-w-3xl mx-auto">
                        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mb-4">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
                        </div>
                        <div className={isExiting ? 'animate-fade-out' : 'animate-fade-in'}>
                            <p className="text-center text-primary font-semibold">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white/80 text-center mt-2 mb-8">{currentQuestion.question}</h3>
                            <div className="space-y-3">
                                {currentQuestion.answers.map((answer, i) => (
                                    <button key={i} onClick={() => handleAnswer(answer)} className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 text-gray-800 dark:text-white text-lg">
                                        {answer}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'loading':
                return <SkeletonLoader />;
            case 'results':
                if (result) {
                    return (
                        <div className={`w-full max-w-4xl mx-auto text-left ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}`}>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white/80">Your Automation Report</h3>
                                <div className="my-6">
                                    <ViralityMeter score={result.automationScore} />
                                </div>
                                <p className="text-base text-gray-700 dark:text-white/80">Your Automation Maturity Level is: <span className="font-bold text-primary">{result.maturityLevel}</span></p>
                                <div className="prose dark:prose-invert max-w-2xl mx-auto mt-4 text-gray-600 dark:text-white/80">
                                    <MarkdownRenderer content={result.detailedAnalysis} />
                                </div>
                            </div>
                            <div className="my-8">
                                <h4 className="text-xl font-bold font-montserrat text-gray-900 dark:text-white text-center mb-6">Your Top 3 AI Opportunities</h4>
                                <div className="space-y-4">
                                    {result.topOpportunities.map((opp, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                                            <h5 className="font-bold text-primary">{opp.title}</h5>
                                            <p className="text-xs text-gray-600 dark:text-white/80 mt-1">{opp.description}</p>
                                            <p className="text-xs text-gray-600 dark:text-white/80 mt-2"><span className="font-semibold text-gray-700 dark:text-white/90">Impact:</span> {opp.impact}</p>
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                                                <h6 className="font-semibold text-gray-800 dark:text-white text-xs mb-1">First Steps:</h6>
                                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-white/80 pl-2">
                                                    {opp.firstSteps.map((step, si) => <li key={si}>{step}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <button onClick={restartQuiz} className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-all">
                                    Take Again
                                </button>
                                <a href="#ai-strategy" onClick={handleCTAClick} className="inline-block bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-all">
                                    Get a Custom Plan
                                </a>
                            </div>
                        </div>
                    );
                }
                return null;
        }
    };

    return (
        <section ref={ref} id="ai-quiz" className={`py-12 sm:py-16 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="container mx-auto px-6">
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 md:p-8 flex items-center justify-center">
                    {renderContent()}
                </div>
                {error && <p className="text-center text-red-400 mt-8 text-sm" role="alert">{error}</p>}
            </div>
        </section>
    );
};

export default AIQuizSection;