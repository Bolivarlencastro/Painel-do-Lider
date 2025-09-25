import React, { useState, useMemo } from 'react';
// FIX: Added Enrollment to props and usage
import { Trail, Course, TeamMember, Pulse, SelectedItem, PulseType, MemberStatus, Enrollment } from '../../types';
import { Icon } from '../Icon';
import { analytics } from '../../services/analytics';
import { COURSE_CONTENT_ITEMS_DATA, MEMBER_CONTENT_PROGRESS_DATA } from '../../constants';


interface TrailDetailProps {
  trail: Trail;
  allCourses: Course[];
  allMembers: TeamMember[];
  allPulses: Pulse[];
  // FIX: Added allEnrollments to props to fix course lookup
  allEnrollments: Enrollment[];
  onItemClick: (type: SelectedItem['type'], data: any) => void;
}

type DetailTab = 'members' | 'not-enrolled' | 'courses' | 'pulses';

// --- Reusable helpers ---
const getIndividualProgress = (member: TeamMember, contentId: string): number => {
    if (member.status === MemberStatus.Completed) return 100;
    if (member.status === MemberStatus.NotStarted || member.status === MemberStatus.Empty) return 0;
    const progressSeed = member.id.charCodeAt(0) + contentId.charCodeAt(1) + (contentId.length);
    if (member.status === MemberStatus.Late) {
        return (progressSeed % 40) + 10;
    }
    return (progressSeed % 50) + 45;
};


