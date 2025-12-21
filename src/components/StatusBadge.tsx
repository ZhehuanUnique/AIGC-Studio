import React from 'react';
import { TeamStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface StatusBadgeProps {
  status: TeamStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.normal;
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider ${config.color} ${config.bg} border ${config.border} transition-all hover:scale-105`}>
      <Icon size={10} className="sm:w-3 sm:h-3 animate-pulse" />
      {config.label}
    </div>
  );
};

