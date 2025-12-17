import React from 'react';
import { Edit2, Sparkles } from 'lucide-react';
import { Member } from '../types';

interface DirectorCardProps {
  member: Member;
  onClick: (member: Member) => void;
  isEditing: boolean;
}

export const DirectorCard: React.FC<DirectorCardProps> = ({ member, onClick, isEditing }) => (
  <div
    onClick={() => isEditing && onClick(member)}
    className={`relative group h-full ${
      isEditing ? 'cursor-pointer hover:ring-2 hover:ring-orange-500/30 rounded-xl transition-all' : 'cursor-default'
    }`}
  >
    <div className="relative flex flex-col justify-between bg-[#1e293b]/40 border border-slate-700/50 p-5 rounded-xl h-full shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-600 hover:bg-[#1e293b]/60 overflow-hidden">
      {isEditing && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white p-1.5 rounded-full shadow-lg z-20 scale-0 group-hover:scale-100 transition-transform">
          <Edit2 size={12} />
        </div>
      )}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="relative h-14 w-14 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-300">{member.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold tracking-widest text-orange-400 uppercase">
          {member.role || '总负责人'}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-slate-200 tracking-normal group-hover:text-white transition-colors">
          {member.name}
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5 font-normal tracking-wide flex items-center gap-1">
          <Sparkles size={10} className="text-orange-400" /> Director
        </p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/50 to-transparent opacity-50"></div>
    </div>
  </div>
);

