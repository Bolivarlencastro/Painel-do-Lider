import React, { useMemo } from 'react';
import { Icon } from './Icon';
import { LeaderMetrics, LeaderActionItem } from '../types';
import { analytics } from '../services/analytics';

interface LeadersActionTableProps {
  leaderMetrics: LeaderMetrics[];
  onLeaderClick?: (leaderId: string) => void;
}

export const LeadersActionTable: React.FC<LeadersActionTableProps> = ({ leaderMetrics, onLeaderClick }) => {
  const actionItems = useMemo((): LeaderActionItem[] => {
    const items: LeaderActionItem[] = [];

    leaderMetrics.forEach(leader => {
      const daysSinceAccess = Math.floor((Date.now() - new Date(leader.lastAccess).getTime()) / (1000 * 60 * 60 * 24));
      
      // Líder inativo
      if (daysSinceAccess > 7) {
        items.push({
          leaderId: leader.leaderId,
          leaderName: leader.leaderName,
          leaderAvatar: leader.leaderAvatar,
          issue: 'Inativo',
          severity: 'high',
          description: `Sem acesso há ${daysSinceAccess} dias`
        });
      } else if (daysSinceAccess > 3) {
        items.push({
          leaderId: leader.leaderId,
          leaderName: leader.leaderName,
          leaderAvatar: leader.leaderAvatar,
          issue: 'Baixa Frequência',
          severity: 'medium',
          description: `Último acesso há ${daysSinceAccess} dias`
        });
      }

      // Baixa conclusão da equipe
      if (leader.teamCompletionRate < 30) {
        items.push({
          leaderId: leader.leaderId,
          leaderName: leader.leaderName,
          leaderAvatar: leader.leaderAvatar,
          issue: 'Equipe com Baixa Conclusão',
          severity: 'high',
          description: `Apenas ${Math.round(leader.teamCompletionRate)}% de conclusão`
        });
      }

      // Muitas pendências
      if (leader.pendingTasks > 20) {
        items.push({
          leaderId: leader.leaderId,
          leaderName: leader.leaderName,
          leaderAvatar: leader.leaderAvatar,
          issue: 'Muitas Pendências',
          severity: 'medium',
          description: `${leader.pendingTasks} tarefas pendentes na equipe`
        });
      }

      // Baixo engajamento
      if (leader.engagementScore < 50) {
        items.push({
          leaderId: leader.leaderId,
          leaderName: leader.leaderName,
          leaderAvatar: leader.leaderAvatar,
          issue: 'Baixo Engajamento',
          severity: leader.engagementScore < 30 ? 'high' : 'medium',
          description: `Score de engajamento: ${leader.engagementScore}`
        });
      }
    });

    // Sort by severity
    return items.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }).slice(0, 8); // Top 8 issues
  }, [leaderMetrics]);

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Ações Recomendadas
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {actionItems.filter(i => i.severity === 'high').length} críticas
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {actionItems.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="check_circle" className="text-4xl text-green-500 mx-auto mb-3" />
            <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
              Tudo em ordem!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Não há ações críticas no momento
            </p>
          </div>
        ) : (
          actionItems.map((item, index) => (
            <div
              key={`${item.leaderId}-${index}`}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => {
                analytics.track('action_item_clicked', { leaderId: item.leaderId, issue: item.issue });
                onLeaderClick?.(item.leaderId);
              }}
            >
              <div className="flex items-start gap-3">
                <Icon
                  name={getSeverityIcon(item.severity)}
                  className={`text-xl mt-0.5 ${
                    item.severity === 'high'
                      ? 'text-red-600 dark:text-red-400'
                      : item.severity === 'medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getSeverityColor(item.severity)}`}>
                      {item.issue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={item.leaderAvatar}
                      alt={item.leaderName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.leaderName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-gray-400 dark:text-gray-600 text-xl" />
              </div>
            </div>
          ))
        )}
      </div>

      {actionItems.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => analytics.track('view_all_actions_clicked')}
            className="w-full text-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Ver todas as ações recomendadas
          </button>
        </div>
      )}
    </div>
  );
};
