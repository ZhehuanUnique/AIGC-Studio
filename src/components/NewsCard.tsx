import React from 'react';
import { X, ExternalLink, Flame } from 'lucide-react';
import { News } from '../types';
import { NEWS_TAGS } from '../constants';

interface NewsCardProps {
  item: News;
  isEditing: boolean;
  onClick: (item: News) => void;
  onDelete: (id: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, isEditing, onClick, onDelete }) => {
  const tagConfig = NEWS_TAGS[item.type] || NEWS_TAGS.industry;
  const isHighPriority = item.priority === 'high';
  const TagIcon = tagConfig.icon;
  
  return (
    <div
      onClick={() => isEditing && onClick(item)}
      className={`relative flex flex-col justify-between p-4 rounded-xl transition-all group min-w-[280px] w-full sm:w-[320px] h-[120px] ${
        isHighPriority
          ? 'bg-gradient-to-br from-red-900/20 to-slate-900/80 border border-red-500/30 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          : 'bg-slate-900/50 border border-slate-800 hover:border-slate-600'
      } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {isHighPriority && (
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500 rounded-tl-lg opacity-50"></div>
      )}
      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-opacity z-10"
        >
          <X size={14} />
        </button>
      )}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${tagConfig.color} ${tagConfig.bg} ${tagConfig.border}`}>
              {TagIcon && <TagIcon size={8} />}
              {tagConfig.label}
            </span>
            {isHighPriority && (
              <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold animate-pulse">
                <Flame size={10} fill="currentColor" /> HIGH
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
        </div>
        <h4 className={`text-sm font-medium leading-snug line-clamp-2 transition-colors ${
          isHighPriority ? 'text-white' : 'text-slate-300 group-hover:text-white'
        }`}>
          {item.title}
        </h4>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          {item.url && item.url !== '#' && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-sky-500 hover:text-sky-400 bg-sky-500/10 px-2 py-1 rounded transition-colors"
            >
              查看详情 <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

