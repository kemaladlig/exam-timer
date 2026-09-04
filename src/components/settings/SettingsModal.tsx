import { Modal } from '../ui/Modal';
import type { TimeDisplayFormat } from '../../types';
import { Clock, Sliders, Check } from 'lucide-react';
import { cn } from '../../utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeFormat: TimeDisplayFormat;
  onChangeTimeFormat: (format: TimeDisplayFormat) => void;
  showProgressBar: boolean;
  onToggleProgressBar: (show: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  timeFormat,
  onChangeTimeFormat,
  showProgressBar,
  onToggleProgressBar,
}: SettingsModalProps) {
  const formatOptions: { id: TimeDisplayFormat; label: string; example: string }[] = [
    { id: 'hh:mm:ss', label: 'Saat : Dk : Sn', example: '02:09:39' },
    { id: 'mm:ss', label: 'Dk : Sn', example: '129:39' },
    { id: 'm_only', label: 'Sadece Dk', example: '129 dk' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Görünüm ve Ayarlar" maxWidth="md">
      <div className="space-y-6">
        
        {/* 1. Zaman Gösterim Formatı */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Saat Formatı
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Sayacın ekranda nasıl görüneceğini seçin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {formatOptions.map((opt) => {
              const isSelected = timeFormat === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeTimeFormat(opt.id)}
                  className={cn(
                    'p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    {opt.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {opt.example}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. İlerleme Çubuğu (Ambient Bar) */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Üst Süre Çubuğu
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ekranın en üstünde kalan süreyi sessizce gösteren minimalist ambient çizgi.
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={showProgressBar}
              onClick={() => onToggleProgressBar(!showProgressBar)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                showProgressBar ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  showProgressBar ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
