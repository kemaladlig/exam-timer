import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { CheckpointList } from './components/checkpoints/CheckpointList';
import { SessionSummaryModal } from './components/stats/SessionSummaryModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { useExamSession, useTimer, useFullscreen, useWakeLock, usePWAInstall } from './hooks';
import type { TimeDisplayFormat, TimerMode, SectionConfig, ExamSession } from './types';
import { EXAM_PRESETS } from './constants/presets';
import { Moon, Sun, ArrowDownUp, FileDown, X, Eye, Timer, Download, Smartphone, CheckCircle2, Settings } from 'lucide-react';
import { Button } from './components/ui/Button';
import { formatDurationHuman } from './utils';

const PRESET_DURATIONS = [
  { label: '130 dk (KPSS)', minutes: 130 },
  { label: '165 dk (TYT)', minutes: 165 },
  { label: '110 dk (AGS)', minutes: 110 },
  { label: '150 dk (ALES)', minutes: 150 },
  { label: '60 dk', minutes: 60 },
  { label: '45 dk', minutes: 45 },
  { label: '30 dk', minutes: 30 },
];

function App() {
  const { 
    activeSession, 
    addCheckpoint, 
    addGenericCheckpoint,
    undoLastCheckpoint,
    removeCheckpoint,
    resetSessionCheckpoints,
    finishSession
  } = useExamSession();

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { canInstall, installApp, showIOSModal, setShowIOSModal } = usePWAInstall();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const handleToggleTheme = () => {
    const nextTheme = !isDarkMode;
    // Modern View Transitions API (Sıfır senkron kayması, ekran görüntüsü üzerinden tek kare crossfade)
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        flushSync(() => {
          setIsDarkMode(nextTheme);
          if (nextTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        });
      });
    } else {
      setIsDarkMode(nextTheme);
    }
  };
  
  // Varsayılan format 'hh:mm:ss' (Saat : Dk : Sn)
  const [timeFormat, setTimeFormat] = useState<TimeDisplayFormat>('hh:mm:ss');
  
  // Ayarlar Modalı ve İlerleme Çubuğu Görünürlük Durumu
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('exam_show_progress_bar');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleProgressBar = (show: boolean) => {
    setShowProgressBar(show);
    localStorage.setItem('exam_show_progress_bar', String(show));
  };

  // Non-blocking report state
  const [lastFinishedSession, setLastFinishedSession] = useState<ExamSession | null>(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  // Dynamic sections state (initialized with KPSS by default)
  const [sections, setSections] = useState<SectionConfig[]>(() => {
    return EXAM_PRESETS.find(p => p.id === 'kpss-lisans')?.sections || [];
  });

  // Mode state: countdown varsayılan
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown');
  const [countdownTotalSeconds, setCountdownTotalSeconds] = useState<number>(130 * 60);

  useEffect(() => {
    const themeColor = isDarkMode ? '#09090b' : '#f8fafc';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Mobil telefonlarda durum çubuğu rengini hem iOS hem Android için anında güncelle
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach(tag => tag.setAttribute('content', themeColor));

    // Chromium / Android cihazlarda durum çubuğu yeniden çizimini tetiklemek için dinamik etiket ekle
    const dynamicId = 'theme-color-dynamic-override';
    const oldDynamic = document.getElementById(dynamicId);
    if (oldDynamic) oldDynamic.remove();
    
    const freshMeta = document.createElement('meta');
    freshMeta.id = dynamicId;
    freshMeta.name = 'theme-color';
    freshMeta.content = themeColor;
    document.head.appendChild(freshMeta);
  }, [isDarkMode]);

  const initialSeconds = timerMode === 'countdown' ? countdownTotalSeconds : 0;

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
  });

  // Ekranı süre akarken sessizce arka planda açık tutuyoruz (UI yazısına gerek yok!)
  useWakeLock(isRunning);

  const handleFinishExam = () => {
    // Çok kısaysa (<30 sn) ve hiç ders kaydedilmediyse rapor üretme, sessizce sıfırla
    if (elapsedSeconds < 30 && activeSession.checkpoints.length === 0) {
      handleQuickReset();
      return;
    }

    if (activeSession && !activeSession.completedAt) {
      const completed: ExamSession = {
        ...activeSession,
        totalElapsedSeconds: elapsedSeconds,
        completedAt: Date.now(),
      };
      setLastFinishedSession(completed);
      finishSession(elapsedSeconds);
      // Modal otomatik açılmasın! Sadece alttaki bildirim çubuğu çıksın.
    }
    
    if (isRunning) toggleTimer(); 
  };

  const handleQuickReset = () => {
    if (isRunning) toggleTimer();
    resetTimer();
    resetSessionCheckpoints();
  };

  const handleChangeMode = (newMode: TimerMode) => {
    if (isRunning) toggleTimer();
    setTimerMode(newMode);
    resetTimer();
  };

  const handleSelectCountdownDuration = (totalSeconds: number) => {
    if (isRunning) toggleTimer();
    setCountdownTotalSeconds(totalSeconds);
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

  const handleApplyPreset = (newSections: SectionConfig[], durationSeconds?: number) => {
    setSections(newSections);
    if (durationSeconds && durationSeconds > 0) {
      setCountdownTotalSeconds(durationSeconds);
    }
    resetTimer();
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
      
      {/* Top Navbar */}
      <header className="px-5 py-3.5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] flex justify-between items-center w-full z-20 sticky top-0 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-sm transition-colors duration-200">
        <div className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Timer size={16} />
          </div>
          <span className="text-slate-900 dark:text-white font-bold">Sınav Kronometresi</span>
          {lastFinishedSession && (
            <button
              onClick={() => setShowDetailedModal(true)}
              className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Son seans raporunu incele"
            >
              <Eye size={12} />
              Son Seans
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
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
            onClick={handleToggleTheme}
            title="Temayı Değiştir"
            className="rounded-full w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </header>

      {/* Top Sticky Minimalist Zen Ambient Line */}
      {showProgressBar && timerMode === 'countdown' && countdownTotalSeconds > 0 && (
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-20 w-full h-[2px] bg-slate-200/50 dark:bg-zinc-800/60 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.35)] transition-all duration-1000 ease-linear rounded-r-full"
            style={{
              width: `${Math.min(100, Math.max(0, (remainingSeconds / countdownTotalSeconds) * 100))}%`
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto z-10">
        
        {/* Timer Section */}
        <div className="flex flex-col items-center justify-center pt-2 md:pt-6 pb-2">
          
          {/* Mode Switch Tabs (Sadece süre başlamadıysa görünür - animasyonlu) */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center ${
            hasStarted 
              ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none mb-0' 
              : 'max-h-16 opacity-100 translate-y-0 mb-2'
          }`}>
            <div className="flex items-center p-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs text-xs font-semibold">
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
          </div>

          {/* Huge Timer Display with Direct Inline Editing (Dakika & Saniye) */}
          <TimerDisplay 
            displayedSeconds={displayedSeconds}
            remainingSeconds={remainingSeconds}
            mode={timerMode}
            format={timeFormat}
            isEditable={timerMode === 'countdown' && !hasStarted}
            onDurationChange={handleSelectCountdownDuration}
          />

          {/* Countdown Quick Presets (Animasyonlu) */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center ${
            timerMode === 'countdown' && !hasStarted
              ? 'max-h-24 opacity-100 translate-y-0 mt-1 mb-3'
              : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none mt-0 mb-0'
          }`}>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md px-4">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.minutes}
                  onClick={() => handleSelectCountdownDuration(preset.minutes * 60)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-transform active:scale-95 cursor-pointer ${
                    countdownTotalSeconds === preset.minutes * 60
                      ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950 dark:border-blue-500 dark:text-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls right next to the timer */}
          <div className="mt-1 w-full max-w-sm px-4 transition-all duration-300">
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

        {/* Scrollable Checkpoints below the timer */}
        <div className="flex-1 w-full bg-slate-100/70 dark:bg-zinc-900/40 border-t border-slate-200/80 dark:border-zinc-800/80 mt-2 flex flex-col justify-between">
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
        onToggleProgressBar={handleToggleProgressBar}
      />
    </div>
  );
}

export default App;
