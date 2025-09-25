import React from 'react';
import { TeamMember, Trail, Course, Enrollment, EnrollmentStatus, EnrollmentType } from '../../types';
import { Icon } from '../Icon';
import { StatusBadge } from '../StatusBadge';
import { COURSE_CONTENT_ITEMS_DATA, MEMBER_CONTENT_PROGRESS_DATA } from '../../constants';
import { TypeBadge } from '../TypeBadge';

interface MemberTrailProgressDetailProps {
    member: TeamMember;
    trail: Trail;
    allCourses: Course[];
    allEnrollments: Enrollment[];
    onBack: () => void;
    onCourseSelect: (course: Course) => void;
}

const getMemberCoursePerformance = (memberId: string, courseId: string): number => {
    const courseContentIds = COURSE_CONTENT_ITEMS_DATA
        .filter(item => item.courseId === courseId)
        .map(item => item.id);

    const memberProgressOnCourseContent = MEMBER_CONTENT_PROGRESS_DATA
        .filter(p => p.memberId === memberId && courseContentIds.includes(p.contentId));
    
    if (memberProgressOnCourseContent.length === 0) {
        return 0;
    }

    const totalPerformance = memberProgressOnCourseContent.reduce((sum, p) => sum + p.performance, 0);
    return Math.round(totalPerformance / memberProgressOnCourseContent.length);
};

export const MemberTrailProgressDetail: React.FC<MemberTrailProgressDetailProps> = ({ member, trail, allCourses, allEnrollments, onBack, onCourseSelect }) => {
    const coursesInTrail = allCourses.filter(course => trail.courseIds.includes(course.id));
    const memberEnrollmentsMap = new Map(allEnrollments.filter(e => e.memberId === member.id).map(e => [e.courseId, e]));

    return (
        <div className="p-4 sm:p-6">
            <button onClick={onBack} className="flex items-center gap-2 mb-4 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                <Icon name="arrow_back" size="sm" />
                Voltar para o perfil de {member.name}
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Progresso na Trilha: {trail.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Acompanhe o avanço de {member.name} nos cursos desta trilha.</p>

            <ul className="space-y-3">
                {coursesInTrail.map(course => {
                    const enrollment = memberEnrollmentsMap.get(course.id);
                    const performance = getMemberCoursePerformance(member.id, course.id);

                    return (
                        <li key={course.id} onClick={() => onCourseSelect(course)} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <Icon name="rocket_launch" className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={course.name}>{course.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {enrollment && enrollment.type === EnrollmentType.Obrigatoria && (
                                        <TypeBadge type={enrollment.isNormativa ? 'Normativa' : 'Obrigatória'} isExpanded />
                                    )}
                                </div>
                            </div>
                            <div className="w-full sm:w-auto ml-auto flex items-center justify-end gap-x-6 gap-y-2 flex-wrap">
                                <div className="text-center w-20">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{enrollment?.progress ?? 0}%</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Progresso</p>
                                </div>
                                <div className="text-center w-20">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{performance}%</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                                </div>
                                <div className="w-28 text-center">
                                    <StatusBadge status={enrollment?.status ?? EnrollmentStatus.Matriculado} />
                                </div>
                                <div className="text-center w-24">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {enrollment?.dueDate ? new Date(enrollment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Data Meta</p>
                                </div>
                            </div>
                        </li>
                    );
                })}
                 {coursesInTrail.length === 0 && (
                    <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Esta trilha não possui cursos associados.
                    </div>
                )}
            </ul>
        </div>
    );
};