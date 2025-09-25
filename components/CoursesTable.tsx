import React, { useState, useMemo } from 'react';
import { Course, TeamMember, Enrollment, EnrollmentStatus } from '../types';
import { Icon } from './Icon';
import { TablePagination } from './TablePagination';

interface CoursesTableProps {
  courses: Course[];
  members: TeamMember[];
  enrollments: Enrollment[];
  onRowClick: (course: Course) => void;
}

type CourseWithStats = Course & { 
  enrolledCount: number;
  overdueCount: number;
  completionRate: number;
  averageProgress: number; 
  totalDurationMinutes: number;
};

type LocalSortConfig = { key: keyof CourseWithStats, direction: 'ascending' | 'descending' };

const durationToMinutes = (durationStr: string): number => {
    if (!durationStr) return 0;
    let totalMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*h/);
    const minutesMatch = durationStr.match(/(\d+)\s*m/);

    if (hoursMatch) {
        totalMinutes += parseFloat(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1], 10);
    }
    return totalMinutes;
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
  sortKey: keyof CourseWithStats;
  sortConfig: LocalSortConfig | null;
  requestSort: (key: keyof CourseWithStats) => void;
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

export const CoursesTable: React.FC<CoursesTableProps> = ({ courses, members, enrollments, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<LocalSortConfig | null>({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const coursesWithStats = useMemo(() => {
    const teamMemberIds = new Set(members.map(m => m.id));
    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id && teamMemberIds.has(e.memberId));
      
      const totalProgress = courseEnrollments.reduce((acc, e) => acc + e.progress, 0);
      const averageProgress = courseEnrollments.length > 0 ? Math.round(totalProgress / courseEnrollments.length) : 0;
      
      const completedCount = courseEnrollments.filter(e => e.status === EnrollmentStatus.Finalizado).length;
      const completionRate = courseEnrollments.length > 0 ? Math.round((completedCount / courseEnrollments.length) * 100) : 0;
      
      const overdueCount = courseEnrollments.filter(e => e.status === EnrollmentStatus.Expirada).length;

      const totalDurationMinutes = durationToMinutes(course.duration);

      return {
        ...course,
        enrolledCount: courseEnrollments.length,
        averageProgress,
        completionRate,
        overdueCount,
        totalDurationMinutes,
      };
    });
  }, [courses, members, enrollments]);

  const filteredAndSortedCourses = useMemo(() => {
    let filteredItems = [...coursesWithStats];

    if (searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        filteredItems = filteredItems.filter(course => course.name.toLowerCase().includes(lowercasedTerm));
    }

    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const key = sortConfig.key as keyof CourseWithStats;
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
  }, [coursesWithStats, sortConfig, searchTerm]);

  const requestSort = (key: keyof CourseWithStats) => {
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
                        placeholder="Buscar por nome do curso..."
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
            {courses.length > 0 && filteredAndSortedCourses.length > 0 ? (
                filteredAndSortedCourses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((course) => (
                <tr key={course.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onRowClick(course)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                        <span>{course.name}</span>
                        {course.isExternal && <Icon name="link" size="sm" className="text-gray-400 dark:text-gray-500" title="Curso Externo"/>}
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{course.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">{course.enrolledCount}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${course.overdueCount > 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    {course.overdueCount > 0 ? course.overdueCount : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <RateIndicator rate={course.completionRate} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <RateIndicator rate={course.averageProgress} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={courses.length === 0 ? "menu_book" : "search_off"} size="lg" />
                            <p className="font-semibold">{courses.length === 0 ? "Nenhum curso para exibir" : "Nenhum resultado encontrado"}</p>
                            <p className="text-sm">{courses.length === 0 ? "Não há cursos disponíveis para esta equipe." : "Tente ajustar seus filtros ou termo de busca."}</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        count={filteredAndSortedCourses.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};