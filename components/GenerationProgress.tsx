import React, { useState, useEffect } from 'react';

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  tools: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  subtasks: Subtask[];
}

interface GenerationProgressProps {
  isGenerating: boolean;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ isGenerating }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Analyzing Business Requirements',
      description: 'Processing business details and knowledge base',
      status: 'in-progress',
      subtasks: [
        { id: '1.1', title: 'Extracting business information', description: 'Parsing provided business details', status: 'completed', tools: ['knowledge-base-analyzer'] },
        { id: '1.2', title: 'Identifying key services', description: 'Finding primary business offerings', status: 'in-progress', tools: ['service-categorizer'] },
        { id: '1.3', title: 'Determining target audience', description: 'Analyzing customer segments', status: 'pending', tools: ['audience-analyzer'] },
      ]
    },
    {
      id: '2',
      title: 'Designing Agent Personality',
      description: 'Creating the AI agent character and tone',
      status: 'pending',
      subtasks: [
        { id: '2.1', title: 'Defining communication style', description: 'Setting tone and voice', status: 'pending', tools: ['personality-engine'] },
        { id: '2.2', title: 'Creating greeting message', description: 'Drafting initial agent message', status: 'pending', tools: ['message-generator'] },
        { id: '2.3', title: 'Setting response patterns', description: 'Configuring response format', status: 'pending', tools: ['response-architect'] },
      ]
    },
    {
      id: '3',
      title: 'Building Knowledge Base',
      description: 'Structuring agent information database',
      status: 'pending',
      subtasks: [
        { id: '3.1', title: 'Compiling service information', description: 'Gathering service details', status: 'pending', tools: ['data-aggregator'] },
        { id: '3.2', title: 'Creating FAQ database', description: 'Generating common Q&A pairs', status: 'pending', tools: ['faq-generator'] },
        { id: '3.3', title: 'Setting up response rules', description: 'Configuring answer patterns', status: 'pending', tools: ['rule-engine'] },
      ]
    },
    {
      id: '4',
      title: 'Generating Sample Interactions',
      description: 'Creating example conversations',
      status: 'pending',
      subtasks: [
        { id: '4.1', title: 'Drafting user scenarios', description: 'Creating example queries', status: 'pending', tools: ['scenario-builder'] },
        { id: '4.2', title: 'Generating agent responses', description: 'Writing example answers', status: 'pending', tools: ['response-generator'] },
        { id: '4.3', title: 'Validating interactions', description: 'Testing conversation flow', status: 'pending', tools: ['flow-validator'] },
      ]
    },
    {
      id: '5',
      title: 'Finalizing Agent Blueprint',
      description: 'Completing the agent configuration',
      status: 'pending',
      subtasks: [
        { id: '5.1', title: 'Compiling system prompt', description: 'Assembling final prompt', status: 'pending', tools: ['prompt-compiler'] },
        { id: '5.2', title: 'Configuring voice settings', description: 'Setting voice parameters', status: 'pending', tools: ['voice-configurator'] },
        { id: '5.3', title: 'Deploying to demo', description: 'Launching live demo', status: 'pending', tools: ['demo-deployer'] },
      ]
    },
  ]);

  const [expandedTasks, setExpandedTasks] = useState<string[]>(['1']);

  useEffect(() => {
    if (!isGenerating) {
      setTasks(prev => prev.map(task => ({
        ...task,
        status: 'completed',
        subtasks: task.subtasks.map(st => ({ ...st, status: 'completed' as const }))
      })));
      return;
    }

    const interval = setInterval(() => {
      setTasks(prev => {
        const newTasks = [...prev];
        for (let i = 0; i < newTasks.length; i++) {
          const task = newTasks[i];
          if (task.status === 'in-progress') {
            const inProgressSubtask = task.subtasks.find(st => st.status === 'in-progress');
            if (inProgressSubtask) {
              inProgressSubtask.status = 'completed';
            } else {
              const pendingSubtask = task.subtasks.find(st => st.status === 'pending');
              if (pendingSubtask) {
                pendingSubtask.status = 'in-progress';
              } else {
                task.status = 'completed';
                if (newTasks[i + 1]) {
                  newTasks[i + 1].status = 'in-progress';
                  newTasks[i + 1].subtasks[0].status = 'in-progress';
                }
              }
            }
            break;
          } else if (task.status === 'pending' && i === 0) {
            task.status = 'in-progress';
            task.subtasks[0].status = 'in-progress';
            break;
          }
        }
        return newTasks;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Completed</span>;
      case 'in-progress':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">In Progress</span>;
      case 'failed':
        return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Failed</span>;
      default:
        return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Pending</span>;
    }
  };

  if (!isGenerating) return null;

  return (
    <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
          Generating Your AI Agent
        </h3>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => {
          const isExpanded = expandedTasks.includes(task.id);
          const isCompleted = task.status === 'completed';
          const isInProgress = task.status === 'in-progress';

          return (
            <div key={task.id} className={`${index !== 0 ? 'mt-2 pt-2 border-t border-gray-200 dark:border-white/10' : ''}`}>
              <div 
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && task.subtasks.length > 0 && (
                <div className="ml-8 mt-1 space-y-1">
                  {task.subtasks.map((subtask) => (
                    <div 
                      key={subtask.id} 
                      className="flex items-center gap-3 p-2 rounded bg-white/5 dark:bg-black/20"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(subtask.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs ${subtask.status === 'completed' ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {subtask.title}
                        </span>
                      </div>
                      {subtask.tools && subtask.tools.length > 0 && (
                        <div className="flex gap-1">
                          {subtask.tools.map((tool, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Processing with Gemini AI</span>
          <span>Step {tasks.findIndex(t => t.status === 'in-progress') + 1} of {tasks.length}</span>
        </div>
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ 
              width: `${((tasks.filter(t => t.status === 'completed').length) / tasks.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
