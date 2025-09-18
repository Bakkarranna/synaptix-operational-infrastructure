import React, { useMemo } from 'react';
import StyledText from './StyledText';
import { QuoteIcon } from './Icon';

interface BlogMarkdownRendererProps {
  content: string;
}

const BlogMarkdownRenderer: React.FC<BlogMarkdownRendererProps> = ({ content }) => {
  const elements = useMemo(() => {
    if (typeof content !== 'string') {
      return [<p key="invalid">Invalid content.</p>];
    }

    const blocks = content.split(/\n\s*\n/);
    const renderedElements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let isInsideList: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0 && isInsideList) {
        const ListTag = isInsideList;
        const listClass = ListTag === 'ul' ? 'list-disc' : 'list-decimal';
        renderedElements.push(
          <ListTag key={`list-${renderedElements.length}`} className={`${listClass} list-inside space-y-2 my-4 pl-4`}>
            {listItems.map((item, i) => <li key={i}><StyledText text={item} /></li>)}
          </ListTag>
        );
        listItems = [];
        isInsideList = null;
      }
    };

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      if (!block) continue;

      // --- Block-level checks in order of precedence ---

      // 1. Testimonial
      if (block.startsWith('[TESTIMONIAL_START]')) {
        flushList();
        const testimonialContent = block.substring('[TESTIMONIAL_START]'.length, block.indexOf('[TESTIMONIAL_END]')).trim();
        const match = testimonialContent.match(/"([\s\S]*?)"\s*--\s*([\s\S]*)/);
        if (match) {
          const quote = match[1];
          const attribution = match[2];
          renderedElements.push(
            <div key={`testimonial-${i}`} className="my-8 p-6 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary rounded-r-lg shadow-inner">
              <QuoteIcon className="w-8 h-8 text-primary/80 dark:text-primary/60 mb-4" />
              <p className="text-lg italic text-gray-700 dark:text-white/90">
                <StyledText text={`"${quote}"`} />
              </p>
              <p className="text-right mt-4 font-semibold text-gray-800 dark:text-white/90">
                -- {attribution}
              </p>
            </div>
          );
        }
        continue;
      }

      // 2. FAQ
      if (block.startsWith('**Q:**')) {
        flushList();
        let questionText = '';
        let answerText = '';
        const qaParts = block.split(/\n\s*\*\*A:\*\*/);
        questionText = qaParts[0].substring(6).trim();
        if (qaParts.length > 1) {
          answerText = qaParts.slice(1).join('\n**A:**').trim();
        }
        renderedElements.push(
          <div key={`faq-${i}`} className="my-6 p-4 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-lg border border-gray-900/10 dark:border-white/10">
            <p className="font-bold text-gray-900 dark:text-white"><StyledText text={`**Q:** ${questionText}`} /></p>
            <div className="mt-2 text-gray-700 dark:text-white/80"><p><span className="font-bold">A: </span><StyledText text={answerText} /></p></div>
          </div>
        );
        continue;
      }

      // 3. Table
      if (block.includes('|') && block.includes('---')) {
        flushList();
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 1 && lines[0].includes('|') && lines[1].includes('---')) {
          const headerLine = lines[0];
          const bodyLines = lines.slice(2);
          const headers = headerLine.split('|').slice(1, -1).map(h => h.trim());
          const numColumns = headers.length;
          
          const rows = bodyLines.map(rowLine => {
              const cells = rowLine.split('|').slice(1, -1).map(cell => cell.trim());
              // Pad the row with empty strings if it has fewer columns than the header
              while (cells.length < numColumns) {
                  cells.push('');
              }
              // Truncate the row if it has more columns, preventing layout breaks
              return cells.slice(0, numColumns);
          });

          renderedElements.push(
            <div key={`table-${i}`} className="my-6 overflow-x-auto">
              <table className="w-full">
                <thead><tr>{headers.map((header, hIndex) => <th key={hIndex}><StyledText text={header} /></th>)}</tr></thead>
                <tbody>{rows.map((row, rIndex) => (<tr key={rIndex}>{row.map((cell, cIndex) => <td key={cIndex} data-label={headers[cIndex]}><StyledText text={cell} /></td>)}</tr>))}</tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 4. Headings
      if (block.startsWith('#')) {
        flushList();
        const match = block.match(/^(#+)\s(.*)/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const Tag = `h${level > 6 ? 6 : level}` as keyof JSX.IntrinsicElements;
          renderedElements.push(<Tag key={`heading-${i}`}><StyledText text={text} /></Tag>);
          continue;
        }
      }
      
      // 5. Lists
      const isUnorderedList = block.split('\n').every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
      const isOrderedList = block.split('\n').every(line => /^\d+\.\s/.test(line.trim()));
      
      if (isUnorderedList || isOrderedList) {
        const listType = isOrderedList ? 'ol' : 'ul';
        if (isInsideList !== listType) {
          flushList();
          isInsideList = listType;
        }
        const items = block.split('\n').map(item => item.trim().replace(/^(\* |-\s*|\d+\.\s*)/, ''));
        listItems.push(...items);
        continue;
      }
      
      // 6. Default to Paragraph
      flushList();
      renderedElements.push(<p key={`p-${i}`}><StyledText text={block} /></p>);
    }

    flushList(); // Flush any remaining list items at the end
    return renderedElements;
  }, [content]);

  // Use prose class for better typography and spacing of generated content.
  // The prose class will automatically style h2, h3, etc.
  return <div className="prose prose-sm dark:prose-invert sm:prose-base lg:prose-lg max-w-none space-y-4 leading-relaxed">{elements}</div>;
};

export default BlogMarkdownRenderer;