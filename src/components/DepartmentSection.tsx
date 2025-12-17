import React from 'react';
import { 
  Edit2, Target, Clock, Activity, Wallet, TrendingDown, ListTodo, 
  CheckSquare, Square, Users, Plus, Image as ImageIcon, Upload, 
  Link as LinkIcon, Receipt 
} from 'lucide-react';
import { Team, Member } from '../types';
import { ICON_MAP } from '../constants';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { DirectorCard } from './DirectorCard';
import { MemberCard } from './MemberCard';
import { ResourceLink } from './ResourceLink';

interface DepartmentSectionProps {
  team: Team;
  index: number;
  isEditing: boolean;
  onEditMember: (member: Member) => void;
  onAddMember: (groupId: string) => void;
  onEditGroup: (group: Team) => void;
  onAddConsumption?: (groupId: string, tier: 299 | 499, note?: string) => void;
}

export const DepartmentSection: React.FC<DepartmentSectionProps> = ({
  team,
  index,
  isEditing,
  onEditMember,
  onAddMember,
  onEditGroup,
  onAddConsumption
}) => {
  const Icon = ICON_MAP[team.iconKey] || ICON_MAP['default'];
  const directors = team.members.filter(m => m.isDirector);
  const crew = team.members.filter(m => !m.isDirector);
  
  const isOverBudget = Number(team.actualCost) > Number(team.budget);
  const budgetColor = isOverBudget ? 'text-red-500' : 'text-slate-300';
  const costColor = isOverBudget ? 'text-red-400' : 'text-emerald-400';

  return (
    <div className={`mb-8 bg-[#0f172a] border ${
      team.status === 'urgent' ? 'border-red-900/30' : 'border-slate-800'
    } rounded-2xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700`}>
      <div className="absolute -top-6 -right-6 text-9xl font-black text-slate-800/20 pointer-events-none select-none">
        0{index + 1}
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4 min-w-[240px]">
          <div
            onClick={() => isEditing && onEditGroup(team)}
            className={`p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-sm text-sky-500 ${
              isEditing ? 'cursor-pointer hover:bg-slate-700' : ''
            }`}
          >
            <Icon size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-200 tracking-tight hover:text-white transition-colors">
                {team.title}
              </h2>
              <StatusBadge status={team.status || 'normal'} />
              {isEditing && (
                <button onClick={() => onEditGroup(team)}>
                  <Edit2 size={14} className="text-slate-500 hover:text-sky-500 transition-colors" />
                </button>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500 tracking-wider mt-1 uppercase flex items-center gap-2">
              <span>SIZE: {team.members.length}</span>
              <span className="h-3 w-px bg-slate-700"></span>
              <span>PROGRESS: {team.progress}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-[#1e293b]/50 rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3">
              <div className="p-1.5 bg-orange-500/10 rounded text-orange-500">
                <Target size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Mission</div>
                <div className="text-xs text-slate-300 truncate" title={team.task}>
                  {team.task || '-'}
                </div>
              </div>
            </div>
            <div className="bg-[#1e293b]/50 rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-500">
                <Clock size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Cycle</div>
                <div className="text-xs text-slate-300 truncate">{team.cycle || '-'}</div>
              </div>
            </div>
            <div className="bg-[#1e293b]/50 rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded text-blue-500">
                <Activity size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Daily Load</div>
                <div className="text-xs text-slate-300 truncate" title={team.workload}>
                  {team.workload || '-'}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3 ${
              isOverBudget ? 'bg-red-900/10 border-red-900/30' : 'bg-[#1e293b]/50'
            }`}>
              <div className="p-1.5 bg-slate-700/50 rounded text-slate-400">
                <Wallet size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Budget (预期)</div>
                <div className={`text-lg font-mono font-bold ${budgetColor}`}>¥ {team.budget || 0}</div>
              </div>
            </div>
            <div className={`rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3 ${
              isOverBudget ? 'bg-red-900/20 border-red-500/30' : 'bg-[#1e293b]/50'
            }`}>
              <div className={`p-1.5 rounded ${
                isOverBudget ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                <TrendingDown size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Actual Cost (实耗)</div>
                <div className={`text-lg font-mono font-bold ${costColor}`}>¥ {team.actualCost || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-48 flex flex-col justify-center gap-1.5">
          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
            <span>Completion</span>
            <span>{team.progress}%</span>
          </div>
          <ProgressBar progress={team.progress} />
        </div>
      </div>
      
      {team.todos && team.todos.length > 0 && (
        <div className="mb-6 px-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            <ListTodo size={12} /> Pending Tasks ({team.todos.filter(t => !t.done).length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {team.todos.slice(0, 3).map(todo => (
              <div
                key={todo.id}
                className={`task-item flex items-center gap-2 px-3 py-2 rounded border ${
                  todo.done
                    ? 'bg-slate-900/30 border-slate-800/50 text-slate-600'
                    : 'bg-[#1e293b]/50 border-slate-700 text-slate-300'
                }`}
              >
                {todo.done ? (
                  <CheckSquare size={12} className="text-slate-600" />
                ) : (
                  <Square size={12} className="text-sky-500" />
                )}
                <span className={`text-xs truncate ${todo.done ? 'line-through' : ''}`}>
                  {todo.text}
                </span>
              </div>
            ))}
            {team.todos.length > 3 && (
              <div className="px-3 py-2 text-xs text-slate-500 italic flex items-center">
                ... +{team.todos.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 flex flex-col gap-6">
          {directors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {directors.map((director) => (
                <DirectorCard
                  key={director.id}
                  member={director}
                  isEditing={isEditing}
                  onClick={onEditMember}
                />
              ))}
            </div>
          )}
          <div className="bg-[#1e293b]/20 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                <Users size={12} /> Execution Team
              </div>
              {isEditing && (
                <button
                  onClick={() => onAddMember(team.id)}
                  className="flex items-center gap-1 text-[10px] text-sky-500 hover:text-sky-400 font-bold bg-sky-500/10 px-2 py-1 rounded hover:bg-sky-500/20 transition-colors"
                >
                  <Plus size={10} /> ADD
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {crew.length > 0 ? (
                crew.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isEditing={isEditing}
                    onClick={onEditMember}
                  />
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                  暂无成员
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="bg-[#1e293b]/30 rounded-xl p-4 border border-slate-800 h-full flex flex-col">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
              <ImageIcon size={12} /> Style Ref / 参考图
            </div>
            <div className="flex-1 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative group min-h-[160px]">
              {team.coverImage ? (
                <>
                  <img
                    src={team.coverImage}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    alt="Cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-slate-300">Key Visual</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                  <ImageIcon size={24} className="opacity-20" />
                  <span className="text-[9px] opacity-50">暂无 Key Visual</span>
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => onEditGroup(team)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold gap-1"
                >
                  <Upload size={12} /> 设置
                </button>
              )}
            </div>
            {team.images && team.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 animate-in fade-in">
                {team.images.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-md border border-slate-700/50 bg-slate-950 overflow-hidden relative group cursor-pointer"
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#1e293b]/30 rounded-xl p-4 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
              <LinkIcon size={12} /> Resources
            </div>
            <div className="flex flex-wrap gap-2">
              {team.links && team.links.length > 0 ? (
                team.links.map((link, idx) => (
                  <ResourceLink
                    key={idx}
                    name={link.name}
                    url={link.url}
                    isEditing={isEditing}
                    onDelete={() => {}}
                  />
                ))
              ) : (
                <span className="text-xs text-slate-600 italic">暂无链接</span>
              )}
            </div>
          </div>
          <div className="bg-[#1e293b]/30 rounded-xl p-4 border border-slate-800 flex-1 flex flex-col min-h-[120px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                <Receipt size={12} /> 消耗即梦账号数
              </div>
              {isEditing && onAddConsumption && (
                <button
                  onClick={() => {
                    const tier = window.confirm('选择档位:\n确定=299档  取消=499档') ? 299 : 499;
                    const note = window.prompt('备注(可选):');
                    onAddConsumption(team.id, tier as 299 | 499, note || undefined);
                  }}
                  className="text-sky-500 hover:text-white transition-colors bg-sky-500/10 hover:bg-sky-500/20 rounded p-1"
                  title="添加消费记录"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
            <div className="flex-1 bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 overflow-y-auto max-h-[200px]">
              {team.consumptionRecords && team.consumptionRecords.length > 0 ? (
                <div className="space-y-1.5">
                  {team.consumptionRecords.map((record, idx) => (
                    <div key={record.id} className="text-xs text-slate-400 font-mono flex items-start gap-2 bg-slate-900/30 rounded p-2 border border-slate-800/30">
                      <span className="text-slate-600 font-bold">#{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${record.tier === 299 ? 'text-blue-400' : 'text-purple-400'}`}>
                            ¥{record.tier}
                          </span>
                          <span className="text-[10px] text-slate-600">{record.date}</span>
                        </div>
                        {record.note && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic">{record.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-700 italic">暂无消费记录...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

