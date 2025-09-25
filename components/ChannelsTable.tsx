import React, { useState, useMemo } from 'react';
import { Channel, TeamMember, Pulse } from '../types';
import { Icon } from './Icon';
import { TablePagination } from './TablePagination';

interface ChannelsTableProps {
  channels: Channel[];
  members: TeamMember[];
  pulses: Pulse[];
  onRowClick: (channel: Channel) => void;
}

type ChannelWithStats = Channel & {
  enrolledCount: number;
  lastActivity: string;
  lastActivityDate: Date;
  teamProgress: number;
};

type LocalSortConfig = { key: keyof ChannelWithStats, direction: 'ascending' | 'descending' };

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

const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    if (diffTime < 0) return 'Recentemente';
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


const SortableHeader: React.FC<{
  label: string;
  sortKey: keyof ChannelWithStats;
  sortConfig: LocalSortConfig | null;
  requestSort: (key: keyof ChannelWithStats) => void;
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

export const ChannelsTable: React.FC<ChannelsTableProps> = ({ channels, members, pulses, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const channelsWithData = useMemo(() => {
    return channels
      .filter(channel => members.some(member => member.channelIds.includes(channel.id))) // Only show channels with team members
      .map(channel => {
        const enrolledMembers = members.filter(member => member.channelIds.includes(channel.id));
        const lastAccessDates = enrolledMembers.map(m => new Date(m.lastAccess)).filter(d => !isNaN(d.getTime()));
        const lastActivityDate = lastAccessDates.length > 0 ? new Date(Math.max.apply(null, lastAccessDates.map(d => d.getTime()))) : new Date(0);

        const totalPossibleConsumptions = enrolledMembers.length * channel.pulsesCount;
        const totalActualConsumptions = enrolledMembers.reduce((sum, member) => {
            const consumedInChannel = member.pulseIds.filter(pulseId => channel.pulseIds.includes(pulseId));
            return sum + consumedInChannel.length;
        }, 0);
        const teamProgress = totalPossibleConsumptions > 0 ? Math.round((totalActualConsumptions / totalPossibleConsumptions) * 100) : 0;
        
        return {
          ...channel,
          enrolledCount: enrolledMembers.length,
          lastActivity: lastAccessDates.length > 0 ? formatRelativeTime(lastActivityDate) : 'N/A',
          lastActivityDate,
          teamProgress,
        };
      });
  }, [channels, members, pulses]);

  const filteredAndSortedChannels = useMemo(() => {
    let filteredItems = [...channelsWithData];
    
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase().trim();
      filteredItems = filteredItems.filter(channel =>
        channel.name.toLowerCase().includes(lowercasedTerm) ||
        channel.description.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const key = sortConfig.key;
        
        if (key === 'lastActivityDate') {
            const valA = a.lastActivityDate.getTime();
            const valB = b.lastActivityDate.getTime();
            if (valA === 0) return 1;
            if (valB === 0) return -1;
            if (valA < valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            return 0;
        }

        if (a[key] < b[key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [channelsWithData, sortConfig, searchTerm]);

  const requestSort = (key: keyof ChannelWithStats) => {
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
                      placeholder="Buscar por nome ou descrição..."
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
              <SortableHeader label="Nome do Canal" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]" />
              <SortableHeader label="Pulses" sortKey="pulsesCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Liderados Inscritos" sortKey="enrolledCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Última Atividade" sortKey="lastActivityDate" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Progresso Geral" sortKey="teamProgress" sortConfig={sortConfig} requestSort={requestSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {channelsWithData.length > 0 && filteredAndSortedChannels.length > 0 ? (
                filteredAndSortedChannels
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((channel) => (
                <tr key={channel.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onRowClick(channel)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{channel.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={channel.description}>{channel.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{channel.pulsesCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{channel.enrolledCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{channel.lastActivity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <RateIndicator rate={channel.teamProgress} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={channelsWithData.length === 0 ? "hub" : "search_off"} size="lg" />
                            <p className="font-semibold">{channelsWithData.length === 0 ? "Nenhum canal para exibir" : "Nenhum resultado encontrado"}</p>
                            <p className="text-sm">{channelsWithData.length === 0 ? "Não há canais com liderados inscritos." : "Tente ajustar seus filtros ou termo de busca."}</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        count={filteredAndSortedChannels.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};