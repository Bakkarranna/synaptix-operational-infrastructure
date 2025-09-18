

import React, { useMemo } from 'react';
import StyledText from './StyledText';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const elements = useMemo(() => {
    if (typeof content !== 'string') {
        return <p>Invalid content.</p>;
    }
      
    const lines = content.split('\n');
    const renderedElements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let isInsideList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        renderedElements.push(
          <ul key={`ul-${renderedElements.length}`} className="list-disc list-inside space-y-2 my-4 pl-4">
            {listItems.map((item, i) => <li key={i}><StyledText text={item} /></li>)}
          </ul>
        );
        listItems = [];
      }
      isInsideList = false;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle headings
      if (trimmedLine.startsWith('#')) {
        flushList();
        const headingLevelMatch = trimmedLine.match(/^(#+)\s/);
        if (headingLevelMatch) {
          const level = headingLevelMatch[1].length;
          const text = trimmedLine.substring(level + 1).trim();
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          
          renderedElements.push(<Tag key={index}><StyledText text={text} /></Tag>);
          return; // continue to next line
        }
      }
      
      // Handle different list formats
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || /^\d+\.\s/.test(trimmedLine)) {
        isInsideList = true;
        // Strip the list marker
        const itemText = trimmedLine.replace(/^(\* |-\s*|\d+\.\s*)/, '');
        listItems.push(itemText);
      } else if (trimmedLine.length > 0) {
        // If we encounter a non-list line, flush any existing list
        flushList();
        renderedElements.push(<p key={index}><StyledText text={trimmedLine} /></p>);
      } else {
        // An empty line also flushes the list
        if (isInsideList) {
          flushList();
        }
      }
    });

    flushList(); // Flush any remaining list items at the end
    return renderedElements;
  }, [content]);

  // Use prose class for better typography and spacing of generated content.
  // The prose class will automatically style h2, h3, etc.
  return <div className="prose dark:prose-invert sm:prose-lg max-w-none space-y-4 leading-relaxed">{elements}</div>;
};

export default MarkdownRenderer;