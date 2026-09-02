import { useState, useEffect, useRef } from 'react';
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
  remainingSeconds, 
  mode, 
  format,
  isEditable = false,
  onDurationChange
}: TimerDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('00');
  
  const minInputRef = useRef<HTMLInputElement>(null);
  const secInputRef = useRef<HTMLInputElement>(null);

  const isWarning = mode === 'countdown' && remainingSeconds <= 15 * 60 && remainingSeconds > 5 * 60;
  const isCritical = mode === 'countdown' && remainingSeconds <= 5 * 60;

  useEffect(() => {
    if (!isEditing) {
      const mins = Math.floor(displayedSeconds / 60);
      const secs = displayedSeconds % 60;
      setInputMinutes(mins.toString());
      setInputSeconds(String(secs).padStart(2, '0'));
    }
  }, [displayedSeconds, isEditing]);

  const handleCommit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(inputMinutes, 10) || 0;
    const secs = parseInt(inputSeconds, 10) || 0;
    const total = mins * 60 + secs;

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

  const colorClass = isCritical 
    ? "text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]" 
    : isWarning 
      ? "text-amber-500 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
      : "text-slate-900 dark:text-white";

  return (
    <div className="flex flex-col items-center justify-center w-full py-2">
      {isEditable && isEditing ? (
        <form onSubmit={handleCommit} className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
          {/* Dakika ve Saniye Giriş Alanı */}
          <div className="flex items-center justify-center font-mono tabular-nums font-bold tracking-tighter leading-none text-slate-900 dark:text-white">
            <div className="flex flex-col items-center">
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
                className="text-[5rem] md:text-[8rem] text-center bg-transparent border-b-4 border-blue-600 dark:border-blue-500 focus:outline-none w-40 md:w-64 leading-none"
              />
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-1">
                Dakika
              </span>
            </div>

            <span className="text-[4rem] md:text-[7rem] pb-5 opacity-40 select-none mx-1">:</span>

            <div className="flex flex-col items-center">
              <input
                ref={secInputRef}
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(e.target.value)}
                onBlur={() => handleCommit()}
                onKeyDown={handleKeyDown}
                className="text-[5rem] md:text-[8rem] text-center bg-transparent border-b-4 border-blue-600 dark:border-blue-500 focus:outline-none w-32 md:w-48 leading-none"
              />
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-1">
                Saniye
              </span>
            </div>
          </div>

          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2.5">
            Kaydetmek için Enter'a basın veya dışarı dokunun
          </span>
        </form>
      ) : isEditable ? (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          title="Süreyi doğrudan değiştirmek için dokunun"
          className="group flex flex-col items-center cursor-pointer transition-transform active:scale-[0.98] outline-none"
        >
          <div 
            className={cn(
              "text-[5.5rem] md:text-[8.5rem] font-mono tabular-nums font-bold tracking-tighter leading-none transition-all duration-300 group-hover:scale-[1.02]",
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
            "text-[5.5rem] md:text-[8.5rem] font-mono tabular-nums font-bold tracking-tighter leading-none transition-all duration-300",
            colorClass
          )}
        >
          {formatSeconds(displayedSeconds, format)}
        </div>
      )}

      {/* Subtle warnings underneath */}
      {!isEditing && (isWarning || isCritical) && (
        <div className="mt-1 animate-pulse">
           {isCritical ? (
             <span className="text-xs font-semibold text-red-500/80 bg-red-500/10 px-2.5 py-0.5 rounded-full tracking-wider">SON 5 DAKİKA</span>
           ) : (
             <span className="text-xs font-semibold text-amber-500/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full tracking-wider">SON 15 DAKİKA</span>
           )}
        </div>
      )}
    </div>
  );
}
