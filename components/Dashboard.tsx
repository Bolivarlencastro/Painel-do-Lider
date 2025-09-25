import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from './Icon';
import { EnhancedKpiCard } from './EnhancedKpiCard';
import { ImmediateActionTable } from './ImmediateActionTable';
import { MandatoryCoursesTable } from './MandatoryCoursesTable';
import { InactiveMembersTable } from './InactiveMembersTable';
import { TeamMembersTable } from './TeamMembersTable';
import { CoursesTable } from './CoursesTable';
import { TrailsTable } from './TrailsTable';
import { EventsTable } from './EventsTable';
import { ChannelsTable } from './ChannelsTable';
import { PulsesTable } from './PulsesTable';
import { Modal } from './Modal';
import { NPSModal } from './NPSModal';
import { TeamMemberDetail } from './details/TeamMemberDetail';
import { CourseDetail } from './details/CourseDetail';
import { TrailDetail } from './details/TrailDetail';
import { EventDetail } from './details/EventDetail';
import { ChannelDetail } from './details/ChannelDetail';
import { PulseDetail } from './details/PulseDetail';
import { GamificationRanking } from './GamificationRanking';
import { FreeEnrollmentsTable } from './FreeEnrollmentsTable';
import { View, TeamMember, Course, Trail, Event, SelectedItem, Channel, Pulse, EnhancedKpiData, TrendDirection, MemberRankingItem, Enrollment, EnrollmentStatus, EnrollmentType } from '../types';
import { analytics } from '../services/analytics';
import { LocalSortConfig } from './TeamMembersTable';


// --- KPI Calculation Logic ---

const durationToHours = (durationStr: string): number => {
    if (!durationStr) return 0;
    let totalHours = 0;
    
    // Improved regex to handle various formats like "10m", "10 min", "4h 30m"
    const durationRegex = /(?:(\d+(?:\.\d+)?)\s*h(?:oras|r)?)?\s*(?:(\d+)\s*m(?:in)?)?/;
    const matches = durationStr.match(durationRegex);

    if (matches) {
        const hours = parseFloat(matches[1]) || 0;
        const minutes = parseInt(matches[2], 10) || 0;
        totalHours = hours + (minutes / 60);
    }
    
    return totalHours;
};

const getTrend = (current: number, benchmark: number, unit: string = '', isHigherBetter: boolean = true, precision: number = 0): { value: string; direction: TrendDirection; period: string; benchmarkValue: string; } => {
    const diff = current - benchmark;
    let direction: TrendDirection;

    if (isHigherBetter) {
        direction = diff > 0.1 ? 'positive' : diff < -0.1 ? 'negative' : 'neutral';
    } else {
        direction = diff < -0.1 ? 'positive' : diff > 0.1 ? 'negative' : 'neutral';
    }
    
    const value = `${diff > 0 ? '+' : ''}${diff.toFixed(precision)}${unit}`;
    
    return {
        value,
        direction,
        period: 'vs. Média da Empresa',
        benchmarkValue: `${benchmark.toFixed(precision)}${unit}`
    };
};

