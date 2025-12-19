import { LucideIcon } from 'lucide-react';

export type TeamStatus = 'normal' | 'review' | 'urgent' | 'done';
export type NewsType = 'all' | 'ranking' | 'tool' | 'industry' | 'internal';
export type NewsPriority = 'normal' | 'high';
export type IconKey = 'ghost' | 'ai' | 'storyboard' | 'post' | 'voice' | 'default';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface Member {
  id: string;
  name: string;
  isDirector: boolean;
  avatar: string;
  role: string;
  // 总负责人可选：负责项目（支持网址或命令文本；命令会在 UI 中点击复制）
  projects?: ResourceLink[];
}

export interface ResourceLink {
  name: string;
  url: string;
}

export interface ConsumptionRecord {
  id: string;
  platform: 'jimeng' | 'hailuo' | 'vidu';  // 平台: 即梦、海螺、Vidu
  package: 'jimeng-299' | 'jimeng-499' | 'hailuo-1399' | 'vidu-499';  // 套餐类型
  amount: number;    // 金额: 299/499/1399/499
  datetime: string;  // 日期+时间
  note?: string;     // 可选备注
}

export interface Team {
  id: string;
  title: string;
  iconKey: IconKey;
  task: string;
  cycle: string;
  workload: string;
  budget: number;
  actualCost: number;
  progress: number;
  status: TeamStatus;
  notes: string;
  coverImage: string;
  images: string[];
  links: ResourceLink[];
  todos: Todo[];
  members: Member[];
  password?: string; // 团队管理员密码
  consumptionRecords?: ConsumptionRecord[]; // 即梦账号消费记录
  unfinishedWorks?: string[]; // 未完成作品图片 URL 列表
  finishedWorks?: string[]; // 已完成作品图片 URL 列表
}

export interface News {
  id: string;
  date: string;
  type: NewsType;
  priority: NewsPriority;
  title: string;
  url: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
}

export interface NewsTagConfig {
  label: string;
  color?: string;
  bg?: string;
  border?: string;
  icon?: LucideIcon;
}

export interface AITool {
  name: string;
  url: string;
  icon: string;
}

