import React from 'react';
import AIContentSparkSection from '../AIContentSparkSection';
import AIIdeaGeneratorSection from '../AIIdeaGeneratorSection';
import ROICalculatorSection from '../ROICalculatorSection';
import ToolsNavBar from '../ToolsNavBar';
import AIAdCopyGeneratorSection from '../AIAdCopyGeneratorSection';
import AIEmailSubjectLineTesterSection from '../AIEmailSubjectLineTesterSection';
import AIWebsiteAuditorSection from '../AIWebsiteAuditorSection';
import { AI_TOOLS_NAV_LINKS } from '../../constants';
import AIAgentGeneratorSection from '../AIAgentGeneratorSection';
import AIKnowledgeBaseGeneratorSection from '../AIKnowledgeBaseGeneratorSection';
import CustomSolutionsSection from '../CustomSolutionsSection';

interface AIAdminDashboardProps {
  theme: 'light' | 'dark';
}

const AIAdminDashboard: React.FC<AIAdminDashboardProps> = ({ theme }) => {
  const [activeTool, setActiveTool] = useState(AI_TOOLS_NAV_LINKS[0].href);
  
  const handleToolSelect = (toolHref: string) => {
    setActiveTool(toolHref);
    window.location.hash = toolHref;
  };

  const renderActiveTool = () => {
    switch(activeTool) {
      case '#ai-agent-generator':
        return <AIAgentGeneratorSection />;
      case '#viral-content-strategist':
        return <AIContentSparkSection />;
      case '#ai-idea-generator':
        return <AIIdeaGeneratorSection />;
      case '#custom-solutions':
        return <CustomSolutionsSection />;
      case '#roi-calculator':
        return <ROICalculatorSection />;
      case '#ai-ad-copy-generator':
        return <AIAdCopyGeneratorSection />;
      case '#ai-subject-line-tester':
        return <AIEmailSubjectLineTesterSection />;
      case '#ai-website-auditor':
        return <AIWebsiteAuditorSection />;
      case '#ai-knowledge-base-generator':
        return <AIKnowledgeBaseGeneratorSection />;
      default:
        return <AIAgentGeneratorSection />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-brand-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-6 pt-24 sm:pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto mb-4">
          <h1 className="text-2xl md:text-3xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">
            AI Tools Dashboard
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80">
            Manage and test all AI-powered tools in one place. These tools are only accessible through the admin dashboard.
          </p>
        </div>
        
        <ToolsNavBar activeTool={activeTool} onToolSelect={handleToolSelect} />

        <div className="pt-8">
          {renderActiveTool()}
        </div>
      </div>
    </div>
  );
};

export default AIAdminDashboard;
