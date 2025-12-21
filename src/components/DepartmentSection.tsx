import React, { useMemo, useRef, useState } from 'react';
import { 
  Edit2, Activity, Wallet, TrendingDown, ListTodo, 
  CheckSquare, Square, Users, Plus, Image as ImageIcon, Upload, 
  Receipt, Lock, Unlock, Trash2 
} from 'lucide-react';
import { Team, Member, Todo } from '../types';
import { ICON_MAP } from '../constants';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { DirectorCard } from './DirectorCard';
import { MemberCard } from './MemberCard';

interface DepartmentSectionProps {
  team: Team;
  index: number;
  isEditing: boolean;
  isUnlocked: boolean;
  theme: 'dark' | 'blue' | 'white' | 'green';
  onEditMember: (member: Member) => void;
  onAddMember: (groupId: string) => void;
  onDeleteMember?: (memberId: string, memberName?: string, memberRole?: string, isDirector?: boolean) => void;
  onToggleTodo?: (groupId: string, todoId: string) => void;
  onAddTodo?: (groupId: string, text: string) => void;
  onDeleteTodo?: (groupId: string, todoId: string) => void;
  onEditGroup: (group: Team) => void;
  onDeleteGroup?: (groupId: string, groupTitle?: string) => void;
  memberTasks?: Record<string, Todo[]>;
  onAddMemberTask?: (groupId: string, memberId: string, text: string) => void;
  onToggleMemberTask?: (groupId: string, memberId: string, todoId: string) => void;
  onDeleteMemberTask?: (groupId: string, memberId: string, todoId: string) => void;
  onEditReferences?: (group: Team) => void;
  onAddConsumption?: (groupId: string) => void;
  onDeleteConsumption?: (groupId: string, recordId: string) => void;
  onUploadWork?: (groupId: string, file: File, isFinished: boolean) => void;
  onDeleteWork?: (groupId: string, imageUrl: string, isFinished: boolean) => void;
  onAddDirectorProject?: (groupId: string, directorId: string) => void;
  onDeleteDirectorProject?: (groupId: string, directorId: string, projectIndex: number) => void;
  onToggleLock: (team: Team) => void;
  onProgressChange?: (groupId: string, progress: number) => void;
}

