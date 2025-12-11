import React, { useState, useRef, useEffect } from 'react';
import { Persona } from '../types';
import { Icon } from './Icon';
import { analytics } from '../services/analytics';

interface PersonaSelectorProps {
  currentPersona: Persona;
  personas: Persona[];
  onPersonaChange: (persona: Persona) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  currentPersona,
  personas,
  onPersonaChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePersonaClick = (persona: Persona) => {
    analytics.track('persona_changed', {
      from: currentPersona.id,
      to: persona.id,
      from_role: currentPersona.role,
      to_role: persona.role,
    });
    onPersonaChange(persona);
    setIsOpen(false);
  };

  const getRoleBadgeColor = (role: Persona['role']) => {
    switch (role) {
      case 'leader':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'director':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const getRoleLabel = (role: Persona['role']) => {
    switch (role) {
      case 'leader':
        return 'Líder';
      case 'manager':
        return 'Gerente';
      case 'director':
        return 'Diretor';
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <img
          className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-500"
          src={currentPersona.avatarUrl}
          alt={currentPersona.name}
        />
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {currentPersona.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentPersona.jobTitle}
          </span>
        </div>
        <Icon name="expand_more" className="hidden md:block text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-gray-700 animate-fadeInUp">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Icon name="swap_horiz" size="sm" />
              <span className="text-sm font-semibold">Trocar Perfil (Protótipo)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Simule diferentes níveis de hierarquia
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {personas.map((persona) => {
              const isActive = persona.id === currentPersona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaClick(persona)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={persona.avatarUrl}
                    alt={persona.name}
                    className={`h-10 w-10 rounded-full object-cover ${
                      isActive ? 'ring-2 ring-purple-500' : ''
                    }`}
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {persona.name}
                      </span>
                      {isActive && (
                        <Icon name="check_circle" className="text-purple-600 dark:text-purple-400 text-base" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {persona.jobTitle}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                          persona.role
                        )}`}
                      >
                        {getRoleLabel(persona.role)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {persona.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Cada perfil mostra uma visão diferente do painel
            </p>
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
