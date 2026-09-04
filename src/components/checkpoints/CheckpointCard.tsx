import { CheckCircle2, X, RotateCcw } from 'lucide-react';
import type { SectionConfig, CheckpointRecord } from '../../types';
import { formatSeconds } from '../../utils';

interface CheckpointCardProps {
  section: SectionConfig;
  checkpoint?: CheckpointRecord;
  hasStarted?: boolean;
  isExiting?: boolean;
  onComplete: (sectionId: string, sectionName: string, questionCount?: number) => void;
  onRemove?: (sectionId: string) => void;
  onUndo?: (checkpointId: string) => void;
}

export function CheckpointCard({
  section,
  checkpoint,
  hasStarted = false,
  isExiting = false,
  onComplete,
  onRemove,
  onUndo
}: CheckpointCardProps) {
  const isCompleted = !!checkpoint;

  // 1. Tamamlanmış Ders Kartı
  if (isCompleted) {
    return (
      <div className={`py-2.5 px-3 rounded-xl border border-emerald-200/60 dark:border-emerald-950/50 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between shadow-xs transition-all ${
        isExiting ? 'animate-pop-out' : 'animate-pop-in'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200 truncate">
            {section.name}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
          <span className="font-mono tabular-nums text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
            {formatSeconds(checkpoint.deltaSeconds)}
          </span>
          {onUndo && (
            <button
              type="button"
              onClick={() => onUndo(checkpoint.id)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Tamamlamayı geri al"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Sınav Henüz Başlamadıysa (Ders Seçim / Hazırlık Modu)
  if (!hasStarted) {
    return (
      <div className="py-2.5 px-3 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span className="font-medium text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate">
            {section.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(section.id)}
              className="p-1 text-slate-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors rounded-md cursor-pointer"
              title="Bu dersi çıkar"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Sınav Aktifken (Süre Akarken Tamamı Tıklanabilir Bitir Kartı - Yanlışlıkla silmeyi önlemek için X yok)
  return (
    <button 
      type="button"
      onClick={() => onComplete(section.id, section.name, section.questionCount)}
      className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200 flex items-center justify-between group active:scale-[0.97] py-3 px-3.5 w-full text-left outline-none cursor-pointer"
    >
      <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {section.name}
      </span>
      <span className="text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white px-2.5 py-1 rounded-lg shrink-0 ml-1.5 transition-all duration-200 group-active:scale-95">
        Bitir
      </span>
    </button>
  );
}
