import { useState, useEffect, useCallback, useRef } from 'react';
import { AppLogo } from './components/ui/AppLogo';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { CheckpointList } from './components/checkpoints/CheckpointList';
import { SessionSummaryModal, QuickNetModal } from './components/stats';
import { SettingsModal } from './components/settings';
import {
  useExamSession,
  useTimer,
  useFullscreen,
  useWakeLock,
  usePWAInstall,
  useTheme,
  useUiPrefs,
  useLocalStorage,
} from './hooks';
import type { TimeDisplayFormat, TimerMode, SectionConfig, ExamSession, ExamTemplate } from './types';
import { EXAM_PRESETS } from './constants/presets';
import { Moon, Sun, ArrowDownUp, FileDown, X, Eye, Download, Smartphone, Settings, Calculator, Focus, CheckCircle2 } from 'lucide-react';
import { Button } from './components/ui/Button';
import {
  formatDurationHuman,
  STORAGE_KEYS,
  loadResumeState,
  saveTimerSnapshot,
  playThresholdChime,
} from './utils';

const QUICK_MINUTES = [
  { label: '60 dk', minutes: 60 },
  { label: '45 dk', minutes: 45 },
  { label: '30 dk', minutes: 30 },
  { label: '25 dk (Pomo)', minutes: 25 },
];

