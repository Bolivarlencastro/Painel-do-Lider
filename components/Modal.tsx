
import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  removeMainPadding?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, removeMainPadding = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
    }
  }

  if (!isOpen) return null;
  
  const mainClasses = removeMainPadding ? "overflow-y-auto" : "p-4 sm:p-6 overflow-y-auto";

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700/60 animate-slideUp"
      >
        <header className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="truncate pr-4">{typeof title === 'string' ? <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h2> : title}</div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <Icon name="close" />
          </button>
        </header>
        <main className={mainClasses}>
          {children}
        </main>
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
