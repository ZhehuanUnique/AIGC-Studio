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
}

export interface ResourceLink {
  name: string;
  url: string;
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

