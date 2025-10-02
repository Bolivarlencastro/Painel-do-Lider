

import React, { useState } from 'react';
import { Icon } from './Icon';

interface DebugPanelProps {
    activeCases: Set<string>;
    toggleCase: (caseName: string) => void;
}

const edgeCases = [
    { id: 'NO_DATA', label: 'Sem Dados (Equipe Vazia)' },
    { id: 'LONG_NAMES', label: 'Nomes/Títulos Longos' },
    { id: 'ALL_INACTIVE', label: 'Todos Liderados Inativos' },
    { id: 'ALL_OVERDUE', label: 'Todos Cursos Obrigatórios Atrasados' },
    { id: 'NO_MANDATORY', label: 'Sem Cursos Obrigatórios' },
    { id: 'ZERO_PROGRESS', label: 'Progresso Zerado na Equipe' },
    { id: 'EMPTY_ACTION_CARDS', label: 'Cards de Ação Vazios (Equipe Ativa)' },
    { id: 'MEMBER_NO_CONTENT', label: 'Liderado sem Conteúdo' },
    { id: 'DISABLE_RANKING', label: 'Desativar Módulo Ranking' },
    { id: 'DISABLE_MANDATORY', label: 'Desativar Módulo Normativas' },
    { id: 'ENABLE_KPI_COMPARISON', label: 'Habilitar Comparação (KPIs)' },
    { id: 'IMPERSONATE_LEADER', label: 'Personificar Líder (J. Silva)' },
];

const Switch: React.FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-10 h-6 rounded-full transition ${checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
    </label>
);

export const DebugPanel: React.FC<DebugPanelProps> = ({ activeCases, toggleCase }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-0 right-0 z-[100] w-24 h-24 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute bottom-4 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-110"
                    aria-label="Open debug panel"
                >
                    <Icon name="science" size="md" />
                </button>
            </div>
            {isOpen && (
                <div className="fixed bottom-20 right-4 z-[100] w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeInUp">
                    <header className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Painel de Corner Cases</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                            <Icon name="close" size="sm" />
                        </button>
                    </header>
                    <div className="p-2 space-y-1">
                        {edgeCases.map(ec => (
                            <Switch
                                key={ec.id}
                                label={ec.label}
                                checked={activeCases.has(ec.id)}
                                onChange={() => toggleCase(ec.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.2s ease-out forwards; }
            `}</style>
        </>
    );
};