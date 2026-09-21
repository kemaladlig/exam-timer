import { useState, useEffect } from 'react';
import { Target, Check, Edit2, X, Plus } from 'lucide-react';
import { getLocalStorageItem, setLocalStorageItem } from '../../utils';

export interface TargetGoalConfig {
  value: number;
  type: 'net' | 'score';
  label: string;
}

interface TargetGoalCardProps {
  categoryKey: string;
  currentValue: number;
  isKpss?: boolean;
  kpssScore?: number;
  kpssScoreType?: string;
  onTargetChange?: (target: TargetGoalConfig | null) => void;
}

export function TargetGoalCard({
  categoryKey,
  currentValue,
  isKpss = false,
  kpssScore = 0,
  kpssScoreType = 'P3',
  onTargetChange,
}: TargetGoalCardProps) {
  const storageKey = `exam_target_goal_${categoryKey}`;

  const [target, setTarget] = useState<TargetGoalConfig | null>(() => {
    const saved = getLocalStorageItem<TargetGoalConfig | null>(storageKey, null);
    if (saved && !isKpss && saved.type === 'score') {
      return { ...saved, type: 'net', label: 'Net' };
    }
    return saved;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [targetType, setTargetType] = useState<'net' | 'score'>(isKpss ? 'score' : 'net');

  // Update parent when target state changes
  useEffect(() => {
    if (onTargetChange) {
      onTargetChange(target);
    }
  }, [target, onTargetChange]);

  const handleStartEdit = () => {
    setInputValue(target ? String(target.value) : '');
    setTargetType(target?.type || (isKpss ? 'score' : 'net'));
    setIsEditing(true);
  };

  const handleSave = () => {
    const num = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      const newTarget: TargetGoalConfig = {
        value: num,
        type: targetType,
        label: targetType === 'score' ? `Puan (${kpssScoreType})` : 'Net',
      };
      setTarget(newTarget);
      setLocalStorageItem(storageKey, newTarget);
    } else {
      setTarget(null);
      setLocalStorageItem(storageKey, null);
    }
    setIsEditing(false);
  };

  const handleRemove = () => {
    setTarget(null);
    setLocalStorageItem(storageKey, null);
    setIsEditing(false);
  };

  // Evaluate progress
  const activeCurrentVal = target?.type === 'score' && isKpss ? kpssScore : currentValue;
  const progressPercent = target && target.value > 0 ? (activeCurrentVal / target.value) * 100 : 0;
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const diff = target ? activeCurrentVal - target.value : 0;
  const isReached = diff >= 0 && activeCurrentVal > 0;

  if (isEditing) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
            <Target size={13} className="text-slate-500 dark:text-zinc-400" />
            <span>Hedef Belirle</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Target Type Toggle (if KPSS) */}
          {isKpss && (
            <div className="p-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setTargetType('score')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  targetType === 'score'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Puan
              </button>
              <button
                type="button"
                onClick={() => setTargetType('net')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  targetType === 'net'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Net
              </button>
            </div>
          )}

          {/* Number Input */}
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="decimal"
              placeholder={targetType === 'score' ? '85.0' : '75.0'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              className="w-full h-8 px-2.5 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2 top-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 pointer-events-none">
              {targetType === 'score' ? kpssScoreType : 'Net'}
            </span>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
          >
            <Check size={13} />
            <span>Kaydet</span>
          </button>

          {target && (
            <button
              type="button"
              onClick={handleRemove}
              className="h-8 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors cursor-pointer shrink-0"
              title="Hedefi Kaldır"
            >
              Kaldır
            </button>
          )}
        </div>
      </div>
    );
  }

  // Not set state: Minimal pill
  if (!target || target.value <= 0) {
    return (
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
          <Target size={13} className="text-slate-400" />
          <span>Hedef belirle (isteğe bağlı)</span>
        </div>
        <button
          type="button"
          onClick={handleStartEdit}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus size={12} />
          <span>Hedef Ekle</span>
        </button>
      </div>
    );
  }

  // Active Target View: Minimal, High-Contrast & Sleek
  return (
    <div className={`p-2.5 rounded-xl border transition-all ${
      isReached
        ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
        : 'bg-slate-50 dark:bg-zinc-900/80 border-slate-200/90 dark:border-zinc-800'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {/* Left: Target title & Edit */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Target size={13} className={isReached ? 'text-emerald-500' : 'text-blue-500'} />
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
            Hedef: {target.value.toFixed(1)} {target.label}
          </span>
          <button
            type="button"
            onClick={handleStartEdit}
            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
            title="Hedefi Düzenle"
          >
            <Edit2 size={11} />
          </button>
        </div>

        {/* Right: Status Text */}
        <div className="shrink-0 text-right">
          {activeCurrentVal === 0 ? (
            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
              Net bekleniyor
            </span>
          ) : isReached ? (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Hedefe ulaşıldı (+{diff.toFixed(2)})
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">
              Kalan: {Math.abs(diff).toFixed(2)} {target.label}
            </span>
          )}
        </div>
      </div>

      {/* Sleek Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isReached
                ? 'bg-emerald-500'
                : 'bg-blue-600 dark:bg-blue-500'
            }`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-400 dark:text-zinc-500 px-0.5">
          <span>Mevcut: {activeCurrentVal.toFixed(2)}</span>
          <span className={isReached ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
            %{progressPercent.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}

