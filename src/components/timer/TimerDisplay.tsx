import { useState, useRef } from 'react';
import { formatSeconds } from '../../utils';
import type { TimeDisplayFormat, TimerMode } from '../../types';
import { cn } from '../../utils';
import { Edit2 } from 'lucide-react';

interface TimerDisplayProps {
  displayedSeconds: number;
  remainingSeconds: number;
  mode: TimerMode;
  format: TimeDisplayFormat;
  isEditable?: boolean;
  onDurationChange?: (totalSeconds: number) => void;
}

export function TimerDisplay({ 
  displayedSeconds, 
  format,
  isEditable = false,
  onDurationChange
}: TimerDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('0');
  
  const minInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    const mins = Math.floor(displayedSeconds / 60);
    setInputMinutes(mins.toString());
    setIsEditing(true);
  };

  const handleCommit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(inputMinutes, 10) || 0;
    const total = mins * 60;

    if (total > 0 && onDurationChange) {
      onDurationChange(total);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    } else if (e.key === 'Enter') {
      handleCommit();
    }
  };

  const colorClass = "text-slate-900 dark:text-white";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full px-2 py-2 select-none overflow-hidden">
      {isEditable && isEditing ? (
        <form onSubmit={handleCommit} className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 w-full max-w-full">
          {/* Dakika Giriş Alanı */}
          <div className="flex items-center justify-center font-mono tabular-nums font-bold tracking-tighter leading-none text-slate-900 dark:text-white w-full">
            <div className="flex flex-col items-center max-w-full">
              <input
                ref={minInputRef}
                type="number"
                min="0"
                max="999"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                onBlur={() => handleCommit()}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-[clamp(3.5rem,15vw,5rem)] md:text-[8rem] text-center bg-transparent border-b-4 border-blue-600 dark:border-blue-500 focus:outline-none w-36 sm:w-48 md:w-64 leading-none tabular-nums"
              />
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-1">
                Dakika
              </span>
            </div>
          </div>

          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2.5 text-center px-4">
            Kaydetmek için Enter'a basın veya dışarı dokunun
          </span>
        </form>
      ) : isEditable ? (
        <button
          type="button"
          onClick={handleStartEditing}
          title="Süreyi doğrudan değiştirmek için dokunun"
          className="group flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-[0.98] outline-none w-full max-w-full"
        >
          <div 
            className={cn(
              "text-[clamp(2.75rem,13vw,5.5rem)] sm:text-[6.5rem] md:text-[8.5rem] font-mono tabular-nums font-bold tracking-tighter leading-none whitespace-nowrap transition-transform duration-200 group-hover:scale-[1.01] w-full text-center px-1",
              colorClass
            )}
          >
            {formatSeconds(displayedSeconds, format)}
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-2 flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700 shadow-xs">
            <Edit2 size={12} className="text-blue-600 dark:text-blue-400" />
            Süreyi değiştirmek için dokun
          </span>
        </button>
      ) : (
        <div 
          className={cn(
            "text-[clamp(2.75rem,13vw,5.5rem)] sm:text-[6.5rem] md:text-[8.5rem] font-mono tabular-nums font-bold tracking-tighter leading-none whitespace-nowrap w-full text-center px-1",
            colorClass
          )}
        >
          {formatSeconds(displayedSeconds, format)}
        </div>
      )}
    </div>
  );
}
