import { useState } from 'react';
import { BookmarkPlus, RotateCcw, Plus, ChevronDown, ChevronUp, Clock, X, Pin, CheckCircle2, BookmarkCheck, Layers, Sparkles } from 'lucide-react';
import type { SectionConfig, CheckpointRecord, CustomPreset } from '../../types';
import { EXAM_PRESETS } from '../../constants/presets';
import { CheckpointCard } from './CheckpointCard';
import { Button } from '../ui/Button';
import { formatSeconds } from '../../utils';

interface CheckpointListProps {
  sections: SectionConfig[];
  checkpoints: CheckpointRecord[];
  onCompleteSection: (sectionId: string, sectionName: string, questionCount?: number) => void;
  onGenericCheckpoint: (customName?: string) => void;
  onUndoLastCheckpoint: () => void;
  onRemoveCheckpoint: (checkpointId: string) => void;
  onAddSection: (name: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onApplyPreset: (sections: SectionConfig[], durationSeconds?: number) => void;
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
  onApplyPreset,
  hasStarted,
}: CheckpointListProps) {
  const [newSectionName, setNewSectionName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Kullanıcının özel kaydettiği ders grupları (LocalStorage'da kalıcı saklanır)
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try {
      const saved = localStorage.getItem('exam_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

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

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || sections.length === 0) return;
    const newPreset: CustomPreset = {
      id: 'custom-' + Date.now(),
      name: groupName.trim(),
      sections: [...sections],
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('exam_custom_presets', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setGroupName('');
    setIsSavingGroup(false);
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('exam_custom_presets', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 px-4 pb-16 mt-2">
      
      {/* 1. Sınav Başlamadan Önceki Görünüm (Sınav ve Ders Seçimi) */}
      {!hasStarted ? (
        <div className="space-y-3 animate-in fade-in duration-300">
          {/* Hızlı Sınav Seçici Segment */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Sınav Formatı
              </span>
              {sections.length > 0 && !isSavingGroup && (
                <button
                  type="button"
                  onClick={() => setIsSavingGroup(true)}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Mevcut ders listesini özel grup olarak kaydet"
                >
                  <BookmarkCheck size={12} />
                  <span>Bu Grubu Kaydet</span>
                </button>
              )}
            </div>

            {/* Özel Grup Kaydetme Girişi */}
            {isSavingGroup && (
              <form onSubmit={handleSaveGroup} className="flex gap-1.5 items-center p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Grup / Sınav adı (örn. AGS, Deneme 1)..."
                  autoFocus
                  className="flex-1 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none font-medium"
                />
                <Button type="submit" size="sm" className="py-1.5 px-3 text-xs rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                  Kaydet
                </Button>
                <button
                  type="button"
                  onClick={() => setIsSavingGroup(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </form>
            )}

            {/* Hazır Sınav Formatları (KPSS, TYT, AGS, ALES, Temizle) */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-800/80">
              {EXAM_PRESETS.map((preset) => {
                const shortLabel = preset.id === 'kpss-lisans' 
                  ? 'KPSS' 
                  : preset.id === 'yks-tyt' 
                    ? 'TYT' 
                    : preset.id === 'meb-ags' 
                      ? 'AGS' 
                      : preset.id === 'osym-ales' 
                        ? 'ALES' 
                        : preset.name.split(' ')[0];

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset.sections, preset.totalDurationSeconds)}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 shadow-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    title={preset.name}
                  >
                    <span>{shortLabel}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => onApplyPreset([])}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 shadow-xs hover:text-red-500 dark:hover:text-red-400 cursor-pointer ml-auto"
                title="Ders listesini boşalt"
              >
                <Layers size={13} />
                <span>Temizle</span>
              </button>
            </div>

            {/* Kullanıcının Özel Grupları */}
            {customPresets.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1 flex items-center gap-0.5">
                  <Sparkles size={10} className="text-amber-500" />
                  Özel Gruplar:
                </span>
                {customPresets.map((cp) => (
                  <div
                    key={cp.id}
                    className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => onApplyPreset(cp.sections, cp.totalDurationSeconds)}
                      className="cursor-pointer hover:underline"
                      title={`${cp.sections.length} dersi yükle`}
                    >
                      {cp.name} ({cp.sections.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteGroup(cp.id, e)}
                      className="text-blue-400 hover:text-red-500 transition-colors p-0.5 ml-1 cursor-pointer"
                      title="Bu özel grubu sil"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ders Listesi Başlığı & Ders Sayısı */}
          <div className="flex items-center justify-between text-xs px-1 pt-1">
            <span className="font-bold text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-1.5">
              <span>Sınav Dersleri</span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 bg-slate-200/70 dark:bg-zinc-800 px-1.5 py-0.2 rounded-md">
                {sections.length}
              </span>
            </span>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Ders Ekle</span>
              </button>
            )}
          </div>

          {/* Yeni Ders Ekleme Formu */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="flex gap-2 items-center animate-in fade-in duration-150">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Ders adı (örn. Geometri)..."
                autoFocus
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
              <Button type="submit" size="sm" className="py-2 px-3.5 text-xs rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                Ekle
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAdding(false)} 
                className="py-2 px-2.5 text-xs rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                İptal
              </Button>
            </form>
          )}

          {/* Ders Izgarası (Mobilde 2 sütunlu, düzenli ve kompakt) */}
          {sections.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {sections.map((section) => (
                <CheckpointCard
                  key={section.id}
                  section={section}
                  hasStarted={false}
                  onComplete={onCompleteSection}
                  onRemove={onRemoveSection}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-500 text-xs bg-white/40 dark:bg-zinc-900/20">
              Henüz ders eklenmedi. Yukarıdan KPSS / TYT seçebilir veya yeni ders ekleyebilirsiniz.
            </div>
          )}
        </div>
      ) : (
        /* 2. Sınav Başladıktan Sonraki Görünüm (Süre Akarken) */
        <div className="space-y-3 animate-in fade-in duration-300">
          {/* Süreyi Not Al & Geri Al Butonları */}
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => onGenericCheckpoint()}
              className="flex-1 rounded-xl py-3 px-4 font-semibold border border-slate-200/90 dark:border-zinc-800 bg-white hover:bg-slate-50 text-slate-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <BookmarkPlus size={16} className="text-blue-600 dark:text-blue-400" />
              <span>Süreyi Not Al</span>
            </button>
            
            {hasCheckpoints && (
              <button 
                type="button"
                onClick={onUndoLastCheckpoint}
                className="rounded-xl px-3.5 py-3 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/60 hover:bg-red-100/60 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 border border-red-200/70 dark:border-red-900/40 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                title="Son kaydı geri al"
              >
                <RotateCcw size={13} />
                <span>Geri Al</span>
              </button>
            )}
          </div>

          {/* Kaydedilen Süreler Listesi (Collapsible) */}
          {hasCheckpoints && (
            <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800/60"
              >
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-500" />
                  Kaydedilen Süreler ({checkpoints.length})
                </span>
                {isHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isHistoryOpen && (
                <div className="px-3 py-1 space-y-0.5 divide-y divide-slate-100 dark:divide-zinc-800/60 max-h-44 overflow-y-auto">
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

          {/* Devam Eden Dersler Izgarası (Mobilde 2 Sütun, Hızlı ve Net Dokunma) */}
          {uncompletedSections.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
                Dersi Bitir
              </div>
              <div className="grid grid-cols-2 gap-2">
                {uncompletedSections.map((section) => (
                  <CheckpointCard
                    key={section.id}
                    section={section}
                    hasStarted={true}
                    onComplete={onCompleteSection}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-500 text-xs bg-white/40 dark:bg-zinc-900/20">
              Tüm dersler tamamlandı.
            </div>
          )}

          {/* Tamamlanan Dersler */}
          {completedCheckpoints.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
                Tamamlananlar ({completedCheckpoints.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {completedCheckpoints.map((cp) => {
                  const sec = sections.find(s => s.id === cp.sectionId) || { id: cp.sectionId, name: cp.sectionName };
                  return (
                    <CheckpointCard
                      key={cp.id}
                      section={sec}
                      checkpoint={cp}
                      hasStarted={true}
                      onComplete={() => {}}
                      onUndo={onRemoveCheckpoint}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
