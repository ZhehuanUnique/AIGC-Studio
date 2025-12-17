import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  let colorClass = 'bg-sky-500';
  if (progress > 80) colorClass = 'bg-emerald-500';
  else if (progress < 30) colorClass = 'bg-orange-500';
  
  return (
    <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

