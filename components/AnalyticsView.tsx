import React, { useState } from 'react';
import { Icon } from './Icon';
import { EnhancedKpiCard } from './EnhancedKpiCard';
import { EnhancedKpiData, TeamMember, LeaderMetrics } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analytics } from '../services/analytics';
import { LeadersRankingTable } from './LeadersRankingTable';
import { LeadersActionTable } from './LeadersActionTable';

interface AnalyticsViewProps {
  teamMembers: TeamMember[];
  leaders: TeamMember[];
  managedLeaderIds: string[]; // IDs of leaders managed by current persona
  onLeaderClick: (leaderId: string) => void; // Callback to drill-down into specific leader
}

const calculateLeaderMetrics = (leaders: TeamMember[], teamMembers: TeamMember[], managedLeaderIds: string[]): LeaderMetrics[] => {
  // Always show all managed leaders (not filtered by selection)
  const relevantLeaders = managedLeaderIds.length > 0 
    ? leaders.filter(l => managedLeaderIds.includes(l.id))
    : leaders;

  return relevantLeaders.map(leader => {
    const team = teamMembers.filter(m => m.managerId === leader.id);
    const avgCompletion = team.length > 0 
      ? team.reduce((sum, m) => sum + m.overallProgress, 0) / team.length 
      : 0;
    
    const pendingTasks = team.reduce((sum, m) => {
      const coursesInProgress = m.totalCourses - m.coursesCompleted;
      const trailsInProgress = m.totalTrails - m.trailsCompleted;
      return sum + coursesInProgress + trailsInProgress;
    }, 0);

    const lastAccessDate = new Date(leader.lastAccess);
    const daysSinceAccess = Math.floor((Date.now() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Engagement score: based on recency of access and team progress
    let engagementScore = 100;
    if (daysSinceAccess > 7) engagementScore -= 50;
    else if (daysSinceAccess > 3) engagementScore -= 25;
    if (avgCompletion < 30) engagementScore -= 20;
    else if (avgCompletion < 50) engagementScore -= 10;
    
    return {
      leaderId: leader.id,
      leaderName: leader.name,
      leaderAvatar: leader.avatarUrl,
      leaderJobTitle: leader.jobTitle,
      teamSize: team.length,
      lastAccess: leader.lastAccess,
      actionsThisWeek: Math.floor(Math.random() * 15) + 5, // Mock data
      teamCompletionRate: avgCompletion,
      pendingTasks,
      engagementScore: Math.max(0, Math.min(100, engagementScore))
    };
  });
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ teamMembers, leaders, managedLeaderIds, onLeaderClick }) => {
  const leaderMetrics = calculateLeaderMetrics(leaders, teamMembers, managedLeaderIds);
  
  // Calculate aggregate KPIs
  const totalLeaders = leaderMetrics.length;
  const activeLeaders = leaderMetrics.filter(l => {
    const daysSinceAccess = Math.floor((Date.now() - new Date(l.lastAccess).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceAccess <= 7;
  }).length;
  const activePercentage = totalLeaders > 0 ? Math.round((activeLeaders / totalLeaders) * 100) : 0;
  
  const avgEngagement = leaderMetrics.length > 0
    ? Math.round(leaderMetrics.reduce((sum, l) => sum + l.engagementScore, 0) / leaderMetrics.length)
    : 0;
  
  const totalActions = leaderMetrics.reduce((sum, l) => sum + l.actionsThisWeek, 0);
  
  const avgTeamCompletion = leaderMetrics.length > 0
    ? Math.round(leaderMetrics.reduce((sum, l) => sum + l.teamCompletionRate, 0) / leaderMetrics.length)
    : 0;

  const ANALYTICS_KPI_DATA: EnhancedKpiData[] = [
    {
      value: `${activePercentage}%`,
      label: 'Líderes Ativos',
      context: `${activeLeaders} de ${totalLeaders} líderes`,
      trend: { value: '+8%', direction: 'positive', period: 'vs. Semana Anterior' }
    },
    {
      value: `${avgEngagement}`,
      label: 'Score de Engajamento',
      context: 'Média geral dos líderes',
      trend: { value: '+5 pts', direction: 'positive', period: 'vs. Semana Anterior' }
    },
    {
      value: `${totalActions}`,
      label: 'Ações Realizadas',
      context: 'Total nesta semana',
      trend: { value: '+12', direction: 'positive', period: 'vs. Semana Anterior' }
    },
    {
      value: `${avgTeamCompletion}%`,
      label: 'Conclusão Média',
      context: 'Das equipes dos líderes',
      trend: { value: '+3%', direction: 'positive', period: 'vs. Mês Anterior' }
    },
  ];

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'semester' | 'year'>('month');

  const getEngagementData = () => {
    switch (timeRange) {
      case 'month':
        return [
          { name: 'Sem 1', value: 65 },
          { name: 'Sem 2', value: 68 },
          { name: 'Sem 3', value: 72 },
          { name: 'Sem 4', value: 75 },
        ];
      case 'quarter':
        return [
          { name: 'Jan', value: 65 },
          { name: 'Fev', value: 70 },
          { name: 'Mar', value: 78 },
        ];
      case 'semester':
        return [
          { name: 'Jan', value: 65 },
          { name: 'Fev', value: 70 },
          { name: 'Mar', value: 78 },
          { name: 'Abr', value: 82 },
          { name: 'Mai', value: 80 },
          { name: 'Jun', value: 85 },
        ];
      case 'year':
        return [
          { name: 'Jan', value: 65 },
          { name: 'Fev', value: 70 },
          { name: 'Mar', value: 78 },
          { name: 'Abr', value: 82 },
          { name: 'Mai', value: 80 },
          { name: 'Jun', value: 85 },
          { name: 'Jul', value: 88 },
          { name: 'Ago', value: 86 },
          { name: 'Set', value: 90 },
          { name: 'Out', value: 92 },
          { name: 'Nov', value: 95 },
          { name: 'Dez', value: 94 },
        ];
      default:
        return [];
    }
  };

  const engagementData = getEngagementData();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 lg:p-8 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics de Liderança</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visão geral de {totalLeaders} {totalLeaders === 1 ? 'líder' : 'líderes'} sob sua gestão
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                analytics.track('view_all_team_members_clicked');
                onLeaderClick('all');
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Icon name="group" size="sm"/>
              <span>Liderados de Todos</span>
            </button>
            <button 
              onClick={() => analytics.track('action_clicked', { action: 'export_analytics_report' })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <Icon name="download" size="sm"/>
              <span>Exportar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-6">
          {/* KPIs principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ANALYTICS_KPI_DATA.map((kpi) => (
              <EnhancedKpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Tabelas de ação e ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeadersActionTable leaderMetrics={leaderMetrics} onLeaderClick={onLeaderClick} />
            <LeadersRankingTable leaderMetrics={leaderMetrics} onLeaderClick={onLeaderClick} />
          </div>

          {/* Gráfico de Evolução de Engajamento */}
          <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Evolução do Engajamento
              </h2>
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                {(['month', 'quarter', 'semester', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      timeRange === range
                        ? 'bg-white dark:bg-gray-600 text-purple-700 dark:text-purple-300 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {range === 'month' && 'Mês'}
                    {range === 'quarter' && 'Trimestre'}
                    {range === 'semester' && 'Semestre'}
                    {range === 'year' && 'Ano'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={engagementData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--chart-text-stroke)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--chart-text-stroke)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--chart-grid-stroke)', strokeWidth: 2 }}
                    contentStyle={{ 
                      backgroundColor: 'var(--chart-tooltip-bg)', 
                      border: '1px solid var(--chart-tooltip-border)', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Engajamento"
                    stroke="var(--chart-line-main-stroke)" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--chart-tooltip-bg)' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
