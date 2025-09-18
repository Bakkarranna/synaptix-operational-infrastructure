
import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <div className="animate-pulse">
        <img src="https://iili.io/Fkb6akl.png" alt="Synaptix Studio Logo" className="h-20 w-auto" />
      </div>
    </div>
  );
};

export default Preloader;
