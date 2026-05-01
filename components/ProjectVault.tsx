import React, { useState, useEffect } from 'react';

interface ProjectVaultProps {
  className?: string;
}

const ProjectVault: React.FC<ProjectVaultProps> = ({ className = '' }) => {
  const [visibleFiles, setVisibleFiles] = useState<string[]>([]);

  const projectFiles = [
    'Wise_Invoices.json',
    'Hail_Damage_Appointments.json',
    'HubSpot_Chatbot.json',
    'Meeting_Reminder_Dynamic.json',
    'Master_Agent.json',
    'Roofbot_Webhook_v2.json',
    'Telegram_Task_Creation.json',
    'Appointment_Agent.json',
    'HubSpot_Chatbot.json',
    'Meeting_Reminder_Dynamic.json',
    'Master_Agent.json',
    'Roofbot_Webhook_v2.json',
    'Telegram_Task_Creation.json'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomFile = projectFiles[Math.floor(Math.random() * projectFiles.length)];
      setVisibleFiles(prev => {
        const newFiles = [randomFile, ...prev].slice(0, 5);
        return newFiles;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full bg-gray-900 border-y border-white/5 overflow-hidden ${className}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">Project Vault</h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live Deployment</span>
            </div>
          </div>

          <div className="bg-gray-800 border border-white/5 rounded-xl p-8 font-mono text-sm">
            <div className="text-gray-600 dark:text-gray-400 mb-4 text-xs uppercase tracking-wider">Active Workflows</div>
            <div className="space-y-1">
              {visibleFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                  <span className="text-green-400">→</span>
                  <span className="text-gray-900 dark:text-white">{file}</span>
                  <span className="text-gray-500 text-xs">
                    [{index + 1}/5] ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800/50 backdrop-blur border border-white/5 rounded-xl p-6">
              <div className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">Modules Loaded</div>
              <div className="space-y-2 text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400"></div>
                  <span>Wise_Invoices.json</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400"></div>
                  <span>HubSpot_Chatbot.json</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400"></div>
                  <span>Master_Agent.json</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-white/5 rounded-xl p-6">
              <div className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">System Status</div>
              <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-white text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Uptime</div>
                  <div className="text-green-400 font-bold">99.97%</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Latency</div>
                  <div className="text-blue-400 font-bold">12ms</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-white/5 rounded-xl p-6">
              <div className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">Latest Deployment</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary">●</span>
                  <span>Roofbot_Webhook_v2.json</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary">●</span>
                  <span>Telegram_Task_Creation.json</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">●</span>
                  <span>HubSpot_Chatbot.json</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur border border-white/5 px-4 py-2 rounded-lg">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm">Real-time workflow monitoring active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectVault;
