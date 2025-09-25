import React, { useState, useMemo } from 'react';
import { Pulse, Channel, TeamMember, PulseType } from '../types';
import { Icon } from './Icon';
import { TablePagination } from './TablePagination';

interface PulsesTableProps {
  pulses: Pulse[];
  channels: Channel[];
  members: TeamMember[];
  onRowClick: (pulse: Pulse) => void;
}

type PulseWithStats = Pulse & { 
  viewCount: number;
  consumptionRate: number;
};

type LocalSortConfig = { key: keyof PulseWithStats, direction: 'ascending' | 'descending' };

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
  sortKey: keyof PulseWithStats;
  sortConfig: LocalSortConfig | null;
  requestSort: (key: keyof PulseWithStats) => void;
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

export const PulsesTable: React.FC<PulsesTableProps> = ({ pulses, channels, members, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const channelMap = useMemo(() => new Map(channels.map(c => [c.id, c.name])), [channels]);

  const pulsesWithData = useMemo(() => {
    // Only show pulses that are in channels where at least one team member is enrolled
    const teamChannelIds = new Set(members.flatMap(m => m.channelIds));
    const relevantPulses = pulses.filter(p => teamChannelIds.has(p.channelId));

    return relevantPulses.map(pulse => {
      // Consumption rate should be based on members enrolled in THAT specific channel
      const membersInChannel = members.filter(m => m.channelIds.includes(pulse.channelId));
      const viewers = membersInChannel.filter(member => member.pulseIds.includes(pulse.id));
      const consumptionRate = membersInChannel.length > 0
        ? Math.round((viewers.length / membersInChannel.length) * 100)
        : 0;
      
      return {
        ...pulse,
        viewCount: viewers.length,
        consumptionRate,
      };
    });
  }, [pulses, members]);

  const filteredAndSortedPulses = useMemo(() => {
    let filteredItems = [...pulsesWithData];

    if (searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        filteredItems = filteredItems.filter(pulse => pulse.name.toLowerCase().includes(lowercasedTerm));
    }

    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
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
    return filteredItems;
  }, [pulsesWithData, sortConfig, searchTerm]);

  const requestSort = (key: keyof PulseWithStats) => {
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
                        placeholder="Buscar por nome do pulse..."
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
              <SortableHeader label="Nome do Pulse" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[300px]" />
              <SortableHeader label="Tipo" sortKey="type" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Duração" sortKey="duration" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Visualizações" sortKey="viewCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Taxa de Consumo" sortKey="consumptionRate" sortConfig={sortConfig} requestSort={requestSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {pulsesWithData.length > 0 && filteredAndSortedPulses.length > 0 ? (
                filteredAndSortedPulses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pulse) => (
                <tr key={pulse.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onRowClick(pulse)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate" title={pulse.name}>{pulse.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{channelMap.get(pulse.channelId) || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {pulse.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{pulse.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{pulse.viewCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <RateIndicator rate={pulse.consumptionRate} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={pulsesWithData.length === 0 ? "track_changes" : "search_off"} size="lg" />
                            <p className="font-semibold">{pulsesWithData.length === 0 ? "Nenhum pulse para exibir" : "Nenhum resultado encontrado"}</p>
                            <p className="text-sm">{pulsesWithData.length === 0 ? "Não há pulses disponíveis para esta equipe." : "Tente ajustar seus filtros ou termo de busca."}</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
       <TablePagination
        count={filteredAndSortedPulses.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};