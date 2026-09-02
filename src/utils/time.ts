import type { TimeDisplayFormat } from '../types';

/**
 * Formats seconds into a string based on the provided format.
 * Absolutely NO milliseconds to prevent visual fatigue.
 */
export const formatSeconds = (totalSeconds: number, format: TimeDisplayFormat = 'mm:ss'): string => {
  if (totalSeconds < 0) totalSeconds = 0;

  const seconds = totalSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, '0');

  // Sadece dakika: "130 dk"
  if (format === 'm_only') {
    const totalMinutes = Math.floor(totalSeconds / 60);
    return `${totalMinutes} dk`;
  }

  // Saat : Dakika : Saniye ("02:10:00")
  if (format === 'hh:mm:ss') {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  // Varsayılan Dakika : Saniye ("130:00", "129:59", "45:00")
  // Öğrencilerin sınavda en çok tercih ettiği mod: saat cinsine bölmeden toplam dakika:saniye gösterir!
  const totalMinutes = Math.floor(totalSeconds / 60);
  const paddedMinutes = String(totalMinutes).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
};

/**
 * Human-readable duration format (e.g. "2 saat 10 dk" or "45 dk")
 */
export const formatDurationHuman = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) return `${hours} saat ${minutes} dk`;
  if (hours > 0) return `${hours} saat`;
  return `${minutes} dk`;
};