const calculateKpis = (
    members: TeamMember[],
    courses: Course[],
    trails: Trail[],
    pulses: Pulse[],
    enrollments: Enrollment[],
    isKpiComparisonEnabled: boolean
): EnhancedKpiData[] => {
    const noTrend = {
        value: '',
        direction: 'neutral' as TrendDirection,
        period: '',
        benchmarkValue: undefined
    };

    // --- Edge Case: No Data ---
    if (members.length === 0) {
        const naKpi = (label: string, context: string): EnhancedKpiData => ({
            value: 'N/A',
            label,
            context,
            trend: noTrend,
            supportText: 'Não há dados de equipe para calcular.'
        });
        return [
            naKpi('Total de Matrículas', 'Soma das matrículas em Cursos e Trilhas pela equipe.'),
            naKpi('Taxa de Liderados Ativos', '% de liderados que acessaram nos últimos 30 dias.'),
            naKpi('Taxa de Conclusão', '(Matrículas concluídas / Matrículas totais) * 100'),
            naKpi('Média de Horas por Liderado', 'Média de horas de treinamento por liderado.'),
            naKpi('Progresso dos Cursos Obrigatórios', '% de conclusão das matrículas obrigatórias.')
        ];
    }
    
    // --- Simulated Company Averages for Benchmarking ---
    const COMPANY_AVG_ENROLLMENTS = 40;
    const COMPANY_AVG_ACTIVE_MEMBERS_RATE = 60;
    const COMPANY_AVG_COMPLETION_RATE = 85;
    const COMPANY_AVG_HOURS_PER_LEADER = 6.5;
    const COMPANY_AVG_MANDATORY_COMPLETION = 95;

    // KPI 1: Total de Matrículas
    const totalMatriculas = enrollments.length + members.reduce((sum, member) => sum + member.trailIds.length, 0);
    
    // KPI 2: Taxa de Liderados Ativos
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeMembersCount = members.filter(m => new Date(m.lastAccess) > thirtyDaysAgo).length;
    const taxaColaboradoresAtivos = members.length > 0 ? (activeMembersCount / members.length) * 100 : 0;

    // KPI 3: Taxa de Conclusão
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.Finalizado).length;
    const taxaConclusao = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    
    // KPI 4: Média de Horas por Liderado
    const courseDurationMap = new Map(courses.map(c => [c.id, durationToHours(c.duration)]));
    const pulseDurationMap = new Map(pulses.map(p => [p.id, durationToHours(p.duration)]));
    // Calculate hours based on completed enrollments only for a more accurate picture
    const totalHoursTrained = enrollments
        .filter(e => e.status === EnrollmentStatus.Finalizado)
        .reduce((sum, e) => sum + (courseDurationMap.get(e.courseId) || 0), 0);
        
    const totalPulseHours = members.reduce((total, member) => {
        return total + member.pulseIds.reduce((sum, pulseId) => sum + (pulseDurationMap.get(pulseId) || 0), 0);
    }, 0);
    const mediaHorasPorColaborador = members.length > 0 ? (totalHoursTrained + totalPulseHours) / members.length : 0;

    // KPI 5: Progresso dos Cursos Obrigatórios
    const mandatoryEnrollments = enrollments.filter(e => e.type === EnrollmentType.Obrigatoria);
    let mandatoryKpi: EnhancedKpiData;

    if (mandatoryEnrollments.length === 0) {
        mandatoryKpi = {
            value: 'N/A',
            label: 'Progresso dos Cursos Obrigatórios',
            context: '% de conclusão das matrículas obrigatórias.',
            supportText: 'Nenhuma matrícula obrigatória para a equipe.',
            trend: noTrend,
        };
    } else {
        const completedMandatory = mandatoryEnrollments.filter(e => e.status === EnrollmentStatus.Finalizado).length;
        const progressoCursosObrigatorios = (completedMandatory / mandatoryEnrollments.length) * 100;

        mandatoryKpi = {
            value: `${progressoCursosObrigatorios.toFixed(0)}%`,
            label: 'Progresso dos Cursos Obrigatórios',
            context: '% de conclusão das matrículas obrigatórias.',
            trend: isKpiComparisonEnabled ? getTrend(progressoCursosObrigatorios, COMPANY_AVG_MANDATORY_COMPLETION, '%') : noTrend
        };
    }

    const kpis: EnhancedKpiData[] = [
        {
            value: totalMatriculas.toString(),
            label: 'Total de Matrículas',
            context: 'Soma das matrículas em Cursos e Trilhas pela equipe.',
            trend: isKpiComparisonEnabled ? getTrend(totalMatriculas, COMPANY_AVG_ENROLLMENTS, '', true, 0) : noTrend
        },
        {
            value: `${taxaColaboradoresAtivos.toFixed(0)}%`,
            label: 'Taxa de Liderados Ativos',
            context: '% de liderados que acessaram nos últimos 30 dias.',
            trend: isKpiComparisonEnabled ? getTrend(taxaColaboradoresAtivos, COMPANY_AVG_ACTIVE_MEMBERS_RATE, '%') : noTrend
        },
        {
            value: `${taxaConclusao.toFixed(0)}%`,
            label: 'Taxa de Conclusão',
            context: '(Matrículas concluídas / Matrículas totais) * 100',
            trend: isKpiComparisonEnabled ? getTrend(taxaConclusao, COMPANY_AVG_COMPLETION_RATE, '%') : noTrend
        },
        {
            value: mediaHorasPorColaborador.toFixed(1),
            label: 'Média de Horas por Liderado',
            context: 'Média de horas de treinamento por liderado.',
            trend: isKpiComparisonEnabled ? getTrend(mediaHorasPorColaborador, COMPANY_AVG_HOURS_PER_LEADER, '', true, 1) : noTrend
        },
        mandatoryKpi,
    ];
    return kpis;
};


