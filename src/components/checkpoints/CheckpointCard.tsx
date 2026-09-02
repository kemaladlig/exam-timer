import { CheckCircle2, X, RotateCcw } from 'lucide-react';
import type { SectionConfig, CheckpointRecord } from '../../types';
import { formatSeconds } from '../../utils';

interface CheckpointCardProps {
  section: SectionConfig;
  checkpoint?: CheckpointRecord;
  onComplete: (sectionId: string, sectionName: string, questionCount?: number) => void;
  onRemove?: (sectionId: string) => void;
  onUndo?: (checkpointId: string) => void;
}

export function CheckpointCard({
  section,
  checkpoint,
  onComplete,
  onRemove,
  onUndo
}: CheckpointCardProps) {
  const isCompleted = !!checkpoint;

  if (isCompleted) {
    return (
      <div className="py-2.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-between shadow-xs transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span className="font-semibold text-xs text-slate-700 dark:text-zinc-300 truncate">
            {section.name}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          <span className="font-mono tabular-nums text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
            {formatSeconds(checkpoint.deltaSeconds)}
          </span>
          {onUndo && (
            <button
              type="button"
              onClick={() => onUndo(checkpoint.id)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Tamamlamayı geri al"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-blue-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.99]">
      <button 
        type="button"
        onClick={() => onComplete(section.id, section.name, section.questionCount)}
        className="flex-1 text-left py-3 px-3.5 flex items-center justify-between min-w-0 outline-none"
      >
        <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 truncate">
          {section.name}
        </span>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white px-2.5 py-1 rounded-lg shrink-0 ml-2 transition-colors">
          Bitir
        </span>
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(section.id);
          }}
          className="p-2 mr-1 text-slate-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors rounded-lg shrink-0"
          title="Dersi Sil"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
