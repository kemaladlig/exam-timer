import { Play, Pause, Square, Maximize, Minimize, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface TimerControlsProps {
  isRunning: boolean;
  isFullscreen: boolean;
  onToggleTimer: () => void;
  onFinishSession: () => void;
  onResetTimer: () => void;
  onToggleFullscreen: () => void;
  hasStarted: boolean;
  isFinished: boolean;
}

export function TimerControls({
  isRunning,
  isFullscreen,
  onToggleTimer,
  onFinishSession,
  onResetTimer,
  onToggleFullscreen,
  hasStarted,
  isFinished
}: TimerControlsProps) {
  if (isFinished) {
    return (
      <div className="flex items-center justify-center gap-3 w-full animate-in fade-in zoom-in duration-300">
        <Button
          variant="primary"
          onClick={onResetTimer}
          className="rounded-2xl px-6 py-4 flex items-center justify-center text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xl transition-transform active:scale-95 font-bold"
        >
          <RotateCcw size={20} className="mr-2" />
          Yeni Sınav Başlat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 w-full">
      
      {/* Reset / Sıfırla Butonu */}
      {!isRunning && hasStarted ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetTimer}
          title="Sayacı Sıfırla"
          className="rounded-full w-12 h-12 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw size={22} />
        </Button>
      ) : (
        <div className="w-12 h-12" />
      )}

      {/* Play / Pause - Dev İkon Buton */}
      <button
        type="button"
        onClick={onToggleTimer}
        className={`rounded-full w-20 h-20 shadow-xl flex items-center justify-center transition-transform active:scale-95 shrink-0 ${
          isRunning 
            ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white border border-slate-300 dark:border-zinc-700'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
        }`}
        title={isRunning ? 'Duraklat' : 'Başlat'}
      >
        {isRunning ? (
          <Pause size={36} fill="currentColor" />
        ) : (
          <Play size={36} fill="currentColor" className="ml-1.5" />
        )}
      </button>

      {/* Sınavı / Seansı Bitir (Kırmızı Kare) */}
      {hasStarted ? (
        <button
          type="button"
          onClick={onFinishSession}
          className="rounded-full w-12 h-12 shadow flex items-center justify-center transition-transform active:scale-95 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-950/40 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white border border-red-200 dark:border-red-900/60 shrink-0"
          title="Seansı Bitir ve Kaydet"
        >
          <Square size={20} fill="currentColor" />
        </button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
          className="rounded-full w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>
      )}

      {/* Fullscreen Butonu */}
      {hasStarted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
          className="rounded-full w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </Button>
      )}
    </div>
  );
}
