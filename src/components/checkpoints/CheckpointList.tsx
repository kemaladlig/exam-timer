import { useState } from 'react';
import { BookmarkPlus, RotateCcw, Plus, ChevronDown, ChevronUp, Clock, X, Pin, CheckCircle2 } from 'lucide-react';
import type { SectionConfig, CheckpointRecord } from '../../types';
import { CheckpointCard } from './CheckpointCard';
import { Button } from '../ui/Button';
import { formatSeconds } from '../../utils';

interface CheckpointListProps {
  sections: SectionConfig[];
  checkpoints: CheckpointRecord[];
  onCompleteSection: (sectionId: string, sectionName: string) => void;
  onGenericCheckpoint: (customName?: string) => void;
  onUndoLastCheckpoint: () => void;
  onRemoveCheckpoint: (checkpointId: string) => void;
  onAddSection: (name: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onResetSections: (type: 'kpss' | 'tyt' | 'clear') => void;
  hasStarted: boolean;
}

export function CheckpointList({
  sections,
  checkpoints,
  onCompleteSection,
  onGenericCheckpoint,
  onUndoLastCheckpoint,
  onRemoveCheckpoint,
  onAddSection,
  onRemoveSection,
  onResetSections,
  hasStarted,
}: CheckpointListProps) {
  const [newSectionName, setNewSectionName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const hasCheckpoints = checkpoints.length > 0;
  const allRecordedCheckpoints = [...checkpoints].reverse();
  const uncompletedSections = sections.filter(s => !checkpoints.some(c => c.sectionId === s.id));
  const completedCheckpoints = checkpoints.filter(c => !c.isGenericLap);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim());
      setNewSectionName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 px-4 pb-16 mt-2">
      
      {/* Süreyi Not Al & Geri Al Butonları */}
      <div className="flex gap-2">
        <button 
          type="button"
          onClick={() => onGenericCheckpoint()}
          className="flex-1 rounded-xl py-3.5 px-4 font-semibold border border-slate-200/90 dark:border-zinc-800 bg-white hover:bg-slate-50 text-slate-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
        >
          <BookmarkPlus size={17} className="text-blue-600 dark:text-blue-400" />
          <span>Süreyi Not Al</span>
        </button>
        
        {hasCheckpoints && (
          <button 
            type="button"
            onClick={onUndoLastCheckpoint}
            className="rounded-xl px-4 py-3.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/60 hover:bg-red-100/60 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 border border-red-200/70 dark:border-red-900/40 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            title="Son kaydı geri al"
          >
            <RotateCcw size={14} />
            <span>Geri Al</span>
          </button>
        )}
      </div>

      {/* Kaydedilen Süreler Listesi */}
      {hasCheckpoints && (
        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800/60"
          >
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-blue-500" />
              Kaydedilen Süreler ({checkpoints.length})
            </span>
            {isHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isHistoryOpen && (
            <div className="px-3 py-1 space-y-0.5 divide-y divide-slate-100 dark:divide-zinc-800/60 max-h-48 overflow-y-auto">
              {allRecordedCheckpoints.map((cp) => (
                <div key={cp.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {cp.isGenericLap ? (
                      <Pin size={13} className="text-blue-500 shrink-0" />
                    ) : (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate text-xs">
                      {cp.sectionName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 font-mono tabular-nums shrink-0 ml-2">
                    <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                      {formatSeconds(cp.elapsedSecondsAtCheckpoint)}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      +{formatSeconds(cp.deltaSeconds)}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => onRemoveCheckpoint(cp.id)}
                      className="p-1 rounded text-slate-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Bu kaydı geri al / sil"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ders Listesi Başlığı & Hızlı Şablonlar */}
      <div className="flex items-center justify-between text-xs px-1 pt-1">
        <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-[11px]">
          Ders Listesi
        </span>
        {!hasStarted && (
          <div className="flex items-center gap-1">
            <button 
              type="button" 
              onClick={() => onResetSections('kpss')}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-medium text-[11px] transition-colors cursor-pointer"
            >
              KPSS
            </button>
            <button 
              type="button" 
              onClick={() => onResetSections('tyt')}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-medium text-[11px] transition-colors cursor-pointer"
            >
              TYT
            </button>
            <button 
              type="button" 
              onClick={() => onResetSections('clear')}
              className="px-2.5 py-0.5 rounded-md bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-500 dark:text-red-400 font-medium text-[11px] transition-colors cursor-pointer"
            >
              Temizle
            </button>
          </div>
        )}
      </div>

      {/* İki Sütunlu Ders Izgarası (Web ve Mobilde ideal boyut ve rahat tıklama) */}
      {uncompletedSections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {uncompletedSections.map((section) => (
            <CheckpointCard
              key={section.id}
              section={section}
              onComplete={onCompleteSection}
              onRemove={onRemoveSection}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-500 text-xs bg-white/40 dark:bg-zinc-900/20">
          Tüm dersler tamamlandı veya liste boş.
        </div>
      )}

      {/* Yeni Ders Ekleme Formu */}
      <div>
        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="flex gap-2 items-center animate-in fade-in duration-150">
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Ders adı (örn. Geometri)..."
              autoFocus
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
            <Button type="submit" size="sm" className="py-2.5 px-4 text-xs rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white">
              Ekle
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsAdding(false)} 
              className="py-2.5 px-2.5 text-xs rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Vazgeç
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-3 px-3 rounded-xl border border-dashed border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white/60 dark:bg-zinc-900/30 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
          >
            <Plus size={14} className="text-blue-500" />
            Yeni Ders Ekle
          </button>
        )}
      </div>

      {/* Tamamlanan Dersler */}
      {completedCheckpoints.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
            Tamamlanan Dersler ({completedCheckpoints.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {completedCheckpoints.map((cp) => {
              const sec = sections.find(s => s.id === cp.sectionId) || { id: cp.sectionId, name: cp.sectionName };
              return (
                <CheckpointCard
                  key={cp.id}
                  section={sec}
                  checkpoint={cp}
                  onComplete={() => {}}
                  onUndo={onRemoveCheckpoint}
                />
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
