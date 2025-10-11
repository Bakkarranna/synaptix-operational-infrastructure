
import React, { useEffect } from 'react';
import { iconPreloadService } from '../services/iconPreload';

const Preloader: React.FC = () => {
  useEffect(() => {
    // Start preloading all critical icons immediately when preloader mounts
    iconPreloadService.preloadCriticalIcons().catch(error => {
      console.warn('⚠️ Some icons failed to preload during preloader phase:', error);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <div className="animate-pulse">
        <img src="https://iili.io/Fkb6akl.png" alt="Synaptix Studio Logo" className="h-20 w-auto" />
      </div>
    </div>
  );
};

export default Preloader;
