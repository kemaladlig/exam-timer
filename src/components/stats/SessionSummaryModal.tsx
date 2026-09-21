import { Modal } from '../ui/Modal';
import type { ExamSession, SectionScore } from '../../types';
import { formatDurationHuman } from '../../utils';
import { TimeBreakdownTable } from './TimeBreakdownTable';
import { NetScoreCalculator } from './NetScoreCalculator';
import { ShareButtonGroup } from './ShareButtonGroup';
import type { ShareCardData } from '../../utils/shareUtils';
import { Button } from '../ui/Button';
import { FileDown, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ExamSession | null;
  onRestart?: () => void;
  onConfirm?: () => void;
  onUpdateSession?: (session: ExamSession) => void;
}

export function SessionSummaryModal({ 
  isOpen, 
  onClose, 
  session, 
  onRestart, 
  onConfirm,
  onUpdateSession 
}: SessionSummaryModalProps) {
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(session);

  // Keep currentSession in sync if session prop updates
  if (session && (!currentSession || currentSession.id !== session.id)) {
    setCurrentSession(session);
  }

  const shareCardData: ShareCardData = useMemo(() => {
    if (!currentSession) {
      return {
        title: '',
        totalNet: 0,
        totalQuestions: 0,
        sections: [],
      };
    }
    return {
      title: currentSession.examTitle,
      totalNet: currentSession.totalNet || 0,
      totalDurationFormatted: formatDurationHuman(currentSession.totalElapsedSeconds),
      totalQuestions: currentSession.checkpoints.reduce((acc, cp) => acc + (cp.questionCount || 0), 0),
      sections: currentSession.checkpoints.map((cp) => {
        const sc = currentSession.sectionScores?.[cp.id];
        return {
          name: cp.sectionName,
          correct: sc?.correct || 0,
          incorrect: sc?.incorrect || 0,
          net: sc?.net || 0,
          questionCount: cp.questionCount,
          durationFormatted: formatDurationHuman(cp.deltaSeconds),
        };
      }),
    };
  }, [currentSession]);

  if (!currentSession) return null;

  const handleConfirm = onConfirm || onRestart || onClose;

  const handleScoresChange = (scores: Record<string, SectionScore>, totalNet: number, penaltyRatio: number) => {
    const updated: ExamSession = {
      ...currentSession,
      sectionScores: scores,
      totalNet,
      penaltyRatio,
    };
    setCurrentSession(updated);
    if (onUpdateSession) {
      onUpdateSession(updated);
    }
  };

  const generateReportText = () => {
    const header = `Sınav Raporu: ${currentSession.examTitle}\nTarih: ${new Date(currentSession.startedAt).toLocaleString('tr-TR')}\nToplam Süre: ${formatDurationHuman(currentSession.totalElapsedSeconds)}\n\n`;
    
    const details = currentSession.checkpoints.map((cp, idx) => {
      let speed = '';
      if (cp.questionCount && cp.questionCount > 0) {
         speed = ` (${(cp.deltaSeconds / cp.questionCount).toFixed(1)} sn/soru)`;
      }
      return `#${idx + 1} - ${cp.sectionName}: ${formatDurationHuman(cp.deltaSeconds)}${speed}`;
    }).join('\n');

    let netSection = '';
    if (currentSession.sectionScores && Object.keys(currentSession.sectionScores).length > 0) {
      const scoreLines: string[] = [];
      let totalElapsed = 0;

      currentSession.checkpoints.forEach((cp) => {
        if (cp.isGenericLap) return;
        const sc = currentSession.sectionScores?.[cp.id];
        if (sc && (sc.correct > 0 || sc.incorrect > 0)) {
          totalElapsed += cp.deltaSeconds;
          const timePerNet = sc.net > 0 ? ` (${formatDurationHuman(Math.round(cp.deltaSeconds / sc.net))}/net)` : '';
          scoreLines.push(`• ${cp.sectionName}: ${sc.correct} D / ${sc.incorrect} Y ➔ ${sc.net} Net${timePerNet}`);
        }
      });

      if (scoreLines.length > 0) {
        const avgTime = currentSession.totalNet && currentSession.totalNet > 0
          ? ` (Ort. ${formatDurationHuman(Math.round(totalElapsed / currentSession.totalNet))}/net)`
          : '';
        netSection = `\n\n--- Net Analizi ---\nToplam: ${currentSession.totalNet || 0} Net${avgTime}\n` + scoreLines.join('\n');
      }
    }

    return header + details + netSection;
  };

  const handleDownloadReport = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sinav_Raporu_${currentSession.examTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Çalışma Özeti" maxWidth="xl">
      <div className="space-y-4 sm:space-y-5">
        
        {/* Total Time Card - Hero metric */}
        <div className="rounded-2xl p-4 sm:p-5 text-center border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 shadow-xs">
          <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest mb-1 text-slate-500 dark:text-zinc-400">
            Toplam Geçen Süre
          </h3>
          <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-slate-900 dark:text-white mb-1.5">
            {formatDurationHuman(currentSession.totalElapsedSeconds)}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {currentSession.examTitle} ({new Date(currentSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
          </p>
        </div>

        {/* Breakdown Table & Mobile Cards */}
        <div>
          <TimeBreakdownTable session={currentSession} />
        </div>

        {/* Optional Net Calculation Section */}
        <div>
          <NetScoreCalculator 
            checkpoints={currentSession.checkpoints}
            initialScores={currentSession.sectionScores}
            initialPenaltyRatio={currentSession.penaltyRatio || 4}
            isDefaultOpen={true}
            onScoresChange={handleScoresChange}
          />
        </div>

        {/* Actions - Mobile Thumb-Friendly Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800 flex-wrap">
          {/* WhatsApp & Card Image Sharing */}
          <ShareButtonGroup data={shareCardData} />

          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
            <Button 
              variant="secondary" 
              onClick={handleDownloadReport} 
              className="rounded-xl h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 cursor-pointer font-semibold text-xs shrink-0"
              title="TXT Rapor İndir"
            >
              <FileDown size={14} className="mr-1" />
              .txt
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirm} 
              className="flex-1 sm:flex-initial sm:min-w-[120px] rounded-xl h-10 shadow-xs cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center text-xs sm:text-sm"
            >
              <CheckCircle2 size={16} className="mr-1.5" />
              Tamam
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
