import React from 'react';
import { EnhancedKpiData, TrendDirection } from '../types';
import { Icon } from './Icon';

const trendInfoMap: { [key in TrendDirection]: { text: string; color: string; } } = {
  positive: { text: 'Acima da Média da Empresa', color: 'text-green-600 dark:text-green-400' },
  negative: { text: 'Abaixo da Média da Empresa', color: 'text-red-600 dark:text-red-400' },
  neutral: { text: 'Na Média da Empresa', color: 'text-gray-600 dark:text-gray-400' },
};

export const EnhancedKpiCard: React.FC<EnhancedKpiData> = ({ value, label, context, trend, supportText }) => {
  const trendInfo = trendInfoMap[trend.direction];
  const showComparison = trend?.period;

  return (
    <div className="bg-white dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-sm transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full text-left">
      
      {/* 1. Title */}
      <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
          <div className="relative group flex-shrink-0">
            <Icon name="info" size="sm" className="text-gray-400 dark:text-gray-500 cursor-pointer" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-50 pointer-events-none">
                {context}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
            </div>
          </div>
      </div>

      <div className="mt-auto" />

      <div className="space-y-1 mt-3">
        {/* 2. Value */}
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>

        {showComparison && (
            <>
                {/* 3. Comparison */}
                <p className={`text-sm font-bold ${trendInfo.color}`}>
                    {trend.direction === 'positive' && '▲ ' }
                    {trend.direction === 'negative' && '▼ ' }
                    {trendInfo.text}
                </p>

                {/* 4. Reference */}
                {trend.benchmarkValue && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        (Média da Empresa: {trend.benchmarkValue})
                    </p>
                )}
            </>
        )}

        {/* 5. Support */}
        {supportText && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic pt-2">
                {supportText}
            </p>
        )}
      </div>
    </div>
  );
};