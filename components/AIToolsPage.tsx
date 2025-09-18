


import React, { useState, useEffect } from 'react';
import AIContentSparkSection from './AIContentSparkSection';
import AIIdeaGeneratorSection from './AIIdeaGeneratorSection';
import ROICalculatorSection from './ROICalculatorSection';
import StyledText from './StyledText';
import ToolsNavBar from './ToolsNavBar';
import AIAdCopyGeneratorSection from './AIAdCopyGeneratorSection';
import AIEmailSubjectLineTesterSection from './AIEmailSubjectLineTesterSection';
import AIWebsiteAuditorSection from './AIWebsiteAuditorSection';
import { AI_TOOLS_NAV_LINKS } from '../constants';
import AIAgentGeneratorSection from './AIAgentGeneratorSection';
import AIKnowledgeBaseGeneratorSection from './AIKnowledgeBaseGeneratorSection';
import CustomSolutionsSection from './CustomSolutionsSection';

interface AIToolsPageProps {
  navigate: (path: string) => void;
}

const AIToolsPage: React.FC<AIToolsPageProps> = ({ navigate }) => {

  const getAnchorFromUrl = () => {
    const hash = window.location.hash; // e.g., #/ai-tools#viral-content-strategist
    const parts = hash.split('#');
    if (parts.length > 2) {
        const anchor = `#${parts[2]}`;
        if (AI_TOOLS_NAV_LINKS.some(link => link.href === anchor)) {
            return anchor;
        }
    }
    return AI_TOOLS_NAV_LINKS[0].href; // Default to first tool
  };

  const [activeTool, setActiveTool] = useState(getAnchorFromUrl());
  
  useEffect(() => {
    const handleHashChange = () => {
        setActiveTool(getAnchorFromUrl());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const handleToolSelect = (toolHref: string) => {
    setActiveTool(toolHref);
    navigate(`/ai-tools${toolHref}`);
  };

  const title = "Synaptix Studio **AI Toolkit**";
  const description = "Experience the power of our AI firsthand. These free tools are designed to provide instant value and showcase what's possible with intelligent automation.";

  const renderActiveTool = () => {
    switch(activeTool) {
      case '#ai-agent-generator':
        return <AIAgentGeneratorSection />;
      case '#viral-content-strategist':
        return <AIContentSparkSection />;
      case '#ai-idea-generator':
        return <AIIdeaGeneratorSection navigate={navigate} />;
      case '#custom-solutions':
        return <CustomSolutionsSection navigate={navigate} />;
      case '#roi-calculator':
        return <ROICalculatorSection navigate={navigate} />;
      case '#ai-ad-copy-generator':
        return <AIAdCopyGeneratorSection />;
      case '#ai-subject-line-tester':
        return <AIEmailSubjectLineTesterSection />;
      case '#ai-website-auditor':
        return <AIWebsiteAuditorSection navigate={navigate} />;
      case '#ai-knowledge-base-generator':
        // FIX: Pass navigate prop to AIKnowledgeBaseGeneratorSection for consistent navigation handling.
        return <AIKnowledgeBaseGeneratorSection navigate={navigate} />;
      default:
        return <AIAgentGeneratorSection />;
    }
  };

  return (
    <div className="relative z-10 animate-fade-in">
      <div className="container mx-auto px-6 pt-24 sm:pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-2xl md:text-3xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]"><StyledText text={title} /></h1>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80"><StyledText text={description} /></p>
        </div>
        
        <ToolsNavBar activeTool={activeTool} onToolSelect={handleToolSelect} />

        <div className="pt-8">
          {renderActiveTool()}
        </div>

      </div>
    </div>
  );
};

export default AIToolsPage;