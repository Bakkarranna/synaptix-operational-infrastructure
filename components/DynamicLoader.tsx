import React, { useState, useEffect } from 'react';

interface DynamicLoaderProps {
  messages: string[];
  interval?: number;
  className?: string;
}

const DynamicLoader: React.FC<DynamicLoaderProps> = ({ messages, interval = 2500, className = '' }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => (prev < messages.length - 1 ? prev + 1 : prev));
        }, interval);
        return () => clearInterval(timer);
    }, [messages, interval]);

    return (
        <div className={`text-center animate-fade-in w-full rounded-xl bg-white dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 p-8 min-h-[200px] flex flex-col items-center justify-center ${className}`}>
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">AI is Working...</h3>
            <p className="mt-2 text-gray-700 dark:text-white/80 font-semibold transition-opacity duration-500">{messages[step]}</p>
        </div>
    );
};

export default DynamicLoader;
