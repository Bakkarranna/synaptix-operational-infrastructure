import React, { useState, useEffect } from 'react';

interface ViralityMeterProps {
  score: number;
}

const ViralityMeter: React.FC<ViralityMeterProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const size = 77;
  const strokeWidth = 6.4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    let animationFrameId: number;
    const startTimestamp = performance.now();
    const startScore = displayScore;
    const duration = 1000;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const currentAnimatedScore = Math.floor(startScore + (score - startScore) * progress);
      
      setDisplayScore(currentAnimatedScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);


  const offset = circumference - (displayScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 40) return '#F95C5C'; // Red
    if (s < 75) return '#facc15'; // Yellow
    return '#4ade80'; // Green
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200 dark:text-white/10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: color }}>
          {displayScore}
        </span>
        <span className="text-xs font-semibold text-gray-500 dark:text-white/60">SCORE</span>
      </div>
    </div>
  );
};

export default ViralityMeter;