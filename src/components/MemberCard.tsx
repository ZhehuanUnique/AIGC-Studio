import React from 'react';
import { Edit2 } from 'lucide-react';
import { Member } from '../types';

interface MemberCardProps {
  member: Member;
  onClick: (member: Member) => void;
  isEditing: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onClick, isEditing }) => (
  <div
    onClick={() => isEditing && onClick(member)}
    className={`relative flex items-center gap-3 bg-[#1e293b]/30 hover:bg-[#1e293b]/60 border border-slate-700/50 hover:border-slate-600 p-3 rounded-lg transition-all duration-300 group ${
      isEditing ? 'cursor-pointer hover:ring-1 hover:ring-sky-500/50' : 'cursor-default'
    }`}
  >
    {isEditing && (
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500">
        <Edit2 size={10} />
      </div>
    )}
    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-400 border border-slate-700 overflow-hidden shrink-0 shadow-sm">
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
      ) : (
        <span className="group-hover:text-slate-200 transition-colors">{member.name.charAt(0)}</span>
      )}
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className="text-sm text-slate-300 font-medium group-hover:text-white tracking-normal transition-colors truncate">
        {member.name}
      </span>
      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-wide truncate">
        {member.role || '执行专员'}
      </span>
    </div>
  </div>
);