export const DepartmentSection: React.FC<DepartmentSectionProps> = ({
  team,
  index,
  isEditing,
  isUnlocked,
  theme,
  onEditMember,
  onAddMember,
  onDeleteMember,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onEditGroup,
  onDeleteGroup,
  memberTasks,
  onAddMemberTask,
  onToggleMemberTask,
  onDeleteMemberTask,
  onEditReferences,
  onAddConsumption,
  onDeleteConsumption,
  onUploadWork,
  onDeleteWork,
  onAddDirectorProject,
  onDeleteDirectorProject,
  onToggleLock,
  onProgressChange
}) => {
  const Icon = ICON_MAP[team.iconKey] || ICON_MAP['default'];
  const directors = team.members.filter(m => m.isDirector);
  const crew = team.members.filter(m => !m.isDirector);
  const groupTodos = team.todos || [];
  const groupPendingTodos = groupTodos.filter(t => !t.done);
  const getMemberTodos = (memberId: string) => memberTasks?.[memberId] || [];
  const fallbackDirectorProjects = (name: string) => {
    if (name === '汪凯伦') {
      return [{
        name: '负责项目（飞书多维表）',
        url: 'https://e60nf37yjb.feishu.cn/base/RoHWb8tQVa6zoHs2eOkc63krnyd?table=tblQ2St1cSQYRvH5&view=vewEjkuVBs'
      }];
    }
    return [];
  };

  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const canDeleteMembers = useMemo(() => isUnlocked && !!onDeleteMember, [isUnlocked, onDeleteMember]);
  const showDeleteUI = canDeleteMembers && deleteMode;

  const [showTodosPopover, setShowTodosPopover] = useState<boolean>(false);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [memberInputMap, setMemberInputMap] = useState<Record<string, string>>({});
  const canEditTodos = isUnlocked && !!onAddTodo && !!onDeleteTodo;
  const todosCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openTodosPopover = () => {
    if (todosCloseTimerRef.current) {
      clearTimeout(todosCloseTimerRef.current);
      todosCloseTimerRef.current = null;
    }
    setShowTodosPopover(true);
  };

  const scheduleCloseTodosPopover = () => {
    if (todosCloseTimerRef.current) clearTimeout(todosCloseTimerRef.current);
    // 轻微延迟，避免用户移动鼠标去点浮窗/输入框时面板瞬间消失
    todosCloseTimerRef.current = setTimeout(() => {
      setShowTodosPopover(false);
      todosCloseTimerRef.current = null;
    }, 800);
  };
  
  const isOverBudget = Number(team.actualCost) > Number(team.budget);
  const budgetColor = isOverBudget ? 'text-red-500' : 'text-slate-300';
  const costColor = isOverBudget ? 'text-red-400' : 'text-emerald-400';

  // 主题配置
  const themeStyles = {
    dark: { 
      card: 'bg-[#0f172a]', 
      subCard: 'bg-[#1e293b]/50',
      border: 'border-slate-800',
      text: 'text-slate-200'
    },
    blue: { 
      card: 'bg-blue-900/50', 
      subCard: 'bg-blue-800/30',
      border: 'border-blue-700',
      text: 'text-blue-50'
    },
    white: { 
      card: 'bg-white', 
      subCard: 'bg-gray-50',
      border: 'border-gray-300',
      text: 'text-gray-800'
    },
    green: { 
      card: 'bg-emerald-900/50', 
      subCard: 'bg-emerald-800/30',
      border: 'border-emerald-700',
      text: 'text-emerald-50'
    }
  };
  
  const currentTheme = themeStyles[theme];

  return (
    <div className={`mb-8 ${currentTheme.card} border ${
      team.status === 'urgent' ? 'border-red-900/30' : currentTheme.border
    } rounded-2xl p-4 sm:p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors`}>
      <div className="absolute -top-6 -right-6 text-9xl font-black text-slate-800/20 pointer-events-none select-none">
        0{index + 1}
      </div>
      
      {/* 锁按钮 - 右上角（桌面端显示，移动端隐藏） */}
      <button
        onClick={() => onToggleLock(team)}
        className={`hidden sm:flex absolute top-4 right-4 z-20 flex-col items-center gap-1 px-3 py-2 rounded-lg font-bold transition-all ${
          isUnlocked
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
        }`}
      >
        {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
        <div className="text-[8px] leading-tight">
          <div>UPDATE</div>
          <div>更新</div>
        </div>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4 min-w-[240px]">
          <div
            onClick={() => isUnlocked && onEditGroup(team)}
            className={`p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-sm text-sky-500 ${
              isUnlocked ? 'cursor-pointer hover:bg-slate-700' : ''
            }`}
          >
            <Icon size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-200 tracking-tight hover:text-white transition-colors break-words">
                {team.title}
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={team.status || 'normal'} />
                {isUnlocked && (
                  <button onClick={() => onEditGroup(team)}>
                    <Edit2 size={14} className="text-slate-500 hover:text-sky-500 transition-colors" />
                  </button>
                )}
                {isEditing && onDeleteGroup && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGroup(team.id, team.title);
                    }}
                    className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded p-1 transition-colors"
                    title="删除该组"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="text-xs font-mono text-slate-500 tracking-wider mt-1 uppercase flex items-center gap-2">
              <span>SIZE: {team.members.length}</span>
              <span className="h-3 w-px bg-slate-700"></span>
              <span>PROGRESS: {team.progress}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-[#1e293b]/50 rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded text-blue-500">
                <Activity size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 uppercase font-bold">{team.cycle || '周期'}</div>
                <div className="text-sm text-slate-300 truncate" title={team.workload}>
                  {team.workload || '-'}
                </div>
              </div>
            </div>
            <div className={`rounded-lg p-2 px-3 border border-slate-800 flex items-center gap-3 ${
              isOverBudget ? 'bg-red-900/10 border-red-900/30' : 'bg-[#1e293b]/50'
            }`}>
              <div className="p-1.5 bg-slate-700/50 rounded text-slate-400">
                <Wallet size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 uppercase font-bold">预期</div>
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
                <div className="text-xs text-slate-500 uppercase font-bold">实耗</div>
                <div className={`text-lg font-mono font-bold ${costColor}`}>¥ {team.actualCost || 0}</div>
              </div>
            </div>
          </div>
          
          {/* 进度条 - 占据整行 */}
          <div className="w-full flex flex-col gap-1.5 bg-[#1e293b]/30 rounded-lg p-3 border border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>进度</span>
              <span>{team.progress}%</span>
            </div>
            <ProgressBar 
              progress={team.progress} 
              onProgressChange={onProgressChange ? (progress) => onProgressChange(team.id, progress) : undefined}
            />
          </div>

          {/* 待做 + 已完成：两列布局 */}
          <div className="w-full grid grid-cols-2 gap-3">
            {/* 左列：待做 */}
            <div className="flex-1 min-h-0">
              <WorkCard
                team={team}
                isFinished={false}
                isUnlocked={isUnlocked}
                onUploadWork={onUploadWork}
                onDeleteWork={onDeleteWork}
              />
            </div>

            {/* 右列：已完成 */}
            <div className="flex-1 min-h-0">
              <WorkCard
                team={team}
                isFinished={true}
                isUnlocked={isUnlocked}
                onUploadWork={onUploadWork}
                onDeleteWork={onDeleteWork}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending Tasks：hover 展开浮窗显示全部任务；浮窗离开即消失（对外只展示"小组任务/总目标"） */}
      {groupTodos && (
        <div
          // 触发范围尽量小：仅包住标题 + 预览卡片，不占满整行，避免误触
          className="mb-6 px-1 relative inline-block w-fit"
          onMouseEnter={openTodosPopover}
          onMouseLeave={scheduleCloseTodosPopover}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 cursor-default select-none">
            <ListTodo size={12} /> Pending Tasks ({groupPendingTodos.length})
            <span className="text-[10px] text-slate-600 font-mono">(hover)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-fit">
            {groupTodos.slice(0, 3).map(todo => (
              <div
                key={todo.id}
                className={`task-item flex items-center gap-2 px-3 py-2 rounded border ${
                  todo.done
                    ? 'bg-slate-900/30 border-slate-800/50 text-slate-600'
                    : 'bg-[#1e293b]/50 border-slate-700 text-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleTodo?.(team.id, todo.id)}
                  className={`p-0.5 rounded ${todo.done ? 'text-slate-600' : 'text-sky-500 hover:text-sky-400'}`}
                  title={todo.done ? '取消完成' : '标记完成'}
                >
                  {todo.done ? <CheckSquare size={12} /> : <Square size={12} />}
                </button>
                <span className={`text-xs truncate ${todo.done ? 'line-through' : ''}`}>
                  {todo.text}
                </span>
              </div>
            ))}
            {groupTodos.length > 3 && (
              <div className="px-3 py-2 text-xs text-slate-500 italic flex items-center">
                ... +{groupTodos.length - 3} more
              </div>
            )}
          </div>

          {showTodosPopover && (
            <div
              className="absolute left-0 top-7 z-50 w-full max-w-[720px]"
              onMouseEnter={openTodosPopover}
              onMouseLeave={scheduleCloseTodosPopover}
            >
              <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <ListTodo size={14} className="text-sky-500" />
                    全部任务
                  </div>
                  {canEditTodos && (
                    <div className="text-[10px] text-emerald-400 font-bold">已解锁：可新增/删除</div>
                  )}
                </div>

                {/* 小组任务（总目标） */}
                <div className="px-4 pt-3 pb-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  小组任务（总目标）{groupTodos.length ? ` · ${groupTodos.length}` : ''}
                </div>

                {canEditTodos && (
                  <div className="px-4 pb-3 border-b border-slate-800 flex gap-2">
                    <input
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = newTodoText.trim();
                          if (!v) return;
                          onAddTodo?.(team.id, v);
                          setNewTodoText('');
                        }
                      }}
                      onFocus={openTodosPopover}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                      placeholder="新增小组任务…（回车添加）"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const v = newTodoText.trim();
                        if (!v) return;
                        onAddTodo?.(team.id, v);
                        setNewTodoText('');
                      }}
                      className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
                      title="添加小组任务"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {groupTodos.length > 0 ? (
                    groupTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded border ${
                          todo.done
                            ? 'bg-slate-900/30 border-slate-800/50 text-slate-600'
                            : 'bg-[#1e293b]/50 border-slate-700 text-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onToggleTodo?.(team.id, todo.id)}
                          className={`p-0.5 rounded ${todo.done ? 'text-slate-600' : 'text-sky-500 hover:text-sky-400'}`}
                          title={todo.done ? '取消完成' : '标记完成'}
                        >
                          {todo.done ? <CheckSquare size={14} /> : <Square size={14} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs ${todo.done ? 'line-through' : ''}`}>{todo.text}</div>
                        </div>
                        {canEditTodos && (
                          <button
                            type="button"
                            onClick={() => onDeleteTodo?.(team.id, todo.id)}
                            className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded p-1 transition-colors"
                            title="删除任务"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-600 py-6">暂无任务</div>
                  )}
                </div>

                {/* 成员任务 */}
                <div className="px-4 pt-2 pb-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest border-t border-slate-800">
                  成员任务
                </div>
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar px-3 pb-3 space-y-2">
                  {team.members.map((m) => {
                    const todos = getMemberTodos(m.id);
                    const pending = todos.filter(t => !t.done).length;
                    return (
                      <div key={m.id} className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {m.role || (m.isDirector ? '组长' : '成员')} · {m.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">PENDING {pending}</div>
                        </div>

                        {isUnlocked && onAddMemberTask && (
                          <div className="px-3 pb-2 flex gap-2">
                            <input
                              value={memberInputMap[m.id] || ''}
                              onChange={(e) => setMemberInputMap(prev => ({ ...prev, [m.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const text = (memberInputMap[m.id] || '').trim();
                                  if (!text) return;
                                  onAddMemberTask(team.id, m.id, text);
                                  setMemberInputMap(prev => ({ ...prev, [m.id]: '' }));
                                }
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                              placeholder="新增成员任务…（回车添加）"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const text = (memberInputMap[m.id] || '').trim();
                                if (!text) return;
                                onAddMemberTask(team.id, m.id, text);
                                setMemberInputMap(prev => ({ ...prev, [m.id]: '' }));
                              }}
                              className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
                              title="添加成员任务"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}

                        <div className="px-3 pb-3 space-y-2">
                          {todos.length ? (
                            todos.map((t) => (
                              <div
                                key={t.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded border ${
                                  t.done
                                    ? 'bg-slate-900/30 border-slate-800/50 text-slate-600'
                                    : 'bg-[#1e293b]/50 border-slate-700 text-slate-300'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => onToggleMemberTask?.(team.id, m.id, t.id)}
                                  className={`p-0.5 rounded ${t.done ? 'text-slate-600' : 'text-sky-500 hover:text-sky-400'}`}
                                  title={t.done ? '取消完成' : '标记完成'}
                                >
                                  {t.done ? <CheckSquare size={14} /> : <Square size={14} />}
                                </button>
                                <span className={`text-xs ${t.done ? 'line-through' : ''}`}>{t.text}</span>
                                {isUnlocked && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteMemberTask?.(team.id, m.id, t.id)}
                                    className="ml-auto text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded p-1 transition-colors"
                                    title="删除任务"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-xs text-slate-600 py-3">暂无成员任务</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 成员区稍微收窄，给参考图更舒服的横向空间 */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {directors.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {/* 总负责人区：每个负责人占一整行（避免在半屏宽度下再分两列导致挤压变形） */}
              {directors.map((director) => {
                const storedProjects =
                  Array.isArray((director as any).projects) ? (director as any).projects : [];
                const fallbackProjects = fallbackDirectorProjects(director.name);
                // 合并展示：避免“兜底链接”在新增真实链接后被覆盖消失
                const projects = [
                  ...storedProjects,
                  ...fallbackProjects.filter((fp: any) =>
                    !storedProjects.some((sp: any) => sp?.name === fp?.name && sp?.url === fp?.url)
                  ),
                ];

                return (
                  <div key={director.id} className="relative group">
                    {/* 左：总负责人卡片；右：负责项目面板（并排） */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="md:flex-1 min-w-0">
                        <DirectorCard
                          member={director}
                          isEditing={isEditing}
                          onClick={onEditMember}
                        />
                      </div>

                      <div className="md:w-[260px] shrink-0 rounded-xl bg-slate-900/30 border border-slate-800 p-3 self-stretch">
                        {/* 右侧面板：两列（内容 + 操作列），保证 “+” 与每行垃圾桶同列对齐 */}
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2 mb-2 pr-1">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">负责项目</div>
                          <div className="w-8 flex justify-end">
                            {isUnlocked && !!onAddDirectorProject && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddDirectorProject(team.id, director.id);
                                }}
                                className="w-8 h-8 inline-flex items-center justify-center rounded bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 hover:text-sky-200 transition-colors"
                                title="新增负责项目"
                              >
                                <Plus size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {projects.length > 0 ? (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                            {projects.map((p: any, idx: number) => (
                              <div key={`${p?.name || 'p'}-${idx}`} className="grid grid-cols-[1fr_auto] items-start gap-2">
                                <a
                                  href={p?.url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 min-w-0 text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2 decoration-sky-500/40 hover:decoration-sky-400/70 transition-colors break-all"
                                  title={p?.url || ''}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {p?.name || '未命名链接'}
                                </a>
                                <div className="w-8 flex justify-end">
                                  {isUnlocked && !!onDeleteDirectorProject && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteDirectorProject(team.id, director.id, idx);
                                      }}
                                      className="w-8 h-8 inline-flex items-center justify-center rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                      title="删除"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-600">暂无</div>
                        )}
                      </div>
                    </div>
                  {/* Hover 任务浮窗：成员任务 */}
                  <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[320px] max-w-[80vw] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                    <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                          <ListTodo size={14} className="text-sky-500" />
                          {director.name} · 任务（{getMemberTodos(director.id).length}）
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          PENDING {getMemberTodos(director.id).filter(t => !t.done).length}
                        </div>
                      </div>
                      <div className="p-3 max-h-[220px] overflow-y-auto custom-scrollbar space-y-2">
                        {getMemberTodos(director.id).length > 0 ? (
                          getMemberTodos(director.id).map((todo) => (
                            <div
                              key={todo.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded border ${
                                todo.done
                                  ? 'bg-slate-900/30 border-slate-800/50 text-slate-600'
                                  : 'bg-[#1e293b]/50 border-slate-700 text-slate-300'
                              }`}
                            >
                              {todo.done ? <CheckSquare size={14} className="text-slate-600" /> : <Square size={14} className="text-sky-500" />}
                              <span className={`text-xs ${todo.done ? 'line-through' : ''}`}>{todo.text}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-xs text-slate-600 py-6">暂无任务</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {showDeleteUI && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMember?.(director.id, director.name, director.role, true);
                      }}
                      className="absolute top-2 right-2 z-10 text-red-500/80 hover:text-red-400 bg-black/40 hover:bg-red-500/10 border border-red-500/20 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="删除成员"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          )}
          <div className="bg-[#1e293b]/20 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                <Users size={12} /> Execution Team
              </div>
              {isUnlocked && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddMember(team.id)}
                      className="flex items-center gap-1 text-[10px] text-sky-500 hover:text-sky-400 font-bold bg-sky-500/10 px-2 py-1 rounded hover:bg-sky-500/20 transition-colors"
                    >
                      <Plus size={10} /> ADD
                    </button>
                    {canDeleteMembers && (
                      <button
                        type="button"
                        onClick={() => setDeleteMode(v => !v)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                          deleteMode
                            ? 'bg-red-600 text-white'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                        title={deleteMode ? '退出删除模式' : '删除成员'}
                      >
                        <Trash2 size={10} /> DEL
                      </button>
                    )}
                  </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {crew.length > 0 ? (
                crew.map((member) => (
                    <div key={member.id} className="relative group">
                      <MemberCard
                        member={member}
                        isEditing={isEditing}
                        onClick={onEditMember}
                      />
                      {/* Hover 任务浮窗：成员任务 */}
                      <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[320px] max-w-[80vw] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                        <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                              <ListTodo size={14} className="text-sky-500" />
                              {member.name} · 任务（{getMemberTodos(member.id).length}）
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              PENDING {getMemberTodos(member.id).filter(t => !t.done).length}
                            </div>
                          </div>
                          <div className="p-3 max-h-[220px] overflow-y-auto custom-scrollbar space-y-2">
                            {getMemberTodos(member.id).length > 0 ? (
                              getMemberTodos(member.id).map((todo) => (
                                <div
                                  key={todo.id}
                                  className={`flex items-center gap-2 px-3 py-2 rounded border ${
                                    todo.done
                                      ? 'bg-slate-900/30 border-slate-800/50 text-slate-600'
                                      : 'bg-[#1e293b]/50 border-slate-700 text-slate-300'
                                  }`}
                                >
                                  {todo.done ? <CheckSquare size={14} className="text-slate-600" /> : <Square size={14} className="text-sky-500" />}
                                  <span className={`text-xs ${todo.done ? 'line-through' : ''}`}>{todo.text}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-xs text-slate-600 py-6">暂无任务</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {showDeleteUI && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMember?.(member.id, member.name, member.role, false);
                          }}
                          className="absolute top-2 right-2 z-10 text-red-500/80 hover:text-red-400 bg-black/40 hover:bg-red-500/10 border border-red-500/20 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除成员"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                  暂无成员
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 封面图 + 费用支出：两列布局 */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {/* 左列：费用支出 */}
          <div className="bg-[#1e293b]/30 rounded-xl p-5 border border-slate-800 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                <Receipt size={14} /> 费用支出
              </div>
              {onAddConsumption && (
                <button
                  onClick={() => onAddConsumption(team.id)}
                  className="text-sky-500 hover:text-white transition-colors bg-sky-500/10 hover:bg-sky-500/20 rounded-lg p-1.5"
                  title="添加支出记录"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="flex-1 bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 overflow-y-auto max-h-[300px] min-h-0">
              {team.consumptionRecords && team.consumptionRecords.length > 0 ? (
                <div className="space-y-2">
                  {team.consumptionRecords.map((record, idx) => {
                    const platformNames = { jimeng: '即梦', hailuo: '海螺', vidu: 'Vidu', other: '其它' };
                    const platformColors = { 
                      jimeng: 'text-blue-400 bg-blue-500/10 border-blue-500/20', 
                      hailuo: 'text-purple-400 bg-purple-500/10 border-purple-500/20', 
                      vidu: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      other: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                    };
                    const amountColors = {
                      299: 'text-blue-400',
                      499: 'text-purple-400',
                      1399: 'text-orange-400'
                    };
                    
                    return (
                      <div key={record.id} className="text-xs text-slate-400 font-mono flex items-start gap-2 bg-slate-900/30 rounded-lg p-2.5 border border-slate-800/30 hover:border-slate-700/50 transition-colors">
                        <span className="text-slate-600 font-bold text-[10px] mt-0.5">#{idx + 1}</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${platformColors[record.platform]}`}>
                              {platformNames[record.platform]}
                            </span>
                            <span className={`font-bold ${amountColors[record.amount as keyof typeof amountColors] || 'text-sky-400'}`}>
                              ¥{record.amount}
                            </span>
                            <span className="text-xs text-slate-600">{record.datetime}</span>
                          </div>
                          {record.note && (
                            <div className="text-xs text-slate-500 italic">{record.note}</div>
                          )}
                        </div>
                        {onDeleteConsumption && (
                          <button
                            onClick={() => onDeleteConsumption(team.id, record.id)}
                            className="text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded p-1 transition-colors"
                            title="删除此记录"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-700 italic">暂无支出记录...</p>
              )}
            </div>
          </div>

          {/* 右列：封面图（固定 2:3） */}
          <div className="flex flex-col h-full">
            <div className="bg-[#1e293b]/30 rounded-xl p-4 border border-slate-800 h-full flex flex-col">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={12} /> 封面图
              </div>
              <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative group aspect-[2/3]">
              {team.coverImage ? (
                <>
                  <img
                    src={team.coverImage}
                    className="w-full h-full object-cover opacity-100"
                    alt="Cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-slate-300">Key Visual</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                  <ImageIcon size={24} className="opacity-20" />
                  <span className="text-[9px] opacity-50">暂无 Key Visual</span>
                </div>
              )}
              {onEditReferences && (
                <button
                  onClick={() => onEditReferences(team)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold gap-1 z-20"
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
      </div>
      
      {/* 移动端 UPDATE 按钮 - 卡片底部 */}
      <button
        onClick={() => onToggleLock(team)}
        className={`sm:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${
          isUnlocked
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
        }`}
      >
        {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
        <span className="text-sm">UPDATE 更新</span>
      </button>
      </div>
    </div>
  );
};

// 作品卡片组件（独立卡片，悬停显示完整面板）- 暂时移除
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WorkCardProps {
  team: Team;
  isFinished: boolean;
  isUnlocked: boolean;
  onUploadWork?: (groupId: string, file: File, isFinished: boolean) => void;
  onDeleteWork?: (groupId: string, imageUrl: string, isFinished: boolean) => void;
}

const WorkCard: React.FC<WorkCardProps> = ({
  team,
  isFinished,
  isUnlocked,
  onUploadWork,
  onDeleteWork,
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const works = isFinished ? (team.finishedWorks || []) : (team.unfinishedWorks || []);
  const title = isFinished ? '已完成' : '待做';
  const IconComponent = isFinished ? CheckSquare : Square;

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setShowPanel(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowPanel(false);
    }, 200);
    setCloseTimeout(timeout);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadWork) {
      onUploadWork(team.id, file, isFinished);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnlocked && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative flex-1 min-h-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-[#1e293b]/30 rounded-xl p-2.5 border border-slate-800 h-full flex flex-col cursor-pointer hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <IconComponent size={10} className={isFinished ? 'text-emerald-400' : 'text-sky-400'} />
            {title}
            <span className="text-[8px] text-slate-600 font-mono">({works.length})</span>
          </div>
          {isUnlocked && onUploadWork && (
            <button
              onClick={handleUploadClick}
              className="text-sky-500 hover:text-white transition-colors bg-sky-500/10 hover:bg-sky-500/20 rounded-lg p-1"
              title="上传作品"
            >
              <Plus size={12} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {works.length > 0 ? (
          <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
            <div className="flex gap-2 h-full pb-1">
              {works.map((url, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-20 aspect-[2/3] rounded border border-slate-700/50 bg-slate-950 overflow-hidden"
                >
                  <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-700">
            <span className="text-[9px] opacity-50">暂无{title}</span>
          </div>
        )}
      </div>

      {showPanel && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl p-4 max-h-[500px] overflow-y-auto"
          onMouseEnter={() => {
            if (closeTimeout) {
              clearTimeout(closeTimeout);
              setCloseTimeout(null);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
              <IconComponent size={14} className={isFinished ? 'text-emerald-400' : 'text-sky-400'} />
              {title}
            </div>
            {isUnlocked && onUploadWork && (
              <button
                onClick={handleUploadClick}
                className="w-6 h-6 inline-flex items-center justify-center rounded bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 hover:text-sky-200 transition-colors"
                title="上传作品"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {works.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {works.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[2/3] rounded border border-slate-700/50 bg-slate-950 overflow-hidden group"
                >
                  <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                  {isUnlocked && onDeleteWork && (
                    <button
                      onClick={() => onDeleteWork(team.id, url, isFinished)}
                      className="absolute top-1 right-1 w-6 h-6 inline-flex items-center justify-center rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="删除"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-600 py-4">
              暂无{title}
              {isUnlocked && onUploadWork && (
                <button
                  onClick={handleUploadClick}
                  className="ml-2 text-sky-400 hover:text-sky-300"
                >
                  点击上传
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

