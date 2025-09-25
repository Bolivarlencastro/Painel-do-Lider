import React from 'react';
import { MemberRankingItem } from '../types';
import { Icon } from './Icon';

const MemberRankingList: React.FC<{ items: MemberRankingItem[] }> = ({ items }) => (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700/60">
        {items.slice(0, 5).map(item => (
            <li key={item.id} className="p-3 min-h-[6rem] flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-lg transition-colors">
                <span className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center text-sm flex-shrink-0">{item.rank}</span>
                <img src={item.avatarUrl} alt={item.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.jobTitle}</p>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{item.points.toLocaleString()} pts</span>
                </div>
            </li>
        ))}
    </ul>
);

interface GamificationRankingProps {
    memberRanking: MemberRankingItem[];
    isTeamEmpty: boolean;
}

export const GamificationRanking: React.FC<GamificationRankingProps> = ({ memberRanking, isTeamEmpty }) => {

    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Ranking da Equipe
                    </h2>
                     <div className="relative group">
                        <Icon name="info" size="sm" className="text-gray-400 dark:text-gray-500 cursor-pointer" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-50 pointer-events-none">
                            Este ranking mostra a classificação dos membros da sua equipe. Para ver o ranking geral da empresa, acesse o item "Ranking" no menu lateral.
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-2">
                {memberRanking.length > 0 ? (
                    <MemberRankingList items={memberRanking} />
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                        <p>{isTeamEmpty ? "Não há liderados para exibir no ranking." : "O ranking da equipe ainda não foi gerado."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};