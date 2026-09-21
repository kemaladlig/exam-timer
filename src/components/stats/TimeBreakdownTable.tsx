import type { ExamSession } from '../../types';
import { formatSeconds } from '../../utils';

interface TimeBreakdownTableProps {
  session: ExamSession;
}

export function TimeBreakdownTable({ session }: TimeBreakdownTableProps) {
  const checkpoints = session.checkpoints;

  if (checkpoints.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-sm">
        Henüz kaydedilmiş bir tur yok.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 1. Mobile Card List (sm altı ekranlar için yatay kaydırmayı kaldıran kart yapısı) */}
      <div className="space-y-2 block sm:hidden">
        {checkpoints.map((cp, idx) => {
          const percent = session.totalElapsedSeconds > 0 
            ? ((cp.deltaSeconds / session.totalElapsedSeconds) * 100).toFixed(1)
            : '0.0';

          const timePerQuestion = cp.questionCount && cp.questionCount > 0 
            ? (cp.deltaSeconds / cp.questionCount).toFixed(1)
            : null;

          const score = session.sectionScores?.[cp.id];

          return (
            <div 
              key={cp.id}
              className="p-3 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-zinc-500 font-mono text-xs">#{idx + 1}</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate">
                    {cp.sectionName}
                  </span>
                  {cp.questionCount && (
                    <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium">
                      {cp.questionCount}S
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  {timePerQuestion && <span>{timePerQuestion} sn/soru</span>}
                  <span>•</span>
                  <span>%{percent}</span>
                  {score && score.net > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{score.net} Net</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono tabular-nums font-bold text-sm text-blue-600 dark:text-blue-400">
                  {formatSeconds(cp.deltaSeconds)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Tabular View (sm ve üstü geniş ekranlar için) */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Sıra</th>
              <th className="px-4 py-3 font-semibold">Bölüm / Tur</th>
              <th className="px-4 py-3 font-semibold">Harcanan Süre</th>
              <th className="px-4 py-3 font-semibold text-center">Hız</th>
              <th className="px-4 py-3 font-semibold text-right">% Toplam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {checkpoints.map((cp, idx) => {
              const percent = session.totalElapsedSeconds > 0 
                ? ((cp.deltaSeconds / session.totalElapsedSeconds) * 100).toFixed(1)
                : '0.0';

              const timePerQuestion = cp.questionCount && cp.questionCount > 0 
                ? (cp.deltaSeconds / cp.questionCount).toFixed(1)
                : null;

              return (
                <tr key={cp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 dark:text-zinc-500 font-mono text-xs">#{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-200">
                    {cp.sectionName}
                    {cp.questionCount && (
                      <span className="ml-2 text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                        {cp.questionCount} Soru
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">{formatSeconds(cp.deltaSeconds)}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-xs text-slate-500 dark:text-zinc-400">
                    {timePerQuestion ? `${timePerQuestion} sn/soru` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500 dark:text-zinc-400">{percent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
