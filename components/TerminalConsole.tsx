import React, { useState, useEffect } from 'react';

interface TerminalConsoleProps {
  className?: string;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({ className = '' }): React.JSX.Element => {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const terminalLines = [
    '> INITIALIZING MASTER_AGENT.JSON...',
    '> LOADED MODULE: HAIL_DAMAGE_APPOINTMENTS...',
    '> CONNECTING TO HUBSPOT_CHATBOT API...',
    '> EXECUTING WISE_INVOICES_WORKFLOW...',
    '> TASK: DETECTED UNPAID INVOICE #9920',
    '> ACTION: AUTO-DRAFTING PAYMENT VIA WISE...',
    '> STATUS: 140ms LATENCY. SYSTEM OPTIMIZED.',
    '> SYSTEM: ALL MODULES ACTIVE',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLineIndex(prev => {
        const nextIndex = (prev + 1) % terminalLines.length;
        setDisplayLines(terminalLines.slice(0, nextIndex + 1));
        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`py-8 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 dark:bg-black/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-600 dark:text-white/50 uppercase tracking-wider font-mono">Live System Console</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">synaptix-core-v2.1.4</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-400">127ms</span>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-xs mb-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <div>
                  <div className="w-3 h-3 border border-gray-600 bg-gray-800 rounded-sm"></div>
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-gray-300">Synaptix Operational Infrastructure</p>
                  <p className="text-xs text-gray-500">© 2025 Synaptix Studio</p>
                </div>
              </div>
            </div>

            <div className="h-64 bg-gray-950 border border-gray-700 rounded-lg overflow-hidden font-mono text-xs leading-relaxed">
              <div className="p-4">
                <div className="flex min-h-full">
                  <div className="flex-shrink-0 w-full text-gray-500">
                    {displayLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1">
                        <span className="text-green-400">{line}</span>
                        {idx === displayLines.length - 1 && (
                          <span className="animate-blink text-primary">_</span>
                        )}
                      </div>
                    ))}
                    {displayLines.length === 0 && (
                      <span className="animate-blink text-primary">_</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalConsole;
