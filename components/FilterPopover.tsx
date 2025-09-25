import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface FilterPopoverProps {
  label: string;
  icon: string;
  children: (close: () => void) => React.ReactNode;
  activeCount: number;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({ label, icon, children, activeCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => setIsOpen(!isOpen);
  const closePopover = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={togglePopover}
        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors
        ${activeCount > 0 
          ? 'bg-purple-50 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' 
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Icon name={icon} size="sm" className="text-purple-500 dark:text-purple-400" />
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="ml-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-purple-600 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-20 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="p-4">
            {children(closePopover)}
          </div>
        </div>
      )}
    </div>
  );
};
