
import React from 'react';

const SkeletonLoader: React.FC = () => {
  const shimmerClass = "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent";

  const SkeletonBar: React.FC<{ width: string; height?: string }> = ({ width, height = 'h-4' }) => (
    <div className={`relative overflow-hidden rounded bg-white/10 ${width} ${height}`}>
      <div className={shimmerClass} />
    </div>
  );

  return (
    <div className="text-left animate-fade-in mt-12 pt-8 border-t border-white/20 space-y-6" aria-live="polite" aria-busy="true">
      {/* Title */}
      <SkeletonBar width="w-3/4" height="h-8" />
      
      {/* Paragraphs */}
      <div className="space-y-3">
        <SkeletonBar width="w-full" />
        <SkeletonBar width="w-5/6" />
        <SkeletonBar width="w-full" />
      </div>
      
      {/* Subheading */}
      <SkeletonBar width="w-1/2" height="h-6" />
      
      {/* Paragraphs */}
      <div className="space-y-3">
        <SkeletonBar width="w-full" />
        <SkeletonBar width="w-11/12" />
      </div>

      <div className="space-y-3">
        <SkeletonBar width="w-full" />
        <SkeletonBar width="w-10/12" />
      </div>
    </div>
  );
};

export default SkeletonLoader;
