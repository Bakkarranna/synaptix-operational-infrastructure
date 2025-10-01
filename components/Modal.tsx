import React from 'react';
import { CloseIcon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  noPadding?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = '2xl', noPadding = false }) => {
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl sm:max-w-6xl lg:max-w-7xl',
  };

  return (
    <div 
      className={`fixed inset-0 bg-gray-900/80 dark:bg-black/80 z-50 flex justify-center items-start overflow-y-auto p-2 sm:p-4 pt-4 sm:pt-8 md:items-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div 
        className={`bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl w-full ${sizeClasses[size]} relative flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'} animate-glow my-4 sm:my-8 mx-auto`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-800 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-white/10 dark:hover:bg-black/10"
          aria-label="Close modal"
          tabIndex={isOpen ? 0 : -1}
        >
          <CloseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className={noPadding ? '' : 'p-4 sm:p-6 md:p-8 lg:p-12'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;