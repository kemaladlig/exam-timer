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
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Sıra</th>
            <th className="px-4 py-3 font-semibold">Bölüm / Tur</th>
            <th className="px-4 py-3 font-semibold">Harcanan Süre</th>
            <th className="px-4 py-3 font-semibold text-right">% Toplam</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
          {checkpoints.map((cp, idx) => {
            const percent = session.totalElapsedSeconds > 0 
              ? ((cp.deltaSeconds / session.totalElapsedSeconds) * 100).toFixed(1)
              : '0.0';

            return (
              <tr key={cp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 text-slate-400 dark:text-zinc-500 font-mono text-xs">#{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-200">{cp.sectionName}</td>
                <td className="px-4 py-3 font-mono tabular-nums font-semibold text-primary">{formatSeconds(cp.deltaSeconds)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500 dark:text-zinc-400">{percent}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
