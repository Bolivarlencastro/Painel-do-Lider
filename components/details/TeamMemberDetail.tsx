import React, { useState, useMemo } from 'react';
import { TeamMember, Course, Trail, Event, Channel, Pulse, SelectedItem, MemberStatus, Enrollment, EnrollmentType, EnrollmentStatus } from '../../types';
import { Icon } from '../Icon';
import { MEMBER_RANKING_DATA, MEMBER_CONTENT_PROGRESS_DATA, COURSE_CONTENT_ITEMS_DATA } from '../../constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { MemberCourseActivityDetail } from './MemberCourseProgressDetail';
import { MemberTrailProgressDetail } from './MemberTrailProgressDetail';
import { MemberChannelProgressDetail } from './MemberChannelProgressDetail';
import { ProgressBar } from '../ProgressBar';
import { StatusBadge } from '../StatusBadge';
import { TypeBadge } from '../TypeBadge';
import { SimpleKpiCard } from '../SimpleKpiCard';

interface TeamMemberDetailProps {
  member: TeamMember;
  allMembers: TeamMember[];
  allCourses: Course[];
  allTrails: Trail[];
  allEvents: Event[];
  allChannels: Channel[];
  allPulses: Pulse[];
  allEnrollments: Enrollment[];
  onItemClick: (type: SelectedItem['type'], data: any) => void;
}

type DetailTab = 'overview' | 'courses' | 'trails' | 'events' | 'channels' | 'pulses';
type EventItemStatus = 'Agendado' | 'Realizado';

// --- Helper Functions for Simplified Tables ---

const getParticipationStatus = (eventId: string, memberId: string, eventDateStr: string): { status: 'Participou' | 'Não Participou' | 'Inscrito'; icon: string, color: string } => {
    const eventEndDate = new Date(eventDateStr.split(' a ').pop()!.split('/').reverse().join('-') + 'T23:59:59');
    if (eventEndDate < new Date()) {
        const seed = parseInt(memberId, 10) + eventId.charCodeAt(1);
        if (seed % 3 !== 0) {
            return { status: 'Participou', icon: 'check_circle', color: 'text-green-600 dark:text-green-400' };
        } else {
            return { status: 'Não Participou', icon: 'cancel', color: 'text-red-600 dark:text-red-400' };
        }
    }
    return { status: 'Inscrito', icon: 'event_seat', color: 'text-blue-600 dark:text-blue-400' };
};

const getEventItemStatus = (dateStr: string): EventItemStatus => {
    const eventEndDate = new Date(dateStr.split(' a ').pop()!.split('/').reverse().join('-') + 'T23:59:59');
    return eventEndDate < new Date() ? 'Realizado' : 'Agendado';
};

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

const getMemberTrailPerformance = (memberId: string, trail: Trail): number => {
    if (trail.courseIds.length === 0) {
        return 0;
    }
    const totalPerformance = trail.courseIds.reduce((sum, courseId) => {
        return sum + getMemberCoursePerformance(memberId, courseId);
    }, 0);
    return Math.round(totalPerformance / trail.courseIds.length);
};


// --- Simplified Table Components ---

