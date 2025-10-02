import React from 'react';
import { Enrollment, TeamMember, EnrollmentType, Course } from '../types';
import { Icon } from './Icon';
import { COURSES_DATA } from '../constants'; // Required to get course names

interface ImmediateActionTableProps {
  members: TeamMember[];
  enrollments: Enrollment[];
  onViewDetails: (member: TeamMember) => void;
  onViewAll: () => void;
}

interface ActionableItem {
  member: TeamMember;
  courseName: string;
  isExternal: boolean;
  criticalDetail: string;
  sortPriority: number;
  dueDateDiff: number;
}

const getStatus = (diffDays: number): { text: string, color: string } => {
    if (diffDays < 0) {
        return { text: `Vencido há ${Math.abs(diffDays)}d`, color: 'text-red-600 dark:text-red-400 font-semibold' };
    }
    if (diffDays === 0) {
        return { text: `Vence hoje`, color: 'text-red-600 dark:text-red-400 font-semibold' };
    }
    return { text: `Vence em ${diffDays}d`, color: 'text-yellow-600 dark:text-yellow-400' };
};

export const ImmediateActionTable: React.FC<ImmediateActionTableProps> = ({ members, enrollments, onViewDetails, onViewAll }) => {

  const handleViewDetails = (e: React.MouseEvent, member: TeamMember) => {
    e.stopPropagation();
    onViewDetails(member);
  };

  const { displayItems, totalCount } = React.useMemo(() => {
    // FIX: Explicitly type Maps to prevent type inference issues.
    const memberMap: Map<string, TeamMember> = new Map(members.map(m => [m.id, m]));
    const courseMap: Map<string, Course> = new Map(COURSES_DATA.map(c => [c.id, c]));
    const items: ActionableItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mandatoryEnrollments = enrollments.filter(e => e.type === EnrollmentType.Obrigatoria && e.dueDate);
    
    mandatoryEnrollments.forEach(enrollment => {
        const member = memberMap.get(enrollment.memberId);
        const course = courseMap.get(enrollment.courseId);

        if (!member || !course || enrollment.progress === 100) return;

        const dueDate = new Date(enrollment.dueDate + 'T00:00:00');
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const isOverdue = diffDays < 0;
        const isDueSoon = diffDays >=0 && diffDays <= 7;

        if (isOverdue || isDueSoon) {
            items.push({
              member,
              courseName: course.name,
              isExternal: course.isExternal || false,
              criticalDetail: course.name,
              sortPriority: isOverdue ? 1 : 2,
              dueDateDiff: diffDays,
            });
        }
    });

    const sortedItems = items.sort((a, b) => {
        if (a.sortPriority !== b.sortPriority) {
          return a.sortPriority - b.sortPriority;
        }
        return a.dueDateDiff - b.dueDateDiff;
      });

    const uniqueMembers = new Set(sortedItems.map(item => item.member.id));

    return {
        displayItems: sortedItems.slice(0, 5),
        totalCount: uniqueMembers.size
    };

  }, [members, enrollments]);

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg flex flex-col h-full">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Matrículas Obrigatórias
            </h2>
            {totalCount > 0 && (
                <span className="flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">{totalCount}</span>
            )}
        </div>
        <div className="flex items-center gap-1">
            <div className="relative group flex items-center">
                <Icon name="info" size="sm" className="text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-50 pointer-events-none">
                    Ao clicar em 'Ver todos', a lista de liderados será aberta com um filtro pré-aplicado para esta condição.
                    <div className="absolute right-3 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                </div>
            </div>
            <button 
                onClick={onViewAll}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
                disabled={totalCount === 0}
            >
                Ver todos
            </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-2">
         {displayItems.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {displayItems.map(({ member, courseName, isExternal, dueDateDiff }, index) => {
                const status = getStatus(dueDateDiff);
                return (
                <li key={`${member.id}-${courseName}-${index}`} className="p-3 min-h-[6rem] flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-lg transition-colors cursor-pointer" onClick={(e) => handleViewDetails(e, member)}>
                    <img className="h-10 w-10 rounded-full flex-shrink-0" src={member.avatarUrl} alt={member.name} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate" title={courseName}>{courseName}</span>
                          {isExternal && <Icon name="link" size="sm" className="text-gray-400 dark:text-gray-500" title="Curso Externo"/>}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className={`text-sm ${status.color}`}>{status.text}</p>
                    </div>
                </li>
                );
            })}
            </ul>
        ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                <p>Nenhum item de atenção imediata. A equipe está em dia!</p>
            </div>
        )}
      </div>
    </div>
  );
};