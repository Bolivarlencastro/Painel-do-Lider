
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TeamMember } from '../types';
import { Icon } from './Icon';

interface ImpersonationSelectorProps {
  leaders: TeamMember[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

// Group members by job title
const groupMembers = (members: TeamMember[]) => {
  const grouped: Record<string, TeamMember[]> = {};
  members.forEach(member => {
    if (!grouped[member.jobTitle]) {
      grouped[member.jobTitle] = [];
    }
    grouped[member.jobTitle].push(member);
  });
  return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
};

export const ImpersonationSelector: React.FC<ImpersonationSelectorProps> = ({ leaders, selectedIds, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const selectedLeaders = useMemo(() => leaders.filter(m => selectedIds.includes(m.id)), [leaders, selectedIds]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const filteredLeaders = useMemo(() =>
    leaders.filter(leader =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [leaders, searchTerm]
  );
  
  const groupedAndFilteredLeaders = useMemo(() => groupMembers(filteredLeaders), [filteredLeaders]);

  const handleGroupToggle = (leadersInGroup: TeamMember[]) => {
    const groupIds = leadersInGroup.map(m => m.id);
    const areAllSelected = groupIds.every(id => selectedIds.includes(id));
    if (areAllSelected) {
      onSelectionChange(selectedIds.filter(id => !groupIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedIds, ...groupIds])]);
    }
  };

  const renderTriggerContent = () => {
    if (selectedLeaders.length === 0) {
      return (
        <>
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <Icon name="groups" className="text-gray-600 dark:text-gray-300" />
          </div>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Visão Geral</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Selecione um líder ou área</span>
          </div>
          <Icon name="expand_more" className="hidden md:block text-gray-500 dark:text-gray-400" />
        </>
      );
    }
    if (selectedLeaders.length === 1) {
      const leader = selectedLeaders[0];
      return (
        <>
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={leader.avatarUrl}
            alt={leader.name}
          />
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-28">{leader.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-28">{leader.jobTitle}</span>
          </div>
          <Icon name="expand_more" className="hidden md:block text-gray-500 dark:text-gray-400" />
        </>
      );
    }
    return (
      <>
        <div className="flex -space-x-3">
          {selectedLeaders.slice(0, 3).map(m => 
            <img key={m.id} className="h-8 w-8 rounded-full object-cover border-2 border-white dark:border-gray-800" src={m.avatarUrl} alt={m.name} />
          )}
        </div>
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedLeaders.length} Líderes</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Visão consolidada</span>
        </div>
        <Icon name="expand_more" className="hidden md:block text-gray-500 dark:text-gray-400" />
      </>
    );
  };
  
  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full"
      >
        {renderTriggerContent()}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-gray-700 animate-fadeInUp">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar líder ou área..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-10 pr-3 bg-gray-100 dark:bg-gray-700/50 border-none rounded-md focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {groupedAndFilteredLeaders.map(([jobTitle, leadersInGroup]) => {
                const groupIds = leadersInGroup.map(m => m.id);
                const selectedInGroupCount = groupIds.filter(id => selectedIds.includes(id)).length;
                const isAllSelected = selectedInGroupCount === groupIds.length;
                const isPartiallySelected = selectedInGroupCount > 0 && !isAllSelected;

                return (
                    <li key={jobTitle}>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors w-full">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-purple-600 focus:ring-purple-500"
                                checked={isAllSelected}
                                ref={input => { if (input) input.indeterminate = isPartiallySelected; }}
                                onChange={() => handleGroupToggle(leadersInGroup)}
                            />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{jobTitle}</span>
                        </label>
                        <ul className="pl-6">
                            {leadersInGroup.map(leader => (
                                <li key={leader.id}>
                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-purple-600 focus:ring-purple-500"
                                            checked={selectedIds.includes(leader.id)}
                                            onChange={() => onSelectionChange(
                                                selectedIds.includes(leader.id) 
                                                ? selectedIds.filter(id => id !== leader.id) 
                                                : [...selectedIds, leader.id]
                                            )}
                                        />
                                        <img src={leader.avatarUrl} alt={leader.name} className="w-7 h-7 rounded-full" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{leader.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </li>
                );
            })}
          </ul>
           <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => onSelectionChange([])} 
                    className="w-full text-center px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/40 rounded-md"
                >
                    Limpar Seleção
                </button>
           </div>
        </div>
      )}
       <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp { animation: fadeInUp 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};
