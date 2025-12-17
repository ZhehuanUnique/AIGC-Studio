import React from 'react';
import { Link as LinkIcon, ExternalLink, X } from 'lucide-react';

interface ResourceLinkProps {
  name: string;
  url: string;
  isEditing: boolean;
  onDelete: () => void;
}

export const ResourceLink: React.FC<ResourceLinkProps> = ({ name, url, isEditing, onDelete }) => (
  <a
    href={isEditing ? undefined : url}
    target={isEditing ? undefined : '_blank'}
    rel={isEditing ? undefined : 'noopener noreferrer'}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 hover:border-sky-500/30 transition-all group text-xs text-slate-300 hover:text-white ${isEditing ? 'cursor-default pr-2' : 'cursor-pointer'}`}
  >
    <LinkIcon size={12} className="text-sky-500" />
    <span className="truncate max-w-[100px]">{name}</span>
    {!isEditing && <ExternalLink size={10} className="opacity-0 group-hover:opacity-50" />}
    {isEditing && (
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        className="ml-2 p-1 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-400"
      >
        <X size={10} />
      </button>
    )}
  </a>
);

