/**
 * Minimalist & High-Resolution Sharing Utilities for Exam Timer
 */

export interface ShareCardData {
  title: string;
  subtitle?: string;
  totalNet: number;
  totalQuestions?: number;
  score?: {
    type: string;
    value: number;
    description?: string;
  };
  target?: {
    value: number;
    type: 'net' | 'score';
    label: string;
  };
  sections: Array<{
    name: string;
    correct: number;
    incorrect: number;
    net: number;
    questionCount?: number;
    durationFormatted?: string;
  }>;
  totalDurationFormatted?: string;
  dateStr?: string;
}

/**
 * Clean & Professional plain-text WhatsApp format (No emoji clutter)
 */
export function formatWhatsAppReport(data: ShareCardData): string {
  const date = data.dateStr || new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  
  let msg = `*${data.title.toUpperCase()}*\n`;
  msg += `Tarih: ${date} • ${time}\n`;
  if (data.totalDurationFormatted) {
    msg += `Süre: ${data.totalDurationFormatted}\n`;
  }
  msg += `\n`;

  // Hero Stats
  msg += `Toplam Net: *${data.totalNet.toFixed(2)}*`;
  if (data.totalQuestions && data.totalQuestions > 0) {
    msg += ` (${data.totalQuestions} Soru)`;
  }
  msg += `\n`;

  if (data.score && data.score.value > 0) {
    msg += `${data.score.type} Puanı: *${data.score.value.toFixed(2)}*\n`;
  }

  // Target comparison if available
  if (data.target && data.target.value > 0) {
    const currentVal = data.target.type === 'score' && data.score ? data.score.value : data.totalNet;
    const diff = currentVal - data.target.value;
    const percent = Math.round((currentVal / data.target.value) * 100);
    
    if (diff >= 0) {
      msg += `Hedef: ${data.target.value} ${data.target.label} (Ulaşıldı: +${diff.toFixed(2)} • %${percent})\n`;
    } else {
      msg += `Hedef: ${data.target.value} ${data.target.label} (Kalan: ${Math.abs(diff).toFixed(2)} • %${percent})\n`;
    }
  }

  msg += `\nDers Dağılımı:\n`;

  data.sections.forEach((sec) => {
    if (sec.correct > 0 || sec.incorrect > 0 || sec.net !== 0) {
      const timeInfo = sec.durationFormatted ? ` (${sec.durationFormatted})` : '';
      msg += `• ${sec.name}: ${sec.correct} D / ${sec.incorrect} Y → *${sec.net.toFixed(2)} Net*${timeInfo}\n`;
    }
  });

  msg += `\nSınav Kronometresi`;

  return msg;
}

/**
 * Open WhatsApp with encoded text
 */
export function shareToWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = `whatsapp://send?text=${encoded}`;
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }, 700);
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
  }
}

/**
 * Generate Ultra High-Definition Minimalist Card Image (3x Scale Canvas)
 */
