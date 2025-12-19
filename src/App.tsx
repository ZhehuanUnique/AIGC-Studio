import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search, Plus, Trash2, X, Image as ImageIcon, Save, RefreshCw, Upload,
  CheckCircle, CheckSquare, ListTodo, Square,
  Download, FileJson, ClipboardList, Unlock,
  Wrench, Megaphone, GripVertical
} from 'lucide-react';
import { Team, Member, Todo, ResourceLink, ConsumptionRecord } from './types';
import { 
  STORAGE_KEY, INITIAL_ANNOUNCEMENT, INITIAL_TEAMS,
  STATUS_CONFIG, AI_TOOLS, PROJECT_PHASES
} from './constants';
import { Modal } from './components/Modal';
import { InputField } from './components/InputField';
import { DepartmentSection } from './components/DepartmentSection';
import { teamsAPI, announcementAPI } from './utils/api';
import { upload } from '@vercel/blob/client';

interface EditingMember extends Member {
  currentGroupId?: string;
}

function App() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [memberTasksByTeam, setMemberTasksByTeam] = useState<Record<string, Record<string, Todo[]>>>({});
  const [announcement, setAnnouncement] = useState<string>(INITIAL_ANNOUNCEMENT);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [unlockedGroups, setUnlockedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const currentPhase = 1;
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'blue' | 'white' | 'green'>('dark');
  const [isCoarsePointer, setIsCoarsePointer] = useState<boolean>(false);
  const [aiToolsExpanded, setAiToolsExpanded] = useState<boolean>(false);
  // 使用指南直接跳转飞书文档（不再使用站内 guide.html）
  
  // 自定义提示框状态
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [promptMessage, setPromptMessage] = useState<string>('');
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [promptValue, setPromptValue] = useState<string>('');
  const [promptCallback, setPromptCallback] = useState<((value: string | null) => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmCallback, setConfirmCallback] = useState<((value: boolean) => void) | null>(null);

  useEffect(() => {
    const mq = window.matchMedia?.('(pointer: coarse)');
    if (!mq) return;

    const apply = () => setIsCoarsePointer(!!mq.matches);
    apply();

    // 兼容不同浏览器的事件 API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMq: any = mq;
    if (typeof anyMq.addEventListener === 'function') {
      anyMq.addEventListener('change', apply);
      return () => anyMq.removeEventListener('change', apply);
    }
    if (typeof anyMq.addListener === 'function') {
      anyMq.addListener(apply);
      return () => anyMq.removeListener(apply);
    }
  }, []);

  const normalizeTeam = useCallback((team: any): Team => {
    // 后端/数据库字段是 snake_case，这里统一转换成前端使用的 camelCase
    return {
      ...team,
      iconKey: team.iconKey ?? team.icon_key ?? 'default',
      actualCost: team.actualCost ?? team.actual_cost ?? 0,
      coverImage: team.coverImage ?? team.cover_image ?? '',
      // 兼容旧字段：members/todos/images/links 若是字符串则尝试解析
      images: Array.isArray(team.images) ? team.images : (() => {
        try { return JSON.parse(team.images || '[]'); } catch { return []; }
      })(),
      links: Array.isArray(team.links) ? team.links : (() => {
        try { return JSON.parse(team.links || '[]'); } catch { return []; }
      })(),
      members: Array.isArray(team.members) ? team.members : [],
      todos: Array.isArray(team.todos) ? team.todos : [],
      consumptionRecords: Array.isArray(team.consumptionRecords) 
        ? team.consumptionRecords 
        : (Array.isArray(team.consumption_records) 
          ? team.consumption_records 
          : (() => {
            try { return JSON.parse(team.consumption_records || '[]'); } catch { return []; }
          })()),
      unfinishedWorks: Array.isArray(team.unfinishedWorks) ? team.unfinishedWorks : (() => {
        try { return JSON.parse(team.unfinished_works || team.unfinishedWorks || '[]'); } catch { return []; }
      })(),
      finishedWorks: Array.isArray(team.finishedWorks) ? team.finishedWorks : (() => {
        try { return JSON.parse(team.finished_works || team.finishedWorks || '[]'); } catch { return []; }
      })()
    } as Team;
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupImgRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [editingMember, setEditingMember] = useState<EditingMember | null>(null);
  const [editingGroup, setEditingGroup] = useState<Team | null>(null);
  const [editingReferencesGroup, setEditingReferencesGroup] = useState<Team | null>(null);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [newTeamTitle, setNewTeamTitle] = useState<string>('');
  const [newTeamDirectorName, setNewTeamDirectorName] = useState<string>('');
  const [showReferencesModal, setShowReferencesModal] = useState<boolean>(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState<boolean>(false);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [consumptionPlatform, setConsumptionPlatform] = useState<'jimeng' | 'hailuo' | 'vidu' | 'other'>('jimeng');
  const [consumptionPackage, setConsumptionPackage] = useState<'jimeng-299' | 'jimeng-499' | 'hailuo-1399' | 'vidu-499' | 'custom'>('jimeng-299');
  const [consumptionCustomAmount, setConsumptionCustomAmount] = useState<string>('');
  const [consumptionNote, setConsumptionNote] = useState<string>('');
  
  // 拖拽排序相关状态
  const [draggedTeamId, setDraggedTeamId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const lastClientYRef = useRef<number>(0);
  // 资源链接模块已从“部门管理”弹窗移除，相关 state 先移除
  const [newTaskText, setNewTaskText] = useState<string>('');
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 主题配置
  const themes = {
    dark: { 
      bg: 'bg-slate-950', 
      card: 'bg-[#0f172a]', 
      text: 'text-slate-200', 
      border: 'border-slate-800',
      gradient: 'from-slate-950 via-slate-900 to-slate-950'
    },
    blue: { 
      bg: 'bg-blue-950', 
      card: 'bg-blue-900/50', 
      text: 'text-blue-50', 
      border: 'border-blue-700',
      gradient: 'from-blue-950 via-blue-900 to-blue-950'
    },
    white: { 
      // “白色”切换为淡蓝色主题（更清爽、且依旧是浅色模式）
      bg: 'bg-sky-50',
      card: 'bg-white/80 backdrop-blur',
      text: 'text-slate-800',
      border: 'border-sky-200/70',
      gradient: 'from-sky-50 via-white to-blue-50'
    },
    green: { 
      bg: 'bg-emerald-950', 
      card: 'bg-emerald-900/50', 
      text: 'text-emerald-50', 
      border: 'border-emerald-700',
      gradient: 'from-emerald-950 via-emerald-900 to-emerald-950'
    }
  };

  // 自定义居中提示框函数
  const customAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  const customPrompt = useCallback((message: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptMessage(message);
      setPromptValue('');
      setShowPrompt(true);
      setPromptCallback(() => resolve);
    });
  }, []);

  const customConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmMessage(message);
      setShowConfirm(true);
      setConfirmCallback(() => resolve);
    });
  }, []);

  const addDirectorProject = useCallback(async (groupId: string, directorId: string) => {
    const name = (await customPrompt('请输入项目名称：'))?.trim();
    if (!name) return;
    const url = (await customPrompt('请输入飞书链接：'))?.trim();
    if (!url) return;

    let teamToPersist: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id !== groupId) return t;
      const nextMembers = t.members.map(m => {
        if (m.id !== directorId) return m;
        const list: ResourceLink[] = Array.isArray((m as any).projects) ? [...((m as any).projects)] : [];
        list.push({ name, url });
        return { ...m, projects: list } as Member;
      });
      const updated = { ...t, members: nextMembers };
      teamToPersist = updated;
      return updated;
    }));

    if (!useLocalStorage && teamToPersist) {
      teamsAPI.update(teamToPersist).catch(err => console.error('保存失败:', err));
    }
  }, [customPrompt, useLocalStorage]);

  const deleteDirectorProject = useCallback(async (groupId: string, directorId: string, projectIndex: number) => {
    const ok = await customConfirm('删除该负责项目链接？\n\n此操作不可撤销。');
    if (!ok) return;

    let teamToPersist: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id !== groupId) return t;
      const nextMembers = t.members.map(m => {
        if (m.id !== directorId) return m;
        const list: ResourceLink[] = Array.isArray((m as any).projects) ? [...((m as any).projects)] : [];
        list.splice(projectIndex, 1);
        return { ...m, projects: list } as Member;
      });
      const updated = { ...t, members: nextMembers };
      teamToPersist = updated;
      return updated;
    }));

    if (!useLocalStorage && teamToPersist) {
      teamsAPI.update(teamToPersist).catch(err => console.error('保存失败:', err));
    }
  }, [customConfirm, useLocalStorage]);

  const isDataUrl = (value?: string) => typeof value === 'string' && value.startsWith('data:');
  const isVercelBlobUrl = (value?: string) =>
    typeof value === 'string' &&
    (value.includes('.blob.vercel-storage.com') || value.includes('vercel-storage.com') || value.includes('blob.vercel.com'));

  const uniqueUploadName = (originalName: string, prefix: string) => {
    const safe = (originalName || 'file').replace(/[^\w.\-]+/g, '_');
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}-${safe}`;
  };

  const deleteBlobByUrl = useCallback(async (url?: string) => {
    if (!isVercelBlobUrl(url)) return;
    try {
      await fetch('/api/blob-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (e) {
      // 不阻塞主流程：删除失败最多浪费一点存储
      console.warn('旧 Blob 删除失败（可忽略）:', e);
    }
  }, []);

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
    const binStr = atob(base64);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };

  // 压缩图片为缩略图（支持指定宽高和比例）
  const compressImage = (
    file: File, 
    options: {
      maxWidth?: number;
      maxHeight?: number;
      aspectRatio?: '2:3' | 'square';
      quality?: number;
    } = {}
  ): Promise<Blob> => {
    const {
      maxWidth = 600,
      maxHeight = 900,
      aspectRatio,
      quality = 0.75
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 计算缩放比例（保持宽高比）
          const scale = Math.min(maxWidth / width, maxHeight / height);
          if (scale < 1) {
            width = width * scale;
            height = height * scale;
          }

          // 如果指定了比例，按比例裁剪
          if (aspectRatio === '2:3') {
            const targetRatio = 2 / 3;
            const currentRatio = width / height;
            
            if (currentRatio > targetRatio) {
              // 当前图片更宽，裁剪宽度
              width = height * targetRatio;
            } else {
              // 当前图片更高，裁剪高度
              height = width / targetRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建 canvas context'));
            return;
          }

          // 如果指定了2:3比例，需要裁剪图片
          if (aspectRatio === '2:3') {
            const sourceRatio = img.width / img.height;
            const targetRatio = 2 / 3;
            
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            
            if (sourceRatio > targetRatio) {
              // 源图片更宽，裁剪左右
              sw = img.height * targetRatio;
              sx = (img.width - sw) / 2;
            } else {
              // 源图片更高，裁剪上下
              sh = img.width / targetRatio;
              sy = (img.height - sh) / 2;
            }
            
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 迁移旧的 Base64(dataURL) 图片 -> Vercel Blob URL，避免 PUT /api/teams 触发 413
  const migrateTeamMediaToBlob = useCallback(async (team: Team): Promise<Team> => {
    let changed = false;
    let coverImage = team.coverImage;
    let images = team.images || [];

    if (isDataUrl(coverImage)) {
      const blobObj = await upload(`cover-${team.id}-${Date.now()}.png`, dataUrlToBlob(coverImage as string), {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      coverImage = blobObj.url;
      changed = true;
    }

    const newImages: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (isDataUrl(img)) {
        const blobObj = await upload(`img-${team.id}-${Date.now()}-${i}.png`, dataUrlToBlob(img), {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        newImages.push(blobObj.url);
        changed = true;
      } else {
        newImages.push(img);
      }
    }
    images = newImages;

    return changed ? { ...team, coverImage, images } : team;
  }, []);

  // 初始化：从 API 或 localStorage 加载数据
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 尝试从 API 加载数据
      const [teamsData, announcementData] = await Promise.all([
        teamsAPI.getAll(),
        announcementAPI.get(),
      ]);
      
      // 合并密码字段 - 确保每个组都有密码
      const teamsWithPasswords = teamsData.map((raw: any) => {
        const team = normalizeTeam(raw);
        const initialTeam = INITIAL_TEAMS.find(t => t.id === team.id);
        return {
          ...team,
          password: team.password || initialTeam?.password || '0000',
          consumptionRecords: team.consumptionRecords || []
        };
      });
      
      setTeams(teamsWithPasswords);
      setAnnouncement(announcementData);
      setUseLocalStorage(false);
      console.log('✅ 数据已从云端数据库加载');
      // 调试：打印加载的作品数据
      teamsWithPasswords.forEach((team: Team) => {
        if ((team.unfinishedWorks && team.unfinishedWorks.length > 0) || 
            (team.finishedWorks && team.finishedWorks.length > 0)) {
          console.log(`📥 加载团队 ${team.id} 的作品:`, {
            unfinished: team.unfinishedWorks?.length || 0,
            finished: team.finishedWorks?.length || 0
          });
        }
      });
    } catch (error: any) {
      console.error('⚠️ API 加载失败，使用本地存储作为后备方案');
      console.error('错误类型:', error?.name || typeof error);
      console.error('错误消息:', error?.message || String(error));
      console.error('完整错误:', error);
      
      // 如果是网络错误或 CORS 错误，给用户更明确的提示
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('CORS')) {
        console.error('💡 可能是网络连接问题或 CORS 配置问题，请检查：');
        console.error('   - 网络连接是否正常');
        console.error('   - API 端点是否正确（/api/teams, /api/announcement）');
        console.error('   - Vercel 环境变量是否正确配置');
      }
      
      // 回退到 localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.teams) {
            // 同样合并密码字段
            const teamsWithPasswords = parsed.teams.map((raw: any) => {
              const team = normalizeTeam(raw);
              const initialTeam = INITIAL_TEAMS.find(t => t.id === team.id);
              return {
                ...team,
                password: team.password || initialTeam?.password || '0000',
                consumptionRecords: team.consumptionRecords || []
              };
            });
            setTeams(teamsWithPasswords);
          }
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

  // 自动保存到 localStorage（作为本地备份） - 使用防抖优化性能
  useEffect(() => {
    if (mounted && !loading) {
      // 使用 setTimeout 将保存操作延迟到下一个事件循环,避免阻塞 UI
      const timeoutId = setTimeout(() => {
        try {
          // 使用 requestIdleCallback 在浏览器空闲时执行,如果不支持则直接执行
          const saveToStorage = () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, announcement }));
          };
          
          if ('requestIdleCallback' in window) {
            requestIdleCallback(saveToStorage, { timeout: 2000 });
          } else {
            saveToStorage();
          }
        } catch (error) {
          console.error('保存数据失败:', error);
        }
      }, 300); // 300ms 防抖延迟
      
      return () => clearTimeout(timeoutId);
    }
  }, [teams, announcement, mounted, loading]);

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

  // 切换组的锁定状态
  const toggleGroupLock = useCallback(async (group: Team) => {
    const groupId = group.id;
    
    // 如果已解锁,则锁定
    if (unlockedGroups.has(groupId) || isAdminUnlocked) {
      setUnlockedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
      return;
    }
    
    // 否则提示输入密码
    const input = await customPrompt(`请输入【${group.title}】的密码:`);
    if (input === null) return; // 用户取消
    
    const password = input.trim(); // 去除前后空格
    
    if (password === '2468') {
      // 管理员密码 - 解锁所有组
      setIsAdminUnlocked(true);
      const allGroupIds = new Set(teams.map(t => t.id));
      setUnlockedGroups(allGroupIds);
      customAlert('✅ 管理员权限已激活,可以编辑所有组!');
    } else if (password === group.password) {
      // 组密码 - 只解锁该组
      setUnlockedGroups(prev => new Set(prev).add(groupId));
      customAlert(`✅ 已解锁【${group.title}】!`);
    } else {
      customAlert('❌ 密码错误！');
    }
  }, [unlockedGroups, isAdminUnlocked, teams, customPrompt, customAlert]);

  // 更新进度（无需密码保护）
  const handleProgressChange = useCallback(async (groupId: string, newProgress: number) => {
    // 确保进度在 0-100 范围内
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    
    let updatedTeamToPersist: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id === groupId) {
        const updated = { ...t, progress: clampedProgress };
        if (!updatedTeamToPersist) updatedTeamToPersist = updated;
        return updated;
      }
      return t;
    }));

    // 保存到 API
    if (!useLocalStorage && updatedTeamToPersist) {
      try {
        await teamsAPI.update(updatedTeamToPersist);
        console.log(`✅ 进度已更新: ${groupId} -> ${clampedProgress}%`);
      } catch (err) {
        console.error('进度更新失败:', err);
      }
    }
  }, [useLocalStorage]);

  const handleGenerateReport = useCallback(() => {
    const date = new Date().toLocaleDateString();
    let report = `📢 【AIGC制作日报】 ${date}\n\n`;
    
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
      customAlert('✅ 日报已生成并复制到剪贴板！\n\n你可以直接去飞书/微信群粘贴了。');
    });
  }, [teams]);

  const handleSavePage = async () => {
    try {
      // 保存到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, announcement }));
      
      // 如果不是使用本地存储模式,则保存到 API
      if (!useLocalStorage) {
        // 保存所有团队数据
        await Promise.all(teams.map(team => teamsAPI.update(team)));
        // 保存公告
        await announcementAPI.update(announcement);
        
        customAlert('✅ 所有修改已保存到云端数据库和本地存储!');
      } else {
        customAlert('✅ 所有修改已保存到本地存储!');
      }
      
      // 保存成功后,恢复到初始锁定状态
      setIsAdminUnlocked(false);
      setUnlockedGroups(new Set());
      
    } catch (error) {
      console.error('保存失败:', error);
      // 至少保存到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, announcement }));
      customAlert('⚠️ 云端保存失败,但已保存到本地存储。');
      
      // 即使保存失败也恢复锁定状态
      setIsAdminUnlocked(false);
      setUnlockedGroups(new Set());
    }
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
        if (data.announcement) setAnnouncement(data.announcement);
        customAlert('数据恢复成功！');
      } catch (err) {
        console.error(err);
        customAlert('导入失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSetter: React.Dispatch<React.SetStateAction<EditingMember | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await upload(uniqueUploadName(file.name, 'avatar'), file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      targetSetter(prev => {
        if (!prev) return prev;
        const oldUrl = prev.avatar;
        // 先更新 UI，再异步清理旧图
        if (oldUrl && oldUrl !== blob.url) deleteBlobByUrl(oldUrl);
        return { ...prev, avatar: blob.url };
      });
    } catch (err) {
      console.error('头像上传失败:', err);
      customAlert('⚠️ 头像上传失败，请检查网络或稍后重试。');
    } finally {
      e.target.value = '';
    }
  };
  
  const handleGroupImgChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSetter: React.Dispatch<React.SetStateAction<Team | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await upload(uniqueUploadName(file.name, 'cover'), file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      targetSetter(prev => {
        if (!prev) return prev;
        const oldUrl = prev.coverImage;
        if (oldUrl && oldUrl !== blob.url) deleteBlobByUrl(oldUrl);
        return { ...prev, coverImage: blob.url };
      });
    } catch (err) {
      console.error('图片上传失败:', err);
      customAlert('⚠️ 图片上传失败，请检查网络或稍后重试。');
    } finally {
      e.target.value = '';
    }
  };
  
  const handleGalleryImgChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSetter: React.Dispatch<React.SetStateAction<Team | null>>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      for (const file of files) {
        const blob = await upload(uniqueUploadName(file.name, 'gallery'), file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        targetSetter(prev => {
          if (!prev) return prev;
          const nextImages = [...(prev.images || []), blob.url];
          // 辅助参考图库最多保留 2 张：超出的旧图自动清理（节省 Blob 存储）
          const keep = nextImages.slice(-2);
          const removed = nextImages.slice(0, Math.max(0, nextImages.length - 2));
          removed.forEach((u) => deleteBlobByUrl(u));
          return { ...prev, images: keep };
        });
      }
    } catch (err) {
      console.error('图库上传失败:', err);
      customAlert('⚠️ 图片上传失败，请检查网络或稍后重试。');
    } finally {
      e.target.value = '';
    }
  };
  
  const handleRemoveGalleryImage = useCallback(
    (idx: number, targetSetter: React.Dispatch<React.SetStateAction<Team | null>>) => {
      targetSetter(prev => {
        if (!prev) return prev;
        const list = prev.images || [];
        const toRemove = list[idx];
        if (toRemove) deleteBlobByUrl(toRemove);
        return { ...prev, images: list.filter((_, i) => i !== idx) };
      });
    },
    [deleteBlobByUrl]
  );
  
  const triggerFileUpload = useCallback(() => fileInputRef.current?.click(), []);
  const triggerGroupImgUpload = useCallback(() => groupImgRef.current?.click(), []);
  const triggerGalleryUpload = useCallback(() => galleryInputRef.current?.click(), []);
  
  const handleReset = () => {
    // 保持与密码弹窗同一套风格
    customConfirm('重置数据？\n\n此操作会清空本地缓存并刷新页面，且不可撤销。').then((ok) => {
      if (!ok) return;
      setTeams(INITIAL_TEAMS);
      setAnnouncement(INITIAL_ANNOUNCEMENT);
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    });
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
    const memberId = editingMember.id || `m-${Date.now()}`;
    const targetGroupId = editingMember.currentGroupId;

    const mToSave: Member = {
      id: memberId,
      name: editingMember.name,
      isDirector: editingMember.isDirector,
      avatar: editingMember.avatar,
      role: editingMember.role || (editingMember.isDirector ? '总负责人' : '执行专员'),
      projects: Array.isArray((editingMember as any).projects) ? (editingMember as any).projects : []
    };

    // ⚠️ 这里必须用“不可变更新”，否则在 React 严格模式(dev)下可能导致一次点击被执行两次从而 push 出双份数据
    let teamToPersist: Team | null = null;
    setTeams(prev => {
      // 先从所有组移除该成员（编辑成员/换组时用）
      const removed = prev.map(t => ({
        ...t,
        members: t.members.filter(m => m.id !== memberId)
      }));

      // 再把成员加入目标组
      const next = removed.map(t => {
        if (t.id !== targetGroupId) return t;
        const updatedTeam = {
          ...t,
          members: [...t.members, mToSave]
        };
        teamToPersist = updatedTeam;
        return updatedTeam;
      });

      return next;
    });

    // 保存到 API（放在 setTeams 外，避免在 state 更新回调里做副作用）
    if (!useLocalStorage && teamToPersist) {
      teamsAPI.update(teamToPersist).catch(err => console.error('保存失败:', err));
    }
    setShowMemberModal(false);
  };
  
  const handleDeleteMember = async () => {
    if (await customConfirm('删除成员？\n\n此操作不可撤销。')) {
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

  // 从卡片上直接删除成员（无需打开成员编辑弹窗）
  const handleDeleteMemberDirect = useCallback(async (
    memberId: string,
    memberName?: string,
    memberRole?: string,
    isDirector?: boolean
  ) => {
    if (!await customConfirm('确认删除该成员？\n\n此操作不可撤销。')) return;

    // 先在本地 state 里删
    let updatedTeamToPersist: Team | null = null;
    setTeams(prev => {
      const next = prev.map(t => {
        const hasById = !!memberId && t.members.some(m => m.id === memberId);
        const hasByFallback = !memberId && !!memberName && t.members.some(m =>
          (m.name === memberName) &&
          (memberRole ? m.role === memberRole : true) &&
          (typeof isDirector === 'boolean' ? m.isDirector === isDirector : true)
        );

        if (!hasById && !hasByFallback) return t;

        let newMembers = t.members;
        if (hasById) {
          newMembers = t.members.filter(m => m.id !== memberId);
        } else {
          // 兜底：老数据可能没有 id/重复 id，用“姓名+角色+是否组长”删除第一个匹配项
          let removedOnce = false;
          newMembers = t.members.filter(m => {
            if (removedOnce) return true;
            const match =
              (m.name === memberName) &&
              (memberRole ? m.role === memberRole : true) &&
              (typeof isDirector === 'boolean' ? m.isDirector === isDirector : true);
            if (match) {
              removedOnce = true;
              return false;
            }
            return true;
          });
        }

        const updatedTeam = { ...t, members: newMembers };
        // 严格模式下 updater 可能执行两次：保留第一次捕获到的 team，避免第二次找不到成员导致丢失
        if (!updatedTeamToPersist) updatedTeamToPersist = updatedTeam;
        return updatedTeam;
      });
      return next;
    });

    // 再同步到 API
    if (!useLocalStorage && updatedTeamToPersist) {
      try {
        await teamsAPI.update(updatedTeamToPersist);
      } catch (err) {
        console.error('删除成员保存失败:', err);
      }
    }
  }, [useLocalStorage, customConfirm]);
  
  // 资源链接模块已从“部门管理”弹窗移除，如需恢复可再加回
  
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

  const handleDeleteGroup = useCallback(async (groupId: string, groupTitle?: string) => {
    const ok = await customConfirm(`确认删除该组？\n\n${groupTitle || groupId}\n\n此操作不可撤销。`);
    if (!ok) return;

    // 先本地删
    setTeams(prev => prev.filter(t => t.id !== groupId));
    setUnlockedGroups(prev => {
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
    setMemberTasksByTeam(prev => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });

    // 再同步到 API
    if (!useLocalStorage) {
      try {
        await teamsAPI.delete(groupId);
      } catch (err) {
        console.error('删除组保存失败:', err);
        customAlert('删除已在本地完成，但同步到服务器失败，请检查网络连接');
      }
    }
  }, [useLocalStorage, customConfirm, customAlert]);

  const openEditReferencesModal = useCallback((group: Team) => {
    setEditingReferencesGroup(group);
    setShowReferencesModal(true);
  }, []);

  const openAddTeamModal = useCallback(() => {
    setNewTeamTitle('');
    setNewTeamDirectorName('');
    setShowAddTeamModal(true);
  }, []);

  const handleCreateTeam = useCallback(async () => {
    const title = newTeamTitle.trim();
    const directorName = newTeamDirectorName.trim();
    if (!title) {
      customAlert('请填写组名');
      return;
    }
    if (!directorName) {
      customAlert('请填写组长名');
      return;
    }

    const now = Date.now();
    const teamId = `t_${now}`;
    const memberId = `m_${now}`;

    const newTeam: Team = {
      id: teamId,
      title,
      iconKey: 'default',
      task: '',
      cycle: '',
      workload: '',
      budget: 0,
      actualCost: 0,
      progress: 0,
      status: 'normal',
      notes: '',
      coverImage: '',
      images: [],
      links: [],
      todos: [],
      members: [
        {
          id: memberId,
          name: directorName,
          isDirector: true,
          avatar: '',
          role: '组长',
        },
      ],
      consumptionRecords: [],
    };

    // 先本地插入
    setTeams(prev => [...prev, newTeam]);
    setMemberTasksByTeam(prev => ({ ...prev, [teamId]: {} }));

    // 再同步到 API（后端按 id upsert）
    if (!useLocalStorage) {
      try {
        await teamsAPI.update(newTeam);
      } catch (err) {
        console.error('新增组保存失败:', err);
        customAlert('新增组已在本地创建，但保存到服务器失败，请检查网络连接');
      }
    }

    setShowAddTeamModal(false);
  }, [newTeamTitle, newTeamDirectorName, useLocalStorage, customAlert]);

  const addMemberTask = useCallback((groupId: string, memberId: string, text: string) => {
    const v = text.trim();
    if (!v) return;
    const id = `mt_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    const todo: Todo = { id, text: v, done: false };
    setMemberTasksByTeam(prev => {
      const teamMap = prev[groupId] || {};
      const list = teamMap[memberId] || [];
      return { ...prev, [groupId]: { ...teamMap, [memberId]: [...list, todo] } };
    });
  }, []);

  const toggleMemberTask = useCallback((groupId: string, memberId: string, todoId: string) => {
    setMemberTasksByTeam(prev => {
      const teamMap = prev[groupId] || {};
      const list = teamMap[memberId] || [];
      return {
        ...prev,
        [groupId]: {
          ...teamMap,
          [memberId]: list.map(t => t.id === todoId ? ({ ...t, done: !t.done }) : t),
        },
      };
    });
  }, []);

  const deleteMemberTask = useCallback((groupId: string, memberId: string, todoId: string) => {
    setMemberTasksByTeam(prev => {
      const teamMap = prev[groupId] || {};
      const list = teamMap[memberId] || [];
      return {
        ...prev,
        [groupId]: {
          ...teamMap,
          [memberId]: list.filter(t => t.id !== todoId),
        },
      };
    });
  }, []);

  const handleSaveReferences = useCallback(async () => {
    if (!editingReferencesGroup) return;

    // 若历史数据里还残留 Base64(dataURL)，先迁移到 Blob（否则 /api/teams 可能 413）
    let toSave = editingReferencesGroup;
    try {
      toSave = await migrateTeamMediaToBlob(editingReferencesGroup);
      if (toSave !== editingReferencesGroup) {
        setEditingReferencesGroup(toSave);
      }
    } catch (e) {
      console.error('迁移参考图失败:', e);
      customAlert('⚠️ 图片迁移失败，请稍后重试。');
      return;
    }

    // 辅助参考图库最多保留 2 张：保存时兜底裁剪并清理多余 Blob
    if (toSave.images && toSave.images.length > 2) {
      const keep = toSave.images.slice(-2);
      const removed = toSave.images.slice(0, toSave.images.length - 2);
      removed.forEach((u) => deleteBlobByUrl(u));
      toSave = { ...toSave, images: keep };
      setEditingReferencesGroup(toSave);
    }

    setTeams(prev => prev.map(t => t.id === toSave.id ? {
      ...t,
      coverImage: toSave.coverImage,
      images: toSave.images
    } : t));

    // 保存到 API
    if (!useLocalStorage) {
      try {
        const existing = teams.find(t => t.id === toSave.id);
        if (existing) {
          await teamsAPI.update({
            ...existing,
            coverImage: toSave.coverImage,
            images: toSave.images
          });
        } else {
          await teamsAPI.update(toSave);
        }
        console.log('✅ 参考图已保存');
      } catch (err) {
        console.error('参考图保存失败:', err);
        customAlert('⚠️ 保存失败，请检查网络连接或稍后再试。');
      }
    }

    setShowReferencesModal(false);
  }, [editingReferencesGroup, teams, useLocalStorage, migrateTeamMediaToBlob, customAlert]);
  
  const handleExportData = useCallback(() => {
    const data = { version: '11.0', timestamp: new Date().toISOString(), teams, announcement };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIGC_Backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [teams, announcement]);
  
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setEditingGroup(prev => prev ? ({
      ...prev,
      todos: [...(prev.todos || []), { id: `t-${Date.now()}`, text: newTaskText, done: false }]
    }) : null);
    setNewTaskText('');
  };

  // 打开添加消费记录的模态框
  const openAddConsumptionModal = useCallback((groupId: string) => {
    setCurrentGroupId(groupId);
    setConsumptionPlatform('jimeng');
    setConsumptionPackage('jimeng-299');
    setConsumptionNote('');
    setShowConsumptionModal(true);
  }, []);

  // 删除费用支出记录
  const handleDeleteConsumptionRecord = useCallback(async (groupId: string, recordId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id === groupId) {
        const newRecords = (t.consumptionRecords || []).filter(r => r.id !== recordId);
        // 重新计算总消耗
        const totalConsumption = newRecords.reduce((sum, record) => sum + record.amount, 0);
        return {
          ...t,
          consumptionRecords: newRecords,
          actualCost: totalConsumption
        };
      }
      return t;
    }));

    // 保存到 API
    if (!useLocalStorage) {
      const updatedTeam = teams.find(t => t.id === groupId);
      if (updatedTeam) {
        const newRecords = (updatedTeam.consumptionRecords || []).filter(r => r.id !== recordId);
        const totalConsumption = newRecords.reduce((sum, record) => sum + record.amount, 0);
        try {
          await teamsAPI.update({
            ...updatedTeam,
            consumptionRecords: newRecords,
            actualCost: totalConsumption
          });
          console.log('✅ 记录已删除');
        } catch (err) {
          console.error('删除失败:', err);
        }
      }
    }
  }, [teams, useLocalStorage]);

  // 上传作品图片（压缩为2:3比例的缩略图）
  const handleUploadWork = useCallback(async (
    groupId: string,
    file: File,
    isFinished: boolean
  ) => {
    try {
      // 压缩图片为2:3比例（最大600x900px，质量0.75）
      const compressedBlob = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 900,
        aspectRatio: '2:3',
        quality: 0.75
      });
      // 上传到 Vercel Blob
      const blobObj = await upload(
        uniqueUploadName(file.name, isFinished ? 'finished-work' : 'unfinished-work'),
        compressedBlob,
        {
          access: 'public',
          handleUploadUrl: '/api/upload',
        }
      );

      let updatedTeam: Team | null = null;
      setTeams(prev => {
        const updated = prev.map(t => {
          if (t.id === groupId) {
            const worksKey = isFinished ? 'finishedWorks' : 'unfinishedWorks';
            const currentWorks = (t[worksKey] as string[] || []);
            const newTeam: Team = {
              ...t,
              [worksKey]: [...currentWorks, blobObj.url]
            };
            updatedTeam = newTeam;
            return newTeam;
          }
          return t;
        });
        // 同时更新 localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams: updated, announcement }));
        return updated;
      });

      // 保存到 API
      if (!useLocalStorage && updatedTeam) {
        try {
          // 调试日志：打印要保存的数据
          const worksKey = isFinished ? 'finishedWorks' : 'unfinishedWorks';
          const teamData = updatedTeam as Team;
          const works = isFinished 
            ? (teamData.finishedWorks || [])
            : (teamData.unfinishedWorks || []);
          console.log(`📤 准备保存作品到数据库:`, {
            teamId: teamData.id,
            worksKey,
            worksCount: works.length,
            works: works
          });
          
          // 确保字段名正确传递给 API
          const teamToSave = {
            ...teamData,
            unfinishedWorks: teamData.unfinishedWorks || [],
            finishedWorks: teamData.finishedWorks || []
          };
          
          const saveResult = await teamsAPI.update(teamToSave);
          console.log('✅ 作品已上传并保存到数据库', {
            unfinishedCount: teamToSave.unfinishedWorks?.length || 0,
            finishedCount: teamToSave.finishedWorks?.length || 0,
            saveResult
          });
          
          // 验证：等待一小段时间后从数据库重新加载，确认数据已保存
          // 注意：由于数据库事务和网络延迟，立即验证可能读取到旧数据
          try {
            // 等待 500ms 确保数据库事务已提交
            await new Promise(resolve => setTimeout(resolve, 500));
            const verifyData = await teamsAPI.getAll();
            const verifyTeam = verifyData.find((t: Team) => t.id === teamToSave.id);
            if (verifyTeam) {
              const verifyWorks = isFinished 
                ? (verifyTeam.finishedWorks || [])
                : (verifyTeam.unfinishedWorks || []);
              console.log(`🔍 验证保存结果 - 团队 ${teamToSave.id}:`, {
                expectedCount: works.length,
                actualCount: verifyWorks.length,
                match: works.length === verifyWorks.length,
                expectedWorks: works,
                actualWorks: verifyWorks
              });
              
              if (works.length !== verifyWorks.length) {
                console.warn('⚠️ 验证不匹配（可能是延迟问题），但保存操作已成功完成');
                customAlert('✅ 作品上传成功！（如果刷新后看不到，请查看服务器日志）');
              } else {
                customAlert('✅ 作品上传成功！');
              }
            } else {
              console.warn('⚠️ 验证时未找到团队数据（可能是延迟问题）');
              customAlert('✅ 作品上传成功！（请刷新页面查看）');
            }
          } catch (verifyErr) {
            console.error('验证保存结果时出错（不影响保存）:', verifyErr);
            customAlert('✅ 作品上传成功！（请刷新页面确认）');
          }
        } catch (err: any) {
          console.error('❌ 上传失败:', err);
          const errorMsg = err?.message || '未知错误';
          // 如果错误提示缺少字段，说明数据库需要迁移
          if (errorMsg.includes('unfinished_works') || errorMsg.includes('finished_works') || errorMsg.includes('column') || errorMsg.includes('不存在')) {
            customAlert('⚠️ 数据库需要更新，请联系管理员执行迁移脚本：lib/migration-add-works.sql');
          } else {
            customAlert('⚠️ 作品已在本地保存，但同步到服务器失败：' + errorMsg);
          }
        }
      } else if (useLocalStorage && updatedTeam) {
        // 本地存储模式
        customAlert('✅ 作品已保存（本地模式）');
      }
    } catch (err) {
      console.error('作品上传失败:', err);
      customAlert('⚠️ 作品上传失败，请检查网络或稍后重试。');
    }
  }, [useLocalStorage, compressImage, uniqueUploadName, customAlert, announcement]);

  // 删除作品图片
  const handleDeleteWork = useCallback(async (
    groupId: string,
    imageUrl: string,
    isFinished: boolean
  ) => {
    let updatedTeam: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id === groupId) {
        const worksKey = isFinished ? 'finishedWorks' : 'unfinishedWorks';
        const currentWorks = (t[worksKey] as string[] || []).filter(url => url !== imageUrl);
        const newTeam = {
          ...t,
          [worksKey]: currentWorks
        };
        updatedTeam = newTeam;
        return newTeam;
      }
      return t;
    }));

    // 删除 Blob 存储中的文件
    await deleteBlobByUrl(imageUrl);

    // 保存到 API
    if (!useLocalStorage && updatedTeam) {
      try {
        await teamsAPI.update(updatedTeam);
        customAlert('✅ 作品已删除');
        console.log('✅ 作品已删除');
      } catch (err: any) {
        console.error('删除失败:', err);
        const errorMsg = err?.message || '未知错误';
        if (errorMsg.includes('unfinished_works') || errorMsg.includes('finished_works') || errorMsg.includes('column') || errorMsg.includes('不存在')) {
          customAlert('⚠️ 数据库需要更新，请联系管理员执行迁移脚本：lib/migration-add-works.sql');
        } else {
          customAlert('⚠️ 作品已在本地删除，但同步到服务器失败：' + errorMsg);
        }
      }
    } else if (useLocalStorage && updatedTeam) {
      // 本地存储模式
      customAlert('✅ 作品已删除（本地模式）');
    }
  }, [useLocalStorage, deleteBlobByUrl, customAlert]);

  // 实际添加费用支出记录
  const handleSaveConsumption = useCallback(async () => {
    if (!currentGroupId) return;

    // 获取金额
    const amountMap: Record<'jimeng-299' | 'jimeng-499' | 'hailuo-1399' | 'vidu-499', number> = {
      'jimeng-299': 299,
      'jimeng-499': 499,
      'hailuo-1399': 1399,
      'vidu-499': 499
    };
    
    let amount: number;
    if (consumptionPackage === 'custom') {
      const customAmount = parseFloat(consumptionCustomAmount);
      if (isNaN(customAmount) || customAmount <= 0) {
        customAlert('⚠️ 请输入有效的金额');
        return;
      }
      amount = customAmount;
    } else {
      amount = amountMap[consumptionPackage] || 0;
    }

    // 生成日期+时间
    const now = new Date();
    const datetime = now.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const newRecord: ConsumptionRecord = {
      id: `cr-${Date.now()}`,
      platform: consumptionPlatform,
      package: consumptionPackage,
      amount: amount,
      datetime: datetime,
      note: consumptionNote.trim() || undefined
    };

    let updatedTeamForAPI: Team | null = null;
    
    setTeams(prev => prev.map(t => {
      if (t.id === currentGroupId) {
        const newRecords = [...(t.consumptionRecords || []), newRecord];
        // 自动计算实际消耗总额
        const totalConsumption = newRecords.reduce((sum, record) => sum + record.amount, 0);
        const updated = {
          ...t,
          consumptionRecords: newRecords,
          actualCost: totalConsumption
        };
        updatedTeamForAPI = updated;
        return updated;
      }
      return t;
    }));

    // 保存到 API
    if (!useLocalStorage && updatedTeamForAPI) {
      try {
        await teamsAPI.update(updatedTeamForAPI);
        console.log('✅ 费用支出记录已保存到数据库');
      } catch (err) {
        console.error('保存失败:', err);
        customAlert('⚠️ 费用支出记录保存失败，请刷新后重试');
      }
    }

    // 重置表单并关闭
    setConsumptionPlatform('jimeng');
    setConsumptionPackage('jimeng-299');
    setConsumptionCustomAmount('');
    setConsumptionNote('');
    setShowConsumptionModal(false);
  }, [currentGroupId, consumptionPlatform, consumptionPackage, consumptionCustomAmount, consumptionNote, teams, useLocalStorage, customAlert]);

  // 自动滚动功能 - 使用 requestAnimationFrame 实现更平滑的滚动
  const performAutoScroll = useCallback(() => {
    const clientY = lastClientYRef.current;
    const windowHeight = window.innerHeight;
    const scrollThreshold = 120; // 距离顶部/底部多少像素时开始滚动
    const maxScrollSpeed = 20; // 最大滚动速度（降低速度以减少卡顿）
    
    let scrollAmount = 0;
    
    if (clientY < scrollThreshold) {
      // 向上滚动：根据距离顶部的距离计算速度，越靠近顶部滚动越快
      // 使用平方函数使速度变化更平滑
      const distance = Math.max(0, clientY);
      const normalizedDistance = distance / scrollThreshold;
      const speedFactor = 1 - (normalizedDistance * normalizedDistance);
      scrollAmount = -maxScrollSpeed * Math.max(0.3, speedFactor); // 最小速度30%
    } else if (clientY > windowHeight - scrollThreshold) {
      // 向下滚动：根据距离底部的距离计算速度，越靠近底部滚动越快
      const distance = Math.max(0, windowHeight - clientY);
      const normalizedDistance = distance / scrollThreshold;
      const speedFactor = 1 - (normalizedDistance * normalizedDistance);
      scrollAmount = maxScrollSpeed * Math.max(0.3, speedFactor); // 最小速度30%
    }
    
    if (Math.abs(scrollAmount) > 0.1) {
      // 直接修改 scrollTop 以获得更流畅的滚动体验
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: currentScroll + scrollAmount,
        behavior: 'auto'
      });
      scrollAnimationRef.current = requestAnimationFrame(performAutoScroll);
    } else {
      scrollAnimationRef.current = null;
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  // 检查是否需要自动滚动
  const checkAutoScroll = useCallback((clientY: number) => {
    lastClientYRef.current = clientY;
    const windowHeight = window.innerHeight;
    const scrollThreshold = 150;
    
    if (clientY < scrollThreshold || clientY > windowHeight - scrollThreshold) {
      // 如果还没有启动滚动动画，则启动
      if (scrollAnimationRef.current === null) {
        scrollAnimationRef.current = requestAnimationFrame(performAutoScroll);
      }
    } else {
      // 停止滚动
      stopAutoScroll();
    }
  }, [performAutoScroll, stopAutoScroll]);

  // 拖拽排序功能
  const handleDragStart = useCallback((e: React.DragEvent, teamId: string) => {
    setDraggedTeamId(teamId);
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽预览为空，使用自定义预览
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
    
    // 检查是否需要自动滚动
    checkAutoScroll(e.clientY);
  }, [checkAutoScroll]);

  const handleDragLeave = useCallback(() => {
    // 不立即清除 dragOverIndex，允许平滑过渡
    stopAutoScroll();
  }, [stopAutoScroll]);

  const handleDragEnd = useCallback(() => {
    stopAutoScroll();
    setDraggedTeamId(null);
    setDragOverIndex(null);
  }, [stopAutoScroll]);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    stopAutoScroll();
    
    if (!draggedTeamId) return;

    // 使用当前 teams 状态来查找索引
    const draggedIndex = teams.findIndex(t => t.id === draggedTeamId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedTeamId(null);
      setDragOverIndex(null);
      return;
    }

    // 重新排序
    const newTeams = [...teams];
    const [draggedTeam] = newTeams.splice(draggedIndex, 1);
    newTeams.splice(dropIndex, 0, draggedTeam);

    setTeams(newTeams);
    
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams: newTeams, announcement }));
    
    // 保存到 API（更新所有团队的顺序）
    if (!useLocalStorage) {
      Promise.all(newTeams.map(team => teamsAPI.update(team))).catch(err => {
        console.error('保存排序失败:', err);
      });
    }

    setDraggedTeamId(null);
    setDragOverIndex(null);
  }, [draggedTeamId, teams, announcement, useLocalStorage, stopAutoScroll]);

  // 清理自动滚动动画
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setEditingGroup(prev => prev ? ({
      ...prev,
      todos: prev.todos.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    }) : null);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setEditingGroup(prev => prev ? ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== taskId)
    }) : null);
  }, []);

  // 任务：卡片 hover 浮窗直接操作（打勾/新增/删除），并同步到云端
  const handleToggleTodoDirect = useCallback(async (groupId: string, todoId: string) => {
    let updatedTeamToPersist: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id !== groupId) return t;
      const updatedTeam = {
        ...t,
        todos: (t.todos || []).map(td => td.id === todoId ? { ...td, done: !td.done } : td)
      };
      if (!updatedTeamToPersist) updatedTeamToPersist = updatedTeam;
      return updatedTeam;
    }));

    if (!useLocalStorage && updatedTeamToPersist) {
      teamsAPI.update(updatedTeamToPersist).catch(err => console.error('任务更新失败:', err));
    }
  }, [useLocalStorage]);

  const handleAddTodoDirect = useCallback(async (groupId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = { id: `t-${Date.now()}`, text: trimmed, done: false };

    let updatedTeamToPersist: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id !== groupId) return t;
      const updatedTeam = { ...t, todos: [...(t.todos || []), newTodo] };
      if (!updatedTeamToPersist) updatedTeamToPersist = updatedTeam;
      return updatedTeam;
    }));

    if (!useLocalStorage && updatedTeamToPersist) {
      teamsAPI.update(updatedTeamToPersist).catch(err => console.error('任务新增失败:', err));
    }
  }, [useLocalStorage]);

  const handleDeleteTodoDirect = useCallback(async (groupId: string, todoId: string) => {
    if (!await customConfirm('删除该任务？\n\n此操作不可撤销。')) return;

    let updatedTeamToPersist: Team | null = null;
    setTeams(prev => prev.map(t => {
      if (t.id !== groupId) return t;
      const updatedTeam = { ...t, todos: (t.todos || []).filter(td => td.id !== todoId) };
      if (!updatedTeamToPersist) updatedTeamToPersist = updatedTeam;
      return updatedTeam;
    }));

    if (!useLocalStorage && updatedTeamToPersist) {
      teamsAPI.update(updatedTeamToPersist).catch(err => console.error('任务删除失败:', err));
    }
  }, [useLocalStorage, customConfirm]);

  // 使用 useMemo 缓存计算密集型的值，避免每次渲染都重新计算
  const totalMembers = useMemo(() => 
    teams.reduce((acc, t) => acc + t.members.length, 0), 
    [teams]
  );
  
  const totalProgress = useMemo(() => 
    teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + (t.progress || 0), 0) / teams.length) : 0,
    [teams]
  );
  
  const totalBudget = useMemo(() => 
    teams.reduce((acc, t) => acc + Number(t.budget || 0), 0),
    [teams]
  );
  
  const totalCost = useMemo(() => 
    teams.reduce((acc, t) => acc + Number(t.actualCost || 0), 0),
    [teams]
  );
  
  const filteredTeams = useMemo(() => 
    teams.filter(t => 
      t.title.includes(searchTerm) || t.members.some(m => m.name.includes(searchTerm))
    ),
    [teams, searchTerm]
  );
  
  // 加载中界面
  if (loading) {
    return (
      <div className={`min-h-screen ${themes[theme].bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-400 text-lg font-bold">正在从云端数据库加载数据...</div>
          <div className="text-slate-600 text-sm mt-2">首次加载可能需要几秒钟</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themes[theme].bg} ${themes[theme].text} font-sans selection:bg-orange-500/20 selection:text-orange-300 pb-32 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${themes[theme].gradient} transition-all duration-500`}></div>
        <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] ${theme === 'white' ? 'bg-sky-200/35' : 'bg-blue-950/20'} rounded-[100%] blur-[120px] animate-pulse opacity-30 transition-all duration-500`}></div>
        <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] ${theme === 'white' ? 'opacity-20' : 'opacity-10'} transition-opacity duration-500`}></div>
      </div>
      
      <div className={`${themes[theme].bg}/90 backdrop-blur-xl border-b ${themes[theme].border}/80 shadow-lg transition-colors duration-500`}>
        {announcement && (
          <div className="w-full bg-orange-900/20 border-b border-orange-500/10 text-xs text-orange-300 py-1 px-4 flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap">
            <Megaphone size={12} className="animate-bounce text-orange-500" />
            <div className="font-medium">{announcement}</div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg">
              <img src="/logo.png" alt="剧变时代" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-widest uppercase">剧变时代</div>
            <a
              href="https://e60nf37yjb.feishu.cn/wiki/V5h7w4RhjiwyqtkyE7bc1MsznKc"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all text-[10px] font-bold text-slate-200"
              title="打开飞书使用指南"
            >
              <ListTodo size={12} className="text-sky-500" />
              使用指南
            </a>
          </div>
          <div className="flex items-center gap-4">
            {/* 主题切换按钮 */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {(['dark', 'blue', 'white', 'green'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-6 h-6 rounded transition-all ${
                    theme === t ? 'ring-2 ring-sky-500 scale-110' : 'opacity-50 hover:opacity-100'
                  }`}
                  title={t === 'dark' ? '黑色' : t === 'blue' ? '深蓝色' : t === 'white' ? '淡蓝色' : '绿色'}
                  style={{
                    backgroundColor: 
                      t === 'dark' ? '#0f172a' : 
                      t === 'blue' ? '#1e3a8a' : 
                      t === 'white' ? '#e0f2fe' : 
                      '#064e3b',
                    border: t === 'white' ? '1px solid #d1d5db' : 'none'
                  }}
                />
              ))}
            </div>

            {/* 数据库状态指示器 */}
            {!loading && (
              <div className={`hidden lg:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded border ${
                useLocalStorage 
                  ? 'bg-yellow-900/20 border-yellow-500/20 text-yellow-400' 
                  : 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${useLocalStorage ? 'bg-yellow-500' : 'bg-emerald-500'} animate-pulse`}></span>
                <span className="text-xs font-bold uppercase">
                  {useLocalStorage ? '本地模式' : '云端数据库'}
                </span>
              </div>
            )}
            
            <div className="hidden lg:flex items-center gap-2 text-sm font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500">资金消耗:</span>
              <span className={totalCost > totalBudget ? 'text-red-500' : 'text-emerald-400'}>¥{totalCost}</span>
              <span className="text-slate-600">/</span>
              <span>¥{totalBudget}</span>
            </div>

            {isAdminUnlocked && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/90 text-white border border-emerald-500/50">
                <Unlock size={14} />
                <span>管理员模式</span>
              </div>
            )}
            {isAdminUnlocked && (
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

      {isAdminUnlocked && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 border-b-4 border-orange-400 py-5 shadow-xl relative z-50">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
            <label className="text-lg text-white font-bold whitespace-nowrap flex items-center gap-2 drop-shadow-lg">
              <Megaphone size={20} className="animate-pulse" />
               发布通告:
            </label>
            <input
              type="text"
              className="flex-1 bg-white border-4 border-yellow-300 rounded-lg px-5 py-4 text-lg text-slate-900 font-semibold placeholder:text-slate-500 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-300/50 outline-none transition-all shadow-2xl"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="✏️ 点击这里输入公告内容..."
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-400 to-slate-500">剧变时代</span>
              <span className="text-orange-500">中控台</span>
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

        {/* 快捷入口 */}
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <a
            href="/juchacha.html"
            className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-emerald-900/20"
          >
            <Search size={12} /> 剧查查榜单
          </a>
          <a
            href="/works.html"
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 px-3 py-2 rounded-lg font-bold text-xs transition-all"
          >
            <Square size={12} /> 作品展示
          </a>
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
          {filteredTeams.map((team, index) => {
            const isDragged = draggedTeamId === team.id;
            const isDragOver = dragOverIndex === index;
            const draggedIndex = draggedTeamId ? teams.findIndex(t => t.id === draggedTeamId) : -1;
            
            // 计算当前项的视觉位置偏移（用于平滑动画）
            let transformY = 0;
            if (isDragged) {
              // 被拖拽的项保持原位但半透明
            } else if (draggedIndex !== -1 && dragOverIndex !== null) {
              // 如果当前项在被拖拽项和目标位置之间，需要向上或向下移动
              if (index > draggedIndex && index <= dragOverIndex) {
                // 向下移动（被拖拽项从上方插入）
                transformY = -1; // 负值表示向上移动，创建"被挤走"的效果
              } else if (index < draggedIndex && index >= dragOverIndex) {
                // 向上移动（被拖拽项从下方插入）
                transformY = 1; // 正值表示向下移动
              }
            }
            
            return (
              <div
                key={team.id}
                draggable={isAdminUnlocked}
                onDragStart={(e) => handleDragStart(e, team.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative transition-all duration-150 ease-out ${
                  isDragged 
                    ? 'opacity-30 scale-[0.98] z-50' 
                    : 'opacity-100 scale-100 z-auto'
                } ${
                  isDragOver 
                    ? 'border-t-2 border-sky-500 -mt-2' 
                    : 'border-t-2 border-transparent'
                }`}
                style={{
                  transform: transformY !== 0 ? `translateY(${transformY * 8}px)` : undefined,
                  willChange: isDragged || transformY !== 0 ? 'transform, opacity' : 'auto',
                }}
              >
              {isAdminUnlocked && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-400 cursor-move z-10">
                  <GripVertical size={16} />
                </div>
              )}
              <DepartmentSection
                team={team}
                index={index}
                isEditing={isAdminUnlocked}
                isUnlocked={unlockedGroups.has(team.id) || isAdminUnlocked}
                theme={theme}
                onEditMember={openEditMemberModal}
                onAddMember={openAddMemberModal}
                onDeleteMember={handleDeleteMemberDirect}
                onToggleTodo={handleToggleTodoDirect}
                onAddTodo={handleAddTodoDirect}
                onDeleteTodo={handleDeleteTodoDirect}
                onEditGroup={(group) => {
                  setEditingGroup(group);
                  setShowGroupModal(true);
                }}
                onDeleteGroup={handleDeleteGroup}
                memberTasks={memberTasksByTeam[team.id] || {}}
                onAddMemberTask={addMemberTask}
                onToggleMemberTask={toggleMemberTask}
                onDeleteMemberTask={deleteMemberTask}
                onEditReferences={openEditReferencesModal}
                onAddConsumption={openAddConsumptionModal}
                onDeleteConsumption={handleDeleteConsumptionRecord}
                onUploadWork={handleUploadWork}
                onDeleteWork={handleDeleteWork}
                onAddDirectorProject={addDirectorProject}
                onDeleteDirectorProject={deleteDirectorProject}
                onToggleLock={toggleGroupLock}
                onProgressChange={handleProgressChange}
              />
              </div>
            );
          })}
        </div>

        {/* 页面底部：新增组入口（仅管理员解锁可见） */}
        {isAdminUnlocked && (
          <div className="flex justify-center pt-6 pb-10">
            <button
              type="button"
              onClick={openAddTeamModal}
              className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl hover:border-slate-600 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition-all"
              title="新增组"
            >
              <Plus size={22} />
            </button>
          </div>
        )}
      </div>

      {/* AI 工具：页面最右侧向左展开的悬浮面板（桌面 hover 展开；移动端完全不显示） */}
      {!isCoarsePointer && (
        <div
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
          onMouseEnter={() => setAiToolsExpanded(true)}
          onMouseLeave={() => setAiToolsExpanded(false)}
        >
          <div
            className={[
              'relative',
              'transition-transform duration-200 ease-out',
              // 收起态：面板整体移出屏幕，只保留左侧“发亮把手”可见
              aiToolsExpanded ? 'translate-x-0' : 'translate-x-[260px]',
            ].join(' ')}
          >
            {/* 展开后的面板 */}
            <div className="w-[260px] bg-slate-900/90 border border-slate-700 rounded-l-2xl shadow-2xl backdrop-blur-md p-3">
              <div className="flex items-center gap-2 px-1 pb-2 mb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 grid place-items-center text-slate-200">
                  <Wrench size={16} />
                </div>
                <div className="text-xs font-black tracking-wide text-slate-300">AI TOOLS</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {AI_TOOLS.map((tool, idx) => (
                  <a
                    key={idx}
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                    title={tool.name}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-900/60 border border-slate-700 grid place-items-center text-slate-100 font-black leading-none">
                      {tool.icon}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{tool.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* 收起态提示把手：微微发亮/呼吸感 */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full">
              <div
                className={[
                  'w-8 h-24 rounded-l-2xl',
                  'bg-slate-900/70 border border-slate-700 shadow-2xl backdrop-blur-md',
                  'grid place-items-center',
                  aiToolsExpanded ? 'opacity-0' : 'opacity-100',
                  'transition-opacity duration-200',
                ].join(' ')}
              >
                <div className="relative w-1 h-14 rounded-full bg-slate-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-400/0 via-sky-400/60 to-sky-400/0 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">周期</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditingGroup({ ...editingGroup, cycle: '每日交付' })}
                  className={`py-3 rounded-lg border text-xs font-bold transition-colors ${
                    editingGroup.cycle === '每日交付'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  每日交付
                </button>
                <button
                  onClick={() => setEditingGroup({ ...editingGroup, cycle: '每周交付' })}
                  className={`py-3 rounded-lg border text-xs font-bold transition-colors ${
                    editingGroup.cycle === '每周交付'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  每周交付
                </button>
              </div>
            </div>
            <div className="mb-4">
              <InputField
                label="交付量"
                value={editingGroup.workload || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, workload: e.target.value })}
                placeholder="例如: 5集"
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
            {/* 已按需求移除：核心任务、日工作量、主参考图、辅助参考图库、消耗即梦账号数、资源链接
                说明：
                - 参考图请在卡片“参考图设置”里调整
                - 费用支出请在卡片"费用支出"里调整
            */}
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

      {/* 新增组：仅需组名 + 组长名 */}
      <Modal isOpen={showAddTeamModal} onClose={() => setShowAddTeamModal(false)} title="新增组">
        <InputField
          label="组名"
          value={newTeamTitle}
          onChange={(e) => setNewTeamTitle(e.target.value)}
        />
        <InputField
          label="组长名"
          value={newTeamDirectorName}
          onChange={(e) => setNewTeamDirectorName(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={() => setShowAddTeamModal(false)}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleCreateTeam}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm shadow-lg transition-colors"
          >
            创建
          </button>
        </div>
      </Modal>

      {/* 添加费用支出记录模态框 */}
      <Modal
        isOpen={showConsumptionModal}
        onClose={() => setShowConsumptionModal(false)}
        title="添加费用支出记录"
      >
        <div className="space-y-5">
          {/* 平台选择 */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3">选择平台</label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setConsumptionPlatform('jimeng');
                  setConsumptionPackage('jimeng-299');
                  setConsumptionCustomAmount('');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  consumptionPlatform === 'jimeng'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-base font-bold">即梦</div>
              </button>
              <button
                onClick={() => {
                  setConsumptionPlatform('hailuo');
                  setConsumptionPackage('hailuo-1399');
                  setConsumptionCustomAmount('');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  consumptionPlatform === 'hailuo'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-base font-bold">海螺</div>
              </button>
              <button
                onClick={() => {
                  setConsumptionPlatform('vidu');
                  setConsumptionPackage('vidu-499');
                  setConsumptionCustomAmount('');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  consumptionPlatform === 'vidu'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-base font-bold">Vidu</div>
              </button>
              <button
                onClick={() => {
                  setConsumptionPlatform('other');
                  setConsumptionPackage('custom');
                  setConsumptionCustomAmount('');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  consumptionPlatform === 'other'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-base font-bold">其它</div>
              </button>
            </div>
          </div>

          {/* 费用金额 */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3">费用金额</label>
            {consumptionPlatform === 'jimeng' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setConsumptionPackage('jimeng-299');
                    setConsumptionCustomAmount('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    consumptionPackage === 'jimeng-299'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl font-bold">¥299</div>
                  <div className="text-xs mt-1">首次充值</div>
                </button>
                <button
                  onClick={() => {
                    setConsumptionPackage('jimeng-499');
                    setConsumptionCustomAmount('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    consumptionPackage === 'jimeng-499'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl font-bold">¥499</div>
                  <div className="text-xs mt-1">二次充值</div>
                </button>
              </div>
            )}
            {consumptionPlatform === 'hailuo' && (
              <button
                onClick={() => {
                  setConsumptionPackage('hailuo-1399');
                  setConsumptionCustomAmount('');
                }}
                className="w-full p-4 rounded-lg border-2 border-purple-500 bg-purple-500/10 text-purple-400"
              >
                <div className="text-2xl font-bold">¥1399</div>
                <div className="text-xs mt-1">海螺套餐</div>
              </button>
            )}
            {consumptionPlatform === 'vidu' && (
              <button
                onClick={() => {
                  setConsumptionPackage('vidu-499');
                  setConsumptionCustomAmount('');
                }}
                className="w-full p-4 rounded-lg border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400"
              >
                <div className="text-2xl font-bold">¥499</div>
                <div className="text-xs mt-1">Vidu套餐</div>
              </button>
            )}
            {(consumptionPlatform === 'other' || consumptionPackage === 'custom') && (
              <div>
                <input
                  type="number"
                  value={consumptionCustomAmount}
                  onChange={(e) => {
                    setConsumptionCustomAmount(e.target.value);
                    setConsumptionPackage('custom');
                  }}
                  placeholder="请输入金额"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg text-slate-200 placeholder-slate-600 outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">备注 (可选)</label>
            <textarea
              value={consumptionNote}
              onChange={(e) => setConsumptionNote(e.target.value)}
              placeholder="例如：姓名、目的等..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-500 resize-none"
              rows={3}
            />
          </div>

          {/* 按钮 */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowConsumptionModal(false);
                setConsumptionNote('');
              }}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveConsumption}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm shadow-lg transition-colors"
            >
              确认添加
            </button>
          </div>
        </div>
      </Modal>

      {/* 参考图独立编辑（无需输入组密码） */}
      <Modal
        isOpen={showReferencesModal}
        onClose={() => setShowReferencesModal(false)}
        title="参考图设置"
      >
        {editingReferencesGroup && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">主参考图</label>
              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="w-16 h-16 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                  {editingReferencesGroup.coverImage ? (
                    <img src={editingReferencesGroup.coverImage} className="w-full h-full object-cover" alt="Cover" />
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
                    onChange={(e) => handleGroupImgChange(e, setEditingReferencesGroup)}
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
                  {editingReferencesGroup.images?.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded overflow-hidden relative group border border-slate-700 bg-slate-900">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                      <button
                        onClick={() => handleRemoveGalleryImage(idx, setEditingReferencesGroup)}
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
                  onChange={(e) => handleGalleryImgChange(e, setEditingReferencesGroup)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700/50">
              <button
                onClick={handleSaveReferences}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm shadow-lg"
              >
                保存参考图
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* 自定义Alert对话框 - 居中显示 */}
      {showAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`${themes[theme].card} ${themes[theme].border} border-2 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className={`${themes[theme].text} text-center mb-6 whitespace-pre-wrap`}>
              {alertMessage}
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* 自定义Prompt对话框 - 居中显示 */}
      {showPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`${themes[theme].card} ${themes[theme].border} border-2 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className={`${themes[theme].text} text-center mb-4 whitespace-pre-wrap`}>
              {promptMessage}
            </div>
            <input
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptCallback?.(promptValue);
                  setShowPrompt(false);
                }
              }}
              className={`w-full ${themes[theme].card} ${themes[theme].border} border rounded-lg px-4 py-3 mb-4 ${themes[theme].text} outline-none focus:ring-2 focus:ring-sky-500`}
              autoFocus
              placeholder="请输入..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  promptCallback?.(null);
                  setShowPrompt(false);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  promptCallback?.(promptValue);
                  setShowPrompt(false);
                }}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-lg font-bold transition-colors shadow-lg"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 自定义Confirm对话框 - 与 Prompt 同风格 */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`${themes[theme].card} ${themes[theme].border} border-2 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className={`${themes[theme].text} text-center mb-6 whitespace-pre-wrap`}>
              {confirmMessage}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  confirmCallback?.(false);
                  setShowConfirm(false);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  confirmCallback?.(true);
                  setShowConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-bold transition-colors shadow-lg"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;