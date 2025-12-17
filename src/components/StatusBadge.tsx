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
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${config.color} ${config.bg} border ${config.border} transition-all hover:scale-105`}>
      <Icon size={12} className="animate-pulse" />
      {config.label}
    </div>
  );
};