// --- Main Component ---
interface DashboardProps {
  activeView: View;
  setActiveView: (view: View) => void;
  setActiveSidebarItem: (id: string) => void;
  teamMembers: TeamMember[];
  courses: Course[];
  trails: Trail[];
  events: Event[];
  channels: Channel[];
  pulses: Pulse[];
  enrollments: Enrollment[];
  memberRanking: MemberRankingItem[];
  isRankingEnabled: boolean;
  isNormativasModuleEnabled: boolean;
  isKpiComparisonEnabled: boolean;
  impersonatedLeaderName: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    activeView, 
    setActiveView, 
    setActiveSidebarItem,
    teamMembers,
    courses,
    trails,
    events,
    channels,
    pulses,
    enrollments,
    memberRanking,
    isRankingEnabled,
    isNormativasModuleEnabled,
    isKpiComparisonEnabled,
    impersonatedLeaderName
}) => {
  const [isNpsModalOpen, setNpsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [memberFilterKey, setMemberFilterKey] = useState<string | null>(null);
  const [memberInitialSort, setMemberInitialSort] = useState<LocalSortConfig | null>(null);

  useEffect(() => {
    // Logic to trigger NPS modal, e.g., after some time or actions
    const timer = setTimeout(() => {
        const hasSeenNPS = sessionStorage.getItem('nps_seen');
        if (!hasSeenNPS) {
            setNpsModalOpen(true);
            sessionStorage.setItem('nps_seen', 'true');
        }
    }, 15000); // Trigger after 15 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleItemClick = (type: SelectedItem['type'], data: any) => {
    analytics.track('details_viewed', { item_type: type, item_id: data.id });
    setSelectedItem({ type, data } as SelectedItem);
  };
  
  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleViewMembersWithFilter = (filterKey: string) => {
    setMemberFilterKey(filterKey);
    setActiveView('liderados');
    setActiveSidebarItem(''); // Deselect sidebar item as it's a context navigation
  };

  const handleViewMembersWithSort = (sortConfig: LocalSortConfig) => {
    setMemberInitialSort(sortConfig);
    setMemberFilterKey(null); // Clear any existing filters
    setActiveView('liderados');
    setActiveSidebarItem('');
  };

  // Memoize data to avoid recalculations
  const allTeamMembers = useMemo(() => teamMembers, [teamMembers]);
  const allCourses = useMemo(() => courses, [courses]);
  const allTrails = useMemo(() => trails, [trails]);
  const allEvents = useMemo(() => events, [events]);
  const allChannels = useMemo(() => channels, [channels]);
  const allPulses = useMemo(() => pulses, [pulses]);
  const allEnrollments = useMemo(() => enrollments, [enrollments]);
  const allMemberRanking = useMemo(() => memberRanking, [memberRanking]);
  const isTeamEmpty = allTeamMembers.length === 0;

  const enhancedKpis = useMemo(() => calculateKpis(allTeamMembers, allCourses, allTrails, allPulses, allEnrollments, isKpiComparisonEnabled), [allTeamMembers, allCourses, allTrails, allPulses, allEnrollments, isKpiComparisonEnabled]);

  const renderCurrentView = () => {
    switch (activeView) {
      case 'visaoGeral':
        return <OverviewView kpis={enhancedKpis} members={allTeamMembers} enrollments={allEnrollments} memberRanking={allMemberRanking} onMemberClick={(member) => handleItemClick('member', member)} onViewAllMembers={handleViewMembersWithFilter} isTeamEmpty={isTeamEmpty} isRankingEnabled={isRankingEnabled} isNormativasModuleEnabled={isNormativasModuleEnabled} />;
      case 'liderados':
        return <TeamMembersTable members={allTeamMembers} allCourses={allCourses} allTrails={allTrails} enrollments={allEnrollments} onRowClick={(member) => handleItemClick('member', member)} initialFilterKey={memberFilterKey} onFilterApplied={() => setMemberFilterKey(null)} initialSortConfig={memberInitialSort} onSortApplied={() => setMemberInitialSort(null)} />;
      case 'cursos':
        return <CoursesTable courses={allCourses} members={allTeamMembers} enrollments={allEnrollments} onRowClick={(course) => handleItemClick('course', course)} />;
      case 'trilhas':
        return <TrailsTable trails={allTrails} members={allTeamMembers} allCourses={allCourses} allPulses={allPulses} onRowClick={(trail) => handleItemClick('trail', trail)} />;
      case 'eventos':
          return <EventsTable events={allEvents} members={allTeamMembers} onRowClick={(event) => handleItemClick('event', event)} />;
      case 'canais':
          return <ChannelsTable channels={allChannels} members={allTeamMembers} pulses={allPulses} onRowClick={(channel) => handleItemClick('channel', channel)} />;
      case 'pulses':
          return <PulsesTable pulses={allPulses} channels={allChannels} members={allTeamMembers} onRowClick={(pulse) => handleItemClick('pulse', pulse)} />;
      default:
        return null;
    }
  };
  
  const renderDetailView = () => {
      if (!selectedItem) return null;
      
      let title: React.ReactNode = '';
      let detailComponent = null;
      let removeMainPadding = false;

      switch(selectedItem.type) {
        case 'member':
            title = (
                <div className="flex items-center gap-3">
                    <img src={selectedItem.data.avatarUrl} alt={selectedItem.data.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedItem.data.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">{selectedItem.data.jobTitle}</p>
                    </div>
                </div>
            );
            detailComponent = <TeamMemberDetail member={selectedItem.data} allMembers={allTeamMembers} allCourses={allCourses} allTrails={allTrails} allEvents={allEvents} allChannels={allChannels} allPulses={allPulses} allEnrollments={allEnrollments} onItemClick={handleItemClick} />;
            removeMainPadding = true;
            break;
        case 'course':
            title = `Detalhes do Curso`;
            // FIX: Added missing onItemClick prop to CourseDetail.
            detailComponent = <CourseDetail course={selectedItem.data} allMembers={allTeamMembers} allTrails={allTrails} allEnrollments={allEnrollments} onItemClick={handleItemClick} />;
            break;
        case 'trail':
            title = `Detalhes da Trilha`;
            // FIX: Added missing onItemClick prop to TrailDetail.
            detailComponent = <TrailDetail trail={selectedItem.data} allCourses={allCourses} allMembers={allTeamMembers} allPulses={allPulses} allEnrollments={allEnrollments} onItemClick={handleItemClick} />;
            break;
        case 'event':
            title = `Detalhes do Evento`;
            detailComponent = <EventDetail event={selectedItem.data} allMembers={allTeamMembers} />;
            break;
        case 'channel':
            title = `Detalhes do Canal`;
            detailComponent = <ChannelDetail channel={selectedItem.data} allPulses={allPulses} allMembers={allTeamMembers} />;
            break;
         case 'pulse':
            title = `Detalhes do Pulse`;
            detailComponent = <PulseDetail pulse={selectedItem.data} allChannels={allChannels} allTrails={allTrails} allMembers={allTeamMembers} />;
            break;
      }

      return (
         <Modal isOpen={!!selectedItem} onClose={handleCloseDetails} title={title} removeMainPadding={removeMainPadding}>
            {detailComponent}
        </Modal>
      );
  }

  const isTableView = activeView !== 'visaoGeral';
  const tooltipText = "Todos os números e métricas se refletem aos liderados atuais do líder, sem contar dados de ex-liderados.";

  return (
    <div className={`flex flex-col ${isTableView ? 'h-full' : ''}`}>
        <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 shrink-0 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel do Líder</h1>
                <div className="relative group flex items-center">
                    <Icon name="info" size="sm" className="text-gray-400 dark:text-gray-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm p-3 bg-gray-900 text-white text-left text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-[60] pointer-events-none">
                        {tooltipText}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 mt-4">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              <TabButton<View> id="visaoGeral" label="Visão Geral" icon="dashboard" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={0} />
              <TabButton<View> id="liderados" label="Liderados" icon="group" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={allTeamMembers.length} />
              <TabButton<View> id="cursos" label="Cursos" icon="rocket_launch" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={allCourses.length} />
              <TabButton<View> id="trilhas" label="Trilhas" icon="timeline" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={allTrails.length} />
              <TabButton<View> id="pulses" label="Pulses" icon="track_changes" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={allPulses.length} />
              <TabButton<View> id="canais" label="Canais" icon="hub" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={allChannels.length} />
              <TabButton<View> id="eventos" label="Eventos" icon="event" activeView={activeView} setActiveView={setActiveView} setActiveSidebarItem={setActiveSidebarItem} allItemsCount={allEvents.length} />
            </nav>
          </div>
        </div>
        
        {impersonatedLeaderName && (
            <div className="bg-yellow-100 dark:bg-yellow-900/40 border-b border-t border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 text-sm text-center py-2 px-4 flex items-center justify-center gap-2 shrink-0">
                <Icon name="visibility" size="sm" />
                Você está visualizando o painel como <strong>{impersonatedLeaderName}</strong>. (Visão de Debug ativada)
            </div>
        )}
      
        <div className={isTableView ? 'flex-1 min-h-0' : ''}>
          {renderCurrentView()}
        </div>

        {renderDetailView()}

        <NPSModal isOpen={isNpsModalOpen} onClose={() => setNpsModalOpen(false)} />
    </div>
  );
};


const TabButton = <T extends string>({ id, label, icon, activeView, setActiveView, setActiveSidebarItem, allItemsCount }: { id: T, label: string, icon: string, activeView: T, setActiveView: (id: T) => void, setActiveSidebarItem: (id: string) => void, allItemsCount: number }) => {
    
    const handleTabClick = (view: T) => {
        analytics.track('tab_viewed', { view_name: view });
        setActiveView(view);
        // As per user request, any tab click in the leader dashboard should keep the 'dashboard' sidebar item active.
        setActiveSidebarItem('dashboard');
    };

    const count = allItemsCount > 0 ? `(${allItemsCount})` : '';

    return (
        <button
            onClick={() => handleTabClick(id)}
            className={`
            ${activeView === id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
            }
            whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
            `}
        >
            <Icon name={icon} size="sm" />
            <span>{label}</span>
            {count && <span className="ml-0.5">{count}</span>}
        </button>
    );
}

const OverviewView: React.FC<{ 
    kpis: EnhancedKpiData[], 
    members: TeamMember[],
    enrollments: Enrollment[],
    memberRanking: MemberRankingItem[],
    onMemberClick: (member: TeamMember) => void, 
    onViewAllMembers: (filterKey: string) => void,
    isTeamEmpty: boolean,
    isRankingEnabled: boolean,
    isNormativasModuleEnabled: boolean
}> = ({ kpis, members, enrollments, memberRanking, onMemberClick, onViewAllMembers, isTeamEmpty, isRankingEnabled, isNormativasModuleEnabled }) => (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {kpis.map((kpi) => (
                <EnhancedKpiCard key={kpi.label} {...kpi} />
            ))}
        </div>
        
        {/* Alerts & Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ImmediateActionTable members={members} enrollments={enrollments} onViewDetails={onMemberClick} onViewAll={() => onViewAllMembers('risky_mandatory')} />
            <FreeEnrollmentsTable members={members} enrollments={enrollments} onViewDetails={onMemberClick} onViewAll={() => onViewAllMembers('low_engagement_free')} />
            <InactiveMembersTable members={members} onViewDetails={onMemberClick} onViewAll={() => onViewAllMembers('inactive')} />
        </div>

        {/* Performance & Compliance Row */}
        <div className={`grid grid-cols-1 ${isNormativasModuleEnabled && isRankingEnabled ? 'lg:grid-cols-2' : ''} gap-6`}>
             {isNormativasModuleEnabled && <MandatoryCoursesTable enrollments={enrollments} members={members} onViewDetails={onMemberClick} onViewAll={() => onViewAllMembers('risky_mandatory')} isTeamEmpty={isTeamEmpty} />}
             {isRankingEnabled && <GamificationRanking memberRanking={memberRanking} isTeamEmpty={isTeamEmpty} />}
        </div>
    </div>
);