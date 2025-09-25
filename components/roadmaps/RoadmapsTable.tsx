import React, { useState, useMemo } from 'react';
import { DevelopmentPlan, TeamMember, Course, Trail, Pulse, MemberStatus, PlanStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { Icon } from '../Icon';
import { ProgressBar } from '../ProgressBar';

interface PlansTableProps {
  plans: DevelopmentPlan[];
  allMembers: TeamMember[];
  allCourses: Course[];
  allTrails: Trail[];
  allPulses: Pulse[];
  onRowClick: (plan: DevelopmentPlan) => void;
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

const getMemberProgressOnPlan = (member: TeamMember, plan: DevelopmentPlan): number => {
    const relevantContent = plan.content.filter(c => ['course', 'trail', 'pulse'].includes(c.type));
    if (relevantContent.length === 0) return 100;

    const totalProgress = relevantContent.reduce((acc, contentRef) => {
        return acc + getIndividualProgressOnContent(member, contentRef.id, contentRef.type as any);
    }, 0);
    
    return Math.round(totalProgress / relevantContent.length);
};
// END SIMULATION HELPERS


type PlanWithStats = DevelopmentPlan & {
  viewedCount: number;
  teamProgress: number;
};

// FIX: Constrained sort keys to prevent type errors during comparison.
type SortableKeys = 'title' | 'status' | 'dueDate' | 'viewedCount' | 'teamProgress';
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

export const PlansTable: React.FC<PlansTableProps> = ({ plans, allMembers, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'title', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');

  const plansWithStats = useMemo(() => {
    return plans.map(plan => {
      const assignedMembers = allMembers.filter(m => plan.memberIds.includes(m.id));
      
      let teamProgress = 0;
      if (assignedMembers.length > 0) {
        const totalProgress = assignedMembers.reduce((acc, member) => {
          return acc + getMemberProgressOnPlan(member, plan);
        }, 0);
        teamProgress = Math.round(totalProgress / assignedMembers.length);
      }
      
      return { ...plan, viewedCount: plan.viewedByMemberIds.length, teamProgress };
    });
  }, [plans, allMembers]);

  const filteredAndSortedPlans = useMemo(() => {
    let filteredItems = [...plansWithStats];

    if (statusFilter !== 'all') {
        filteredItems = filteredItems.filter(plan => plan.status === statusFilter);
    }
    
    if (searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        filteredItems = filteredItems.filter(plan => plan.title.toLowerCase().includes(lowercasedTerm));
    }
    
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const key = sortConfig.key;

        if (key === 'dueDate') {
            const valA = a[key] ? new Date(a[key]).getTime() : Infinity;
            const valB = b[key] ? new Date(b[key]).getTime() : Infinity;
             if (sortConfig.direction === 'descending') {
                if (valA === Infinity) return 1;
                if (valB === Infinity) return -1;
            }
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        const valA = a[key];
        const valB = b[key];

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [plansWithStats, sortConfig, searchTerm, statusFilter]);
  
  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700/80 flex flex-col h-full">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/80 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-grow max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" size="sm" className="text-gray-400" />
                  </div>
                  <input
                      type="text"
                      placeholder="Buscar por título do plano..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border-none bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                  />
              </div>
          </div>
      </div>
      <div className="overflow-auto flex-1 no-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-white dark:bg-gray-800">
            <tr>
              <SortableHeader label="Título do Plano" sortKey="title" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Liderados</th>
              <SortableHeader label="Quem Viu?" sortKey="viewedCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Progresso Geral" sortKey="teamProgress" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Meta" sortKey="dueDate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {filteredAndSortedPlans.map((plan) => (
              <tr key={plan.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer h-20" onClick={() => onRowClick(plan)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate" title={plan.title}>{plan.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{plan.memberIds.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{plan.viewedCount}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center font-medium">
                    {plan.teamProgress}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {plan.dueDate ? new Date(plan.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={plan.status} />
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
          <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredAndSortedPlans.length}</span> de <span className="font-semibold text-gray-800 dark:text-gray-200">{plans.length}</span> resultados
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