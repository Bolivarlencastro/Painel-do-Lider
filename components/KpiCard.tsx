
import React from 'react';
import { KpiData } from '../types';

export const KpiCard: React.FC<KpiData> = ({ value, label }) => {
  return (
    <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-700/80 shadow-sm hover:bg-gray-700/80 transition-all duration-300 transform hover:-translate-y-1">
      <p className="text-4xl font-bold text-purple-400">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
};
