import React from 'react';
import { MemberStatus, CourseStatus, GeneralStatus, PlanStatus, EnrollmentStatus } from '../types';

interface StatusBadgeProps {
  status: GeneralStatus | string;
}

const statusIndicatorColors: { [key in GeneralStatus | string]?: string } = {
    // MemberStatus
    [MemberStatus.Late]: 'bg-red-500',
    [MemberStatus.OnTrack]: 'bg-green-500',
    [MemberStatus.Completed]: 'bg-green-500',
    [MemberStatus.Empty]: 'bg-gray-400',
    [MemberStatus.NotStarted]: 'bg-gray-400',
    
    // TeamMembersTable statuses
    'Em Risco': 'bg-red-500',
    'Atenção': 'bg-yellow-500',
    'Em Dia': 'bg-green-500',
    // FIX: Removed duplicate property 'Inativo' which conflicts with CourseStatus.Inactive.
    // The 'Inativo' status will now use the color defined for CourseStatus.Inactive.
    
    // CourseStatus
    [CourseStatus.Active]: 'bg-green-500',
    [CourseStatus.Inactive]: 'bg-slate-400',

    // PlanStatus
    [PlanStatus.InProgress]: 'bg-blue-500',
    [PlanStatus.Archived]: 'bg-gray-400',

    // EnrollmentStatus
    [EnrollmentStatus.Matriculado]: 'bg-blue-500',
    [EnrollmentStatus.Iniciada]: 'bg-cyan-500',
    [EnrollmentStatus.Expirada]: 'bg-red-500',
    [EnrollmentStatus.ReqNovoPrazo]: 'bg-orange-500',
    [EnrollmentStatus.Finalizado]: 'bg-green-500',
    [EnrollmentStatus.AgAprovacao]: 'bg-orange-500',
    [EnrollmentStatus.Reprovada]: 'bg-red-500',
    [EnrollmentStatus.Desistiu]: 'bg-gray-800 dark:bg-gray-600',
    [EnrollmentStatus.Inativa]: 'bg-slate-400',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeStyle = 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
  const indicatorStyle = statusIndicatorColors[status] || 'bg-gray-400';
  
  return (
    <span
      className={`px-3 py-1 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full ${badgeStyle}`}
    >
      <span className={`h-2 w-2 rounded-full ${indicatorStyle}`}></span>
      <span className="whitespace-nowrap">{status}</span>
    </span>
  );
};