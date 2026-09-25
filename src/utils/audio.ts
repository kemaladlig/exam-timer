let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  return sharedCtx;
}

/**
 * Süre dolduğunda çalan 4 tonlu tamamlama melodisi (C5-E5-G5-C6).
 * Harici dosya gerektirmez, çevrimdışı çalışır.
 */
export function playCompletionSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const notes = [
      { freq: 523.25, time: 0, dur: 0.5 },
      { freq: 659.25, time: 0.16, dur: 0.5 },
      { freq: 783.99, time: 0.32, dur: 0.6 },
      { freq: 1046.5, time: 0.48, dur: 1.6 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });

    if ('vibrate' in navigator) navigator.vibrate([250, 100, 250, 100, 400]);
  } catch (e) {
    console.warn('Completion sound could not be played:', e);
  }
}

/**
 * Eşik uyarısı: tek, kısa, yumuşak "tık" tonu. Göz/alın dağıtmaz.
 */
export function playThresholdChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);

    if ('vibrate' in navigator) navigator.vibrate(30);
  } catch (e) {
    console.warn('Threshold chime could not be played:', e);
  }
}
