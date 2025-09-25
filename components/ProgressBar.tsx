
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
      <div
        className="bg-purple-500 h-2.5 rounded-full"
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};
