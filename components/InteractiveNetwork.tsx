import React, { useState, useMemo } from 'react';
import { Icon, IconName } from './Icon';

interface InteractiveNetworkProps {
  navigate: (path: string) => void;
}

interface NodeData {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  target: string;
  size: number;
}

interface PositionedNode extends NodeData {
  x: number;
  y: number;
}

const Tooltip: React.FC<{ node: PositionedNode | null; visible: boolean }> = ({ node, visible }) => {
  if (!node || !visible) return null;

  const style: React.CSSProperties = {
    top: `${node.y}%`,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none',
  };

  // Position tooltip to the left for nodes on the right half, and vice-versa
  if (node.x > 60) {
    style.right = `${100 - node.x + 2}%`;
    style.transform = 'translateY(-50%)';
  } else {
    style.left = `${node.x + 2}%`;
    style.transform = 'translateY(-50%)';
  }

  return (
    <div
      className="absolute bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-lg shadow-xl p-3 max-w-[200px] text-left animate-fade-in-fast z-20"
      style={style}
    >
      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{node.label}</h4>
      <p className="text-xs text-gray-600 dark:text-white/80 mt-1">{node.description}</p>
    </div>
  );
};

// Helper to get static Tailwind classes for icons
const getIconSizeClasses = (size: number): string => {
  if (size >= 14) return 'h-7 w-7';
  if (size >= 10) return 'h-5 w-5';
  return 'h-4 w-4';
};


const InteractiveNetwork: React.FC<InteractiveNetworkProps> = ({ navigate }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodes = useMemo<PositionedNode[]>(() => {
    const mainNodes: NodeData[] = [
        { id: 'services', label: 'Services', icon: 'gear', description: 'Explore our suite of AI automation services.', target: '/#services', size: 10 },
        { id: 'pricing', label: 'Pricing', icon: 'calculator', description: 'Build a custom quote with our interactive calculator.', target: '/#pricing', size: 10 },
        { id: 'blog', label: 'Blog', icon: 'pencil', description: 'Read our latest insights on AI and automation.', target: '/blog', size: 10 },
        { id: 'about', label: 'About Us', icon: 'users', description: 'Learn about our mission, vision, and team.', target: '/#about', size: 10 },
        { id: 'partner', label: 'Partners', icon: 'users', description: 'Join our affiliate or referral program.', target: '/partner', size: 10 },
        { id: 'careers', label: 'Careers', icon: 'rocket', description: 'Join our team and help build the future of AI.', target: '/careers', size: 10 },
        { id: 'contact', label: 'Contact', icon: 'email', description: 'Get in touch or book a free discovery call.', target: '/#lets-talk', size: 10 },
    ];

    const center = { x: 50, y: 50 };
    const radius = 42; // Expanded radius to accommodate more nodes
    const angleStep = (2 * Math.PI) / mainNodes.length;

    const positionedNodes = mainNodes.map((node, i) => {
        const angle = angleStep * i - Math.PI / 2; // Start from top
        return {
            ...node,
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
        }
    });

    const coreNode: PositionedNode = {
        id: 'core', label: 'Synaptix Studio', icon: 'zap', description: 'We build AI that actually saves you money.', target: '/#about', size: 14, x: center.x, y: center.y
    };
    
    return [coreNode, ...positionedNodes];
  }, []);
  
  const serviceNodes = nodes.filter(n => n.id !== 'core');
  const hoveredNode = hoveredNodeId ? nodes.find(n => n.id === hoveredNodeId) : null;

  const handleNodeClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };
  
  return (
    <div className="relative w-full min-h-[250px] sm:min-h-[320px]">
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        {/* Connection Lines */}
        {serviceNodes.map(node => (
          <line
            key={`line-${node.id}`}
            x1="50%"
            y1="50%"
            x2={`${node.x}%`}
            y2={`${node.y}%`}
            className={`transition-all duration-300 ${hoveredNodeId === node.id || hoveredNodeId === 'core' ? 'stroke-primary' : 'stroke-gray-300 dark:stroke-white/20'}`}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <div
          key={node.id}
          className="absolute flex items-center justify-center cursor-pointer group z-10"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size * 4}px`,
            height: `${node.size * 4}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseEnter={() => setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          onClick={(e) => handleNodeClick(e, node.target)}
        >
          <div className={`absolute inset-0 bg-white/80 dark:bg-black/30 backdrop-blur-sm rounded-full border-2 transition-all duration-300 ${hoveredNodeId === node.id ? 'border-primary animate-glow' : 'border-gray-300 dark:border-white/20 group-hover:border-primary/50'} ${node.id === 'core' ? 'animate-pulse-slow' : ''}`} />
          <Icon name={node.icon} className={`relative z-10 transition-colors duration-300 ${getIconSizeClasses(node.size)} ${hoveredNodeId === node.id ? 'text-primary' : 'text-gray-700 dark:text-white/80'}`} />
        </div>
      ))}

      {/* Tooltip */}
      <Tooltip node={hoveredNode} visible={!!hoveredNodeId} />
    </div>
  );
};

export default InteractiveNetwork;
