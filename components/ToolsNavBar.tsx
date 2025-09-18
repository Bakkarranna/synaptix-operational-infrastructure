
import React from 'react';
import { AI_TOOLS_NAV_LINKS } from '../constants';
import { Icon } from './Icon';

interface ToolsNavBarProps {
  activeTool: string;
  onToolSelect: (tool: string) => void;
}

const ToolsNavBar: React.FC<ToolsNavBarProps> = ({ activeTool, onToolSelect }) => {
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onToolSelect(href);
  };

  return (
    <div className="sticky top-15 z-40 my-12 animate-fade-in">
      <div className="container mx-auto px-2 sm:px-0 flex justify-center">
        <nav className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-full border border-gray-900/10 dark:border-white/10 shadow-lg px-2 py-2 inline-flex items-center flex-nowrap gap-x-1 sm:gap-x-2 overflow-x-auto no-scrollbar">
          {AI_TOOLS_NAV_LINKS.map((link) => (
            <a 
              key={link.href} 
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${activeTool === link.href ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white shadow-md' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10'}`}
            >
              <Icon name={link.icon} className="h-4 w-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ToolsNavBar;