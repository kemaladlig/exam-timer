import React, { useState, useMemo, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { ExamSession } from '../../types';
import { calculateKpssScore, type KpssLevel, KPSS_LEVELS } from '../../utils';
import { TargetGoalCard, type TargetGoalConfig } from './TargetGoalCard';
import { ShareButtonGroup } from './ShareButtonGroup';
import type { ShareCardData } from '../../utils/shareUtils';
import { 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Award, 
  GraduationCap,
  Plus,
  Minus,
  Check
} from 'lucide-react';

interface QuickNetModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastFinishedSession?: ExamSession | null;
}

export interface QuickSectionPreset {
  id: string;
  name: string;
  questionCount: number;
  group?: 'gy' | 'gk';
}

interface ExamCategory {
  id: string;
  name: string;
  defaultPenalty: number;
  sections: QuickSectionPreset[];
}

const KPSS_DETAILED_SECTIONS: QuickSectionPreset[] = [
  { id: 'kpss-tr', name: 'Türkçe', questionCount: 30, group: 'gy' },
  { id: 'kpss-math', name: 'Matematik', questionCount: 30, group: 'gy' },
  { id: 'kpss-hist', name: 'Tarih', questionCount: 27, group: 'gk' },
  { id: 'kpss-geo', name: 'Coğrafya', questionCount: 18, group: 'gk' },
  { id: 'kpss-cit', name: 'Vatandaşlık', questionCount: 15, group: 'gk' },
];

const KPSS_GROUPED_SECTIONS: QuickSectionPreset[] = [
  { id: 'kpss-gy', name: 'Genel Yetenek', questionCount: 60, group: 'gy' },
  { id: 'kpss-gk', name: 'Genel Kültür', questionCount: 60, group: 'gk' },
];

const PRESET_CATEGORIES: ExamCategory[] = [
  {
    id: 'kpss',
    name: 'KPSS',
    defaultPenalty: 4,
    sections: KPSS_DETAILED_SECTIONS,
  },
  {
    id: 'tyt',
    name: 'TYT',
    defaultPenalty: 4,
    sections: [
      { id: 'tyt-tr', name: 'Türkçe', questionCount: 40 },
      { id: 'tyt-sos', name: 'Sosyal Bilimler', questionCount: 20 },
      { id: 'tyt-mat', name: 'Temel Matematik', questionCount: 40 },
      { id: 'tyt-fen', name: 'Fen Bilimleri', questionCount: 20 },
    ],
  },
  {
    id: 'ayt',
    name: 'AYT',
    defaultPenalty: 4,
    sections: [
      { id: 'ayt-mat', name: 'Matematik', questionCount: 40 },
      { id: 'ayt-fen', name: 'Fen Bilimleri', questionCount: 40 },
      { id: 'ayt-edeb', name: 'Edebiyat - Sosyal-1', questionCount: 40 },
      { id: 'ayt-sos2', name: 'Sosyal-2', questionCount: 40 },
    ],
  },
  {
    id: 'ales',
    name: 'ALES',
    defaultPenalty: 4,
    sections: [
      { id: 'ales-say', name: 'Sayısal', questionCount: 50 },
      { id: 'ales-soz', name: 'Sözel', questionCount: 50 },
    ],
  },
  {
    id: 'lgs',
    name: 'LGS',
    defaultPenalty: 3,
    sections: [
      { id: 'lgs-tr', name: 'Türkçe', questionCount: 20 },
      { id: 'lgs-mat', name: 'Matematik', questionCount: 20 },
      { id: 'lgs-fen', name: 'Fen Bilimleri', questionCount: 20 },
      { id: 'lgs-ink', name: 'İnkılap Tarihi', questionCount: 10 },
      { id: 'lgs-din', name: 'Din Kültürü', questionCount: 10 },
      { id: 'lgs-ing', name: 'Yabancı Dil', questionCount: 10 },
    ],
  },
];

