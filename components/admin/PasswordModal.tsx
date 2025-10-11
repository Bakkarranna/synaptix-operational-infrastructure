import React, { useState, useEffect } from 'react';
import { Icon } from '../Icon';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// --- DOCUMENTATION ---
// To change the password, modify the value of the CORRECT_PASSWORD constant below.
// This is not a secure method for a production application with multiple users,
// but it fulfills the requirement for a simple, single-user, backend-free authentication system.
const CORRECT_PASSWORD = 'Synaptix@0';

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const verifyAndSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      onSuccess();
      setPassword('');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndSubmit();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in-fast" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-brand-dark border border-white/10 rounded-xl shadow-2xl w-full max-w-sm m-4 relative animate-slide-in-up-fast p-8 text-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <Icon name="zap" className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Admin Access</h2>
        <p className="text-white/60 mb-6">Enter the password to manage blog content.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                verifyAndSubmit();
              }
            }}
            placeholder="Password"
            className="w-full text-center px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-primary focus:border-transparent transition"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button type="submit" className="mt-4 w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
