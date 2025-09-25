
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AdminView } from './components/AdminView';
import { DebugPanel } from './components/DebugPanel';
import { Theme, View, Course, TeamMember, Trail, Event, Channel, Pulse, MemberRankingItem, MemberStatus, Enrollment } from './types';
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
    MEMBER_RANKING_DATA
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
  const [currentView, setCurrentView] = useState<'leader' | 'admin'>('leader');
  const [activeDashboardView, setActiveDashboardView] = useState<View>('visaoGeral');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('dashboard');
  const [activeEdgeCases, setActiveEdgeCases] = useState(new Set<string>());

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
      
      if (activeEdgeCases.has('IMPERSONATE_LEADER')) {
        const impersonatedId = '2'; // João Silva
        const impersonatedMember = members.find(m => m.id === impersonatedId);

        if (impersonatedMember) {
            const memberEnrollments = enrollments.filter(e => e.memberId === impersonatedId);
            const courseIds = new Set(memberEnrollments.map(e => e.courseId));
            const trailIds = new Set(impersonatedMember.trailIds);
            const eventIds = new Set(impersonatedMember.eventIds);
            const channelIds = new Set(impersonatedMember.channelIds);
            const pulseIds = new Set(impersonatedMember.pulseIds);

            members = [impersonatedMember];
            enrollments = memberEnrollments;
            courses = courses.filter(c => courseIds.has(c.id));
            trails = trails.filter(t => trailIds.has(t.id));
            events = events.filter(e => eventIds.has(e.id));
            channels = channels.filter(ch => channelIds.has(ch.id));
            pulses = pulses.filter(p => pulseIds.has(p.id));
            memberRanking = memberRanking.filter(r => r.id === impersonatedId);
        } else {
            return { members: [], courses: [], trails: [], events: [], channels: [], pulses: [], enrollments: [], memberRanking: [] };
        }
      }

      return { members, courses, trails, events, channels, pulses, enrollments, memberRanking };
  }, [activeEdgeCases]);
  
  const impersonatedLeaderName = useMemo(() => {
    if (activeEdgeCases.has('IMPERSONATE_LEADER')) {
        const leader = TEAM_MEMBERS_DATA.find(m => m.id === '2'); // Hardcoded ID for João Silva
        return leader ? leader.name : null;
    }
    return null;
  }, [activeEdgeCases]);

  const isRankingEnabled = !activeEdgeCases.has('DISABLE_RANKING');
  const isNormativasModuleEnabled = !activeEdgeCases.has('DISABLE_MANDATORY');
  const isKpiComparisonEnabled = activeEdgeCases.has('ENABLE_KPI_COMPARISON');

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeView={activeDashboardView}
        setActiveView={setActiveDashboardView}
        activeSidebarItem={activeSidebarItem}
        setActiveSidebarItem={setActiveSidebarItem}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
          {currentView === 'leader' && (
            <Dashboard
              activeView={activeDashboardView}
              // FIX: Corrected prop name from `setActiveView` to `setActiveDashboardView` to match the state setter.
              setActiveView={setActiveDashboardView}
              setActiveSidebarItem={setActiveSidebarItem}
              teamMembers={modifiedData.members}
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
              impersonatedLeaderName={impersonatedLeaderName}
            />
           )}
          {currentView === 'admin' && <AdminView />}
        </main>
      </div>
      <DebugPanel activeCases={activeEdgeCases} toggleCase={toggleEdgeCase} />
    </div>
  );
};

export default App;
