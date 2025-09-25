
import React, { useMemo } from 'react';
import { Icon } from './Icon';
// FIX: Import ENROLLMENTS_DATA to correctly look up course skills
import { TEAM_MEMBERS_DATA, COURSES_DATA, TRAILS_DATA, PULSES_DATA, ENROLLMENTS_DATA } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const TeamSkillsOverview: React.FC = () => {
    const chartData = useMemo(() => {
        const courseSkills = new Map(COURSES_DATA.map(c => [c.id, c.skills || []]));
        const trailSkills = new Map(TRAILS_DATA.map(t => [t.id, t.skills || []]));
        const pulseSkills = new Map(PULSES_DATA.map(p => [p.id, p.skills || []]));
        
        const skillCounts = new Map<string, number>();

        TEAM_MEMBERS_DATA.forEach(member => {
            const memberSkills = new Set<string>();
            
            // FIX: Use ENROLLMENTS_DATA to find member's courses instead of the non-existent 'courseIds' property.
            const memberEnrollments = ENROLLMENTS_DATA.filter(e => e.memberId === member.id);
            memberEnrollments.forEach(enrollment => {
                (courseSkills.get(enrollment.courseId) || []).forEach(skill => memberSkills.add(skill));
            });

            member.trailIds.forEach(id => (trailSkills.get(id) || []).forEach(skill => memberSkills.add(skill)));
            member.pulseIds.forEach(id => (pulseSkills.get(id) || []).forEach(skill => memberSkills.add(skill)));

            memberSkills.forEach(skill => {
                skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
            });
        });

        const sortedSkills = Array.from(skillCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6); // Use top 6 for a hexagon radar chart

        // Simulate company average data for comparison
        return sortedSkills.map(([skill, count], index) => ({
            skill: skill,
            teamCount: count,
            companyCount: Math.min(TEAM_MEMBERS_DATA.length, Math.round(count * (1 + (index % 3 - 1) * 0.2) + 1)), // Simulate some variance
        }));
    }, []);
    
    const maxMembers = TEAM_MEMBERS_DATA.length;

    const CustomTooltipContent = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
            <div className="bg-[var(--chart-tooltip-bg)] backdrop-blur-sm border border-[var(--chart-tooltip-border)] p-3 rounded-lg shadow-lg text-sm text-[var(--chart-tooltip-text)]">
                <p className="font-bold text-[var(--chart-tooltip-label-text)] mb-2">{payload[0].payload.skill}</p>
                {payload.map((pld: any, index: number) => (
                     <div key={index} className="flex justify-between items-center text-xs">
                        <span style={{ color: pld.color }}>{pld.name}:</span>
                        <span className="font-semibold ml-2">{`${pld.value} / ${maxMembers}`}</span>
                    </div>
                ))}
            </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-lg flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Principais Skills da Equipe</h2>
                <Icon name="radar" className="text-purple-500 dark:text-purple-400" />
            </header>
            <div className="flex-1 overflow-hidden p-2 min-h-[300px]">
                {chartData.length > 2 ? (
                   <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid stroke="var(--chart-grid-stroke)" />
                            <PolarAngleAxis 
                                dataKey="skill" 
                                stroke="var(--chart-text-stroke)" 
                                tickLine={false}
                                fontSize={12} 
                            />
                            <PolarRadiusAxis 
                                angle={90} 
                                domain={[0, maxMembers]} 
                                axisLine={false} 
                                tickLine={false}
                                tickCount={4}
                                tickFormatter={(v) => `${Math.round(v)}`}
                                stroke="var(--chart-text-stroke)"
                                fontSize={10}
                            />
                            <Radar 
                                name="Minha Equipe" 
                                dataKey="teamCount" 
                                stroke="var(--chart-line-main-stroke)" 
                                fill="var(--chart-line-main-stroke)" 
                                fillOpacity={0.6}
                            />
                             <Radar 
                                name="Média da Empresa" 
                                dataKey="companyCount" 
                                stroke="var(--chart-line-secondary-stroke)" 
                                fill="var(--chart-line-secondary-stroke)" 
                                fillOpacity={0.4}
                            />
                           <Tooltip content={<CustomTooltipContent />} />
                           <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: '10px'}}/>
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                        <p>Dados insuficientes para exibir o gráfico de skills. (Mínimo: 3)</p>
                    </div>
                )}
            </div>
        </div>
    );
};
