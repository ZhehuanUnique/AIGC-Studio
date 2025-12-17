import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  onEnter?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  onEnter 
}) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-orange-500/50 outline-none min-h-[100px] font-mono"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-orange-500/50 outline-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
      />
    )}
  </div>
);

