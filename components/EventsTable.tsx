import React, { useState, useMemo } from 'react';
import { Event, TeamMember, EventType } from '../types';
import { Icon } from './Icon';
import { TablePagination } from './TablePagination';

interface EventsTableProps {
  events: Event[];
  members: TeamMember[];
  onRowClick: (event: Event) => void;
}

type EventStatus = 'Agendado' | 'Realizado' | 'Cancelado';

type EventWithStats = Event & {
  enrolledCount: number;
  status: EventStatus;
  attendedCount: number;
};

type LocalSortConfig = { key: keyof EventWithStats | 'date', direction: 'ascending' | 'descending' };

const parseEndDate = (dateStr: string): Date => {
    const parts = dateStr.split(' a ');
    const mainDatePart = parts.length > 1 ? parts[1] : parts[0]; 
    
    const dateSegments = mainDatePart.split('/');
    const day = parseInt(dateSegments[0], 10);
    const month = parseInt(dateSegments[1], 10) - 1;
    const year = parseInt(dateSegments[2], 10);
    
    const eventDate = new Date(year, month, day);
    eventDate.setHours(23, 59, 59, 999);
    return eventDate;
};

const getEventStatus = (dateStr: string): EventStatus => {
    return parseEndDate(dateStr) < new Date() ? 'Realizado' : 'Agendado';
};

const getAttendanceCount = (eventId: string, enrolledMembers: TeamMember[]): number => {
    let attendedCount = 0;
    enrolledMembers.forEach(member => {
        const seed = parseInt(member.id, 10) + eventId.charCodeAt(1);
        if (seed % 3 !== 0) { // ~66% participation rate
            attendedCount++;
        }
    });
    return attendedCount;
};

const ParticipationCell: React.FC<{ status: EventStatus; attended: number; enrolled: number }> = ({ status, attended, enrolled }) => {
    if (status === 'Agendado') {
        return <span className="text-gray-500 dark:text-gray-400">—</span>;
    }

    if (enrolled === 0) {
        return <span className="text-sm font-medium text-gray-500 dark:text-gray-400">N/A</span>;
    }

    const rate = Math.round((attended / enrolled) * 100);
    
    let dotColor = 'bg-red-500';
    
    if (rate > 70) {
        dotColor = 'bg-green-500';
    } else if (rate >= 40) {
        dotColor = 'bg-yellow-500';
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`}></span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{`${rate}% (${attended} de ${enrolled})`}</span>
        </div>
    );
};


const SortableHeader: React.FC<{
  label: string;
  sortKey: keyof EventWithStats | 'date';
  sortConfig: LocalSortConfig | null;
  requestSort: (key: keyof EventWithStats | 'date') => void;
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

export const EventsTable: React.FC<EventsTableProps> = ({ events, members, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'date', direction: 'descending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const eventsWithStats = useMemo(() => {
    return events.map(event => {
        const enrolledMembers = members.filter(member => member.eventIds.includes(event.id));
        const status = getEventStatus(event.date);
        const attendedCount = status === 'Realizado' ? getAttendanceCount(event.id, enrolledMembers) : 0;
      
      return {
        ...event,
        enrolledCount: enrolledMembers.length,
        status,
        attendedCount,
      };
    });
  }, [events, members]);

  const filteredAndSortedEvents = useMemo(() => {
    let filteredItems = [...eventsWithStats];
    
    if (searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        filteredItems = filteredItems.filter(event => event.name.toLowerCase().includes(lowercasedTerm));
    }

    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const key = sortConfig.key;
        if (key === 'date') { 
            const dateA = parseEndDate(a.date).getTime();
            const dateB = parseEndDate(b.date).getTime();
            if(dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if(dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
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
  }, [eventsWithStats, sortConfig, searchTerm]);

  const requestSort = (key: keyof EventWithStats | 'date') => {
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
                        placeholder="Buscar por nome do evento..."
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
              <SortableHeader label="Nome do Evento" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]" />
              <SortableHeader label="Inscritos" sortKey="enrolledCount" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Data" sortKey="date" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Participação" sortKey="attendedCount" sortConfig={sortConfig} requestSort={requestSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {events.length > 0 && filteredAndSortedEvents.length > 0 ? (
                filteredAndSortedEvents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((event) => (
                <tr key={event.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onRowClick(event)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{event.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{event.enrolledCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{event.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`text-gray-900 dark:text-white ${event.status === 'Realizado' ? 'opacity-75' : 'font-medium'}`}>
                            {event.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                    <ParticipationCell status={event.status} attended={event.attendedCount} enrolled={event.enrolledCount} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={events.length === 0 ? "event_busy" : "search_off"} size="lg" />
                            <p className="font-semibold">{events.length === 0 ? "Nenhum evento para exibir" : "Nenhum resultado encontrado"}</p>
                            <p className="text-sm">{events.length === 0 ? "Não há eventos disponíveis para esta equipe." : "Tente ajustar seus filtros ou termo de busca."}</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
       <TablePagination
        count={filteredAndSortedEvents.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};