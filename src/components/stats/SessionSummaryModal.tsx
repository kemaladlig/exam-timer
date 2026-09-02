import { Modal } from '../ui/Modal';
import type { ExamSession } from '../../types';
import { formatDurationHuman } from '../../utils';
import { TimeBreakdownTable } from './TimeBreakdownTable';
import { Button } from '../ui/Button';
import { FileDown, Copy, Check, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ExamSession | null;
  onRestart?: () => void;
  onConfirm?: () => void;
}

export function SessionSummaryModal({ isOpen, onClose, session, onRestart, onConfirm }: SessionSummaryModalProps) {
  const [copied, setCopied] = useState(false);
  
  if (!session) return null;

  const handleConfirm = onConfirm || onRestart || onClose;

  const generateReportText = () => {
    const header = `Sınav Raporu: ${session.examTitle}\nTarih: ${new Date(session.startedAt).toLocaleString()}\nToplam Süre: ${formatDurationHuman(session.totalElapsedSeconds)}\n\n`;
    const details = session.checkpoints.map((cp, idx) => {
      let speed = '';
      if (cp.questionCount && cp.questionCount > 0) {
         speed = ` (${(cp.deltaSeconds / cp.questionCount).toFixed(1)} sn/soru)`;
      }
      return `#${idx + 1} - ${cp.sectionName}: ${formatDurationHuman(cp.deltaSeconds)}${speed}`;
    }).join('\n');
    return header + details;
  };

  const handleDownloadReport = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sinav_Raporu_${session.examTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
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
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {session.examTitle} ({new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
          </p>
        </div>

        {/* Breakdown Table */}
        <div>
          <TimeBreakdownTable session={session} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Button 
            variant="secondary" 
            onClick={handleCopySummary} 
            className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            {copied ? <Check className="mr-2 text-emerald-500" size={18} /> : <Copy className="mr-2" size={18} />}
            {copied ? 'Kopyalandı!' : 'Özeti Kopyala'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleDownloadReport} 
            className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            <FileDown className="mr-2" size={18} />
            İndir (.txt)
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            className="flex-1 rounded-xl shadow-xs cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center"
          >
            <CheckCircle2 className="mr-2" size={18} />
            Tamam
          </Button>
        </div>
      </div>
    </Modal>
  );
}
