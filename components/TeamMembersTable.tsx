import React, { useState, useMemo, useEffect } from 'react';
import { TeamMember, Course, Trail, Enrollment, EnrollmentType } from '../types';
import { Icon } from './Icon';
import { TablePagination } from './TablePagination';
import { StatusBadge } from './StatusBadge';

enum GeneralStatusValue {
  EmRisco = 'Em Risco',
  Atencao = 'Atenção',
  EmDia = 'Em Dia',
  Inativo = 'Inativo',
}

enum EngagementLevel {
    Alto = 'Alto',
    Medio = 'Médio',
    Baixo = 'Baixo',
}

export interface ActionableTeamMember extends TeamMember {
  generalStatus: GeneralStatusValue;
  mandatoryProgressText: string;
  nextDueDateText: string;
  lastActivityText: string;
  engagementLevel: EngagementLevel;
  statusPriority: number;
  nextDueDateDiff: number;
  lastActivityDiff: number;
  engagementPriority: number;
}

export type LocalSortConfig = { key: keyof ActionableTeamMember, direction: 'ascending' | 'descending' };


// Helper to format date strings into relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    if (diffTime < 0) return 'Recentemente'; // Future dates

    const seconds = Math.floor(diffTime / 1000);
    const days = Math.floor(seconds / 86400);

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 30) return `Há ${days} dias`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `Há ${months} meses`;

    const years = Math.floor(days / 365);
    return `Há ${years} anos`;
};


interface TeamMembersTableProps {
  members: TeamMember[];
  allCourses: Course[];
  allTrails: Trail[];
  enrollments: Enrollment[];
  onRowClick: (member: TeamMember) => void;
  initialFilterKey: string | null;
  onFilterApplied: () => void;
  initialSortConfig: LocalSortConfig | null;
  onSortApplied: () => void;
}

const SortableHeader: React.FC<{
  label: string;
  sortKey: keyof ActionableTeamMember;
  sortConfig: LocalSortConfig | null;
  requestSort: (key: keyof ActionableTeamMember) => void;
  className?: string;
  isSortable?: boolean;
}> = ({ label, sortKey, sortConfig, requestSort, className = "", isSortable = true }) => {
  const isSorted = sortConfig?.key === sortKey;
  const iconName = isSorted ? (sortConfig?.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more';

  const commonProps = {
    scope: "col",
    className: `px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${className} ${isSortable ? 'cursor-pointer' : ''}`,
  };

  if (!isSortable) {
    return <th {...commonProps}>{label}</th>;
  }

  return (
    <th {...commonProps} onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        <Icon name={iconName} size="sm" className={isSorted ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'} />
      </div>
    </th>
  );
};

const EngagementIndicator: React.FC<{ level: EngagementLevel }> = ({ level }) => {
    const levelMap: Record<EngagementLevel, { color: string; text: string }> = {
        [EngagementLevel.Alto]: { color: 'text-green-500 dark:text-green-400', text: 'Alto' },
        [EngagementLevel.Medio]: { color: 'text-yellow-500 dark:text-yellow-400', text: 'Médio' },
        [EngagementLevel.Baixo]: { color: 'text-red-500 dark:text-red-400', text: 'Baixo' },
    };
    const { color, text } = levelMap[level];
    return (
        <div className={color}>
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
};


export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({ members, allCourses, allTrails, enrollments, onRowClick, initialFilterKey, onFilterApplied, initialSortConfig, onSortApplied }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'statusPriority', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GeneralStatusValue | 'all' | 'risky_mandatory' | 'low_engagement_free'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    if (initialFilterKey) {
        if (initialFilterKey === 'risky_mandatory') {
            setStatusFilter('risky_mandatory');
        } else if (initialFilterKey === 'inactive') {
            setStatusFilter(GeneralStatusValue.Inativo);
        } else if (initialFilterKey === 'low_engagement_free') {
            setStatusFilter('low_engagement_free');
        }
        onFilterApplied();
    }
  }, [initialFilterKey, onFilterApplied]);

  useEffect(() => {
    if(initialSortConfig) {
      setSortConfig(initialSortConfig);
      onSortApplied();
    }
  }, [initialSortConfig, onSortApplied]);

  const actionableMembers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return members.map(member => {
        const memberEnrollments = enrollments.filter(e => e.memberId === member.id && e.type === EnrollmentType.Obrigatoria && e.dueDate);
        const mandatoryTrails = member.trailIds.map(id => allTrails.find(t=>t.id === id)).filter((t): t is Trail => !!(t && t.isMandatory && t.dueDate));
        
        const mandatoryEnrollmentsWithDiffs = memberEnrollments.map(item => {
            const dueDate = new Date(item.dueDate! + 'T00:00:00');
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = dueDate.getTime() - today.getTime();
            return { ...item, diffDays: Math.ceil(diffTime / (1000 * 60 * 60 * 24)) };
        });

        const mandatoryTrailsWithDiffs = mandatoryTrails.map(item => {
            const dueDate = new Date(item.dueDate! + 'T00:00:00');
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = dueDate.getTime() - today.getTime();
            return { ...item, diffDays: Math.ceil(diffTime / (1000 * 60 * 60 * 24)) };
        });

        const allMandatoryWithDiffs = [...mandatoryEnrollmentsWithDiffs, ...mandatoryTrailsWithDiffs];
        
        const overdueItems = allMandatoryWithDiffs.filter(item => item.diffDays < 0);
        const dueSoonItems = allMandatoryWithDiffs.filter(item => item.diffDays >= 0);

        const lastAccessDate = new Date(member.lastAccess);
        const lastActivityDiff = Math.floor((new Date().getTime() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24));
        const lastActivityText = formatRelativeTime(member.lastAccess);

        let generalStatus: GeneralStatusValue;
        let statusPriority: number;
        const isOverdue = overdueItems.length > 0;
        const isDueSoon = dueSoonItems.some(item => item.diffDays <= 7);
        const isInactive15 = lastActivityDiff > 15 && lastActivityDiff <= 30;
        const isInactive30 = lastActivityDiff > 30;

        if (isOverdue) {
            generalStatus = GeneralStatusValue.EmRisco;
            statusPriority = 1;
        } else if (isInactive30) {
            generalStatus = GeneralStatusValue.Inativo;
            statusPriority = 4;
        } else if (isDueSoon || isInactive15) {
            generalStatus = GeneralStatusValue.Atencao;
            statusPriority = 2;
        } else {
            generalStatus = GeneralStatusValue.EmDia;
            statusPriority = 3;
        }
        
        let mandatoryProgressText = 'Nenhuma obrigação';
        if (allMandatoryWithDiffs.length > 0) {
            if (overdueItems.length > 0) {
                mandatoryProgressText = `${overdueItems.length} Atrasado(s)`;
            } else if (dueSoonItems.length > 0) {
                mandatoryProgressText = `${dueSoonItems.length} a vencer`;
            } else {
                mandatoryProgressText = 'Concluído';
            }
        }

        let nextDueDateText = 'N/A';
        let nextDueDateDiff = Infinity;
        if (allMandatoryWithDiffs.length > 0) {
            const sortedByDate = [...allMandatoryWithDiffs].sort((a,b) => a.diffDays - b.diffDays);
            const nextItem = sortedByDate[0];
            nextDueDateDiff = nextItem.diffDays;
            if (nextItem.diffDays < 0) {
                nextDueDateText = `Vencido há ${Math.abs(nextItem.diffDays)}d`;
            } else {
                const dueDateObj = new Date(nextItem.dueDate! + 'T00:00:00');
                const formattedDate = dueDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                nextDueDateText = `Em ${nextItem.diffDays} dias (${formattedDate})`;
            }
        }
        
        // Engagement Logic
        let engagementLevel: EngagementLevel;
        let engagementPriority: number;

        if (member.overallProgress >= 60 && lastActivityDiff <= 15) {
            engagementLevel = EngagementLevel.Alto;
            engagementPriority = 1;
        } else if (member.overallProgress >= 30 && lastActivityDiff <= 30) {
            engagementLevel = EngagementLevel.Medio;
            engagementPriority = 2;
        } else {
            engagementLevel = EngagementLevel.Baixo;
            engagementPriority = 3;
        }
        
        return { ...member, generalStatus, mandatoryProgressText, nextDueDateText, lastActivityText, engagementLevel, statusPriority, nextDueDateDiff, lastActivityDiff, engagementPriority };
    });
  }, [members, allCourses, allTrails, enrollments]);

  const filteredAndSortedMembers = useMemo(() => {
    let filteredItems = [...actionableMembers];

    if (statusFilter === 'risky_mandatory') {
        filteredItems = filteredItems.filter(member => member.generalStatus === GeneralStatusValue.EmRisco || member.generalStatus === GeneralStatusValue.Atencao);
    } else if (statusFilter === 'low_engagement_free') {
        filteredItems = filteredItems.filter(member => member.engagementLevel === EngagementLevel.Baixo);
    } else if (statusFilter !== 'all') {
      filteredItems = filteredItems.filter(member => member.generalStatus === statusFilter);
    }

    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase().trim();
      filteredItems = filteredItems.filter(member =>
        member.name.toLowerCase().includes(lowercasedTerm) ||
        member.jobTitle.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      filteredItems.sort((a, b) => {
        let valA: any = a[key as keyof ActionableTeamMember];
        let valB: any = b[key as keyof ActionableTeamMember];

        if (valA < valB) return direction === 'ascending' ? -1 : 1;
        if (valA > valB) return direction === 'ascending' ? 1 : -1;
        
        // Tie-breaker
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    }
    return filteredItems;
  }, [actionableMembers, sortConfig, searchTerm, statusFilter]);

  const requestSort = (key: keyof ActionableTeamMember) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700/80 flex flex-col h-full">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/80 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-grow max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" size="sm" className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="overflow-auto flex-1 no-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-white dark:bg-gray-800">
            <tr>
              <SortableHeader label="Liderado" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]" />
              <SortableHeader label="Progresso Obrigatório" sortKey="mandatoryProgressText" sortConfig={sortConfig} requestSort={requestSort} isSortable={false} />
              <SortableHeader label="Próximo Vencimento" sortKey="nextDueDateDiff" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Última Atividade" sortKey="lastActivityDiff" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Engajamento" sortKey="engagementPriority" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status Geral" sortKey="statusPriority" sortConfig={sortConfig} requestSort={requestSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {actionableMembers.length > 0 && filteredAndSortedMembers.length > 0 ? (
                filteredAndSortedMembers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((member) => (
                <tr key={member.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onRowClick(member)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={member.avatarUrl} alt={member.name} />
                        </div>
                        <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.jobTitle}</div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {member.mandatoryProgressText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {member.nextDueDateText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {member.lastActivityText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <EngagementIndicator level={member.engagementLevel} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={member.generalStatus} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={members.length === 0 ? "group_off" : "search_off"} size="lg" />
                            <p className="font-semibold">{members.length === 0 ? "Nenhum liderado na equipe" : "Nenhum resultado encontrado"}</p>
                            <p className="text-sm">{members.length === 0 ? "Não há dados de liderados para exibir." : "Tente ajustar seus filtros ou termo de busca."}</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        count={filteredAndSortedMembers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};