// --- Main Component ---
export const TrailDetail: React.FC<TrailDetailProps> = ({ trail, allCourses, allMembers, allPulses, allEnrollments }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('members');

  const trailCourses = allCourses.filter(course => trail.courseIds.includes(course.id));
  const trailPulses = allPulses.filter(pulse => trail.pulseIds.includes(pulse.id));
  const enrolledMembers = allMembers.filter(member => member.trailIds.includes(trail.id));
  const notEnrolledMembers = allMembers.filter(member => !member.trailIds.includes(trail.id));

   const overdueCount = useMemo(() => {
    if (!trail.dueDate) return 0;
    const dueDate = new Date(trail.dueDate + 'T00:00:00');
    if (dueDate >= new Date()) return 0;
    return enrolledMembers.filter(member => getIndividualProgress(member, trail.id) < 100).length;
  }, [trail, enrolledMembers]);
  
  // FIX: Moved helper inside component to access props and fixed logic to use enrollments.
  const getTeamAverageProgress = (contentId: string, contentType: 'course' | 'pulse'): number => {
      const teamMemberIds = new Set(allMembers.map(m => m.id));
      
      const memberIdsWithContent = contentType === 'course' 
          ? new Set(allEnrollments.filter(e => e.courseId === contentId && teamMemberIds.has(e.memberId)).map(e => e.memberId))
          : new Set(allMembers.filter(m => m.pulseIds.includes(contentId)).map(m => m.id));

      if (memberIdsWithContent.size === 0) return 0;
      
      const membersWithContent = allMembers.filter(m => memberIdsWithContent.has(m.id));

      const totalProgress = membersWithContent.reduce((acc, member) => {
        if (contentType === 'course') {
          const enrollment = allEnrollments.find(e => e.memberId === member.id && e.courseId === contentId);
          return acc + (enrollment?.progress || 0);
        }
        // For pulses, progress is simulated.
        return acc + getIndividualProgress(member, contentId);
      }, 0);
      
      return Math.round(totalProgress / membersWithContent.length);
  };

  const getTeamAveragePerformanceOnCourse = (courseId: string): number => {
    const teamMemberIds = new Set(allMembers.map(m => m.id));
    const enrollmentsForCourse = allEnrollments.filter(e => e.courseId === courseId && teamMemberIds.has(e.memberId));
    if (enrollmentsForCourse.length === 0) return 0;

    const getMemberCoursePerformance = (memberId: string): number => {
      const courseContentIds = COURSE_CONTENT_ITEMS_DATA
        .filter(item => item.courseId === courseId)
        .map(item => item.id);

      const memberProgressOnCourseContent = MEMBER_CONTENT_PROGRESS_DATA
        .filter(p => p.memberId === memberId && courseContentIds.includes(p.contentId));
      
      if (memberProgressOnCourseContent.length === 0) return 0;

      const totalPerformance = memberProgressOnCourseContent.reduce((sum, p) => sum + p.performance, 0);
      return Math.round(totalPerformance / memberProgressOnCourseContent.length);
    };
    
    const totalPerformance = enrollmentsForCourse.reduce((sum, enrollment) => {
        return sum + getMemberCoursePerformance(enrollment.memberId);
    }, 0);

    return Math.round(totalPerformance / enrollmentsForCourse.length);
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'members':
              return <MemberList items={enrolledMembers} emptyText="Nenhum liderado da sua equipe inscrito nesta trilha." trail={trail} />;
          case 'not-enrolled':
              return <SimpleMemberList items={notEnrolledMembers} emptyText="Todos os liderados da sua equipe estão matriculados nesta trilha." />;
          case 'courses':
              return <CourseList items={trailCourses} getTeamAverageProgress={getTeamAverageProgress} getTeamAveragePerformanceOnCourse={getTeamAveragePerformanceOnCourse} />;
          case 'pulses':
              return <PulseList items={trailPulses} getTeamAverageProgress={getTeamAverageProgress} />;
          default:
              return null;
      }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{trail.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><Icon name="rocket_launch" size="sm"/> <span>{trail.coursesCount} Cursos</span></div>
            <div className="flex items-center gap-2"><Icon name="group" size="sm"/> <span>{enrolledMembers.length} Liderados Inscritos</span></div>
             {overdueCount > 0 && (
                <div className="flex items-center gap-2 font-semibold text-red-500 dark:text-red-400">
                    <Icon name="error" size="sm"/> <span>{overdueCount} Liderados com Atraso</span>
                </div>
            )}
          </div>
      </div>
      
       <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <TabButton<DetailTab> id="members" label={`Liderados Inscritos (${enrolledMembers.length})`} icon="group" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="not-enrolled" label={`Não Matriculados (${notEnrolledMembers.length})`} icon="person_off" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="courses" label={`Cursos na Trilha (${trailCourses.length})`} icon="rocket_launch" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="pulses" label={`Pulses na Trilha (${trailPulses.length})`} icon="track_changes" activeTab={activeTab} setActiveTab={setActiveTab} />
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

const CourseList: React.FC<{
  items: Course[], 
  getTeamAverageProgress: (contentId: string, contentType: 'course' | 'pulse') => number,
  getTeamAveragePerformanceOnCourse: (courseId: string) => number,
}> = ({ items, getTeamAverageProgress, getTeamAveragePerformanceOnCourse }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum curso nesta trilha.</div>;
    return (
        <ul className="space-y-3">
            {items.map(course => {
              const teamProgress = getTeamAverageProgress(course.id, 'course');
              const teamPerformance = getTeamAveragePerformanceOnCourse(course.id);
              return (
              <li key={course.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-colors">
                <Icon name="rocket_launch" className="text-purple-600 dark:text-purple-400"/>                
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate" title={course.name}>{course.name}</span>
                  {course.isExternal && <Icon name="link" size="sm" className="text-gray-400 dark:text-gray-500" title="Curso Externo"/>}
                </div>
                <div className="ml-auto flex items-center gap-4 flex-shrink-0">
                  <div className="text-center w-24">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{teamProgress}%</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Progresso Médio</p>
                  </div>
                  <div className="text-center w-24">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{teamPerformance}%</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Performance Média</p>
                  </div>
                </div>
              </li>
            )})}
        </ul>
    );
};

const PulseList: React.FC<{
  items: Pulse[], 
  getTeamAverageProgress: (contentId: string, contentType: 'course' | 'pulse') => number
}> = ({ items, getTeamAverageProgress }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum pulse nesta trilha.</div>;
    return (
        <ul className="space-y-3">
            {items.map(pulse => {
               const teamProgress = getTeamAverageProgress(pulse.id, 'pulse');
               return (
              <li key={pulse.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-colors">
                <Icon name="track_changes" className="text-purple-600 dark:text-purple-400"/>
                <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 truncate" title={pulse.name}>{pulse.name}</span>
                <div className="ml-auto flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{pulse.duration}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-12 text-center">{teamProgress}%</span>
                </div>
              </li>
            )})}
        </ul>
    );
};

type TrailMemberStatus = 'Atrasado' | 'A Vencer' | 'Em Dia' | 'Não Iniciado' | 'Concluído';

const TrailStatusTag: React.FC<{ status: TrailMemberStatus }> = ({ status }) => {
    const statusColorMap: Record<TrailMemberStatus, string> = {
        'Atrasado': 'bg-red-500',
        'A Vencer': 'bg-yellow-500',
        'Em Dia': 'bg-blue-500',
        'Não Iniciado': 'bg-gray-400',
        'Concluído': 'bg-green-500',
    };
    const color = statusColorMap[status];
    return (
        <span className="px-3 py-1 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
            <span className={`h-2 w-2 rounded-full ${color}`}></span>
            <span className="whitespace-nowrap">{status}</span>
        </span>
    );
};

const MemberList: React.FC<{
  items: TeamMember[],
  emptyText: string,
  trail: Trail
}> = ({ items, emptyText, trail }) => {
  
  const processedMembers = useMemo(() => {
    return items.map(member => {
        const progress = getIndividualProgress(member, trail.id);
        let status: TrailMemberStatus = 'Em Dia';
        let sortPriority = 4;

        if (progress === 100) {
            status = 'Concluído';
            sortPriority = 5;
        } else if (trail.dueDate) {
            const today = new Date();
            const dueDate = new Date(trail.dueDate + 'T00:00:00');
            today.setHours(0,0,0,0);
            
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                status = 'Atrasado';
                sortPriority = 1;
            } else if (diffDays <= 7) {
                status = 'A Vencer';
                sortPriority = 2;
            }
        }
        
        if (progress === 0 && status !== 'Atrasado' && status !== 'A Vencer') {
             status = 'Não Iniciado';
             sortPriority = 3;
        }

        return { member, progress, status, sortPriority };
    }).sort((a, b) => a.sortPriority - b.sortPriority);
  }, [items, trail]);

  if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
  return (
    <ul className="space-y-3">
      {processedMembers.map(({ member, progress, status }) => (
        <li key={member.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-4">
          <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 truncate">
            <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={member.name}>{member.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
          </div>
          <div className="ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-x-6 gap-y-1 flex-shrink-0">
            <div className="text-center w-24">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Progresso</p>
            </div>
            <div className="w-32 text-center">
              <TrailStatusTag status={status} />
            </div>
            <div className="text-center w-28">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {trail.dueDate ? new Date(trail.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
              </span>
               <p className="text-xs text-gray-500 dark:text-gray-400">Data Meta</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
