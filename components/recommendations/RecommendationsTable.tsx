import React, { useState, useMemo } from 'react';
import { Recommendation, TeamMember, Course, Trail, Pulse, MemberStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { Icon } from '../Icon';
import { ProgressBar } from '../ProgressBar';

interface RecommendationsTableProps {
  recommendations: Recommendation[];
  allMembers: TeamMember[];
  allCourses: Course[];
  allTrails: Trail[];
  allPulses: Pulse[];
  onRowClick: (recommendation: Recommendation) => void;
}

// SIMULATION HELPERS
const getIndividualProgressOnContent = (member: TeamMember, contentId: string, contentType: 'course' | 'trail' | 'pulse'): number => {
    if (contentType === 'pulse' && member.pulseIds.includes(contentId)) return 100;
    if (contentType === 'pulse') return 0;
    
    if (member.status === MemberStatus.Completed) return 100;
    if (member.status === MemberStatus.NotStarted || member.status === MemberStatus.Empty) return 0;
    const progressSeed = member.id.charCodeAt(0) + contentId.charCodeAt(1) + contentId.length;
    if (member.status === MemberStatus.Late) return (progressSeed % 40) + 10;
    return (progressSeed % 50) + 45;
};

const getMemberProgressOnRecommendation = (member: TeamMember, recommendation: Recommendation): number => {
    const relevantContent = recommendation.content.filter(c => ['course', 'trail', 'pulse'].includes(c.type));
    if (relevantContent.length === 0) return 100;

    const totalProgress = relevantContent.reduce((acc, contentRef) => {
        return acc + getIndividualProgressOnContent(member, contentRef.id, contentRef.type as any);
    }, 0);
    
    return Math.round(totalProgress / relevantContent.length);
};
// END SIMULATION HELPERS


type RecommendationWithStats = Recommendation & {
  viewedProgress: number;
  teamProgress: number;
};

// FIX: Constrained sort keys to prevent type errors during comparison.
type SortableKeys = 'title' | 'status' | 'viewedProgress' | 'teamProgress';
type LocalSortConfig = { key: SortableKeys, direction: 'ascending' | 'descending' };

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortableKeys;
  sortConfig: LocalSortConfig | null;
  requestSort: (key: SortableKeys) => void;
  className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className = "" }) => {
  const isSorted = sortConfig?.key === sortKey;
  const iconName = isSorted ? (sortConfig?.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more';

  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none ${className}`}
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <Icon name={iconName} size="sm" className={isSorted ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'} />
      </div>
    </th>
  );
};

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({ recommendations, allMembers, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'title', direction: 'ascending' });

  const recommendationsWithStats = useMemo(() => {
    return recommendations.map(rec => {
      const assignedMembers = allMembers.filter(m => rec.memberIds.includes(m.id));
      const viewedProgress = rec.memberIds.length > 0 ? Math.round((rec.viewedByMemberIds.length / rec.memberIds.length) * 100) : 0;
      
      let teamProgress = 0;
      if (assignedMembers.length > 0) {
        const totalProgress = assignedMembers.reduce((acc, member) => {
          return acc + getMemberProgressOnRecommendation(member, rec);
        }, 0);
        teamProgress = Math.round(totalProgress / assignedMembers.length);
      }
      
      return { ...rec, viewedProgress, teamProgress };
    });
  }, [recommendations, allMembers]);

  const sortedRecommendations = useMemo(() => {
    let sortableItems = [...recommendationsWithStats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        if (a[key] < b[key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [recommendationsWithStats, sortConfig]);
  
  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700/80 flex flex-col h-full">
      <div className="overflow-auto flex-1 no-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-white dark:bg-gray-800">
            <tr>
              <SortableHeader label="Título" sortKey="title" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Liderados</th>
              <SortableHeader label="Visualização" sortKey="viewedProgress" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Progresso Geral" sortKey="teamProgress" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {sortedRecommendations.map((rec) => (
              <tr key={rec.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer h-20" onClick={() => onRowClick(rec)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate" title={rec.title}>{rec.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{rec.memberIds.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{rec.viewedByMemberIds.length}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center font-medium">
                    {rec.teamProgress}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={rec.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition" onClick={(e) => e.stopPropagation()} title="Lembrar equipe"><Icon name="campaign" size="sm" /></button>
                      <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition" onClick={(e) => e.stopPropagation()} title="Editar"><Icon name="edit" size="sm" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 shrink-0 border-t border-gray-200 dark:border-gray-700">
        <div>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{sortedRecommendations.length}</span> resultados
        </div>
        <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" disabled><Icon name="first_page" size="sm"/></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" disabled><Icon name="navigate_before" size="sm"/></button>
            <span className="px-2">Página 1 de 1</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" disabled><Icon name="navigate_next" size="sm"/></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" disabled><Icon name="last_page" size="sm"/></button>
        </div>
      </div>
    </div>
  );
};