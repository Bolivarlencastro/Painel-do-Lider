
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiMetrics } from '../types';
import { MONTHLY_PERFORMANCE_DATA } from '../constants';

const KpiDetail: React.FC<{ label: string; value: string | number; unit?: string; color?: string }> = ({ label, value, unit = '', color = 'text-inherit' }) => (
    <div className="flex justify-between items-baseline">
        <span className="opacity-80">{label}:</span>
        <span className={`font-semibold ${color}`}>{value}{unit}</span>
    </div>
);


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const teamData: KpiMetrics = payload[0].payload.currentPeriod;
    const companyData: KpiMetrics = payload[0].payload.previousPeriod;

    return (
      <div className="bg-[var(--chart-tooltip-bg)] backdrop-blur-sm border border-[var(--chart-tooltip-border)] p-4 rounded-lg shadow-lg text-sm w-64 text-[var(--chart-tooltip-text)]">
        <p className="label font-bold text-[var(--chart-tooltip-label-text)] mb-3 text-base">{label}</p>
        
        <div className="space-y-2">
            <div>
                <p className="font-semibold text-purple-500 dark:text-purple-400 mb-1">Minha Equipe</p>
                <div className="space-y-1 text-xs">
                    <KpiDetail label="Taxa de Conclusão" value={teamData.completionRate} unit="%" color="text-purple-600 dark:text-purple-300"/>
                    <KpiDetail label="Engajamento" value={teamData.engagement} unit="%" />
                    <KpiDetail label="Pendências" value={teamData.pendingTasks} />
                </div>
            </div>
            
            <div className="pt-2">
                <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Média da Empresa</p>
                 <div className="space-y-1 text-xs">
                    <KpiDetail label="Taxa de Conclusão" value={companyData.completionRate} unit="%" />
                    <KpiDetail label="Engajamento" value={companyData.engagement} unit="%" />
                    <KpiDetail label="Pendências" value={companyData.pendingTasks} />
                </div>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceChart: React.FC = () => {
  const data = MONTHLY_PERFORMANCE_DATA;

  return (
    <div className="bg-white dark:bg-gray-800/60 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Desempenho Geral da Equipe</h2>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" />
            <XAxis dataKey="name" stroke="var(--chart-text-stroke)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--chart-text-stroke)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }}/>
            <Legend verticalAlign="top" align="right" height={40} iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
            <Line
              name="Minha Equipe (Conclusão)"
              type="monotone"
              dataKey="currentPeriod.completionRate"
              stroke="var(--chart-line-main-stroke)"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              dot={{ r: 4, fill: 'var(--chart-line-main-stroke)' }}
            />
            <Line
              name="Média da Empresa (Conclusão)"
              type="monotone"
              dataKey="previousPeriod.completionRate"
              stroke="var(--chart-line-secondary-stroke)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: 'var(--chart-line-secondary-stroke)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
