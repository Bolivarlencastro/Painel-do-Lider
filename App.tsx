
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DebugPanel } from './components/DebugPanel';
import { Theme, View, Course, TeamMember, Trail, Event, Channel, Pulse, MemberRankingItem, MemberStatus, Enrollment, Persona } from './types';
import { analytics } from './services/analytics';
import {
    TEAM_MEMBERS_DATA,
    COURSES_DATA,
    TRAILS_DATA,
    EVENTS_DATA,
    CHANNELS_DATA,
    PULSES_DATA,
    // FIX: Imported missing ENROLLMENTS_DATA.
    ENROLLMENTS_DATA,
    MEMBER_RANKING_DATA,
    PERSONAS
} from './constants';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
          return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const daysAgo = (days: number): string => new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
const daysFromNow = (days: number): string => new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [activeDashboardView, setActiveDashboardView] = useState<View>('visaoGeral');
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]); // Default to first persona
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('dashboard');
  const [activeEdgeCases, setActiveEdgeCases] = useState(new Set<string>());
  // For drill-down: empty = show Analytics, populated = show specific leader(s)
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([]);

  const toggleEdgeCase = useCallback((caseName: string) => {
    analytics.track('debug_case_toggled', { case: caseName });
    setActiveEdgeCases(prev => {
        const newSet = new Set(prev);
        if (newSet.has(caseName)) {
            newSet.delete(caseName);
        } else {
            newSet.add(caseName);
        }
        return newSet;
    });
  }, []);
  
  // Auto-enable impersonation for managers and directors
  const isImpersonationEnabled = activeEdgeCases.has('IMPERSONATE_LEADER') || 
    currentPersona.role === 'manager' || 
    currentPersona.role === 'director';

  // Handle persona change
  const handlePersonaChange = useCallback((persona: Persona) => {
    setCurrentPersona(persona);
    
    // Clear drill-down when changing persona (show Analytics for managers/directors)
    setSelectedLeaderIds([]);
    
    // Reset to overview when changing persona
    setActiveDashboardView('visaoGeral');
    setActiveSidebarItem('dashboard');
    
    analytics.track('persona_changed', {
      fromPersona: currentPersona.name,
      toPersona: persona.name,
      fromRole: currentPersona.role,
      toRole: persona.role
    });
  }, [currentPersona]);

  useEffect(() => {
    // Clear selection when impersonation is turned off
    if (!isImpersonationEnabled) {
        setSelectedLeaderIds([]);
    }
  }, [isImpersonationEnabled]);


  useEffect(() => {
    analytics.track('app_loaded', { theme });
  }, [theme]);
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const leaders = useMemo(() => TEAM_MEMBERS_DATA.filter(member => !member.managerId), []);

  const modifiedData = useMemo(() => {
      let members: TeamMember[] = JSON.parse(JSON.stringify(TEAM_MEMBERS_DATA));
      let courses: Course[] = JSON.parse(JSON.stringify(COURSES_DATA));
      let trails: Trail[] = JSON.parse(JSON.stringify(TRAILS_DATA));
      let events: Event[] = JSON.parse(JSON.stringify(EVENTS_DATA));
      let channels: Channel[] = JSON.parse(JSON.stringify(CHANNELS_DATA));
      let pulses: Pulse[] = JSON.parse(JSON.stringify(PULSES_DATA));
      let enrollments: Enrollment[] = JSON.parse(JSON.stringify(ENROLLMENTS_DATA));
      let memberRanking: MemberRankingItem[] = JSON.parse(JSON.stringify(MEMBER_RANKING_DATA));
      
      if (activeEdgeCases.has('NO_DATA')) {
          return { members: [], courses: [], trails: [], events: [], channels: [], pulses: [], enrollments: [], memberRanking: [] };
      }

      if (activeEdgeCases.has('LONG_NAMES')) {
          members = members.map(m => ({ ...m, name: m.name + ' Sobrenome Muito Comprido Para Testar Quebra de Linha', jobTitle: m.jobTitle + ' - Especialista em Assuntos Extremamente Complexos' }));
          courses = courses.map(c => ({ ...c, name: c.name + ': Um Guia Definitivo e Detalhado Sobre Todos os Aspectos Relevantes' }));
          trails = trails.map(t => ({ ...t, name: t.name + ' e a Jornada Interminável Através dos Vales do Conhecimento Profundo' }));
      }

      if (activeEdgeCases.has('ALL_INACTIVE')) {
          members = members.map(m => ({ ...m, lastAccess: daysAgo(45) }));
      }

      if (activeEdgeCases.has('ALL_OVERDUE')) {
          enrollments = enrollments.map(e => e.type === 'Obrigatória' ? { ...e, dueDate: daysFromNow(-15) } : e);
      }

      if (activeEdgeCases.has('NO_MANDATORY')) {
          enrollments = enrollments.filter(e => e.type !== 'Obrigatória');
          trails = trails.map(t => ({ ...t, isMandatory: false }));
      }
      
      if (activeEdgeCases.has('DISABLE_MANDATORY')) {
          const normativaCourseIds = new Set(COURSES_DATA.filter(c => c.id === 'c6').map(c => c.id)); // Assuming c6 is the only normative course
          enrollments = enrollments.filter(e => !(normativaCourseIds.has(e.courseId) && e.isNormativa));
      }

      if (activeEdgeCases.has('ZERO_PROGRESS')) {
          members = members.map(m => ({ ...m, overallProgress: 0, coursesCompleted: 0, trailsCompleted: 0 }));
          enrollments = enrollments.map(e => ({ ...e, progress: 0 }));
          memberRanking = memberRanking.map(mr => ({...mr, points: 0}));
      }

      if (activeEdgeCases.has('EMPTY_ACTION_CARDS')) {
          members = members.map(m => ({ ...m, lastAccess: daysAgo(1) }));
          enrollments = enrollments.map(e => ({...e, dueDate: daysFromNow(100)}));
          trails = trails.map(t => ({...t, dueDate: daysFromNow(100)}));
      }

      if (activeEdgeCases.has('MEMBER_NO_CONTENT')) {
          const memberIdsToClear = ['1', '4'];
          members = members.map(m => {
              if (memberIdsToClear.includes(m.id)) {
                  return {
                      ...m,
                      overallProgress: 0,
                      coursesCompleted: 0,
                      totalCourses: 0,
                      trailsCompleted: 0,
                      totalTrails: 0,
                      enrollmentIds: [],
                      trailIds: [],
                      eventIds: [],
                      channelIds: [],
                      pulseIds: [],
                      status: MemberStatus.Empty,
                  };
              }
              return m;
          });
          enrollments = enrollments.filter(e => !memberIdsToClear.includes(e.memberId));
      }

      if (activeEdgeCases.has('DISABLE_RANKING')) {
          memberRanking = [];
      }
      
      if (isImpersonationEnabled && selectedLeaderIds.length > 0) {
        const selectedLeaderIdsSet = new Set(selectedLeaderIds);

        // Filter for the TEAM MEMBERS of the selected LEADERS
        members = TEAM_MEMBERS_DATA.filter(m => m.managerId && selectedLeaderIdsSet.has(m.managerId));
        
        const memberIds = new Set(members.map(m => m.id));
        
        enrollments = ENROLLMENTS_DATA.filter(e => memberIds.has(e.memberId));
        const courseIds = new Set(enrollments.map(e => e.courseId));
        const trailIds = new Set(members.flatMap(m => m.trailIds));
        const eventIds = new Set(members.flatMap(m => m.eventIds));
        const channelIds = new Set(members.flatMap(m => m.channelIds));
        const pulseIds = new Set(members.flatMap(m => m.pulseIds));

        courses = COURSES_DATA.filter(c => courseIds.has(c.id));
        trails = TRAILS_DATA.filter(t => trailIds.has(t.id));
        events = EVENTS_DATA.filter(e => eventIds.has(e.id));
        channels = CHANNELS_DATA.filter(ch => channelIds.has(ch.id));
        pulses = PULSES_DATA.filter(p => pulseIds.has(p.id));
        memberRanking = MEMBER_RANKING_DATA.filter(r => memberIds.has(r.id));
      } else if (isImpersonationEnabled && currentPersona.managedLeaderIds && currentPersona.managedLeaderIds.length > 0) {
        // When in Analytics view (no specific leader selected), show all team members of all managed leaders
        const managedLeaderIdsSet = new Set(currentPersona.managedLeaderIds);
        members = TEAM_MEMBERS_DATA.filter(m => m.managerId && managedLeaderIdsSet.has(m.managerId));
        
        const memberIds = new Set(members.map(m => m.id));
        
        enrollments = ENROLLMENTS_DATA.filter(e => memberIds.has(e.memberId));
        const courseIds = new Set(enrollments.map(e => e.courseId));
        const trailIds = new Set(members.flatMap(m => m.trailIds));
        const eventIds = new Set(members.flatMap(m => m.eventIds));
        const channelIds = new Set(members.flatMap(m => m.channelIds));
        const pulseIds = new Set(members.flatMap(m => m.pulseIds));

        courses = COURSES_DATA.filter(c => courseIds.has(c.id));
        trails = TRAILS_DATA.filter(t => trailIds.has(t.id));
        events = EVENTS_DATA.filter(e => eventIds.has(e.id));
        channels = CHANNELS_DATA.filter(ch => channelIds.has(ch.id));
        pulses = PULSES_DATA.filter(p => pulseIds.has(p.id));
        memberRanking = MEMBER_RANKING_DATA.filter(r => memberIds.has(r.id));
      }


      return { members, courses, trails, events, channels, pulses, enrollments, memberRanking };
  }, [activeEdgeCases, selectedLeaderIds, isImpersonationEnabled]);
  
  const isRankingEnabled = !activeEdgeCases.has('DISABLE_RANKING');
  const isNormativasModuleEnabled = !activeEdgeCases.has('DISABLE_MANDATORY');
  const isKpiComparisonEnabled = activeEdgeCases.has('ENABLE_KPI_COMPARISON');

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Sidebar
        activeView={activeDashboardView}
        setActiveView={setActiveDashboardView}
        activeSidebarItem={activeSidebarItem}
        setActiveSidebarItem={setActiveSidebarItem}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          currentPersona={currentPersona}
          personas={PERSONAS}
          onPersonaChange={handlePersonaChange}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
          <Dashboard
            activeView={activeDashboardView}
            setActiveView={setActiveDashboardView}
            setActiveSidebarItem={setActiveSidebarItem}
            teamMembers={modifiedData.members}
            leaders={leaders}
            courses={modifiedData.courses}
            trails={modifiedData.trails}
            events={modifiedData.events}
            channels={modifiedData.channels}
            pulses={modifiedData.pulses}
            enrollments={modifiedData.enrollments}
            memberRanking={modifiedData.memberRanking}
            isRankingEnabled={isRankingEnabled}
            isNormativasModuleEnabled={isNormativasModuleEnabled}
            isKpiComparisonEnabled={isKpiComparisonEnabled}
            isImpersonationEnabled={isImpersonationEnabled}
            selectedLeaderIds={selectedLeaderIds}
            setSelectedLeaderIds={setSelectedLeaderIds}
            managedLeaderIds={currentPersona.managedLeaderIds || []}
          />
        </main>
      </div>
      <DebugPanel activeCases={activeEdgeCases} toggleCase={toggleEdgeCase} />
    </div>
  );
};

export default App;
