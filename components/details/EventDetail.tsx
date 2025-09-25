import React, { useState, useMemo } from 'react';
import { Event, TeamMember, SelectedItem } from '../../types';
import { Icon } from '../Icon';
import { analytics } from '../../services/analytics';

// --- TYPE DEFINITIONS ---
type DetailTab = 'participants' | 'not-enrolled' | 'byDay' | 'byLeader';
type EventStatus = 'Agendado' | 'Realizado';
type ParticipationStatus = 'Participou' | 'Não Participou' | 'Inscrito';
type OverallParticipationStatus = 'Participou' | 'Participação Parcial' | 'Não Participou';

// --- HELPER FUNCTIONS ---
const parseDateRange = (dateStr: string): Date[] => {
    const parts = dateStr.split(' a ');
    const [endDayStr, monthStr, yearStr] = (parts.length > 1 ? parts[1] : parts[0]).split('/');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const endDay = parseInt(endDayStr, 10);
    const startDay = parts.length > 1 ? parseInt(parts[0].split('/')[0], 10) : endDay;
    
    const startDate = new Date(year, month, startDay);
    const endDate = new Date(year, month, endDay);
    
    const dates: Date[] = [];
    if (startDate > endDate) return [startDate];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const getEventStatus = (dateObjects: Date[]): EventStatus => {
    return dateObjects[dateObjects.length - 1] < new Date() ? 'Realizado' : 'Agendado';
};

// Deterministic mock logic for attendance
const getDailyAttendance = (memberId: string, eventId: string, day: Date): boolean => {
    const seed = parseInt(memberId, 10) + eventId.charCodeAt(1) + day.getDate();
    return seed % 4 !== 0; // ~75% chance of attending any given day
};

const getSingleDayParticipation = (memberId: string, eventId: string): boolean => {
     const seed = parseInt(memberId, 10) + eventId.charCodeAt(1);
     return seed % 3 !== 0; // ~66% chance of attending
};

// --- SUB-COMPONENTS ---
const TabButton = <T extends string>({ id, label, icon, activeTab, setActiveTab }: { id: T; label: string; icon: string; activeTab: T; setActiveTab: (id: T) => void }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === id ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}
    >
        <Icon name={icon} size="sm" />
        {label}
    </button>
);

