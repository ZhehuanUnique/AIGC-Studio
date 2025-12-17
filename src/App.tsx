import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Trash2, X, Image as ImageIcon, Save, RefreshCw, Upload, Zap,
  CheckCircle, CheckSquare, Globe, ListTodo, Square,
  Download, FileJson, ClipboardList, Lock, Unlock,
  Wrench, Megaphone
} from 'lucide-react';
import { Team, News, Member, NewsType } from './types';
import { 
  STORAGE_KEY, INITIAL_ANNOUNCEMENT, INITIAL_NEWS, INITIAL_TEAMS,
  STATUS_CONFIG, NEWS_TAGS, AI_TOOLS, PROJECT_PHASES
} from './constants';
import { Modal } from './components/Modal';
import { InputField } from './components/InputField';
import { ResourceLink } from './components/ResourceLink';
import { NewsCard } from './components/NewsCard';
import { DepartmentSection } from './components/DepartmentSection';
import { teamsAPI, newsAPI, announcementAPI } from './utils/api';

interface EditingMember extends Member {
  currentGroupId?: string;
}

function App() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [news, setNews] = useState<News[]>(INITIAL_NEWS);
  const [announcement, setAnnouncement] = useState<string>(INITIAL_ANNOUNCEMENT);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [newsFilter, setNewsFilter] = useState<NewsType>('all');
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupImgRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [editingMember, setEditingMember] = useState<EditingMember | null>(null);
  const [editingGroup, setEditingGroup] = useState<Team | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [showNewsModal, setShowNewsModal] = useState<boolean>(false);
  const [newLinkName, setNewLinkName] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [newTaskText, setNewTaskText] = useState<string>('');
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始化：从 API 或 localStorage 加载数据
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 尝试从 API 加载数据
      const [teamsData, newsData, announcementData] = await Promise.all([
        teamsAPI.getAll(),
        newsAPI.getAll(),
        announcementAPI.get(),
      ]);
      
      setTeams(teamsData);
      setNews(newsData);
      setAnnouncement(announcementData);
      setUseLocalStorage(false);
      console.log('✅ 数据已从云端数据库加载');
    } catch (error) {
      console.warn('⚠️ API 加载失败，使用本地存储作为后备方案:', error);
      // 回退到 localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.teams) setTeams(parsed.teams);
          if (parsed.news) setNews(parsed.news);
          if (parsed.announcement) setAnnouncement(parsed.announcement);
        } catch (e) {
          console.error('localStorage 解析失败:', e);
        }
      }
      setUseLocalStorage(true);
    } finally {
      setLoading(false);
    }
  };

  // 自动保存到 localStorage（作为本地备份）
  useEffect(() => {
    if (mounted && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, news, announcement }));
    }
  }, [teams, news, announcement, mounted, loading]);

  // 公告更新时自动保存到 API（防抖）
  useEffect(() => {
    if (!mounted || loading || useLocalStorage) return;
    
    if (announcementTimerRef.current) {
      clearTimeout(announcementTimerRef.current);
    }
    
    announcementTimerRef.current = setTimeout(() => {
      announcementAPI.update(announcement).catch(err => console.error('公告保存失败:', err));
    }, 1000);
    
    return () => {
      if (announcementTimerRef.current) {
        clearTimeout(announcementTimerRef.current);
      }
    };
  }, [announcement, mounted, loading, useLocalStorage]);

  const toggleAdminMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      if (isAdminUnlocked) {
        setIsEditing(true);
      } else {
        const pin = prompt('请输入管理员密码 (默认: 8888):');
        if (pin === '8888') {
          setIsAdminUnlocked(true);
          setIsEditing(true);
        } else if (pin !== null) {
          alert('密码错误！');
        }
      }
    }
  };

  const handleGenerateReport = () => {
    const date = new Date().toLocaleDateString();
    let report = `📢 【AIGC漫剧制作日报】 ${date}\n\n`;
    
    const totalProg = Math.round(teams.reduce((acc, t) => acc + (t.progress || 0), 0) / teams.length);
    report += `📊 全局进度：${totalProg}%\n`;
    
    const totalBudget = teams.reduce((acc, t) => acc + Number(t.budget || 0), 0);
    const totalCost = teams.reduce((acc, t) => acc + Number(t.actualCost || 0), 0);
    report += `💰 资金实耗：¥${totalCost} / ¥${totalBudget} (${Math.round(totalCost / totalBudget * 100)}%)\n\n`;

    teams.forEach(t => {
      const icon = t.status === 'urgent' ? '🔴' : t.status === 'review' ? '🟣' : t.status === 'done' ? '⚪' : '🟢';
      report += `${icon} ${t.title} (进度 ${t.progress}%)\n`;
      report += `   • 任务：${t.task || '无'}\n`;
      if (t.todos && t.todos.length > 0) {
        const pending = t.todos.filter(todo => !todo.done).map(todo => todo.text).join('; ');
        if (pending) report += `   • 待办：${pending}\n`;
      }
      if (Number(t.actualCost) > Number(t.budget)) {
        report += `   • ⚠️ 警告：预算超支 (¥${t.actualCost - t.budget})\n`;
      }
      report += '\n';
    });
    
    navigator.clipboard.writeText(report).then(() => {
      alert('✅ 日报已生成并复制到剪贴板！\n\n你可以直接去飞书/微信群粘贴了。');
    });
  };

  const handleSavePage = () => {
    alert('✅ 在 TypeScript 版本中，请使用"备份数据"功能导出 JSON，然后分享给同事。');
  };

  const triggerImport = () => importInputRef.current?.click();
  
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.teams) setTeams(data.teams);
        if (data.news) setNews(data.news);
        if (data.announcement) setAnnouncement(data.announcement);
        alert('数据恢复成功！');
      } catch (err) {
        console.error(err);
        alert('导入失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, targetSetter: React.Dispatch<React.SetStateAction<EditingMember | null>>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) return alert('图片需小于 800KB');
    const reader = new FileReader();
    reader.onloadend = () => {
      targetSetter(prev => prev ? ({ ...prev, avatar: reader.result as string }) : null);
    };
    reader.readAsDataURL(file);
  };
  
  const handleGroupImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return alert('图片需小于 1MB');
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingGroup(prev => prev ? ({ ...prev, coverImage: reader.result as string }) : null);
    };
    reader.readAsDataURL(file);
  };
  
  const handleGalleryImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      if (file.size > 500 * 1024) {
        alert(`图片 ${file.name} 过大`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingGroup(prev => prev ? ({ ...prev, images: [...(prev.images || []), reader.result as string] }) : null);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleRemoveGalleryImage = (idx: number) => {
    setEditingGroup(prev => prev ? ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }) : null);
  };
  
  const triggerFileUpload = () => fileInputRef.current?.click();
  const triggerGroupImgUpload = () => groupImgRef.current?.click();
  const triggerGalleryUpload = () => galleryInputRef.current?.click();
  
  const handleReset = () => {
    if (window.confirm('重置数据？')) {
      setTeams(INITIAL_TEAMS);
      setNews(INITIAL_NEWS);
      setAnnouncement(INITIAL_ANNOUNCEMENT);
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };
  
  const openAddMemberModal = (gid: string) => {
    setEditingMember({ id: '', name: '', isDirector: false, avatar: '', role: '执行专员', currentGroupId: gid });
    setShowMemberModal(true);
  };
  
  const openEditMemberModal = (m: Member) => {
    const g = teams.find(t => t.members.some(mem => mem.id === m.id));
    setEditingMember({ ...m, currentGroupId: g?.id });
    setShowMemberModal(true);
  };
  
  const handleSaveMember = async () => {
    if (!editingMember?.name.trim()) return alert('请输入姓名');
    setTeams(prev => {
      const newTeams = [...prev];
      if (editingMember.id) {
        newTeams.forEach(t => {
          t.members = t.members.filter(m => m.id !== editingMember.id);
        });
      }
      const mToSave: Member = {
        id: editingMember.id || `m-${Date.now()}`,
        name: editingMember.name,
        isDirector: editingMember.isDirector,
        avatar: editingMember.avatar,
        role: editingMember.role || (editingMember.isDirector ? '总负责人' : '执行专员')
      };
      const tIdx = newTeams.findIndex(t => t.id === editingMember.currentGroupId);
      if (tIdx !== -1) {
        newTeams[tIdx].members.push(mToSave);
        // 保存到 API
        if (!useLocalStorage) {
          teamsAPI.update(newTeams[tIdx]).catch(err => console.error('保存失败:', err));
        }
      }
      return newTeams;
    });
    setShowMemberModal(false);
  };
  
  const handleDeleteMember = async () => {
    if (window.confirm('删除成员？')) {
      setTeams(prev => {
        const newTeams = prev.map(t => ({ ...t, members: t.members.filter(m => m.id !== editingMember?.id) }));
        // 保存到 API
        if (!useLocalStorage) {
          const updatedTeam = newTeams.find(t => t.id === editingMember?.currentGroupId);
          if (updatedTeam) {
            teamsAPI.update(updatedTeam).catch(err => console.error('保存失败:', err));
          }
        }
        return newTeams;
      });
      setShowMemberModal(false);
    }
  };
  
  const handleAddLink = () => {
    if (!newLinkName || !newLinkUrl) return;
    setEditingGroup(prev => prev ? ({ ...prev, links: [...(prev.links || []), { name: newLinkName, url: newLinkUrl }] }) : null);
    setNewLinkName('');
    setNewLinkUrl('');
  };
  
  const handleRemoveLink = (idx: number) => {
    setEditingGroup(prev => prev ? ({ ...prev, links: prev.links.filter((_, i) => i !== idx) }) : null);
  };
  
  const handleSaveGroup = async () => {
    if (!editingGroup) return;
    setTeams(prev => prev.map(t => t.id === editingGroup.id ? editingGroup : t));
    // 保存到 API
    if (!useLocalStorage) {
      try {
        await teamsAPI.update(editingGroup);
        console.log('✅ 团队数据已保存');
      } catch (err) {
        console.error('保存失败:', err);
        alert('保存失败，请检查网络连接');
      }
    }
    setShowGroupModal(false);
  };
  
  const openAddNewsModal = () => {
    setEditingNews({ id: '', title: '', date: '11-25', type: 'industry', priority: 'normal', url: '#' });
    setShowNewsModal(true);
  };
  
  const openEditNewsModal = (item: News) => {
    setEditingNews({ ...item });
    setShowNewsModal(true);
  };
  
  const handleSaveNews = async () => {
    if (!editingNews?.title) return;
    const isNew = !editingNews.id;
    const newsToSave = isNew ? { ...editingNews, id: `n-${Date.now()}` } : editingNews;
    
    setNews(prev => {
      const n = isNew
        ? [newsToSave, ...prev]
        : prev.map(item => item.id === newsToSave.id ? newsToSave : item);
      return n;
    });
    
    // 保存到 API
    if (!useLocalStorage) {
      try {
        if (isNew) {
          await newsAPI.add(newsToSave);
        } else {
          await newsAPI.update(newsToSave);
        }
        console.log('✅ 新闻已保存');
      } catch (err) {
        console.error('保存失败:', err);
        alert('保存失败，请检查网络连接');
      }
    }
    setShowNewsModal(false);
  };
  
  const handleDeleteNews = async (id: string) => {
    if (window.confirm('删除？')) {
      setNews(prev => prev.filter(n => n.id !== id));
      // 从 API 删除
      if (!useLocalStorage) {
        try {
          await newsAPI.delete(id);
          console.log('✅ 新闻已删除');
        } catch (err) {
          console.error('删除失败:', err);
        }
      }
    }
  };
  
  const handleExportData = () => {
    const data = { version: '11.0', timestamp: new Date().toISOString(), teams, news, announcement };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIGC_Backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setEditingGroup(prev => prev ? ({
      ...prev,
      todos: [...(prev.todos || []), { id: `t-${Date.now()}`, text: newTaskText, done: false }]
    }) : null);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    setEditingGroup(prev => prev ? ({
      ...prev,
      todos: prev.todos.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    }) : null);
  };

  const deleteTask = (taskId: string) => {
    setEditingGroup(prev => prev ? ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== taskId)
    }) : null);
  };

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalProgress = Math.round(teams.reduce((acc, t) => acc + (t.progress || 0), 0) / teams.length);
  const totalBudget = teams.reduce((acc, t) => acc + Number(t.budget || 0), 0);
  const totalCost = teams.reduce((acc, t) => acc + Number(t.actualCost || 0), 0);
  const filteredTeams = teams.filter(t => 
    t.title.includes(searchTerm) || t.members.some(m => m.name.includes(searchTerm))
  );
  const filteredNews = newsFilter === 'all' ? news : news.filter(n => n.type === newsFilter);

  // 加载中界面
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-400 text-lg font-bold">正在从云端数据库加载数据...</div>
          <div className="text-slate-600 text-sm mt-2">首次加载可能需要几秒钟</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500/20 selection:text-orange-300 pb-32 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-blue-950/20 rounded-[100%] blur-[120px] animate-pulse opacity-30"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10"></div>
      </div>
      
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
        {announcement && (
          <div className="w-full bg-orange-900/20 border-b border-orange-500/10 text-xs text-orange-300 py-1 px-4 flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap">
            <Megaphone size={12} className="animate-bounce text-orange-500" />
            <div className="font-medium">{announcement}</div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-700 rounded-lg flex items-center justify-center shadow-lg text-white animate-pulse">
              <Zap size={16} className="fill-current" />
            </div>
            <div className="hidden md:block text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-widest uppercase">AIGC STUDIO ⚡</div>
            <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              {PROJECT_PHASES.map((phase, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhase(idx)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    currentPhase === idx
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* 数据库状态指示器 */}
            {!loading && (
              <div className={`hidden lg:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded border ${
                useLocalStorage 
                  ? 'bg-yellow-900/20 border-yellow-500/20 text-yellow-400' 
                  : 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${useLocalStorage ? 'bg-yellow-500' : 'bg-emerald-500'} animate-pulse`}></span>
                <span className="text-[10px] font-bold uppercase">
                  {useLocalStorage ? '本地模式' : '云端数据库'}
                </span>
              </div>
            )}
            
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500">Budget Burn:</span>
              <span className={totalCost > totalBudget ? 'text-red-500' : 'text-emerald-400'}>¥{totalCost}</span>
              <span className="text-slate-600">/</span>
              <span>¥{totalBudget}</span>
            </div>

            <button
              onClick={toggleAdminMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEditing
                  ? 'bg-orange-600/90 text-white border border-orange-500/50 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isEditing ? <Unlock size={14} /> : <Lock size={14} />}
              {isEditing ? 'ADMIN' : 'VIEW'}
            </button>
            {isEditing && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={handleGenerateReport}
                  title="生成日报"
                  className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600 rounded transition-colors"
                >
                  <ClipboardList size={14} />
                </button>
                <div className="w-px h-4 bg-slate-700"></div>
                <button
                  onClick={handleSavePage}
                  title="保存为分享网页"
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors ml-1 shadow-lg shadow-blue-900/30"
                >
                  <Save size={14} />
                  <span>保存设置</span>
                </button>
                <div className="w-px h-4 bg-slate-700 ml-1"></div>
                <button
                  onClick={handleExportData}
                  title="备份数据"
                  className="p-1.5 text-sky-400 hover:text-white hover:bg-sky-600 rounded transition-colors"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={triggerImport}
                  title="恢复数据"
                  className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-600 rounded transition-colors"
                >
                  <FileJson size={14} />
                </button>
                <button
                  onClick={handleReset}
                  title="重置"
                  className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                <input
                  type="file"
                  ref={importInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleImportData}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="bg-slate-900 border-b border-slate-800 py-2">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
            <label className="text-xs text-slate-500 font-bold whitespace-nowrap">发布通告:</label>
            <input
              type="text"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 focus:border-orange-500/50 outline-none"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold tracking-widest uppercase">
                {PROJECT_PHASES[currentPhase]}
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Project Alpha-1</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-400 to-slate-500">AIGC 漫剧</span>
              <span className="text-orange-500">制作中台 🚀</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl min-w-[140px]">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Progress</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white font-mono">{totalProgress}%</span>
                <span className="text-[10px] text-emerald-500 mb-1 flex items-center font-bold">
                  <CheckCircle size={10} className="mr-1" /> On Track
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl min-w-[120px]">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Active Staff</div>
              <div className="text-3xl font-black text-white font-mono">{totalMembers}</div>
            </div>
          </div>
        </header>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
              <Globe size={18} className="text-sky-500" /> 每日动态漫资讯
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://weixin.sogou.com/weixin?type=2&query=%E5%89%A7%E6%9F%A5%E6%9F%A5+%E5%8A%A8%E6%80%81%E6%BC%AB%E6%A6%9C%E5%8D%95"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-lg shadow-emerald-900/20 mr-2"
              >
                <Search size={12} /> 🔍 搜剧查查榜单
              </a>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setNewsFilter('all')}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    newsFilter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  全部
                </button>
                {Object.entries(NEWS_TAGS)
                  .filter(([key]) => key !== 'all')
                  .map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setNewsFilter(key as NewsType)}
                      className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                        newsFilter === key ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
              </div>
              {isEditing && (
                <button
                  onClick={openAddNewsModal}
                  className="ml-2 text-xs flex items-center gap-1 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded font-bold transition-colors"
                >
                  <Plus size={12} /> 发布快讯
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
            {filteredNews.map(item => (
              <NewsCard
                key={item.id}
                item={item}
                isEditing={isEditing}
                onClick={openEditNewsModal}
                onDelete={handleDeleteNews}
              />
            ))}
          </div>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="relative w-full max-w-xl group">
            <input
              type="text"
              placeholder="搜索成员、任务..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all shadow-lg placeholder-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
          {filteredTeams.map((team, index) => (
            <DepartmentSection
              key={team.id}
              team={team}
              index={index}
              isEditing={isEditing}
              onEditMember={openEditMemberModal}
              onAddMember={openAddMemberModal}
              onEditGroup={(group) => {
                setEditingGroup(group);
                setShowGroupModal(true);
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 animate-in slide-in-from-right duration-700">
        <div className="bg-slate-900/90 border border-slate-700 p-2 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2">
          <div className="p-2 text-center border-b border-slate-800 mb-1">
            <Wrench size={20} className="text-slate-400 mx-auto" />
            <div className="text-[9px] font-bold text-slate-500 mt-1">AI TOOLS</div>
          </div>
          {AI_TOOLS.map((tool, idx) => (
            <a
              key={idx}
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-xl text-lg transition-all hover:scale-110 border border-transparent hover:border-slate-600 relative group"
              title={tool.name}
            >
              {tool.icon}
            </a>
          ))}
        </div>
      </div>

      <Modal isOpen={showNewsModal} onClose={() => setShowNewsModal(false)} title="资讯编辑">
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">资讯类型</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(NEWS_TAGS)
              .filter(([key]) => key !== 'all')
              .map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setEditingNews(prev => prev ? ({ ...prev, type: key as NewsType }) : null)}
                  className={`px-3 py-1.5 rounded text-xs font-bold border ${
                    editingNews?.type === key
                      ? 'bg-slate-700 border-slate-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {config.label}
                </button>
              ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">优先级</label>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingNews(prev => prev ? ({ ...prev, priority: 'normal' }) : null)}
              className={`flex-1 py-2 rounded border text-xs font-bold ${
                editingNews?.priority !== 'high'
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              普通
            </button>
            <button
              onClick={() => setEditingNews(prev => prev ? ({ ...prev, priority: 'high' }) : null)}
              className={`flex-1 py-2 rounded border text-xs font-bold ${
                editingNews?.priority === 'high'
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              高优
            </button>
          </div>
        </div>
        <InputField
          label="标题"
          type="textarea"
          value={editingNews?.title || ''}
          onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="日期"
            value={editingNews?.date || ''}
            onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
          />
          <InputField
            label="链接"
            value={editingNews?.url || ''}
            onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
          />
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            onClick={handleSaveNews}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm"
          >
            发布
          </button>
        </div>
      </Modal>

      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="成员编辑">
        {editingMember && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                {editingMember.avatar ? (
                  <img src={editingMember.avatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span className="text-2xl text-slate-600 font-bold">{editingMember.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setEditingMember)}
              />
              <button
                onClick={triggerFileUpload}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-2"
              >
                <Upload size={12} /> 上传头像
              </button>
            </div>
            <InputField
              label="姓名"
              value={editingMember.name || ''}
              onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
            />
            <InputField
              label="职位"
              value={editingMember.role || ''}
              onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
            />
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">是否为组长</label>
              <button
                onClick={() => setEditingMember({ ...editingMember, isDirector: !editingMember.isDirector })}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-colors shadow-sm ${
                  editingMember.isDirector
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {editingMember.isDirector ? '是' : '否'}
              </button>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              {editingMember.id && (
                <button
                  onClick={handleDeleteMember}
                  className="flex-1 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-bold text-sm"
                >
                  删除
                </button>
              )}
              <button
                onClick={handleSaveMember}
                className="flex-[2] py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm"
              >
                保存
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title="部门管理">
        {editingGroup && (
          <>
            <InputField
              label="部门名称"
              value={editingGroup.title || ''}
              onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="预算 (Budget)"
                value={editingGroup.budget?.toString() || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, budget: Number(e.target.value) || 0 })}
              />
              <InputField
                label="实际花费 (Cost)"
                value={editingGroup.actualCost?.toString() || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, actualCost: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField
                label="核心任务"
                value={editingGroup.task || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, task: e.target.value })}
              />
              <InputField
                label="周期"
                value={editingGroup.cycle || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, cycle: e.target.value })}
              />
              <InputField
                label="日工作量"
                value={editingGroup.workload || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, workload: e.target.value })}
              />
            </div>

            <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <ListTodo size={14} /> 任务清单 (To-Do)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="输入新任务..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {editingGroup.todos?.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-2 rounded bg-slate-900/50 hover:bg-slate-900 group">
                    <button
                      onClick={() => toggleTask(todo.id)}
                      className={`p-0.5 rounded ${todo.done ? 'text-emerald-500' : 'text-slate-600 hover:text-sky-500'}`}
                    >
                      {todo.done ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <span className={`flex-1 text-xs ${todo.done ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTask(todo.id)}
                      className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!editingGroup.todos || editingGroup.todos.length === 0) && (
                  <div className="text-center text-[10px] text-slate-600 py-2">暂无任务</div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">状态</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]: [string, { label: string }]) => (
                  <button
                    key={key}
                    onClick={() => setEditingGroup({ ...editingGroup, status: key as Team['status'] })}
                    className={`py-2 rounded border text-[10px] font-bold ${
                      editingGroup.status === key
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                进度: {editingGroup.progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editingGroup.progress || 0}
                onChange={(e) => setEditingGroup({ ...editingGroup, progress: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">主参考图</label>
              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="w-16 h-16 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                  {editingGroup.coverImage ? (
                    <img src={editingGroup.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <ImageIcon className="text-slate-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={groupImgRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleGroupImgChange}
                  />
                  <button
                    onClick={triggerGroupImgUpload}
                    className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded flex items-center gap-2"
                  >
                    <Upload size={12} /> 上传
                  </button>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">辅助参考图库</label>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {editingGroup.images?.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded overflow-hidden relative group border border-slate-700 bg-slate-900">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                      <button
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={triggerGalleryUpload}
                    className="aspect-square rounded border border-dashed border-slate-700 bg-slate-900/50 flex items-center justify-center text-slate-500 hover:text-sky-500 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={galleryInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImgChange}
                />
              </div>
            </div>
            <InputField
              label="备忘录"
              type="textarea"
              value={editingGroup.notes || ''}
              onChange={(e) => setEditingGroup({ ...editingGroup, notes: e.target.value })}
            />
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">资源链接</label>
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                <div className="flex flex-wrap gap-2 mb-3">
                  {editingGroup.links?.map((link, idx) => (
                    <ResourceLink
                      key={idx}
                      name={link.name}
                      url={link.url}
                      isEditing={true}
                      onDelete={() => handleRemoveLink(idx)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="名称"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    className="flex-[2] bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 outline-none"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                  <button
                    onClick={handleAddLink}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 rounded text-xs font-bold"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-700/50">
              <button
                onClick={handleSaveGroup}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm shadow-lg"
              >
                保存所有更改
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;