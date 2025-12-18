import React, { useCallback, useState } from 'react';
import { Edit2, Sparkles } from 'lucide-react';
import { Member } from '../types';

interface DirectorCardProps {
  member: Member;
  onClick: (member: Member) => void;
  isEditing: boolean;
}

export const DirectorCard: React.FC<DirectorCardProps> = ({ member, onClick, isEditing }) => {
  const [copiedKey, setCopiedKey] = useState<string>('');

  const handleProjectClick = useCallback(async (e: React.MouseEvent, name: string, url: string) => {
    // url 若不是 http(s)，则视作“命令/文本”，点击即复制
    const looksLikeHttp = /^https?:\/\//i.test(url);
    if (looksLikeHttp) return;

    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(name);
      window.setTimeout(() => setCopiedKey(''), 1200);
    } catch {
      window.prompt('复制失败，请手动复制：', url);
    }
  }, []);

  const projects = Array.isArray(member.projects) ? member.projects : [];

  return (
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

          {projects.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">负责项目</div>
              <div className="flex flex-col gap-1">
                {projects.map((p) => {
                  const looksLikeHttp = /^https?:\/\//i.test(p.url);
                  const key = `${p.name}::${p.url}`;
                  const isCopied = copiedKey === p.name && !looksLikeHttp;
                  return (
                    <a
                      key={key}
                      href={looksLikeHttp ? p.url : '#'}
                      target={looksLikeHttp ? '_blank' : undefined}
                      rel={looksLikeHttp ? 'noreferrer' : undefined}
                      onClick={(e) => handleProjectClick(e, p.name, p.url)}
                      title={looksLikeHttp ? p.url : `点击复制：${p.url}`}
                      className="text-[11px] text-sky-300 hover:text-sky-200 underline underline-offset-2 decoration-sky-500/40 hover:decoration-sky-400/70 transition-colors line-clamp-2"
                    >
                      {isCopied ? '✅ 已复制' : p.name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/50 to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

