import React, { useState, useMemo } from 'react';
import { Course, TeamMember, Trail, SelectedItem, Enrollment, EnrollmentType, EnrollmentStatus } from '../../types';
import { Icon } from '../Icon';
import { analytics } from '../../services/analytics';
import { StatusBadge } from '../StatusBadge';
import { TypeBadge } from '../TypeBadge';

interface CourseDetailProps {
  course: Course;
  allMembers: TeamMember[];
  allTrails: Trail[];
  allEnrollments: Enrollment[];
  onItemClick: (type: SelectedItem['type'], data: any) => void;
}

type DetailTab = 'members' | 'not-enrolled' | 'trails';

// --- Reusable helpers ---
const getTeamAverageProgress = (contentId: string, allMembers: TeamMember[], contentType: 'trail'): number => {
    const membersWithContent = allMembers.filter(m => m.trailIds.includes(contentId));
    if (membersWithContent.length === 0) return 0;
    
    // Simplified progress logic for this context
    const totalProgress = membersWithContent.reduce((acc, member) => acc + member.overallProgress, 0);
    return Math.round(totalProgress / membersWithContent.length);
};

// --- Main Component ---
export const CourseDetail: React.FC<CourseDetailProps> = ({ course, allMembers, allTrails, allEnrollments }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('members');
  
  const teamMemberIds = useMemo(() => new Set(allMembers.map(m => m.id)), [allMembers]);

  const enrollmentsForCourse = useMemo(() => allEnrollments.filter(e => e.courseId === course.id && teamMemberIds.has(e.memberId)), [allEnrollments, course.id, teamMemberIds]);
  const enrolledMemberIds = useMemo(() => new Set(enrollmentsForCourse.map(e => e.memberId)), [enrollmentsForCourse]);
  
  const notEnrolledMembers = useMemo(() => allMembers.filter(member => !enrolledMemberIds.has(member.id)), [allMembers, enrolledMemberIds]);
  const associatedTrails = useMemo(() => allTrails.filter(trail => trail.courseIds.includes(course.id)), [allTrails, course.id]);

  const overdueCount = useMemo(() => {
    return enrollmentsForCourse.filter(e => e.status === EnrollmentStatus.Expirada).length;
  }, [enrollmentsForCourse]);

  const renderContent = () => {
    switch (activeTab) {
      case 'members':
        return <EnrollmentList items={enrollmentsForCourse} allMembers={allMembers} emptyText="Nenhum liderado da sua equipe inscrito neste curso." />;
      case 'not-enrolled':
        return <SimpleMemberList items={notEnrolledMembers} emptyText="Todos os liderados da sua equipe estão matriculados neste curso." />;
      case 'trails':
        return <TrailList items={associatedTrails} allMembers={allMembers} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{course.name}</span>
            {course.isExternal && <Icon name="link" size="sm" className="text-gray-400 dark:text-gray-500" title="Curso Externo"/>}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><Icon name="timer" size="sm"/> <span>{course.duration}</span></div>
            <div className="flex items-center gap-2"><Icon name="group" size="sm"/> <span>{enrolledMemberIds.size} Liderados Inscritos</span></div>
            {overdueCount > 0 && (
                <div className="flex items-center gap-2 font-semibold text-red-500 dark:text-red-400">
                    <Icon name="error" size="sm"/> <span>{overdueCount} Matrículas Expirada</span>
                </div>
            )}
          </div>
      </div>
      
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <TabButton<DetailTab> id="members" label={`Matrículas (${enrollmentsForCourse.length})`} icon="group" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="not-enrolled" label={`Não Matriculados (${notEnrolledMembers.length})`} icon="person_off" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="trails" label={`Associado às Trilhas (${associatedTrails.length})`} icon="timeline" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </div>
        <div className="pt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};


// --- Sub-components ---
const TabButton = <T extends string>({ id, label, icon, activeTab, setActiveTab }: { id: T, label: string, icon: string, activeTab: T, setActiveTab: (id: T) => void }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`
      ${activeTab === id
        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
      }
      whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
    `}
  >
    <Icon name={icon} size="sm" />
    {label}
  </button>
);

const SimpleMemberList: React.FC<{
  items: TeamMember[],
  emptyText: string,
}> = ({ items, emptyText }) => {
  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
  }
  return (
    <ul className="space-y-3">
        {items.map(member => (
          <li key={member.id} className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-colors">
            <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 truncate">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={member.name}>{member.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
            </div>
          </li>
        ))}
    </ul>
  );
};

const EnrollmentList: React.FC<{
  items: Enrollment[],
  allMembers: TeamMember[],
  emptyText: string,
}> = ({ items, allMembers, emptyText }) => {

  const memberMap = useMemo(() => new Map(allMembers.map(m => [m.id, m])), [allMembers]);

  const processedEnrollments = useMemo(() => {
    const statusPriority: Record<EnrollmentStatus, number> = {
        [EnrollmentStatus.Expirada]: 1,
        [EnrollmentStatus.Reprovada]: 1,
        [EnrollmentStatus.ReqNovoPrazo]: 2,
        [EnrollmentStatus.AgAprovacao]: 2,
        [EnrollmentStatus.Iniciada]: 3,
        [EnrollmentStatus.Matriculado]: 4,
        [EnrollmentStatus.Finalizado]: 5,
        [EnrollmentStatus.Desistiu]: 6,
        [EnrollmentStatus.Inativa]: 7,
    };
    return items
        .map(enrollment => ({ enrollment, sortPriority: statusPriority[enrollment.status] || 99 }))
        .sort((a, b) => a.sortPriority - b.sortPriority);
  }, [items]);
  
  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
  }
  return (
    <ul className="space-y-3">
      {processedEnrollments.map(({ enrollment }) => {
        const member = memberMap.get(enrollment.memberId);
        if (!member) return null;

        return (
            <li key={enrollment.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-4">
                <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 truncate">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={member.name}>{member.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {enrollment.type === EnrollmentType.Obrigatoria && (
                            <TypeBadge type={enrollment.isNormativa ? 'Normativa' : 'Obrigatória'} isExpanded />
                        )}
                    </div>
                </div>
                <div className="ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-x-6 gap-y-1 flex-shrink-0">
                    <div className="text-center w-24">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{enrollment.progress}%</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Progresso</p>
                    </div>
                    <div className="w-32 text-center">
                        <StatusBadge status={enrollment.status} />
                    </div>
                    <div className="text-center w-28">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {enrollment.dueDate ? new Date(enrollment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Data Meta</p>
                    </div>
                </div>
            </li>
        )
      })}
    </ul>
  );
};

const TrailList: React.FC<{
  items: Trail[], 
  allMembers: TeamMember[]
}> = ({items, allMembers}) => {
    if (items.length === 0) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Este curso não está associado a nenhuma trilha.</div>;
    }
    return (
        <ul className="space-y-3">
            {items.map(trail => {
                 const teamProgress = getTeamAverageProgress(trail.id, allMembers, 'trail');
                 return (
                     <li key={trail.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-colors">
                        <Icon name="timeline" className="text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 truncate" title={trail.name}>{trail.name}</span>
                         <div className="ml-auto w-16 text-right flex-shrink-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{teamProgress}%</span>
                        </div>
                    </li>
                 );
            })}
        </ul>
    );
};
