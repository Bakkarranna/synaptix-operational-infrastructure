import React from 'react';
import { CloseIcon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = '2xl' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/80 dark:bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`bg-gray-100 dark:bg-brand-dark border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl w-full ${sizeClasses[size]} relative animate-slide-in-up-fast flex flex-col max-h-[90vh]`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-800 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;