import { Modal } from '../ui/Modal';
import type { ExamSession } from '../../types';
import { formatDurationHuman } from '../../utils';
import { TimeBreakdownTable } from './TimeBreakdownTable';
import { Button } from '../ui/Button';
import { FileDown, RefreshCcw } from 'lucide-react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ExamSession | null;
  onRestart: () => void;
}

export function SessionSummaryModal({ isOpen, onClose, session, onRestart }: SessionSummaryModalProps) {
  if (!session) return null;

  const handleDownloadReport = () => {
    const header = `Sınav Raporu: ${session.examTitle}\nTarih: ${new Date(session.startedAt).toLocaleString()}\nToplam Süre: ${formatDurationHuman(session.totalElapsedSeconds)}\n\n`;
    const details = session.checkpoints.map((cp, idx) => {
      return `#${idx + 1} - ${cp.sectionName}: ${cp.deltaSeconds}sn`;
    }).join('\n');
    
    const blob = new Blob([header + details], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sinav_Raporu_${session.examTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Çalışma Özeti" maxWidth="xl">
      <div className="space-y-6">
        
        {/* Total Time Card */}
        <div className="rounded-2xl p-6 text-center border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 text-slate-500 dark:text-zinc-400">
            Toplam Geçen Süre
          </h3>
          <div className="text-5xl font-bold font-mono tracking-tight text-slate-900 dark:text-white mb-2">
            {formatDurationHuman(session.totalElapsedSeconds)}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Toplam {session.checkpoints.length} tur / ders kaydedildi
          </div>
        </div>

        {/* Breakdown Table */}
        <div>
          <TimeBreakdownTable session={session} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Button 
            variant="secondary" 
            onClick={handleDownloadReport} 
            className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700"
          >
            <FileDown className="mr-2" size={18} />
            Raporu İndir (.txt)
          </Button>
          <Button variant="primary" onClick={onRestart} className="flex-1 rounded-xl shadow-sm">
            <RefreshCcw className="mr-2" size={18} />
            Yeni Seans Başlat
          </Button>
        </div>
      </div>
    </Modal>
  );
}
