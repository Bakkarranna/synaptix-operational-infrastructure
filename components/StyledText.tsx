
import React, { useMemo } from 'react';

const StyledText: React.FC<{ text: string }> = ({ text }) => {
    const elements = useMemo(() => {
        if (typeof text !== 'string') return null;

        const linkMap = new Map<string, React.ReactNode>();
        let linkIndex = 0;

        // Define the recursive parser function *before* it's used in any closure.
        // This ensures its availability and correct closure scope, fixing nested rendering bugs.
        function parseRecursively(str: string): React.ReactNode {
            const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|__LINK_\d+__)/g).filter(Boolean);

            return parts.map((part, i) => {
                if (part.startsWith('__LINK_') && part.endsWith('__')) {
                    return <React.Fragment key={i}>{linkMap.get(part)}</React.Fragment>;
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-primary">{parseRecursively(part.slice(2, -2))}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={i} className="italic">{parseRecursively(part.slice(1, -1))}</em>;
                }
                if (part.startsWith('http')) {
                     return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{part}</a>;
                }
                return part;
            });
        };

        // Pass 1: Extract all links and replace them with placeholders.
        const processedTextWithPlaceholders = text.replace(/(\[[\s\S]*?\]\([\s\S]*?\))/g, (match) => {
            const linkMatch = match.match(/\[([\s\S]*?)\]\(([\s\S]*?)\)/);
            if (!linkMatch) return match;

            const linkText = linkMatch[1];
            const linkUrl = linkMatch[2];
            const isAbsolute = linkUrl.startsWith('http') || linkUrl.startsWith('//');
            
            let finalHref = linkUrl;
            if (!isAbsolute) {
                if (finalHref.startsWith('/#')) {
                    finalHref = finalHref.substring(1);
                } else if (finalHref.startsWith('/')) {
                    finalHref = `#${finalHref}`;
                }
            }

            const placeholder = `__LINK_${linkIndex}__`;
            linkMap.set(placeholder, (
                <a 
                    href={finalHref} 
                    className="text-primary hover:underline"
                    target={isAbsolute ? '_blank' : undefined}
                    rel={isAbsolute ? 'noopener noreferrer' : undefined}
                >
                    {/* Recursively parse text within the link itself */}
                    {parseRecursively(linkText)}
                </a>
            ));
            linkIndex++;
            return placeholder;
        });
        
        // Pass 2: Recursively parse the entire string with placeholders
        return parseRecursively(processedTextWithPlaceholders);
    }, [text]);

    return <>{elements}</>;
};

export default StyledText;