const SimpleMemberList: React.FC<{ members: TeamMember[]; emptyText: string; statusTag?: { text: ParticipationStatus; icon: string; color: string } }> = ({ members, emptyText, statusTag }) => {
    if (members.length === 0) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
    }
    return (
        <ul className="space-y-3">
            {members.map(member => (
                <li key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                    <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 truncate">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
                    </div>
                    {statusTag && (
                        <div className={`ml-auto flex items-center gap-2 flex-shrink-0 text-sm font-medium ${statusTag.color}`}>
                            <Icon name={statusTag.icon} size="sm" />
                            <span>{statusTag.text}</span>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

const VisionByDay: React.FC<{ dateObjects: Date[]; participants: TeamMember[]; eventId: string }> = ({ dateObjects, participants, eventId }) => {
    const [expandedDay, setExpandedDay] = useState<string | null>(dateObjects[0]?.toISOString() || null);

    return (
        <div className="space-y-3">
            {dateObjects.map(day => {
                const dayString = day.toISOString();
                const present = participants.filter(p => getDailyAttendance(p.id, eventId, day));
                const absent = participants.filter(p => !getDailyAttendance(p.id, eventId, day));
                const participationRate = participants.length > 0 ? Math.round((present.length / participants.length) * 100) : 0;
                const isExpanded = expandedDay === dayString;

                return (
                    <div key={dayString} className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-lg overflow-hidden">
                        <button onClick={() => setExpandedDay(isExpanded ? null : dayString)} className="w-full flex items-center justify-between p-3 text-left">
                            <div className="font-semibold text-gray-800 dark:text-gray-200">Dia {dateObjects.indexOf(day) + 1}: {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{participationRate}% de Participação</span>
                                <Icon name={isExpanded ? 'expand_less' : 'expand_more'} />
                            </div>
                        </button>
                        {isExpanded && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Presentes ({present.length})</h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">{present.map(p => <li key={p.id}>{p.name}</li>)}</ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Ausentes ({absent.length})</h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">{absent.map(p => <li key={p.id}>{p.name}</li>)}</ul>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const VisionByLeader: React.FC<{ dateObjects: Date[]; participants: TeamMember[]; eventId: string; }> = ({ dateObjects, participants, eventId }) => {
    const participationData = useMemo(() => {
        return participants.map(member => {
            const attendedDays = dateObjects.filter(day => getDailyAttendance(member.id, eventId, day)).length;
            const totalDays = dateObjects.length;
            let status: OverallParticipationStatus = 'Não Participou';
            let color = 'text-red-600 dark:text-red-400';
            if (attendedDays === totalDays) {
                status = 'Participou';
                color = 'text-green-600 dark:text-green-400';
            } else if (attendedDays > 0) {
                status = 'Participação Parcial';
                color = 'text-yellow-600 dark:text-yellow-400';
            }
            return { member, attendedDays, totalDays, status, color };
        });
    }, [participants, dateObjects, eventId]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/60">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Liderado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status Geral</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Detalhes</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700/60">
                    {participationData.map(data => (
                        <tr key={data.member.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-800 dark:text-gray-200">{data.member.name}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`font-semibold ${data.color}`}>{data.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Presente em {data.attendedDays} de {data.totalDays} dias ({Math.round(data.attendedDays / data.totalDays * 100)}%)</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- VIEW COMPONENTS ---
const ScheduledEventDetail: React.FC<{ event: Event; participants: TeamMember[]; nonParticipants: TeamMember[]; }> = ({ event, participants, nonParticipants }) => {
    const [activeTab, setActiveTab] = useState<DetailTab>('participants');
    

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <TabButton<DetailTab> id="participants" label={`Participantes da Equipe (${participants.length})`} icon="group" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton<DetailTab> id="not-enrolled" label={`Não Inscritos (${nonParticipants.length})`} icon="person_off" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            <div className="pt-6">
                {activeTab === 'participants' ? (
                    <SimpleMemberList members={participants} emptyText="Nenhum liderado inscrito." statusTag={{ text: 'Inscrito', icon: 'event_seat', color: 'text-blue-600 dark:text-blue-400' }} />
                ) : (
                    <SimpleMemberList members={nonParticipants} emptyText="Todos os liderados estão inscritos." />
                )}
            </div>
        </div>
    );
};

const CompletedEventDetail: React.FC<{ event: Event; participants: TeamMember[]; dateObjects: Date[]; isMultiDay: boolean; }> = ({ event, participants, dateObjects, isMultiDay }) => {
    const [activeTab, setActiveTab] = useState<DetailTab>(isMultiDay ? 'byDay' : 'participants');

    if (!isMultiDay) {
        const attended = participants.filter(p => getSingleDayParticipation(p.id, event.id));
        const absent = participants.filter(p => !getSingleDayParticipation(p.id, event.id));
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Compareceram ({attended.length})</h4>
                    <SimpleMemberList members={attended} emptyText="Ninguém compareceu." statusTag={{ text: 'Participou', icon: 'check_circle', color: 'text-green-600 dark:text-green-400' }} />
                </div>
                 <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Não Compareceram ({absent.length})</h4>
                    <SimpleMemberList members={absent} emptyText="Todos compareceram." statusTag={{ text: 'Não Participou', icon: 'cancel', color: 'text-red-600 dark:text-red-400' }} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <TabButton<DetailTab> id="byDay" label="Visão por Dia" icon="calendar_month" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton<DetailTab> id="byLeader" label="Visão por Liderado" icon="person" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            <div className="pt-6">
                {activeTab === 'byDay' ? (
                    <VisionByDay dateObjects={dateObjects} participants={participants} eventId={event.id} />
                ) : (
                    <VisionByLeader dateObjects={dateObjects} participants={participants} eventId={event.id} />
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const EventDetail: React.FC<{ event: Event; allMembers: TeamMember[]; }> = ({ event, allMembers }) => {
    const participants = useMemo(() => allMembers.filter(member => member.eventIds.includes(event.id)), [allMembers, event.id]);
    const nonParticipants = useMemo(() => allMembers.filter(member => !member.eventIds.includes(event.id)), [allMembers, event.id]);
    const dateObjects = useMemo(() => parseDateRange(event.date), [event.date]);
    
    const isMultiDay = dateObjects.length > 1;
    const status = getEventStatus(dateObjects);

    const { overallRate, attendedCount } = useMemo(() => {
        if (status === 'Agendado') return { overallRate: 0, attendedCount: 0 };
        if (participants.length === 0) return { overallRate: 0, attendedCount: 0 };
        
        const totalAttended = participants.filter(p => {
             if (!isMultiDay) return getSingleDayParticipation(p.id, event.id);
             return dateObjects.some(day => getDailyAttendance(p.id, event.id, day)); // Count as attended if they show up at least once
        }).length;

        return {
            overallRate: Math.round((totalAttended / participants.length) * 100),
            attendedCount: totalAttended
        };
    }, [status, participants, isMultiDay, dateObjects, event.id]);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{event.name}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2"><Icon name="calendar_today" size="sm"/> <span>{event.date}</span></div>
                    <div className="flex items-center gap-2"><Icon name="label" size="sm"/> <span>{event.type}</span></div>
                    {status === 'Realizado' ? (
                        <div className="flex items-center gap-2 font-semibold text-purple-600 dark:text-purple-400"><Icon name="military_tech" size="sm"/> <span>Taxa de Participação: {overallRate}% ({attendedCount} de {participants.length})</span></div>
                    ) : (
                        <div className="flex items-center gap-2"><Icon name="group" size="sm"/> <span>{participants.length} Liderados Inscritos</span></div>
                    )}
                </div>
            </div>

            {status === 'Agendado' ? (
                <ScheduledEventDetail event={event} participants={participants} nonParticipants={nonParticipants} />
            ) : (
                <CompletedEventDetail event={event} participants={participants} dateObjects={dateObjects} isMultiDay={isMultiDay} />
            )}
        </div>
    );
};