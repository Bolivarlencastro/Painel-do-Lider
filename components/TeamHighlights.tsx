import React from 'react';
import { Icon } from './Icon';
import { TEAM_MEMBERS_DATA } from '../constants';
import { TeamMember } from '../types';

interface Highlight {
    icon: string;
    iconBgColor: string;
    title: string;
    memberName: string;
    detail: string;
    member: TeamMember;
}

// Mock logic to get highlights
const getTeamHighlights = (): Highlight[] => {
    const highlights: Highlight[] = [];

    // 1. Maior Avanço na Semana (mocked with highest overallProgress)
    const topProgress = [...TEAM_MEMBERS_DATA].sort((a, b) => b.overallProgress - a.overallProgress)[0];
    if (topProgress) {
        highlights.push({
            icon: 'rocket_launch',
            iconBgColor: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
            title: 'Maior Avanço na Semana',
            memberName: topProgress.name,
            detail: `Atingiu ${topProgress.overallProgress}% de progresso`,
            member: topProgress,
        });
    }

    // 2. Top Conclusões (Mês)
    const topCompletions = [...TEAM_MEMBERS_DATA].sort((a, b) => b.coursesCompleted - a.coursesCompleted)[0];
    if (topCompletions && topCompletions.coursesCompleted > 0) {
        highlights.push({
            icon: 'workspace_premium',
            iconBgColor: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
            title: 'Top Conclusões no Mês',
            memberName: topCompletions.name,
            detail: `Finalizou ${topCompletions.coursesCompleted} cursos`,
            member: topCompletions,
        });
    }

    // 3. Mais Engajado (Semana) (mocked with most recent access)
    const mostEngaged = [...TEAM_MEMBERS_DATA].sort((a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime())[0];
     if (mostEngaged) {
        highlights.push({
            icon: 'local_fire_department',
            iconBgColor: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
            title: 'Mais Engajado na Semana',
            memberName: mostEngaged.name,
            detail: 'Manteve a frequência de estudos',
            member: mostEngaged,
        });
    }
    
    // Ensure we have at least 3 unique members if possible
    const uniqueMembers = new Map<string, Highlight>();
    highlights.forEach(h => {
        if (!uniqueMembers.has(h.member.id)) {
            uniqueMembers.set(h.member.id, h);
        }
    });

    return Array.from(uniqueMembers.values()).slice(0, 3);
};


export const TeamHighlights: React.FC<{ onViewDetails: (member: TeamMember) => void, onViewMoreStats: () => void }> = ({ onViewDetails, onViewMoreStats }) => {
    const highlights = getTeamHighlights();

    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Destaques da Equipe</h2>
                 <button 
                    onClick={onViewMoreStats}
                    className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                    Ver mais estatísticas
                </button>
            </header>
            <div className="flex-1 overflow-y-auto p-2">
                 <ul className="divide-y divide-gray-200 dark:divide-gray-700/60">
                    {highlights.map((item, index) => (
                        <li key={index} className="p-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-lg transition-colors cursor-pointer" onClick={() => onViewDetails(item.member)}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${item.iconBgColor}`}>
                                <Icon name={item.icon} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.title}</p>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{item.memberName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.detail}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
