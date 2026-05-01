import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useLazyLoad } from '../hooks/useLazyLoad';

const TrustedBySection: React.FC = () => {
    const [sectionRef, isVisible] = useLazyLoad({ threshold: 0.2, rootMargin: '200px' });
    const [animateIn, setAnimateIn] = useState(false);
    const [progressValues, setProgressValues] = useState({ revenue: 0, hours: 0, uptime: 0 });
    const [animateProgress, setAnimateProgress] = useState(false);

    const liveMetrics = [
        {
            icon: 'chart-bar' as const,
            value: '$4M+',
            label: 'Revenue Processed',
            color: 'text-green-500',
            trend: '+23.5%',
            progressColor: 'bg-green-500'
        },
        {
            icon: 'zap' as const,
            value: '140,000+',
            label: 'Hours Saved',
            color: 'text-blue-500',
            trend: '+18.2%',
            progressColor: 'bg-blue-500'
        },
        {
            icon: 'check-circle' as const,
            value: '99.99%',
            label: 'System Uptime',
            color: 'text-primary',
            trend: '+0.003%',
            progressColor: 'bg-primary'
        }
    ];

    // Trigger entrance animation when section becomes visible
    useEffect(() => {
        if (isVisible) {
            setTimeout(() => setAnimateIn(true), 100);
        }
    }, [isVisible]);

    // Animate progress bars when visible
    useEffect(() => {
        if (isVisible && animateIn && !animateProgress) {
            setAnimateProgress(true);
            const duration = 2000;
            const steps = 60;
            let step = 0;

            const animate = () => {
                if (step < steps) {
                    const progress = step / steps;
                    setProgressValues({
                        revenue: Math.floor(progress * 85 + 15),
                        hours: Math.floor(progress * 92 + 8),
                        uptime: Math.floor(progress * 99.97 + 0.03)
                    });
                    step++;
                    setTimeout(animate, duration / steps);
                }
            };
            animate();
        }
    }, [isVisible, animateIn, animateProgress]);

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="trusted-by"
            className="py-16 sm:py-20 bg-white/5 dark:bg-black/5"
        >
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:bg-clip-text dark:animate-shimmer [background-size:200%_auto] mb-4">
                            Operational Performance
                        </h2>
                        <p className="text-gray-600 dark:text-white/70 text-base max-w-2xl mx-auto">
                            Real-time infrastructure metrics across all deployed systems
                        </p>
                    </div>

                    {/* Main Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {liveMetrics.map((metric, index) => (
                            <div
                                key={metric.label}
                                className={`bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                {/* Metric Icon & Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-2xl">
                                        <Icon name={metric.icon} className={`h-10 w-10 ${metric.color}`} />
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Live</span>
                                    </div>
                                </div>

                                {/* Metric Value */}
                                <div className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 ${metric.color}`}>
                                    {metric.value}
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-white/70 mb-2">
                                        <span className="font-semibold uppercase tracking-wider">Performance</span>
                                        <span className={`font-bold ${metric.color}`}>{metric.trend}</span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${metric.progressColor} transition-all duration-1000 ease-out`}
                                            style={{ width: `${progressValues.uptime}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Metric Label */}
                                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-white/80 uppercase tracking-wider">
                                            {metric.label}
                                        </span>
                                        <Icon name="arrow-right" className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-3">
                                        <div className="text-gray-500 dark:text-white/50 mb-1 uppercase tracking-wider">Updated</div>
                                        <div className="text-gray-900 dark:text-white font-semibold">Just now</div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-3">
                                        <div className="text-gray-500 dark:text-white/50 mb-1 uppercase tracking-wider">Status</div>
                                        <div className="text-gray-900 dark:text-white font-semibold">Optimal</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live Status Bar */}
                    <div className={`mt-10 bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Network</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">All nodes online</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Response Time</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">12ms avg</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Processing</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">Real-time active</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Data Stream</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">47 connected</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBySection;