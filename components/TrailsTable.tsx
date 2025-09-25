import React, { useState, useMemo } from 'react';
import { Trail, TeamMember, MemberStatus, Course, Pulse } from '../types';
import { Icon } from './Icon';
import { TablePagination } from './TablePagination';

interface TrailsTableProps {
  trails: Trail[];
  members: TeamMember[];
  onRowClick: (trail: Trail) => void;
  allCourses: Course[];
  allPulses: Pulse[];
}

type TrailWithStats = Trail & {
  duration: string;
  totalDurationMinutes: number;
  enrolledCount: number;
  overdueCount: number;
  completionRate: number;
  averageProgress: number; 
};

type LocalSortConfig = { key: keyof TrailWithStats, direction: 'ascending' | 'descending' };

const durationToMinutes = (durationStr: string): number => {
    if (!durationStr || durationStr === 'N/A') return 0;
    let totalMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*h/);
    const minutesMatch = durationStr.match(/(\d+)\s*m/);

    if (hoursMatch) {
        totalMinutes += parseFloat(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1], 10);
    }

    if (!hoursMatch && !minutesMatch && (durationStr.includes('min') || durationStr.includes('m'))) {
         const justMinutesMatch = durationStr.match(/(\d+)/);
         if(justMinutesMatch) totalMinutes += parseInt(justMinutesMatch[1], 10);
    }
    return totalMinutes;
};

const formatMinutesToDuration = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return 'N/A';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    let result = '';
    if (hours > 0) {
        result += `${hours}h`;
    }
    if (minutes > 0) {
        if (result) result += ' ';
        result += `${minutes}m`;
    }
    return result;
};


const getIndividualProgress = (member: TeamMember, contentId: string): number => {
    if (member.status === MemberStatus.Completed) return 100;
    if (member.status === MemberStatus.NotStarted || member.status === MemberStatus.Empty) return 0;
    const progressSeed = member.id.charCodeAt(0) + contentId.charCodeAt(1) + (contentId.length);
    if (member.status === MemberStatus.Late) {
        return (progressSeed % 40) + 10;
    }
    return (progressSeed % 50) + 45;
};

const RateIndicator: React.FC<{ rate: number }> = ({ rate }) => {
    let dotColor = 'bg-yellow-500';
    
    if (rate > 70) {
        dotColor = 'bg-green-500';
    } else if (rate < 40) {
        dotColor = 'bg-red-500';
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`}></span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{`${rate}%`}</span>
        </div>
    );
};

const SortableHeader: React.FC<{
  label: string;
  sortKey: keyof TrailWithStats;
  sortConfig: LocalSortConfig | null;
  requestSort: (key: keyof TrailWithStats) => void;
  className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className="" }) => {
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

export const TrailsTable: React.FC<TrailsTableProps> = ({ trails, members, onRowClick, allCourses, allPulses }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const trailsWithStats = useMemo(() => {
    const courseMap = new Map(allCourses.map(c => [c.id, c]));
    const pulseMap = new Map(allPulses.map(p => [p.id, p]));

    return trails.map(trail => {
      const enrolledMembers = members.filter(member => member.trailIds.includes(trail.id));
      const totalProgress = enrolledMembers.reduce((acc, member) => acc + getIndividualProgress(member, trail.id), 0);
      const averageProgress = enrolledMembers.length > 0 ? Math.round(totalProgress / enrolledMembers.length) : 0;
      const completedCount = enrolledMembers.filter(member => getIndividualProgress(member, trail.id) === 100).length;
      const completionRate = enrolledMembers.length > 0 ? Math.round((completedCount / enrolledMembers.length) * 100) : 0;
      
      let overdueCount = 0;
      if (trail.dueDate) {
          const dueDate = new Date(trail.dueDate + 'T00:00:00');
          if (dueDate < new Date()) {
              overdueCount = enrolledMembers.filter(member => getIndividualProgress(member, trail.id) < 100).length;
          }
      }
      
      const courseDurations = trail.courseIds.map(id => courseMap.get(id)?.duration || '0').reduce((sum, dur) => sum + durationToMinutes(dur), 0);
      const pulseDurations = trail.pulseIds.map(id => pulseMap.get(id)?.duration || '0').reduce((sum, dur) => sum + durationToMinutes(dur), 0);
      const totalDurationMinutes = courseDurations + pulseDurations;

      return {
        ...trail,
        duration: formatMinutesToDuration(totalDurationMinutes),
        totalDurationMinutes,
        enrolledCount: enrolledMembers.length,
        averageProgress,
        completionRate,
        overdueCount,
      };
    });
  }, [trails, members, allCourses, allPulses]);

  const filteredAndSortedTrails = useMemo(() => {
    let filteredItems = [...trailsWithStats];

    if (searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        filteredItems = filteredItems.filter(trail => trail.name.toLowerCase().includes(lowercasedTerm));
    }

    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const key = sortConfig.key as keyof TrailWithStats;
        const valA = a[key];
        const valB = b[key];

        const aHasValue = valA !== null && valA !== undefined;
        const bHasValue = valB !== null && valB !== undefined;

        if (!aHasValue) return 1;
        if (!bHasValue) return -1;
        
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
  }, [trailsWithStats, sortConfig, searchTerm]);

  const requestSort = (key: keyof TrailWithStats) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
                    placeholder="Buscar por nome da trilha..."
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
              <SortableHeader label="Nome" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[300px]" />
              <SortableHeader label="Duração" sortKey="totalDurationMinutes" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Matrículas" sortKey="enrolledCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Liderados com Atraso" sortKey="overdueCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Taxa de Conclusão" sortKey="completionRate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Progresso Médio" sortKey="averageProgress" sortConfig={sortConfig} requestSort={requestSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {trails.length > 0 && filteredAndSortedTrails.length > 0 ? (
                filteredAndSortedTrails
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((trail) => (
                <tr key={trail.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onRowClick(trail)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{trail.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{trail.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{trail.enrolledCount}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${trail.overdueCount > 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    {trail.dueDate ? (trail.overdueCount > 0 ? trail.overdueCount : '0') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <RateIndicator rate={trail.completionRate} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <RateIndicator rate={trail.averageProgress} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={trails.length === 0 ? "timeline" : "search_off"} size="lg" />
                            <p className="font-semibold">{trails.length === 0 ? "Nenhuma trilha para exibir" : "Nenhum resultado encontrado"}</p>
                            <p className="text-sm">{trails.length === 0 ? "Não há trilhas disponíveis para esta equipe." : "Tente ajustar seus filtros ou termo de busca."}</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        count={filteredAndSortedTrails.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};