function App() {
  const { 
    activeSession, 
    updateSessionConfig,
    addCheckpoint, 
    addGenericCheckpoint,
    undoLastCheckpoint,
    removeCheckpoint,
    resetSessionCheckpoints,
    finishSession
  } = useExamSession();

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { canInstall, installApp, showIOSModal, setShowIOSModal } = usePWAInstall();
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    showProgressBar,
    toggleProgressBar,
    zenMode,
    toggleZenMode,
    thresholdAlerts,
    toggleThresholdAlerts,
  } = useUiPrefs();

  const [timeFormat, setTimeFormat] = useState<TimeDisplayFormat>('hh:mm:ss');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Kalıcı kurulum (mod, süre, seçili şablon, dersler)
  const [timerMode, setTimerMode] = useLocalStorage<TimerMode>(STORAGE_KEYS.timerMode, 'countdown');
  const [countdownTotalSeconds, setCountdownTotalSeconds] = useLocalStorage<number>(
    STORAGE_KEYS.durationSeconds,
    130 * 60,
  );
  const [selectedPresetId, setSelectedPresetId] = useLocalStorage<string | null>(
    STORAGE_KEYS.selectedPresetId,
    'kpss-lisans',
  );
  const [sections, setSections] = useLocalStorage<SectionConfig[]>(
    STORAGE_KEYS.sections,
    EXAM_PRESETS.find((p) => p.id === 'kpss-lisans')?.sections ?? [],
  );

  // Yüklemede kalıcı sayaç durumunu bir kez oku
  const [resumeState] = useState(loadResumeState);

  // Non-blocking report state — tamamlanmışsa kalıcı oturumdan geri yükle
  const [lastFinishedSession, setLastFinishedSession] = useState<ExamSession | null>(() =>
    activeSession.completedAt ? activeSession : null,
  );
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [isNetModalOpen, setIsNetModalOpen] = useState(false);

  const initialSeconds = timerMode === 'countdown' ? countdownTotalSeconds : 0;

  const handleThreshold = useCallback(() => {
    if (thresholdAlerts) playThresholdChime();
  }, [thresholdAlerts]);

  const handleTimerFinish = () => {
    handleFinishExam();
  };

  const { 
    elapsedSeconds, 
    remainingSeconds,
    displayedSeconds,
    isRunning, 
    toggleTimer, 
    resetTimer 
  } = useTimer({
    initialSeconds,
    mode: timerMode,
    onFinish: handleTimerFinish,
    onThreshold: handleThreshold,
    resumeElapsedSeconds: resumeState.elapsedSeconds,
    resumeRunning: resumeState.running,
  });

  // Ekranı süre akarken sessizce arka planda açık tutuyoruz (UI yazısına gerek yok!)
  useWakeLock(isRunning);

  // Sayaç durumu snapshot'ı için en güncel değerler (yalnızca olay/effect içinde okunur)
  const timerStateRef = useRef({ running: isRunning, elapsed: elapsedSeconds });
  useEffect(() => {
    timerStateRef.current = { running: isRunning, elapsed: elapsedSeconds };
  });

  useEffect(() => {
    const persist = () => {
      const { running, elapsed } = timerStateRef.current;
      saveTimerSnapshot(running, elapsed);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') persist();
    };
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', persist);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Başlat/duraklat geçişinde anında kaydet (tick başına değil)
  useEffect(() => {
    const { running, elapsed } = timerStateRef.current;
    saveTimerSnapshot(running, elapsed);
  }, [isRunning]);

  const handleQuickReset = useCallback(() => {
    if (isRunning) toggleTimer();
    resetTimer();
    resetSessionCheckpoints();
    saveTimerSnapshot(false, 0);
  }, [isRunning, toggleTimer, resetTimer, resetSessionCheckpoints]);

  const handleFinishExam = useCallback(() => {
    // Çok kısaysa (<30 sn) ve hiç ders kaydedilmediyse rapor üretme, sessizce sıfırla
    if (elapsedSeconds < 30 && activeSession.checkpoints.length === 0) {
      handleQuickReset();
      return;
    }

    if (activeSession && !activeSession.completedAt) {
      const finishTime = Date.now();
      const completed: ExamSession = {
        ...activeSession,
        totalElapsedSeconds: elapsedSeconds,
        completedAt: finishTime,
      };
      setLastFinishedSession(completed);
      finishSession(elapsedSeconds);
      // Modal otomatik açılmasın! Sadece alttaki bildirim çubuğu çıksın.
    }
    
    if (isRunning) toggleTimer(); 
  }, [elapsedSeconds, activeSession, finishSession, isRunning, toggleTimer, handleQuickReset]);

  const handleChangeMode = (newMode: TimerMode) => {
    if (isRunning) toggleTimer();
    setTimerMode(newMode);
    resetTimer();
  };

  // Sınav Şablonu Seçimi (Süre ve Dersleri Tam Senkronize Eder)
  const handleSelectExamPreset = useCallback((preset: ExamTemplate) => {
    if (isRunning) toggleTimer();
    setSelectedPresetId(preset.id);
    setSections(preset.sections);
    setCountdownTotalSeconds(preset.totalDurationSeconds);
    setTimerMode('countdown');
    updateSessionConfig(preset.name, preset.totalDurationSeconds, preset.id);
    resetTimer();
    resetSessionCheckpoints();
  }, [isRunning, toggleTimer, updateSessionConfig, resetTimer, resetSessionCheckpoints, setSelectedPresetId, setSections, setCountdownTotalSeconds, setTimerMode]);

  // Hızlı Süre Seçimi (Dakika)
  const handleSelectCustomDuration = useCallback((minutes: number) => {
    if (isRunning) toggleTimer();
    setSelectedPresetId(null);
    setCountdownTotalSeconds(minutes * 60);
    setTimerMode('countdown');
    updateSessionConfig(`${minutes} Dk Deneme`, minutes * 60, 'custom');
    resetTimer();
    resetSessionCheckpoints();
  }, [isRunning, toggleTimer, updateSessionConfig, resetTimer, resetSessionCheckpoints, setSelectedPresetId, setCountdownTotalSeconds, setTimerMode]);

  const handleSelectCountdownDuration = (totalSeconds: number) => {
    if (isRunning) toggleTimer();
    setSelectedPresetId(null);
    setCountdownTotalSeconds(totalSeconds);
    updateSessionConfig('Özel Süreli Deneme', totalSeconds);
    resetTimer();
  };

  // Section management functions
  const handleAddSection = (name: string) => {
    const newSec: SectionConfig = {
      id: 'sec-' + Date.now(),
      name,
    };
    setSections(prev => [...prev, newSec]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const handleApplyPreset = (newSections: SectionConfig[], durationSeconds?: number, presetName?: string) => {
    setSections(newSections);
    if (durationSeconds && durationSeconds > 0) {
      setCountdownTotalSeconds(durationSeconds);
      updateSessionConfig(presetName || 'Özel Deneme', durationSeconds);
    }
    resetTimer();
    resetSessionCheckpoints();
  };

  const handleDirectDownloadReport = (sessionToDownload: ExamSession) => {
    const header = `Sınav Raporu: ${sessionToDownload.examTitle}\nTarih: ${new Date(sessionToDownload.startedAt).toLocaleString()}\nToplam Süre: ${formatDurationHuman(sessionToDownload.totalElapsedSeconds)}\n\n`;
    const details = sessionToDownload.checkpoints.map((cp, idx) => {
      return `#${idx + 1} - ${cp.sectionName}: ${cp.deltaSeconds}sn`;
    }).join('\n');
    
    const blob = new Blob([header + details], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sinav_Raporu_${sessionToDownload.examTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const hasStarted = elapsedSeconds > 0 || isRunning;

  return (
    <div className="min-h-screen flex-1 flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans relative transition-colors duration-200">
      
      {/* Zen Modu için Minimalist Köşe Butonu (Yazısız, Yumuşak Giriş/Çıkış Animasyonlu) */}
      <div className={`fixed top-3.5 right-3.5 z-30 transition-zen-smooth ${
        zenMode 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 -translate-y-2 scale-90 pointer-events-none'
      }`}>
        <button
          type="button"
          onClick={() => toggleZenMode(false)}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 text-indigo-600 dark:text-indigo-400 opacity-50 hover:opacity-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs flex items-center justify-center"
          title="Zen Modundan Çık"
          aria-label="Zen Modundan Çık"
        >
          <Focus size={16} />
        </button>
      </div>

      {/* Top Navbar (Zen Moduna Yumuşakça Kapanıp Açılan Animasyon) */}
      <div className={`w-full z-20 sticky top-0 grid transition-zen-grid bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-sm ${
        zenMode ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'
      }`}>
        <div className="overflow-hidden">
          <header className="px-4 sm:px-5 py-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <AppLogo size={30} className="shadow-xs" />
              {lastFinishedSession && (
                <button
                  onClick={() => setShowDetailedModal(true)}
                  className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Son seans raporunu incele"
                >
                  <Eye size={12} />
                  <span>Son Seans</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zen Modu Hızlı Açma Butonu */}
              <button
                type="button"
                onClick={() => toggleZenMode(true)}
                className="w-9 h-9 rounded-lg font-medium border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                title="Zen Modu (Tam Odak)"
                aria-label="Zen Modu"
              >
                <Focus size={17} />
              </button>

              {/* Net Hesapla Butonu */}
              <button
                type="button"
                onClick={() => setIsNetModalOpen(true)}
                className="h-9 px-2.5 sm:px-3 rounded-lg font-bold text-xs border border-blue-200 dark:border-blue-900/60 bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Hızlı Net Hesaplayıcı"
              >
                <Calculator size={15} className="text-blue-600 dark:text-blue-400" />
                <span className="hidden xs:inline">Net Hesapla</span>
              </button>

              {/* Uygulamayı Yükle Butonu (Sadece ikon, animasyonlu) */}
              {canInstall && (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${
                  hasStarted ? 'max-w-0 opacity-0 pointer-events-none scale-90' : 'max-w-xs opacity-100 scale-100'
                }`}>
                  <button
                    type="button"
                    onClick={installApp}
                    className="w-9 h-9 rounded-lg font-medium border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                    title="Uygulamayı Cihazına Yükle"
                  >
                    <Download size={16} className="text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              )}

              {/* Görünüm ve Ayarlar Butonu */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="w-9 h-9 rounded-lg font-medium border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                title="Görünüm ve Ayarlar"
              >
                <Settings size={17} className="text-slate-600 dark:text-zinc-300" />
              </button>

              {/* Tema Değiştirici */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title="Temayı Değiştir"
                className="rounded-full w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
          </header>
        </div>
      </div>

      {/* Top Sticky Minimalist Zen Ambient Line */}
      {showProgressBar && timerMode === 'countdown' && countdownTotalSeconds > 0 && (
        <div className={`sticky ${zenMode ? 'top-0' : 'top-[calc(3.5rem+env(safe-area-inset-top,0px))]'} z-20 w-full h-[2px] bg-slate-200/50 dark:bg-zinc-800/60 overflow-hidden pointer-events-none`}>
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-r-full ${
              remainingSeconds <= 60
                ? 'bg-rose-500/80 dark:bg-rose-500/70 shadow-[0_0_8px_rgba(244,63,94,0.28)]'
                : remainingSeconds <= 300
                  ? 'bg-amber-500/80 dark:bg-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                  : 'bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.35)]'
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, (remainingSeconds / countdownTotalSeconds) * 100))}%`
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-between overflow-y-auto z-10 w-full">
        
        {/* Timer & Controls Master Section (Sabit, Sarsıntısız ve Ortalanmış) */}
        <div className={`flex-1 flex flex-col items-center justify-center w-full px-2 py-4 sm:py-6 transition-zen-smooth ${
          zenMode ? 'my-auto' : ''
        }`}>
          
          {/* Sınav Tipi & Mod Seçim Bölümü (SÜRENİN ÜSTÜNDE - Sarsıntısız Grid Kapanma) */}
          <div className={`w-full grid transition-zen-grid ${
            hasStarted || zenMode
              ? 'grid-rows-[0fr] opacity-0 pointer-events-none' 
              : 'grid-rows-[1fr] opacity-100 mb-3'
          }`}>
            <div className="overflow-hidden flex flex-col items-center justify-center w-full px-3">
              {/* 1. Mod Seçimi (Geri Sayım / Kronometre) */}
              <div className="flex items-center p-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs text-xs font-semibold mb-2">
                <button
                  onClick={() => handleChangeMode('countdown')}
                  className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    timerMode === 'countdown'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownUp size={13} />
                  Geri Sayım
                </button>
                <button
                  onClick={() => handleChangeMode('stopwatch')}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    timerMode === 'stopwatch'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Kronometre
                </button>
              </div>

              {/* 2. Sınav Tipi & Süre Preseti Barı (Tek Satır, Yana Kaydırılabilir) */}
              {timerMode === 'countdown' && (
                <div className="w-full max-w-xl px-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth">
                    {EXAM_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id && countdownTotalSeconds === preset.totalDurationSeconds;
                      const minutes = Math.round(preset.totalDurationSeconds / 60);

                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectExamPreset(preset)}
                          className={`shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-semibold border transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                          title={`${preset.name} - ${minutes} Dakika (${preset.sections.length} Ders)`}
                        >
                          <span>{preset.name}</span>
                          <span className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                            ({minutes} dk)
                          </span>
                        </button>
                      );
                    })}

                    {/* Ayraç */}
                    <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700 mx-1 shrink-0" />

                    {/* Hızlı Dakika Butonları */}
                    {QUICK_MINUTES.map((quick) => {
                      const isSelected = selectedPresetId === null && countdownTotalSeconds === quick.minutes * 60;
                      return (
                        <button
                          key={quick.minutes}
                          onClick={() => handleSelectCustomDuration(quick.minutes)}
                          className={`shrink-0 whitespace-nowrap text-xs px-2.5 py-1.5 rounded-full font-semibold border transition-all active:scale-95 cursor-pointer shadow-xs ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-500/20'
                              : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {quick.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Huge Timer Display (Süreyi Doğrudan Değiştirme Desteğiyle) */}
          <TimerDisplay 
            displayedSeconds={displayedSeconds}
            remainingSeconds={remainingSeconds}
            mode={timerMode}
            format={timeFormat}
            isEditable={timerMode === 'countdown' && !hasStarted}
            onDurationChange={handleSelectCountdownDuration}
          />

          {/* Controls - Doğrudan Sürenin Altında ve Birleşik */}
          <div className="mt-3 w-full max-w-sm px-4">
             <TimerControls 
                isRunning={isRunning}
                isFullscreen={isFullscreen}
                onToggleTimer={toggleTimer}
                onFinishSession={handleFinishExam}
                onResetTimer={handleQuickReset}
                onToggleFullscreen={toggleFullscreen}
                hasStarted={hasStarted}
                isFinished={!!activeSession.completedAt}
              />
          </div>
        </div>

        {/* Content Section: Zen Modunda Sarsıntısız Kapanan Ders Listesi Grid'i */}
        <div className={`w-full grid transition-zen-grid border-t ${
          zenMode 
            ? 'grid-rows-[0fr] opacity-0 border-transparent pointer-events-none' 
            : 'grid-rows-[1fr] opacity-100 border-slate-200/80 dark:border-zinc-800/80 bg-slate-100/70 dark:bg-zinc-900/40'
        }`}>
          <div className="overflow-hidden flex flex-col justify-between">
            <div className={`flex-1 transition-opacity duration-300 ${hasStarted ? 'opacity-100' : 'opacity-95'}`}>
              <CheckpointList 
                sections={sections} 
                checkpoints={activeSession.checkpoints}
                onCompleteSection={(id, name, qc) => addCheckpoint(id, name, elapsedSeconds, qc)}
                onGenericCheckpoint={(name) => addGenericCheckpoint(elapsedSeconds, name)}
                onUndoLastCheckpoint={undoLastCheckpoint}
                onRemoveCheckpoint={removeCheckpoint}
                onAddSection={handleAddSection}
                onRemoveSection={handleRemoveSection}
                onApplyPreset={handleApplyPreset}
                hasStarted={hasStarted}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Engellemeyen Zarif Seans Özeti Bildirimi */}
      {lastFinishedSession && (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-between gap-3 text-slate-900 dark:text-white">
            <div className="min-w-0 flex-1 pl-1">
              <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Seans Tamamlandı</span>
              </div>
              <div className="text-xs sm:text-sm font-mono tabular-nums text-slate-600 dark:text-zinc-400 font-semibold truncate mt-0.5">
                {formatDurationHuman(lastFinishedSession.totalElapsedSeconds)} • {lastFinishedSession.checkpoints.length} ders
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDirectDownloadReport(lastFinishedSession)}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Raporu indir"
              >
                <FileDown size={17} />
                <span>İndir</span>
              </button>
              <button
                onClick={() => setShowDetailedModal(true)}
                className="h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Tabloyu incele"
              >
                <Eye size={17} />
                <span>İncele</span>
              </button>
              <button
                onClick={() => setLastFinishedSession(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Kapat"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İsteğe bağlı detay modalı */}
      <SessionSummaryModal 
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
        session={lastFinishedSession}
        onUpdateSession={(updated) => setLastFinishedSession(updated)}
        onRestart={() => {
          setShowDetailedModal(false);
          setLastFinishedSession(null);
          handleQuickReset();
        }}
      />

      {/* iOS Safari İçin Şık Ana Ekrana Ekle Rehber Modalı */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-zinc-100">
                <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
                <span>Ana Ekrana Ekle</span>
              </div>
              <button 
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Safari tarayıcısında Sınav Kronometresi'ni adres çubuğu olmadan, tam ekran bir uygulama gibi kullanmak için:
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <span>Alttaki <strong>Paylaş (Share)</strong> simgesine dokun.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <span>Açılan menüden <strong>"Ana Ekrana Ekle"</strong>yi seç.</span>
              </div>
            </div>

            <Button 
              fullWidth 
              size="sm" 
              variant="primary" 
              onClick={() => setShowIOSModal(false)}
              className="rounded-xl font-semibold cursor-pointer"
            >
              Anladım
            </Button>
          </div>
        </div>
      )}

      {/* Görünüm ve Ayarlar Modalı */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        timeFormat={timeFormat}
        onChangeTimeFormat={setTimeFormat}
        showProgressBar={showProgressBar}
        onToggleProgressBar={toggleProgressBar}
        zenMode={zenMode}
        onToggleZenMode={toggleZenMode}
        thresholdAlerts={thresholdAlerts}
        onToggleThresholdAlerts={toggleThresholdAlerts}
      />

      {/* Hızlı Net Hesaplayıcı Modalı (Menü / Sekme / Buton ile doğrudan erişim) */}
      <QuickNetModal
        isOpen={isNetModalOpen}
        onClose={() => setIsNetModalOpen(false)}
        lastFinishedSession={lastFinishedSession}
      />
    </div>
  );
}

export default App;
