

import React, { useRef, useState, useEffect } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import StyledText from './StyledText';

// ============================================
// ANIMATED VISUALIZATION COMPONENTS
// ============================================

// Module 1: Voice Agent Waveform Animation
const VoiceWaveform: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const bars = 12;
  return (
    <div className="flex items-end justify-center gap-1 h-16 w-full">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-gradient-to-t from-primary/60 to-primary rounded-full transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
          style={{
            height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 20}%`,
            animationDelay: `${i * 50}ms`,
            animationDuration: isHovered ? '0.3s' : '0.8s',
          }}
        />
      ))}
    </div>
  );
};

// Module 2: Workflow Node Graph Animation
const NodeGraph: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const nodes = [
    { x: 10, y: 50 },
    { x: 35, y: 25 },
    { x: 35, y: 75 },
    { x: 60, y: 50 },
    { x: 85, y: 35 },
    { x: 85, y: 65 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]
  ];

  return (
    <div className="relative w-full h-20">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Connection Lines */}
        {connections.map(([from, to], i) => (
          <line
            key={`line-${i}`}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="currentColor"
            strokeWidth="0.8"
            className={`text-primary/40 ${isHovered ? 'text-primary/80' : ''} transition-colors duration-300`}
          />
        ))}
        {/* Animated Data Pulse */}
        {isHovered && connections.map(([from, to], i) => (
          <circle
            key={`pulse-${i}`}
            r="2"
            fill="currentColor"
            className="text-primary"
          >
            <animateMotion
              dur={`${0.8 + i * 0.1}s`}
              repeatCount="indefinite"
              path={`M${nodes[from].x},${nodes[from].y} L${nodes[to].x},${nodes[to].y}`}
            />
          </circle>
        ))}
        {/* Nodes */}
        {nodes.map((node, i) => (
          <circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r={isHovered ? 5 : 4}
            className={`fill-primary/80 ${isHovered ? 'fill-primary' : ''} transition-all duration-300`}
          />
        ))}
      </svg>
    </div>
  );
};

// Module 3: Live Dashboard Counter
const DashboardCounter: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [revenue, setRevenue] = useState(4127500);
  const [hours, setHours] = useState(142850);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 500));
      setHours(prev => prev + Math.floor(Math.random() * 5));
    }, isHovered ? 200 : 2000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const bars = [65, 78, 45, 89, 92, 70, 85];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Mini Bar Chart */}
      <div className="flex items-end justify-between gap-1 h-10">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`flex-1 bg-gradient-to-t from-primary/40 to-primary rounded-t transition-all duration-500 ${isHovered ? 'from-primary/60 to-primary' : ''}`}
            style={{
              height: `${height}%`,
              transitionDelay: `${i * 30}ms`
            }}
          />
        ))}
      </div>
      {/* Live Counter */}
      <div className="flex justify-between text-xs font-mono">
        <span className="text-primary">${(revenue / 1000000).toFixed(2)}M</span>
        <span className="text-white/60">{hours.toLocaleString()} hrs</span>
      </div>
    </div>
  );
};

// ============================================
// BENTO CARD COMPONENT
// ============================================

interface BentoCardProps {
  title: string;
  subtitle: string;
  features: string[];
  visualization: 'waveform' | 'nodes' | 'dashboard';
  className?: string;
  index: number;
}

const BentoCard: React.FC<BentoCardProps> = ({ title, subtitle, features, visualization, className = '', index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const [isHovered, setIsHovered] = useState(false);

  const renderVisualization = () => {
    switch (visualization) {
      case 'waveform':
        return <VoiceWaveform isHovered={isHovered} />;
      case 'nodes':
        return <NodeGraph isHovered={isHovered} />;
      case 'dashboard':
        return <DashboardCounter isHovered={isHovered} />;
    }
  };

  return (
    <article
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden
        bg-black/40 dark:bg-black/60 backdrop-blur-xl
        border border-white/10 hover:border-primary/40
        rounded-2xl p-6
        transition-all duration-500 ease-out
        hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${className}
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Glow Effect on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* Module Label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-mono text-primary/80 uppercase tracking-widest">{title}</span>
        <div className={`h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent transition-all duration-300 ${isHovered ? 'from-primary/60' : ''}`} />
      </div>

      {/* Subtitle */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 font-montserrat">
        {subtitle}
      </h3>

      {/* Visualization Container */}
      <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/5">
        {renderVisualization()}
      </div>

      {/* Features List */}
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
            <span className="text-primary mt-0.5 text-xs">▸</span>
            <StyledText text={feature} />
          </li>
        ))}
      </ul>

      {/* Bottom Accent Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
    </article>
  );
};

// ============================================
// MAIN SERVICES SECTION
// ============================================

const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useOnScreen(sectionRef, '-100px');

  const modules = [
    {
      title: 'Module 01',
      subtitle: '24/7 Lead Capture',
      visualization: 'waveform' as const,
      features: [
        '**AI Voice Agents** qualify leads around the clock',
        '**Omnichannel Chatbots** across Web, WhatsApp & Instagram',
        '**Real-time CRM Sync** — every lead logged instantly',
        '**Powered by Appointment_Agent** for instant scheduling',
        '**Integrated with HubSpot_Chatbot** — AI-driven conversations',
      ],
    },
    {
      title: 'Module 02',
      subtitle: 'Workflow Orchestration',
      visualization: 'nodes' as const,
      features: [
        '**Powered by Wise_Invoices** for automated billing',
        '**Hail_Damage_Appointments** for insurance claims',
        '**Master_Agent** orchestration layer',
        '**Telegram_Task_Creation** automation workflow',
        '**Meeting_Reminder_Dynamic** smart scheduling',
      ],
    },
    {
      title: 'Module 03',
      subtitle: 'Intelligence Layer',
      visualization: 'dashboard' as const,
      features: [
        '**Roofbot_Webhook_v2** for instant responses',
        '**Live System Monitoring** with real-time metrics',
        '**Autonomous Decision Engine** — AI-driven choices',
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-20 sm:py-28 relative overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ease-out ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-xs font-mono text-primary/80 uppercase tracking-[0.3em] mb-3">System Architecture</p>
          <h2 id="services-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold font-montserrat text-white">
            The Synaptix Loop
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/60 max-w-2xl mx-auto">
            Three synchronized modules that form the <span className="text-primary font-semibold">autonomous core</span> of your operations.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Module 1: Capture - Tall on mobile, standard on desktop */}
          <BentoCard
            {...modules[0]}
            index={0}
            className="lg:row-span-1"
          />

          {/* Module 2: Process - Standard */}
          <BentoCard
            {...modules[1]}
            index={1}
            className="lg:row-span-1"
          />

          {/* Module 3: Intelligence - Full width on tablet, standard on desktop */}
          <BentoCard
            {...modules[2]}
            index={2}
            className="md:col-span-2 lg:col-span-1"
          />
        </div>

        {/* Bottom CTA Hint */}
        <div className={`text-center mt-12 transition-all duration-700 delay-500 ${isSectionVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-white/40 font-mono">
            ↓ See how it all connects ↓
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;