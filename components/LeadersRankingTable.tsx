import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { LeaderMetrics } from '../types';
import { analytics } from '../services/analytics';

interface LeadersRankingTableProps {
  leaderMetrics: LeaderMetrics[];
  onLeaderClick?: (leaderId: string) => void;
}

export const LeadersRankingTable: React.FC<LeadersRankingTableProps> = ({ leaderMetrics, onLeaderClick }) => {
  const [sortBy, setSortBy] = useState<'engagement' | 'completion' | 'actions'>('engagement');

  const sortedLeaders = useMemo(() => {
    const sorted = [...leaderMetrics].sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagementScore - a.engagementScore;
        case 'completion':
          return b.teamCompletionRate - a.teamCompletionRate;
        case 'actions':
          return b.actionsThisWeek - a.actionsThisWeek;
        default:
          return 0;
      }
    });
    return sorted.slice(0, 10); // Top 10
  }, [leaderMetrics, sortBy]);

  const getEngagementBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Ranking de Líderes
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSortBy('engagement');
                analytics.track('ranking_sort_changed', { sort: 'engagement' });
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                sortBy === 'engagement'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Engajamento
            </button>
            <button
              onClick={() => {
                setSortBy('completion');
                analytics.track('ranking_sort_changed', { sort: 'completion' });
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                sortBy === 'completion'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Conclusão
            </button>
            <button
              onClick={() => {
                setSortBy('actions');
                analytics.track('ranking_sort_changed', { sort: 'actions' });
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                sortBy === 'actions'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Ações
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {sortedLeaders.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="leaderboard" className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum líder encontrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Líder
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Engajamento
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conclusão
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações (7d)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedLeaders.map((leader, index) => (
                <tr 
                  key={leader.leaderId} 
                  onClick={() => onLeaderClick?.(leader.leaderId)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={leader.leaderAvatar}
                        alt={leader.leaderName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {leader.leaderName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {leader.leaderJobTitle}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {leader.teamSize}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEngagementBadgeColor(leader.engagementScore)}`}>
                      {leader.engagementScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {Math.round(leader.teamCompletionRate)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {leader.actionsThisWeek}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
