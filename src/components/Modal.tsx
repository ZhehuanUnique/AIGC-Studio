import React from 'react';
import { Edit2, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/80 via-red-500/80 to-purple-600/80"></div>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-[#0f172a]/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Edit2 size={16} className="text-orange-400" />
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-[#1e293b] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