export async function generateScoreCardImage(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context not supported');

  const width = 720;
  const baseHeight = 360;
  const activeSections = data.sections.filter(s => s.correct > 0 || s.incorrect > 0 || s.net !== 0);
  const rowsCount = Math.max(1, activeSections.length);
  const rowsHeight = rowsCount * 40;
  const targetHeight = data.target && data.target.value > 0 ? 64 : 0;
  const height = baseHeight + rowsHeight + targetHeight;

  // Ultra HD 3x Retina resolution
  const scale = 3;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Background - Modern Dark Slate
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // Outer Border (Hairline)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(data.title, 40, 56);

  // Subtitle / Date
  const dateText = data.dateStr || new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeText = data.totalDurationFormatted ? ` • Süre: ${data.totalDurationFormatted}` : '';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${dateText}${timeText}`, 40, 78);

  // Top Right Minimal Label
  ctx.fillStyle = '#334155';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('SINAV RAPORU', width - 136, 56);

  // Divider
  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(40, 96);
  ctx.lineTo(width - 40, 96);
  ctx.stroke();

  // Metrics Row
  const boxY = 112;
  const boxHeight = 88;
  const boxWidth = (width - 80 - 16) / 2;

  // Box 1: Total Net
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(40, boxY, boxWidth, boxHeight, 10);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TOPLAM NET', 56, boxY + 26);

  ctx.fillStyle = '#38bdf8'; // sky-400
  ctx.font = '700 32px "SF Mono", "Fira Code", monospace';
  ctx.fillText(data.totalNet.toFixed(2), 56, boxY + 64);

  // Box 2: Score or Question Count
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(40 + boxWidth + 16, boxY, boxWidth, boxHeight, 10);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  if (data.score && data.score.value > 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${data.score.type.toUpperCase()} PUANI`, 40 + boxWidth + 32, boxY + 26);

    ctx.fillStyle = '#34d399'; // emerald-400
    ctx.font = '700 32px "SF Mono", "Fira Code", monospace';
    ctx.fillText(data.score.value.toFixed(2), 40 + boxWidth + 32, boxY + 64);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TOPLAM SORU', 40 + boxWidth + 32, boxY + 26);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 32px "SF Mono", "Fira Code", monospace';
    ctx.fillText(String(data.totalQuestions || 0), 40 + boxWidth + 32, boxY + 64);
  }

  let curY = boxY + boxHeight + 16;

  // Optional Target Box
  if (data.target && data.target.value > 0) {
    const currentVal = data.target.type === 'score' && data.score ? data.score.value : data.totalNet;
    const progress = Math.min(1, Math.max(0, currentVal / data.target.value));
    const percent = Math.round((currentVal / data.target.value) * 100);
    const diff = currentVal - data.target.value;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(40, curY, width - 80, 50, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Hedef: ${data.target.value.toFixed(1)} ${data.target.label}`, 56, curY + 20);

    const statusText = diff >= 0
      ? `Ulaşıldı (+${diff.toFixed(2)}) • %${percent}`
      : `Kalan: ${Math.abs(diff).toFixed(2)} • %${percent}`;
    ctx.fillStyle = diff >= 0 ? '#34d399' : '#38bdf8';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const statusW = ctx.measureText(statusText).width;
    ctx.fillText(statusText, width - 56 - statusW, curY + 20);

    // Track
    const barW = width - 112;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(56, curY + 30, barW, 6, 3);
    ctx.fill();

    // Fill
    const fillW = Math.max(6, barW * progress);
    ctx.fillStyle = diff >= 0 ? '#10b981' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(56, curY + 30, fillW, 6, 3);
    ctx.fill();

    curY += 64;
  }

  // Section Table Header
  ctx.fillStyle = '#475569';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DERS', 56, curY + 12);
  ctx.fillText('D / Y', width - 230, curY + 12);
  ctx.fillText('NET', width - 86, curY + 12);

  curY += 22;

  // Section Rows
  const renderList = activeSections.length > 0 ? activeSections : data.sections;
  renderList.forEach((sec, i) => {
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(40, curY - 12, width - 80, 32);
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(sec.name, 56, curY + 8);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "SF Mono", monospace';
    ctx.fillText(`${sec.correct} D / ${sec.incorrect} Y`, width - 230, curY + 8);

    ctx.fillStyle = sec.net > 0 ? '#38bdf8' : '#64748b';
    ctx.font = '700 13px "SF Mono", monospace';
    ctx.fillText(sec.net.toFixed(2), width - 86, curY + 8);

    curY += 32;
  });

  // Footer Watermark
  curY += 16;
  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(40, curY);
  ctx.lineTo(width - 40, curY);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Sınav Kronometresi', 56, curY + 20);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

/**
 * Share image via Web Share API or download as PNG
 */
export async function shareOrDownloadScoreImage(data: ShareCardData): Promise<'shared' | 'downloaded'> {
  const blob = await generateScoreCardImage(data);
  const fileName = `Sinav_Raporu_${data.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `${data.title} Sonuç Kartı`,
        text: `${data.title} - Toplam Net: ${data.totalNet.toFixed(2)}`,
        files: [file],
      });
      return 'shared';
    } catch {
      // User cancelled share dialog
    }
  }

  // Fallback direct download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'downloaded';
}
