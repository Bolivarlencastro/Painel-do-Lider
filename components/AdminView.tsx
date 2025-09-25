

import React from 'react';
import { Icon } from './Icon';
import { EnhancedKpiCard } from './EnhancedKpiCard';
import { EnhancedKpiData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analytics } from '../services/analytics';

const ADMIN_KPI_DATA: EnhancedKpiData[] = [
  {
    value: '75%',
    label: 'Usuários Ativos (MAU)',
    context: 'Meta: 75%',
    trend: { value: '+8%', direction: 'positive', period: 'vs. Mês Anterior' }
  },
  {
    value: '62%',
    label: 'Taxa de Ativação',
    context: 'Líderes que realizaram ação chave na 1ª semana',
    trend: { value: '+2%', direction: 'positive', period: 'vs. Mês Anterior' }
  },
   {
    value: '45',
    label: 'NPS (Net Promoter Score)',
    context: 'Meta: > 40',
    trend: { value: '+5 pts', direction: 'positive', period: 'vs. Última Pesquisa' }
  },
  {
    value: '28%',
    label: 'Redução de Pendências',
    context: 'Meta: 30%',
    trend: { value: '', direction: 'neutral', period: 'Em normativas obrigatórias' }
  },
];

const featureAdoptionData = [
  { name: 'Criar Plano', usage: 28, goal: 25 },
  { name: 'Enviar Lembrete', usage: 65, goal: 50 },
  { name: 'Sugerir Conteúdo', usage: 45, goal: 40 },
  { name: 'Ver Detalhes', usage: 85, goal: 70 },
];

export const AdminView: React.FC = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 sm:p-6 lg:p-8 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel do Administrador</h1>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => analytics.track('action_clicked', { action: 'export_admin_report' })}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {ADMIN_KPI_DATA.map((kpi) => (
                            <EnhancedKpiCard key={kpi.label} {...kpi} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                         <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Adoção de Funcionalidades (% MAU)</h2>
                             <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={featureAdoptionData}
                                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" />
                                        <XAxis dataKey="name" stroke="var(--chart-text-stroke)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--chart-text-stroke)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }}
                                            contentStyle={{ 
                                                backgroundColor: 'var(--chart-tooltip-bg)', 
                                                border: '1px solid var(--chart-tooltip-border)', 
                                                borderRadius: '0.5rem' 
                                            }}
                                        />
                                        <Legend verticalAlign="top" align="right" height={40} iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
                                        <Bar name="Uso Atual" dataKey="usage" fill="var(--chart-line-main-stroke)" radius={[4, 4, 0, 0]} />
                                        <Bar name="Meta" dataKey="goal" fill="var(--chart-line-secondary-stroke)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    )
}