const MemberCoursesList: React.FC<{ enrollments: Enrollment[], courses: Course[], onCourseSelect: (course: Course) => void, memberId: string }> = ({ enrollments, courses, onCourseSelect, memberId }) => {
    const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

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

        return enrollments.map(enrollment => {
            const performance = getMemberCoursePerformance(memberId, enrollment.courseId);
            return { enrollment, performance, sortPriority: statusPriority[enrollment.status] || 99 };
        }).sort((a, b) => a.sortPriority - b.sortPriority);
    }, [enrollments, memberId]);

    return (
        <ul className="space-y-3">
            {processedEnrollments.map(({ enrollment, performance }) => {
                const course = courseMap.get(enrollment.courseId);
                if (!course) return null;

                return (
                    <li key={enrollment.id} onClick={() => onCourseSelect(course)} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Icon name="rocket_launch" className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={course.name}>{course.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {enrollment.type === EnrollmentType.Obrigatoria && (
                                    <TypeBadge type={enrollment.isNormativa ? 'Normativa' : 'Obrigatória'} isExpanded />
                                )}
                            </div>
                        </div>
                        <div className="w-full sm:w-auto ml-auto flex items-center justify-end gap-x-6 gap-y-2 flex-wrap">
                            <div className="text-center w-20">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{enrollment.progress}%</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Progresso</p>
                            </div>
                            <div className="text-center w-20">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{performance}%</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                            </div>
                            <div className="w-28 text-center">
                                <StatusBadge status={enrollment.status} />
                            </div>
                            <div className="text-center w-24">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {enrollment.dueDate ? new Date(enrollment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Data Meta</p>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};


const MemberTrailsList: React.FC<{ trails: Trail[], member: TeamMember, onTrailSelect: (trail: Trail) => void }> = ({ trails, member, onTrailSelect }) => {
    // This component's logic might need updating if trails also become enrollment-based.
    // For now, it uses the old progress simulation.
    const getIndividualProgress = (member: TeamMember, contentId: string): number => {
        if (member.status === MemberStatus.Completed) return 100;
        if (member.status === MemberStatus.NotStarted || member.status === MemberStatus.Empty) return 0;
        const progressSeed = member.id.charCodeAt(0) + contentId.charCodeAt(1) + (contentId.length);
        if (member.status === MemberStatus.Late) return (progressSeed % 40) + 10;
        return (progressSeed % 50) + 45;
    };
    
    const processedTrails = useMemo(() => {
        return trails.map(trail => {
            const progress = getIndividualProgress(member, trail.id);
            const performance = getMemberTrailPerformance(member.id, trail);

            let customStatus: 'Atrasado' | 'A Vencer' | 'Em Dia' | 'Não Iniciado' | 'Concluído' = 'Em Dia';
            let sortPriority = 4;
            if (progress === 100) { customStatus = 'Concluído'; sortPriority = 5; }
            else if (trail.isMandatory && trail.dueDate) {
                const today = new Date(); const dueDate = new Date(trail.dueDate + 'T00:00:00'); today.setHours(0,0,0,0);
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) { customStatus = 'Atrasado'; sortPriority = 1; }
                else if (diffDays <= 7) { customStatus = 'A Vencer'; sortPriority = 2; }
            }
            if (progress === 0 && sortPriority > 2) { customStatus = 'Não Iniciado'; sortPriority = 3; }

            let badgeStatus: MemberStatus;
            switch(customStatus) {
                case 'Atrasado': badgeStatus = MemberStatus.Late; break;
                case 'Concluído': badgeStatus = MemberStatus.Completed; break;
                case 'Não Iniciado': badgeStatus = MemberStatus.NotStarted; break;
                case 'A Vencer':
                case 'Em Dia':
                default: badgeStatus = MemberStatus.OnTrack; break;
            }

            return { trail, progress, performance, status: badgeStatus, sortPriority };
        }).sort((a, b) => a.sortPriority - b.sortPriority);
    }, [trails, member]);

    return (
        <ul className="space-y-3">
            {processedTrails.map(({ trail, progress, performance, status }) => (
                <li key={trail.id} onClick={() => onTrailSelect(trail)} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Icon name="timeline" className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={trail.name}>{trail.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {trail.isMandatory && <TypeBadge type="Obrigatória" isExpanded />}
                        </div>
                    </div>
                    <div className="w-full sm:w-auto ml-auto flex items-center justify-end gap-x-6 gap-y-2 flex-wrap">
                        <div className="text-center w-20">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Progresso</p>
                        </div>
                        <div className="text-center w-20">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{performance}%</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                        </div>
                        <div className="w-28 text-center">
                            <StatusBadge status={status} />
                        </div>
                         <div className="text-center w-24">
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

const ParticipationStatusTag: React.FC<{ status: 'Participou' | 'Não Participou' | 'Inscrito'; icon: string }> = ({ status, icon }) => {
    const iconColorMap = {
        'Participou': 'text-green-600 dark:text-green-400',
        'Não Participou': 'text-red-600 dark:text-red-400',
        'Inscrito': 'text-blue-600 dark:text-blue-400',
    };
    return (
        <span className="px-3 py-1 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
            <Icon name={icon} size="sm" className={iconColorMap[status]} />
            <span className="whitespace-nowrap">{status}</span>
        </span>
    );
};

const MemberEventsList: React.FC<{ events: Event[], member: TeamMember, onItemClick: (type: 'event', data: Event) => void }> = ({ events, member, onItemClick }) => (
     <ul className="space-y-3">
        {events.map(event => {
            const participation = getParticipationStatus(event.id, member.id, event.date);
            const eventStatus = getEventItemStatus(event.date);
            return (
                <li key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Icon name="event" className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={event.name}>{event.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
                    </div>
                    <div className="w-full sm:w-auto ml-auto flex items-center justify-end gap-x-6 gap-y-2 flex-wrap">
                        <div className="text-center w-28">
                             <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{eventStatus}</span>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        </div>
                        <div className="w-32 text-center">
                            <ParticipationStatusTag status={participation.status} icon={participation.icon} />
                        </div>
                    </div>
                </li>
            );
        })}
    </ul>
);

const MemberChannelsList: React.FC<{ channels: Channel[], member: TeamMember, onChannelSelect: (channel: Channel) => void }> = ({ channels, member, onChannelSelect }) => (
    <ul className="space-y-3">
        {channels.map(channel => {
            const totalPulsesInChannel = channel.pulseIds.length;
            const consumedPulses = channel.pulseIds.filter(pulseId => member.pulseIds.includes(pulseId)).length;
            const progress = totalPulsesInChannel > 0 ? Math.round((consumedPulses / totalPulsesInChannel) * 100) : 0;
            return (
                <li key={channel.id} onClick={() => onChannelSelect(channel)} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-4">
                    <Icon name="hub" className="text-purple-600 dark:text-purple-400" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={channel.name}>{channel.name}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3 flex-shrink-0 w-48 justify-end">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{consumedPulses} de {totalPulsesInChannel} pulses</span>
                        <div className="w-24">
                            <ProgressBar progress={progress} />
                        </div>
                    </div>
                </li>
            );
        })}
    </ul>
);

const MemberPulsesList: React.FC<{ pulses: Pulse[], member: TeamMember }> = ({ pulses, member }) => (
    <ul className="space-y-3">
        {pulses.map(pulse => {
            const consumptionDate = new Date(member.lastAccess);
            consumptionDate.setDate(consumptionDate.getDate() - (member.id.charCodeAt(0) % 3));
            const formattedDate = consumptionDate.toLocaleDateString('pt-BR');
            return (
                <li key={pulse.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-4">
                    <Icon name="track_changes" className="text-purple-600 dark:text-purple-400" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={pulse.name}>{pulse.name}</p>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Visualizado em {formattedDate}</span>
                    </div>
                </li>
            );
        })}
    </ul>
);


// --- Main Component ---

const DiagnosticCard: React.FC<{ diagnostic: any }> = ({ diagnostic }) => {
    if (!diagnostic) return null;

    const { status, color, icon, mainText, subText } = diagnostic;

    return (
        <div className={`p-4 rounded-lg flex items-start gap-4 border-l-4 ${color.border} ${color.bg}`}>
            <Icon name={icon} className={`text-2xl ${color.text}`} />
            <div>
                <h4 className={`font-bold text-lg ${color.text}`}>{status}</h4>
                <p className={`font-semibold text-sm ${color.mainText}`}>{mainText}</p>
                <p className={`text-xs ${color.subText}`}>{subText}</p>
            </div>
        </div>
    );
};

const MemberOverview: React.FC<{ member: TeamMember, rankingInfo: any, allTrails: Trail[], enrollments: Enrollment[] }> = ({ member, rankingInfo, allTrails, enrollments }) => {
    
    const diagnosticData = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);

        const mandatoryEnrollments = enrollments.filter(e => e.type === EnrollmentType.Obrigatoria && e.dueDate);
        const mandatoryTrails = allTrails.filter(t => member.trailIds.includes(t.id) && t.isMandatory && t.dueDate);

        const mandatoryWithDiffs = [
            ...mandatoryEnrollments.map(item => ({...item, diffDays: Math.ceil((new Date(item.dueDate! + 'T00:00:00').getTime() - today.getTime()) / (1000*60*60*24))})),
            ...mandatoryTrails.map(item => ({...item, diffDays: Math.ceil((new Date(item.dueDate! + 'T00:00:00').getTime() - today.getTime()) / (1000*60*60*24))}))
        ];

        const overdueItems = mandatoryWithDiffs.filter(item => item.diffDays < 0);
        const dueSoonItems = mandatoryWithDiffs.filter(item => item.diffDays >= 0 && item.diffDays <= 15);
        const lastActivityDiff = Math.floor((new Date().getTime() - new Date(member.lastAccess).getTime()) / (1000 * 60 * 60 * 24));

        if (overdueItems.length > 0) {
            return {
                status: 'Em Risco', icon: 'error',
                color: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-500', text: 'text-red-600 dark:text-red-400', mainText: 'text-red-800 dark:text-red-200', subText: 'text-red-600 dark:text-red-400' },
                mainText: `${overdueItems.length} Treinamento(s) Atrasado(s)`,
                subText: `Última Atividade: Há ${lastActivityDiff} dias`
            };
        }
        if (dueSoonItems.length > 0) {
            return {
                status: 'Em Atenção', icon: 'warning',
                color: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', mainText: 'text-yellow-800 dark:text-yellow-200', subText: 'text-yellow-600 dark:text-yellow-400' },
                mainText: `${dueSoonItems.length} Treinamento(s) a Vencer`,
                subText: `Última Atividade: Há ${lastActivityDiff} dias`
            };
        }
        return {
            status: 'Em Dia', icon: 'check_circle',
            color: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-500', text: 'text-green-600 dark:text-green-400', mainText: 'text-green-800 dark:text-green-200', subText: 'text-green-600 dark:text-green-400' },
            mainText: 'Nenhuma pendência obrigatória',
            subText: `Última Atividade: Há ${lastActivityDiff} dias`
        };
    }, [member, allTrails, enrollments]);

    const completionRate = useMemo(() => {
        const totalEnrollments = enrollments.length;
        if (totalEnrollments === 0) return 0;
        const completedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.Finalizado).length;
        return Math.round((completedEnrollments / totalEnrollments) * 100);
    }, [enrollments]);
    
    const completionHistory = useMemo(() => {
        const history = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const currentMonth = new Date().getMonth();
        
        const totalEnrollments = enrollments.length;
        const completedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.Finalizado).length;
        
        let currentCompleted = completedEnrollments;
        let currentTotal = totalEnrollments;

        for (let i = 11; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthName = monthNames[monthIndex];

            const completed = Math.max(0, currentCompleted);
            const total = Math.max(completed, currentTotal);

            history.push({ 
                month: monthName, 
                'Matrículas Finalizadas': completed,
                'Total de Matrículas': total,
            });
            
            // Simulate previous months data by decreasing current values
            const completedChange = Math.floor(Math.random() * 2); // 0 or 1
            const totalChange = completedChange + Math.floor(Math.random() * 2); 
            
            currentCompleted -= completedChange;
            currentTotal -= totalChange;
        }
        return history;
    }, [enrollments]);

    return (
        <div className="space-y-6">
            <DiagnosticCard diagnostic={diagnosticData} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <SimpleKpiCard icon="rocket_launch" value={`${member.coursesCompleted}/${member.totalCourses}`} label="Matrículas Concluídas" />
                <SimpleKpiCard icon="task_alt" value={`${completionRate}%`} label="Taxa de Conclusão" />
                <SimpleKpiCard icon="military_tech" value={`${rankingInfo?.points?.toLocaleString('pt-BR') ?? 'N/A'} pts`} label={`#${rankingInfo?.rank ?? 'N/A'} no Ranking`} />
            </div>
             <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/60 h-72">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-base">Histórico de Conclusão (Últimos 12 Meses)</h4>
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={completionHistory} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" />
                        <XAxis dataKey="month" stroke="var(--chart-text-stroke)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--chart-text-stroke)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '0.5rem' }} />
                        <Legend verticalAlign="top" align="right" height={36} />
                        <Line type="monotone" name="Finalizadas" dataKey="Matrículas Finalizadas" stroke="var(--chart-line-main-stroke)" strokeWidth={2} activeDot={{ r: 6 }}/>
                        <Line type="monotone" name="Total" dataKey="Total de Matrículas" stroke="var(--chart-line-secondary-stroke)" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const TeamMemberDetail: React.FC<TeamMemberDetailProps> = ({ member, allCourses, allTrails, allEvents, allChannels, allPulses, allEnrollments, onItemClick }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedCourseForActivity, setSelectedCourseForActivity] = useState<Course | null>(null);
  const [selectedTrailForProgress, setSelectedTrailForProgress] = useState<Trail | null>(null);
  const [selectedChannelForProgress, setSelectedChannelForProgress] = useState<Channel | null>(null);
  
  const rankingInfo = useMemo(() => MEMBER_RANKING_DATA.find(r => r.id === member.id), [member.id]);
  const memberEnrollments = useMemo(() => allEnrollments.filter(e => member.enrollmentIds.includes(e.id)), [allEnrollments, member.enrollmentIds]);
  const memberTrails = allTrails.filter(trail => member.trailIds.includes(trail.id));
  const memberEvents = allEvents.filter(event => member.eventIds.includes(event.id));
  const memberChannels = allChannels.filter(channel => member.channelIds.includes(channel.id));
  const memberPulses = allPulses.filter(pulse => member.pulseIds.includes(pulse.id));

  const handleCourseSelect = (course: Course) => setSelectedCourseForActivity(course);
  const handleTrailSelect = (trail: Trail) => setSelectedTrailForProgress(trail);
  const handleChannelSelect = (channel: Channel) => setSelectedChannelForProgress(channel);

  const renderContent = () => {
    const emptyState = (entity: string) => (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Este liderado não possui nenhuma matrícula de {entity}.
        </div>
    );
    switch (activeTab) {
      case 'overview':
        return <MemberOverview member={member} rankingInfo={rankingInfo} allTrails={allTrails} enrollments={memberEnrollments} />;
      case 'courses':
        return memberEnrollments.length === 0 ? emptyState('curso') : <MemberCoursesList enrollments={memberEnrollments} courses={allCourses} onCourseSelect={handleCourseSelect} memberId={member.id} />;
      case 'trails':
        return memberTrails.length === 0 ? emptyState('trilha') : <MemberTrailsList trails={memberTrails} member={member} onTrailSelect={handleTrailSelect} />;
      case 'events':
         return memberEvents.length === 0 ? emptyState('evento') : <MemberEventsList events={memberEvents} member={member} onItemClick={onItemClick} />;
      case 'channels':
        return memberChannels.length === 0 ? emptyState('canal') : <MemberChannelsList channels={memberChannels} member={member} onChannelSelect={handleChannelSelect} />;
      case 'pulses':
        return memberPulses.length === 0 
            ? <div className="text-center py-8 text-gray-500 dark:text-gray-400">Este liderado não consumiu nenhum pulse.</div>
            : <MemberPulsesList pulses={memberPulses} member={member} />;
      default:
        return null;
    }
  };

  if (selectedCourseForActivity) {
      return <MemberCourseActivityDetail member={member} course={selectedCourseForActivity} onBack={() => setSelectedCourseForActivity(null)} />;
  }
  if (selectedTrailForProgress) {
    return <MemberTrailProgressDetail member={member} trail={selectedTrailForProgress} allCourses={allCourses} allEnrollments={allEnrollments} onBack={() => setSelectedTrailForProgress(null)} onCourseSelect={handleCourseSelect} />;
  }
  if (selectedChannelForProgress) {
      return <MemberChannelProgressDetail member={member} channel={selectedChannelForProgress} allPulses={allPulses} onBack={() => setSelectedChannelForProgress(null)} />;
  }

  return (
    <div className="overflow-hidden">
        <div className="px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs" role="tablist">
            <TabButton<DetailTab> id="overview" label="Visão Geral" icon="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="courses" label={`Cursos (${memberEnrollments.length})`} icon="rocket_launch" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="trails" label={`Trilhas (${memberTrails.length})`} icon="timeline" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="pulses" label={`Pulses (${memberPulses.length})`} icon="track_changes" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="channels" label={`Canais (${memberChannels.length})`} icon="hub" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="events" label={`Eventos (${memberEvents.length})`} icon="event" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </div>
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
    </div>
  );
};

const TabButton = <T extends string>({ id, label, icon, activeTab, setActiveTab }: { id: T, label: string, icon: string, activeTab: T, setActiveTab: (id: T) => void }) => (
  <button
    role="tab"
    aria-selected={activeTab === id}
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