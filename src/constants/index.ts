import {
  Ghost, Bot, Film, Mic, Frame, Users, CheckCircle, Eye, AlertTriangle,
  CheckSquare, Globe, TrendingUp, Wrench, Radio, LucideIcon
} from 'lucide-react';
import { Team, News, StatusConfig, NewsTagConfig, AITool, IconKey } from '../types';

export const STORAGE_KEY = 'personnel_structure_v16_final_fix';

export const INITIAL_ANNOUNCEMENT = "🎉 通告：V16 全功能版已上线！包含任务清单与费用管理模块。HMR 热更新测试成功！";

export const INITIAL_NEWS: News[] = [
  { id: 'n1', date: '11-25', type: 'internal', priority: 'high', title: '新功能：点击右上角"保存设置"，可将当前进度打包发给同事', url: '#' },
  { id: 'n2', date: '11-22', type: 'ranking', priority: 'normal', title: '剧查查榜单：AI玄幻动态漫《逆天邪神》登顶腾讯视频动漫榜', url: 'https://weixin.sogou.com/weixin?type=2&query=剧查查+动态漫' },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'ghost', title: '诡异组', iconKey: 'ghost',
    task: '恐怖氛围渲染与特效合成', cycle: 'W2 (进行中)', workload: '产出 50+ 场景图',
    budget: 5000, actualCost: 3200,
    progress: 35, status: 'normal', notes: '氛围参考：中式民俗恐怖。\nLighting: Candle light.', coverImage: '', images: [],
    links: [{ name: '素材库', url: '#' }],
    password: '1111',
    consumptionRecords: [],
    todos: [
      { id: 't1', text: '完成第3集墓地场景渲染', done: true },
      { id: 't2', text: '修复光影Bug', done: false }
    ],
    members: [
      { id: 'm1', name: '刘家发', isDirector: true, avatar: '', role: '总负责人' },
      { id: 'm2', name: '刘畅', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm3', name: '曹颖', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm4', name: '孟凡博', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm5', name: '李兆宇', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm6', name: '闻梓健', isDirector: false, avatar: '', role: '执行专员' }
    ]
  },
  {
    id: 'ai', title: 'AI真人（复刻）', iconKey: 'ai',
    task: '数字人训练/口型匹配', cycle: '每日交付', workload: '训练 2 个新模型',
    budget: 8000, actualCost: 8500,
    progress: 78, status: 'urgent', notes: '紧急：V3模型口型抖动需修复。', coverImage: '', images: [],
    links: [{ name: '角色LoRA', url: '#' }],
    password: '2222',
    consumptionRecords: [],
    todos: [{ id: 't1', text: '采集女主50句新干音', done: false }],
    members: [
      { id: 'm7', name: '汪凯伦', isDirector: true, avatar: '', role: '总负责人' },
      { id: 'm8', name: '何静雨', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm9', name: '彭家顺', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm10', name: '闫永亮', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm11', name: '孙诣涵', isDirector: false, avatar: '', role: '执行专员' }
    ]
  },
  {
    id: 'storyboard', title: '分镜组', iconKey: 'storyboard',
    task: '脚本拆解/MJ出图', cycle: 'T+1', workload: '完成 1 话分镜',
    budget: 2000, actualCost: 500,
    progress: 15, status: 'normal', notes: '主角一致性Seed: 284910', coverImage: '', images: [],
    links: [{ name: '在线脚本', url: '#' }],
    password: '3333',
    consumptionRecords: [],
    todos: [],
    members: [
      { id: 'm12', name: '彭枫', isDirector: true, avatar: '', role: '总负责人' },
      { id: 'm13', name: '刘嘉麟', isDirector: false, avatar: '', role: '执行专员' }
    ]
  },
  {
    id: 'post', title: '后期剪辑', iconKey: 'post',
    task: '剪辑/配乐/字幕', cycle: '周五交付', workload: '粗剪 3 分钟',
    budget: 3000, actualCost: 2800,
    progress: 90, status: 'review', notes: '第2集初版已出，等待审核。', coverImage: '', images: [],
    links: [{ name: '工程文件', url: '#' }],
    password: '4444',
    consumptionRecords: [],
    todos: [{ id: 't1', text: '第2集调色修正', done: false }],
    members: [
      { id: 'm14', name: '权卓文', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm15', name: '朱梓涵', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm16', name: '毛子威', isDirector: false, avatar: '', role: '执行专员' },
      { id: 'm17', name: '金睿哲', isDirector: false, avatar: '', role: '执行专员' }
    ]
  },
  {
    id: 'voice', title: '配音组', iconKey: 'voice',
    task: '配音/音效设计', cycle: '随片', workload: '录制 20 句干音',
    budget: 1500, actualCost: 0,
    progress: 50, status: 'normal', notes: '需补充"开门声"素材。', coverImage: '', images: [], links: [],
    password: '5555',
    consumptionRecords: [],
    todos: [],
    members: [
      { id: 'm18', name: '张雨辰', isDirector: false, avatar: '', role: '执行专员' }
    ]
  }
];

export const ICON_MAP: Record<IconKey, LucideIcon> = {
  ghost: Ghost,
  ai: Bot,
  storyboard: Frame,
  post: Film,
  voice: Mic,
  default: Users
};

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  normal: { label: '正常推进', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  review: { label: '待审核', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
  urgent: { label: '紧急/滞后', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle },
  done: { label: '已交付', color: 'text-slate-400', bg: 'bg-slate-700/30', border: 'border-slate-600/30', icon: CheckSquare },
};

export const NEWS_TAGS: Record<string, NewsTagConfig> = {
  all: { label: '全部情报', icon: Globe },
  ranking: { label: '榜单数据', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: TrendingUp },
  tool: { label: 'AI工具', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Wrench },
  industry: { label: '国内动态', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Radio },
  internal: { label: '内部通知', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Users },
};

export const AI_TOOLS: AITool[] = [
  // 占位图标：后续你提供正式 logo（SVG/PNG）后再替换
  { name: '即梦', url: 'https://jimeng.jianying.com/ai-tool/home/?type=image', icon: '即' },
  { name: 'Vidu', url: 'https://www.vidu.cn/home/recommend', icon: 'V' },
  { name: '海螺', url: 'https://hailuoai.com/', icon: '螺' },
  { name: '巨日禄', url: 'https://hailuoai.com/', icon: '巨' },
  { name: 'RunningHub', url: 'https://www.runninghub.cn/workspace', icon: 'R' },
  { name: '哩布哩布', url: 'https://www.liblib.art/ai-tool/image-generator', icon: '哩' },
];

export const PROJECT_PHASES = ['筹备期', '制作期', '后期合成', '宣发期'];

