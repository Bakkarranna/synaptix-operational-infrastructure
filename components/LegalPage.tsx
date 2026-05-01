

import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface LegalPageProps {
  title: string;
  content: string;
  navigate: (path: string) => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, content, navigate }) => {

  return (
    <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-6 py-24 sm:py-32">
            <div className="max-w-4xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-8 md:p-12">
                <button 
                    onClick={() => navigate('/')} 
                    className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-colors mb-8 inline-flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Home
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-montserrat mb-8">{title}</h1>
                
                <MarkdownRenderer content={content} />
            </div>
        </div>
    </div>
  );
};

export default LegalPage;