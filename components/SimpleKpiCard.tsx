import React from 'react';
import { Icon } from './Icon';

interface SimpleKpiCardProps {
    icon: string;
    value: string;
    label: string;
}

export const SimpleKpiCard: React.FC<SimpleKpiCardProps> = ({ icon, value, label }) => (
    <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/60 flex items-start gap-4">
        <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-full">
            <Icon name={icon} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    </div>
);