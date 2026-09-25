import { useState, useRef } from 'react';
import { formatSeconds } from '../../utils';
import type { TimeDisplayFormat, TimerMode, TimerFontSize } from '../../types';
import { cn } from '../../utils';
import { Edit2 } from 'lucide-react';

interface TimerDisplayProps {
  displayedSeconds: number;
  remainingSeconds: number;
  mode: TimerMode;
  format: TimeDisplayFormat;
  fontSize?: TimerFontSize;
  isEditable?: boolean;
  onDurationChange?: (totalSeconds: number) => void;
}

export function TimerDisplay({ 
  displayedSeconds, 
  mode,
  format,
  fontSize = 'large',
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

  // Subtle renk: yalnızca geri sayımda, zaman daraldıkça yumuşak ton geçişi
  const colorClass =
    mode === 'countdown' && displayedSeconds <= 60
      ? 'text-rose-600 dark:text-rose-400'
      : mode === 'countdown' && displayedSeconds <= 300
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-slate-900 dark:text-white';

  const timeString = formatSeconds(displayedSeconds, format);
  
  // Responsive font size calculated based on selected fontSize option and string length
  let sizeClass = "";
  if (fontSize === 'normal') {
    if (timeString.length <= 5) {
      sizeClass = "text-[clamp(3.5rem,18vw,7rem)] sm:text-[7rem] md:text-[8.5rem] lg:text-[10rem]";
    } else if (timeString.length === 6) {
      sizeClass = "text-[clamp(3.25rem,16vw,6.5rem)] sm:text-[6.5rem] md:text-[8rem] lg:text-[9.5rem]";
    } else {
      sizeClass = "text-[clamp(3rem,14.5vw,6rem)] sm:text-[6rem] md:text-[7.5rem] lg:text-[9rem]";
    }
  } else if (fontSize === 'huge') {
    if (timeString.length <= 5) {
      sizeClass = "text-[clamp(5rem,26vw,10.5rem)] sm:text-[10.5rem] md:text-[12rem] lg:text-[14rem]";
    } else if (timeString.length === 6) {
      sizeClass = "text-[clamp(4.5rem,23vw,9.5rem)] sm:text-[9.5rem] md:text-[11rem] lg:text-[13rem]";
    } else {
      sizeClass = "text-[clamp(4rem,20vw,8.5rem)] sm:text-[8.5rem] md:text-[10.5rem] lg:text-[12rem]";
    }
  } else {
    // 'large' (Varsayılan - Geniş ve telefon için ideal)
    if (timeString.length <= 5) {
      sizeClass = "text-[clamp(4.5rem,23.5vw,9.5rem)] sm:text-[9.5rem] md:text-[11rem] lg:text-[13rem]";
    } else if (timeString.length === 6) {
      sizeClass = "text-[clamp(4.15rem,21vw,8.5rem)] sm:text-[8.5rem] md:text-[10rem] lg:text-[12rem]";
    } else {
      sizeClass = "text-[clamp(3.75rem,18.5vw,7.75rem)] sm:text-[7.75rem] md:text-[9.5rem] lg:text-[11rem]";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full px-1 py-0.5 sm:py-2 select-none overflow-hidden">
      {isEditable && isEditing ? (
        <form onSubmit={handleCommit} className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 w-full max-w-full">
          {/* Dakika Giriş Alanı */}
          <div className="flex items-center justify-center font-mono tabular-nums font-black tracking-tighter leading-none text-slate-900 dark:text-white w-full">
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
                className="text-[clamp(4.5rem,22vw,8.5rem)] sm:text-[8.5rem] md:text-[10rem] text-center bg-transparent border-b-4 border-blue-600 dark:border-blue-500 focus:outline-none w-44 sm:w-56 md:w-72 leading-none tabular-nums font-black"
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
              sizeClass,
              "font-mono tabular-nums font-black tracking-tighter leading-none whitespace-nowrap transition-transform duration-200 transition-colors duration-500 group-hover:scale-[1.01] w-full text-center px-1",
              colorClass
            )}
          >
            {timeString}
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-2 flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700 shadow-xs">
            <Edit2 size={12} className="text-blue-600 dark:text-blue-400" />
            Süreyi değiştirmek için dokun
          </span>
        </button>
      ) : (
        <div 
          className={cn(
            sizeClass,
            "font-mono tabular-nums font-black tracking-tighter leading-none whitespace-nowrap w-full text-center px-1 transition-colors duration-700",
            colorClass
          )}
        >
          {timeString}
        </div>
      )}
    </div>
  );
}
