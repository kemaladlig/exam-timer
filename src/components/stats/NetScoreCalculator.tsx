import React, { useState, useMemo } from 'react';
import type { CheckpointRecord, SectionScore } from '../../types';
import { formatDurationHuman, calculateKpssScore } from '../../utils';
import { Calculator, ChevronDown, ChevronUp, RotateCcw, Award } from 'lucide-react';

interface NetScoreCalculatorProps {
  checkpoints: CheckpointRecord[];
  initialScores?: Record<string, SectionScore>;
  initialPenaltyRatio?: number;
  isDefaultOpen?: boolean;
  onScoresChange?: (scores: Record<string, SectionScore>, totalNet: number, ratio: number) => void;
}

export const NetScoreCalculator: React.FC<NetScoreCalculatorProps> = ({
  checkpoints,
  initialScores,
  initialPenaltyRatio = 4,
  isDefaultOpen = false,
  onScoresChange,
}) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const [penaltyRatio, setPenaltyRatio] = useState<number>(initialPenaltyRatio);

  // Filter actual subject/exam sections (skip generic notes)
  const examCheckpoints = useMemo(() => {
    return checkpoints.filter((cp) => !cp.isGenericLap);
  }, [checkpoints]);

  const [rawCounts, setRawCounts] = useState<Record<string, { correct: string; incorrect: string }>>(() => {
    const init: Record<string, { correct: string; incorrect: string }> = {};
    examCheckpoints.forEach((cp) => {
      const prev = initialScores?.[cp.id];
      init[cp.id] = {
        correct: prev ? prev.correct.toString() : '',
        incorrect: prev ? prev.incorrect.toString() : '',
      };
    });
    return init;
  });

  // Calculate live net scores per section
  const sectionResults = useMemo(() => {
    const results: Record<string, SectionScore> = {};
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalNet = 0;
    let gyNet = 0;
    let gkNet = 0;
    let hasAnyInput = false;

    examCheckpoints.forEach((cp) => {
      const entry = rawCounts[cp.id] || { correct: '', incorrect: '' };
      const c = parseInt(entry.correct, 10);
      const w = parseInt(entry.incorrect, 10);

      const validC = !isNaN(c) && c >= 0 ? c : 0;
      const validW = !isNaN(w) && w >= 0 ? w : 0;

      if (entry.correct !== '' || entry.incorrect !== '') {
        hasAnyInput = true;
      }

      const net = Math.max(0, parseFloat((validC - validW / penaltyRatio).toFixed(2)));
      const empty = cp.questionCount ? Math.max(0, cp.questionCount - (validC + validW)) : undefined;

      results[cp.id] = {
        correct: validC,
        incorrect: validW,
        empty,
        net,
      };

      totalCorrect += validC;
      totalIncorrect += validW;
      totalNet += net;

      if (/türkçe|matematik|genel yetenek/i.test(cp.sectionName)) {
        gyNet += net;
      } else if (/tarih|coğrafya|vatandaşlık|genel kültür/i.test(cp.sectionName)) {
        gkNet += net;
      }
    });

    return {
      scores: results,
      totalCorrect,
      totalIncorrect,
      totalNet: parseFloat(totalNet.toFixed(2)),
      gyNet: parseFloat(gyNet.toFixed(2)),
      gkNet: parseFloat(gkNet.toFixed(2)),
      hasAnyInput,
    };
  }, [examCheckpoints, rawCounts, penaltyRatio]);

  const handleInputChange = (cpId: string, field: 'correct' | 'incorrect', val: string) => {
    // Only allow non-negative integers
    const sanitized = val.replace(/[^0-9]/g, '');
    const newCounts = {
      ...rawCounts,
      [cpId]: {
        ...(rawCounts[cpId] || { correct: '', incorrect: '' }),
        [field]: sanitized,
      },
    };
    setRawCounts(newCounts);

    // Notify parent
    if (onScoresChange) {
      const updatedScores: Record<string, SectionScore> = {};
      let sumNet = 0;
      examCheckpoints.forEach((cp) => {
        const item = newCounts[cp.id] || { correct: '', incorrect: '' };
        const c = parseInt(item.correct, 10) || 0;
        const w = parseInt(item.incorrect, 10) || 0;
        const net = Math.max(0, parseFloat((c - w / penaltyRatio).toFixed(2)));
        updatedScores[cp.id] = {
          correct: c,
          incorrect: w,
          net,
        };
        sumNet += net;
      });
      onScoresChange(updatedScores, parseFloat(sumNet.toFixed(2)), penaltyRatio);
    }
  };

  const handleClearAll = () => {
    const emptyCounts: Record<string, { correct: string; incorrect: string }> = {};
    examCheckpoints.forEach((cp) => {
      emptyCounts[cp.id] = { correct: '', incorrect: '' };
    });
    setRawCounts(emptyCounts);
    if (onScoresChange) {
      onScoresChange({}, 0, penaltyRatio);
    }
  };

  if (examCheckpoints.length === 0) {
    return null;
  }

  // Calculate overall average time per net
  const totalElapsed = examCheckpoints.reduce((acc, cp) => acc + cp.deltaSeconds, 0);
  const avgTimePerNet = sectionResults.totalNet > 0 ? Math.round(totalElapsed / sectionResults.totalNet) : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden transition-all">
      {/* Header Toggle - Distinct, thumb-friendly */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer select-none bg-gradient-to-r from-blue-50/40 to-transparent dark:from-blue-950/20"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Calculator size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                Net & Puan Hesapla
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                {isOpen ? 'Kapat' : 'Hesapla'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {sectionResults.hasAnyInput
                ? `Toplam: ${sectionResults.totalNet} Net ${avgTimePerNet ? `• ${formatDurationHuman(avgTimePerNet)}/net` : ''}`
                : 'Doğru ve yanlışları girerek net ve tahmini puanını hesapla'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {sectionResults.hasAnyInput ? (
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg">
              {sectionResults.totalNet} Net
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hidden xs:inline">
              Net & Puan Hesapla
            </span>
          )}
          <div className="text-slate-400 dark:text-zinc-500">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Expandable Body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
          {/* Top Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 mb-3 border-b border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
              <span className="font-medium">Kural:</span>
              <button
                type="button"
                onClick={() => setPenaltyRatio(4)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  penaltyRatio === 4
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                4 Yanlış (YKS/KPSS)
              </button>
              <button
                type="button"
                onClick={() => setPenaltyRatio(3)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  penaltyRatio === 3
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                3 Yanlış (LGS)
              </button>
            </div>

            {sectionResults.hasAnyInput && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                Temizle
              </button>
            )}
          </div>

          {/* Section Input Cards - Mobile Optimized */}
          <div className="space-y-2.5">
            {examCheckpoints.map((cp) => {
              const counts = rawCounts[cp.id] || { correct: '', incorrect: '' };
              const score = sectionResults.scores[cp.id];
              const timePerNet =
                score && score.net > 0 ? Math.round(cp.deltaSeconds / score.net) : null;

              return (
                <div
                  key={cp.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  {/* Left: Section Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate">
                        {cp.sectionName}
                      </span>
                      {cp.questionCount && (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                          ({cp.questionCount} Soru)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                      Süre: {formatDurationHuman(cp.deltaSeconds)}
                    </div>
                  </div>

                  {/* Right: Touch Inputs for Correct & Incorrect */}
                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                    {/* Doğru */}
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor={`c-${cp.id}`}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                      >
                        D:
                      </label>
                      <input
                        id={`c-${cp.id}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={counts.correct}
                        onChange={(e) => handleInputChange(cp.id, 'correct', e.target.value)}
                        className="w-12 h-9 text-center font-mono font-bold text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Yanlış */}
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor={`w-${cp.id}`}
                        className="text-[11px] font-bold text-rose-600 dark:text-rose-400"
                      >
                        Y:
                      </label>
                      <input
                        id={`w-${cp.id}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={counts.incorrect}
                        onChange={(e) => handleInputChange(cp.id, 'incorrect', e.target.value)}
                        className="w-12 h-9 text-center font-mono font-bold text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-rose-500 focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Net Badge */}
                    <div className="min-w-[68px] text-right pl-1">
                      <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {score ? score.net : 0} Net
                      </div>
                      {timePerNet !== null && (
                        <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 leading-none mt-0.5">
                          {formatDurationHuman(timePerNet)}/net
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Total Result Card */}
          {sectionResults.hasAnyInput && (
            <div className="mt-3.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-blue-950 dark:text-blue-200">
                      Toplam: {sectionResults.totalNet} Net
                    </div>
                    <div className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                      {sectionResults.totalCorrect} Doğru • {sectionResults.totalIncorrect} Yanlış
                    </div>
                  </div>
                </div>

                {avgTimePerNet && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      Ort. Net Başına Süre
                    </div>
                    <div className="text-xs font-mono font-bold text-blue-950 dark:text-blue-200">
                      {formatDurationHuman(avgTimePerNet)}
                    </div>
                  </div>
                )}
              </div>

              {/* KPSS GY & GK Sub-Scores and Estimated Score */}
              {(sectionResults.gyNet > 0 || sectionResults.gkNet > 0) && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    GY: {sectionResults.gyNet} Net
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100/90 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    GK: {sectionResults.gkNet} Net
                  </span>
                  {(() => {
                    const scoreObj = calculateKpssScore(sectionResults.gyNet, sectionResults.gkNet, 'lisans');
                    return scoreObj.score > 0 ? (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                        Tahmini P3: {scoreObj.score}
                      </span>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
