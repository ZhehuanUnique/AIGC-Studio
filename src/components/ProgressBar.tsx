import React, { useRef, useState, useCallback } from 'react';

interface ProgressBarProps {
  progress: number;
  onProgressChange?: (progress: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, onProgressChange }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  let colorClass = 'bg-sky-500';
  if (progress > 80) colorClass = 'bg-emerald-500';
  else if (progress < 30) colorClass = 'bg-orange-500';
  
  const calculateProgress = useCallback((clientX: number) => {
    if (!barRef.current || !onProgressChange) return;
    const rect = barRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    onProgressChange(Math.round(percentage));
  }, [onProgressChange]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onProgressChange) return;
    e.preventDefault();
    setIsDragging(true);
    calculateProgress(e.clientX);
  }, [onProgressChange, calculateProgress]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !onProgressChange) return;
    e.preventDefault();
    calculateProgress(e.clientX);
  }, [isDragging, onProgressChange, calculateProgress]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  return (
    <div 
      ref={barRef}
      className={`w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden relative ${
        onProgressChange ? 'cursor-pointer' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`h-full rounded-full transition-all ${isDragging ? 'duration-0' : 'duration-300'} ${colorClass}`}
        style={{ width: `${progress}%` }}
      ></div>
      {onProgressChange && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="h-full w-1 bg-white/50 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