export const QuickNetModal: React.FC<QuickNetModalProps> = ({
  isOpen,
  onClose,
  lastFinishedSession,
}) => {
  // Session checkpoints if any
  const sessionSections: QuickSectionPreset[] = useMemo(() => {
    if (!lastFinishedSession || !lastFinishedSession.checkpoints) return [];
    return lastFinishedSession.checkpoints
      .filter((cp) => !cp.isGenericLap)
      .map((cp) => ({
        id: cp.id,
        name: cp.sectionName,
        questionCount: cp.questionCount || 0,
      }));
  }, [lastFinishedSession]);

  const hasSession = sessionSections.length > 0;

  // Selected exam category tab
  const [activeTab, setActiveTab] = useState<string>(() => (hasSession ? 'session' : 'kpss'));

  // Clean 2-way toggle for KPSS: 'detailed' (KPSS 5 ders) vs 'grouped' (GY - GK)
  const [kpssMode, setKpssMode] = useState<'detailed' | 'grouped'>('detailed');

  // KPSS Education Level: Lisans (P3) | Önlisans (P93) | Ortaöğretim (P94)
  const [kpssLevel, setKpssLevel] = useState<KpssLevel>('lisans');

  const [penaltyRatio, setPenaltyRatio] = useState<number>(4);

  // Raw counts per section id
  const [counts, setCounts] = useState<Record<string, { correct: string; incorrect: string }>>({});

  // Input refs for auto-advance
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isKpssActive = activeTab === 'kpss';

  // Active section list
  const currentSections = useMemo(() => {
    if (activeTab === 'session' && hasSession) {
      return sessionSections;
    }
    if (activeTab === 'kpss') {
      return kpssMode === 'detailed' ? KPSS_DETAILED_SECTIONS : KPSS_GROUPED_SECTIONS;
    }
    const cat = PRESET_CATEGORIES.find((c) => c.id === activeTab);
    return cat ? cat.sections : PRESET_CATEGORIES[0].sections;
  }, [activeTab, hasSession, sessionSections, kpssMode]);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setPenaltyRatio(tabId === 'lgs' ? 3 : 4);
  };

  // Smart Sync between 5 Ders and GY-GK
  const handleKpssModeToggle = (nextMode: 'detailed' | 'grouped') => {
    if (nextMode === kpssMode) return;

    if (nextMode === 'grouped') {
      const trC = parseInt(counts['kpss-tr']?.correct || '0', 10) || 0;
      const trW = parseInt(counts['kpss-tr']?.incorrect || '0', 10) || 0;
      const matC = parseInt(counts['kpss-math']?.correct || '0', 10) || 0;
      const matW = parseInt(counts['kpss-math']?.incorrect || '0', 10) || 0;

      const histC = parseInt(counts['kpss-hist']?.correct || '0', 10) || 0;
      const histW = parseInt(counts['kpss-hist']?.incorrect || '0', 10) || 0;
      const geoC = parseInt(counts['kpss-geo']?.correct || '0', 10) || 0;
      const geoW = parseInt(counts['kpss-geo']?.incorrect || '0', 10) || 0;
      const citC = parseInt(counts['kpss-cit']?.correct || '0', 10) || 0;
      const citW = parseInt(counts['kpss-cit']?.incorrect || '0', 10) || 0;

      const gyC = trC + matC;
      const gyW = trW + matW;
      const gkC = histC + geoC + citC;
      const gkW = histW + geoW + citW;

      if (gyC > 0 || gyW > 0 || gkC > 0 || gkW > 0) {
        setCounts((prev) => ({
          ...prev,
          'kpss-gy': {
            correct: gyC > 0 ? String(gyC) : (prev['kpss-gy']?.correct || ''),
            incorrect: gyW > 0 ? String(gyW) : (prev['kpss-gy']?.incorrect || ''),
          },
          'kpss-gk': {
            correct: gkC > 0 ? String(gkC) : (prev['kpss-gk']?.correct || ''),
            incorrect: gkW > 0 ? String(gkW) : (prev['kpss-gk']?.incorrect || ''),
          },
        }));
      }
    }
    setKpssMode(nextMode);
  };

  const handleInputChange = (
    sectionId: string, 
    field: 'correct' | 'incorrect', 
    val: string
  ) => {
    const sanitized = val.replace(/[^0-9]/g, '');
    setCounts((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || { correct: '', incorrect: '' }),
        [field]: sanitized,
      },
    }));
  };

  // Keyboard avoidance on mobile: scroll focused input into viewport
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleClearCurrentTab = () => {
    setCounts((prev) => {
      const next = { ...prev };
      currentSections.forEach((sec) => {
        delete next[sec.id];
      });
      return next;
    });
  };

  const handleStep = (
    sectionId: string, 
    field: 'correct' | 'incorrect', 
    delta: number, 
    max?: number
  ) => {
    setCounts((prev) => {
      const current = parseInt(prev[sectionId]?.[field] || '0', 10) || 0;
      const nextVal = Math.max(0, max && max > 0 ? Math.min(max, current + delta) : current + delta);
      return {
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || { correct: '', incorrect: '' }),
          [field]: nextVal === 0 && delta < 0 && !prev[sectionId]?.[field] ? '' : nextVal.toString(),
        },
      };
    });
  };

  const handleSetFull = (sec: QuickSectionPreset) => {
    if (sec.questionCount <= 0) return;
    setCounts((prev) => ({
      ...prev,
      [sec.id]: {
        correct: sec.questionCount.toString(),
        incorrect: '0',
      },
    }));
  };

  // State for target goal
  const [currentTarget, setCurrentTarget] = useState<TargetGoalConfig | null>(null);

  // Active exam title for export & sharing
  const activeExamTitle = useMemo(() => {
    if (activeTab === 'session') {
      return lastFinishedSession?.examTitle || 'Son Seansım';
    } else if (activeTab === 'kpss') {
      return `KPSS ${KPSS_LEVELS[kpssLevel].name} (${KPSS_LEVELS[kpssLevel].scoreType})`;
    } else {
      return PRESET_CATEGORIES.find((c) => c.id === activeTab)?.name || 'Net Raporu';
    }
  }, [activeTab, lastFinishedSession, kpssLevel]);

  // Calculations for current visible sections
  const calculatedResults = useMemo(() => {
    const hasAnyData = currentSections.some((sec) => {
      const entry = counts[sec.id];
      return entry && (entry.correct !== '' || entry.incorrect !== '');
    });

    const items = currentSections.map((sec) => {
      const entry = counts[sec.id] || { correct: '', incorrect: '' };
      const c = parseInt(entry.correct, 10);
      const w = parseInt(entry.incorrect, 10);
      const validC = !isNaN(c) && c >= 0 ? c : 0;
      const validW = !isNaN(w) && w >= 0 ? w : 0;

      const net = Math.max(0, parseFloat((validC - validW / penaltyRatio).toFixed(2)));
      const empty = sec.questionCount > 0 ? Math.max(0, sec.questionCount - (validC + validW)) : 0;
      const isOverLimit = sec.questionCount > 0 && validC + validW > sec.questionCount;

      let timeSpent: number | undefined;
      if (activeTab === 'session' && lastFinishedSession) {
        const matchedCp = lastFinishedSession.checkpoints.find((cp) => cp.id === sec.id);
        if (matchedCp) timeSpent = matchedCp.deltaSeconds;
      }

      return {
        ...sec,
        correct: validC,
        incorrect: validW,
        empty,
        net,
        isOverLimit,
        hasInput: entry.correct !== '' || entry.incorrect !== '',
        timeSpent,
      };
    });

    const totalCorrect = items.reduce((sum, it) => sum + it.correct, 0);
    const totalIncorrect = items.reduce((sum, it) => sum + it.incorrect, 0);
    const totalNet = parseFloat(items.reduce((sum, it) => sum + it.net, 0).toFixed(2));
    const totalQuestions = items.reduce((sum, it) => sum + it.questionCount, 0);
    const totalEmpty = totalQuestions > 0 ? Math.max(0, totalQuestions - (totalCorrect + totalIncorrect)) : 0;

    // Sub-group totals for KPSS
    const gyItems = items.filter((it) => it.group === 'gy');
    const gkItems = items.filter((it) => it.group === 'gk');

    const gyNet = parseFloat(gyItems.reduce((sum, it) => sum + it.net, 0).toFixed(2));
    const gyCorrect = gyItems.reduce((sum, it) => sum + it.correct, 0);
    const gyIncorrect = gyItems.reduce((sum, it) => sum + it.incorrect, 0);

    const gkNet = parseFloat(gkItems.reduce((sum, it) => sum + it.net, 0).toFixed(2));
    const gkCorrect = gkItems.reduce((sum, it) => sum + it.correct, 0);
    const gkIncorrect = gkItems.reduce((sum, it) => sum + it.incorrect, 0);

    // Calculated KPSS Score based on 2020-2025 statistical formula
    const kpssScoreObj = calculateKpssScore(gyNet, gkNet, kpssLevel);

    return {
      items,
      gyItems,
      gkItems,
      gyNet,
      gyCorrect,
      gyIncorrect,
      gkNet,
      gkCorrect,
      gkIncorrect,
      totalCorrect,
      totalIncorrect,
      totalNet,
      totalQuestions,
      totalEmpty,
      hasAnyData,
      kpssScoreObj,
    };
  }, [currentSections, counts, penaltyRatio, activeTab, lastFinishedSession, kpssLevel]);

  // Construct Share Card data object for WhatsApp & PNG export
  const shareCardData: ShareCardData = useMemo(() => {
    const list = isKpssActive && kpssMode === 'detailed'
      ? [...calculatedResults.gyItems, ...calculatedResults.gkItems]
      : calculatedResults.items;

    return {
      title: activeExamTitle,
      totalNet: calculatedResults.totalNet,
      totalQuestions: currentSections.reduce((acc, s) => acc + s.questionCount, 0),
      score: isKpssActive && calculatedResults.kpssScoreObj.score > 0 ? {
        type: calculatedResults.kpssScoreObj.scoreType,
        value: calculatedResults.kpssScoreObj.score,
      } : undefined,
      target: currentTarget && currentTarget.value > 0 ? {
        value: currentTarget.value,
        type: currentTarget.type,
        label: currentTarget.label,
      } : undefined,
      sections: list.map((item) => ({
        name: item.name,
        correct: item.correct,
        incorrect: item.incorrect,
        net: item.net,
        questionCount: item.questionCount,
      })),
    };
  }, [activeExamTitle, calculatedResults, currentSections, isKpssActive, kpssMode, currentTarget]);

  // Helper render for single section row
  const renderSectionCard = (sec: typeof calculatedResults.items[0], index: number, total: number) => {
    return (
      <div
        key={sec.id}
        className={`px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border transition-all ${
          sec.isOverLimit
            ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
            : sec.hasInput
              ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20'
              : 'border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900'
        } flex items-center justify-between gap-1.5 sm:gap-3`}
      >
        {/* Left: Subject Name, Question Count & Quick Full Button */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-zinc-100 whitespace-nowrap">
            {sec.name}
          </span>
          {sec.questionCount > 0 && (
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-zinc-500 shrink-0">
              ({sec.questionCount})
            </span>
          )}
          {sec.questionCount > 0 && (
            <button
              type="button"
              onClick={() => handleSetFull(sec)}
              className="hidden xs:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100/70 dark:bg-emerald-950/50 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer shrink-0"
              title={`${sec.questionCount} Doğru, 0 Yanlış Doldur`}
            >
              Full
            </button>
          )}
          {sec.isOverLimit && (
            <span title="Soru sayısını aştı" className="inline-flex">
              <AlertCircle size={12} className="text-amber-500 shrink-0" />
            </span>
          )}
        </div>

        {/* Right: Stepper Inputs & Net */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Doğru (D) Stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <button
              type="button"
              onClick={() => handleStep(sec.id, 'correct', -1, sec.questionCount)}
              className="w-6 sm:w-7 h-7 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 active:bg-slate-200 dark:active:bg-zinc-800 rounded transition-colors cursor-pointer"
              title="1 Azalt"
            >
              <Minus size={12} />
            </button>

            <div className="flex items-center px-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mr-0.5">D</span>
              <input
                ref={(el) => { inputRefs.current[`${sec.id}-correct`] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={counts[sec.id]?.correct || ''}
                onFocus={handleInputFocus}
                onChange={(e) => handleInputChange(sec.id, 'correct', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    inputRefs.current[`${sec.id}-incorrect`]?.focus();
                  }
                }}
                className="w-7 sm:w-8 h-7 sm:h-8 text-center font-mono font-bold text-xs sm:text-sm bg-transparent focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStep(sec.id, 'correct', +1, sec.questionCount)}
              className="w-6 sm:w-7 h-7 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 active:bg-slate-200 dark:active:bg-zinc-800 rounded transition-colors cursor-pointer"
              title="1 Artır"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Yanlış (Y) Stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <button
              type="button"
              onClick={() => handleStep(sec.id, 'incorrect', -1, sec.questionCount)}
              className="w-6 sm:w-7 h-7 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 active:bg-slate-200 dark:active:bg-zinc-800 rounded transition-colors cursor-pointer"
              title="1 Azalt"
            >
              <Minus size={12} />
            </button>

            <div className="flex items-center px-1">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mr-0.5">Y</span>
              <input
                ref={(el) => { inputRefs.current[`${sec.id}-incorrect`] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={counts[sec.id]?.incorrect || ''}
                onFocus={handleInputFocus}
                onChange={(e) => handleInputChange(sec.id, 'incorrect', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (index < total - 1) {
                      const nextSec = currentSections[index + 1];
                      if (nextSec) inputRefs.current[`${nextSec.id}-correct`]?.focus();
                    }
                  }
                }}
                className="w-7 sm:w-8 h-7 sm:h-8 text-center font-mono font-bold text-xs sm:text-sm bg-transparent focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStep(sec.id, 'incorrect', +1, sec.questionCount)}
              className="w-6 sm:w-7 h-7 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 active:bg-slate-200 dark:active:bg-zinc-800 rounded transition-colors cursor-pointer"
              title="1 Artır"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Calculated Net */}
          <div className="min-w-[36px] sm:min-w-[46px] text-right font-mono font-bold text-xs sm:text-sm shrink-0">
            <span className={sec.net > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}>
              {sec.net}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Net & Puan Hesapla" 
      maxWidth="lg"
      className="sm:max-w-xl"
      contentClassName="p-3 sm:p-5"
      bottomSheet={true}
    >
      <div className="space-y-3">
        {/* Row 1: Exam Category Selector & KPSS Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Exam Selector Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
            {hasSession && (
              <button
                type="button"
                onClick={() => handleSelectTab('session')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  activeTab === 'session'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                }`}
              >
                <Sparkles size={11} />
                <span>Seans</span>
              </button>
            )}

            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectTab(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* KPSS [5 Ders] / [GY • GK] Toggle */}
          {isKpssActive && (
            <div className="p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => handleKpssModeToggle('detailed')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  kpssMode === 'detailed'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                5 Ders
              </button>
              <button
                type="button"
                onClick={() => handleKpssModeToggle('grouped')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  kpssMode === 'grouped'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                GY • GK
              </button>
            </div>
          )}
        </div>

        {/* Row 2: KPSS Education Level Pills (Lisans P3 / Önlisans P93 / Ortaöğretim P94) */}
        {isKpssActive && (
          <div className="flex items-center justify-between gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-zinc-400 pl-1 shrink-0">
              <GraduationCap size={13} className="text-blue-500" />
              <span>Seviye:</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(['lisans', 'onlisans', 'ortaogretim'] as KpssLevel[]).map((lvl) => {
                const conf = KPSS_LEVELS[lvl];
                const isSelected = kpssLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setKpssLevel(lvl)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {conf.name} <span className="text-[10px] opacity-80">({conf.scoreType})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 3: Prominent Net & Hero Score Card */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-blue-950/30 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            {/* Left Column: Net Breakdown & Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Toplam Net
                </span>
                {calculatedResults.hasAnyData && (
                  <button
                    type="button"
                    onClick={handleClearCurrentTab}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Temizle"
                  >
                    <RotateCcw size={10} />
                    <span>Sıfırla</span>
                  </button>
                )}
              </div>

              {/* Net Count with Animated Number */}
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <AnimatedNumber
                  value={calculatedResults.totalNet}
                  decimals={2}
                  duration={700}
                  className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400"
                />
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Net</span>
              </div>

              {/* KPSS GY / GK Sub-splits */}
              {isKpssActive && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono font-bold text-slate-600 dark:text-zinc-400 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    GY: {calculatedResults.gyNet}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    GK: {calculatedResults.gkNet}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Hero Score (KPSS P3/P93/P94 Puanı veya Genel Özet) */}
            {isKpssActive ? (
              <div 
                className="flex flex-col items-end justify-center px-3.5 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-right shrink-0"
                title="2020-2025 ÖSYM Aritmetik & Standart Sapma Ortalaması"
              >
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                  <Award size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{calculatedResults.kpssScoreObj.scoreType} Puanı</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <AnimatedNumber
                    value={calculatedResults.kpssScoreObj.score}
                    decimals={2}
                    duration={750}
                    className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight"
                  />
                  <span className="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-400/80">Puan</span>
                </div>
                <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                  ÖSYM Tahmini
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-end justify-center px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                  {activeTab === 'session' ? 'Seans' : PRESET_CATEGORIES.find((c) => c.id === activeTab)?.name || 'Sınav'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <AnimatedNumber
                    value={calculatedResults.totalNet}
                    decimals={2}
                    duration={700}
                    className="text-2xl sm:text-3xl font-black font-mono text-slate-800 dark:text-zinc-100"
                  />
                  <span className="text-[11px] font-bold text-slate-500">Net</span>
                </div>
                <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                  {currentSections.reduce((acc, s) => acc + s.questionCount, 0)} Soru
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Optional Target Goal Card */}
        <TargetGoalCard
          key={`${activeTab}_${isKpssActive ? kpssLevel : 'std'}`}
          categoryKey={`${activeTab}_${isKpssActive ? kpssLevel : 'std'}`}
          currentValue={calculatedResults.totalNet}
          isKpss={isKpssActive}
          kpssScore={calculatedResults.kpssScoreObj.score}
          kpssScoreType={calculatedResults.kpssScoreObj.scoreType}
          onTargetChange={setCurrentTarget}
        />

        {/* Input Rows List - Single Clean Container */}
        <div className="space-y-1.5 pt-0.5">
          {isKpssActive && kpssMode === 'detailed' ? (
            <>
              {/* GY Subgroup Header */}
              <div className="pt-1 pb-0.5 px-1 flex items-center justify-between text-[11px] font-bold text-blue-700 dark:text-blue-300">
                <span>Genel Yetenek</span>
                <span className="font-mono text-slate-500 dark:text-zinc-400">{calculatedResults.gyNet} net</span>
              </div>
              {calculatedResults.gyItems.map((sec, idx) => 
                renderSectionCard(sec, idx, currentSections.length)
              )}

              {/* GK Subgroup Header */}
              <div className="pt-2 pb-0.5 px-1 flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                <span>Genel Kültür</span>
                <span className="font-mono text-slate-500 dark:text-zinc-400">{calculatedResults.gkNet} net</span>
              </div>
              {calculatedResults.gkItems.map((sec, idx) => 
                renderSectionCard(sec, calculatedResults.gyItems.length + idx, currentSections.length)
              )}
            </>
          ) : (
            currentSections.map((sec, idx) => 
              renderSectionCard(
                calculatedResults.items[idx] || { ...sec, correct: 0, incorrect: 0, empty: 0, net: 0, isOverLimit: false, hasInput: false }, 
                idx, 
                currentSections.length
              )
            )
          )}
        </div>

        {/* Bottom Action Bar: Sharing & Done */}
        <div className="flex items-center justify-between gap-2 pt-3 pb-1 border-t border-slate-200 dark:border-zinc-800 sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
          {calculatedResults.hasAnyData ? (
            <ShareButtonGroup data={shareCardData} />
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Değerleri girdikçe anlık hesaplanır
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="primary"
              onClick={onClose}
              className="h-9 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              <span>{hasSession && activeTab === 'session' ? 'Kaydet ve Kapat' : 'Kapat'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
