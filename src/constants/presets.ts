import type { ExamTemplate } from '../types';

export const EXAM_PRESETS: ExamTemplate[] = [
  {
    id: 'kpss-lisans',
    name: 'KPSS Lisans',
    description: '130 Dakika - Türkçe (30), Matematik (30), Tarih (27), Coğrafya (18), Vatandaşlık (15)',
    defaultMode: 'countdown',
    totalDurationSeconds: 130 * 60, // 130 minutes
    sections: [
      { id: 'kpss-tr', name: 'Türkçe', questionCount: 30 },
      { id: 'kpss-math', name: 'Matematik', questionCount: 30 },
      { id: 'kpss-hist', name: 'Tarih', questionCount: 27 },
      { id: 'kpss-geo', name: 'Coğrafya', questionCount: 18 },
      { id: 'kpss-cit', name: 'Vatandaşlık', questionCount: 15 },
    ],
  },
  {
    id: 'yks-tyt',
    name: 'YKS - TYT',
    description: '165 Dakika - Türkçe, Sosyal, Matematik, Fen',
    defaultMode: 'countdown',
    totalDurationSeconds: 165 * 60, // 165 minutes
    sections: [
      { id: 'tyt-tr', name: 'Türkçe', questionCount: 40 },
      { id: 'tyt-sos', name: 'Sosyal Bilimler', questionCount: 20 },
      { id: 'tyt-mat', name: 'Temel Matematik', questionCount: 40 },
      { id: 'tyt-fen', name: 'Fen Bilimleri', questionCount: 20 },
    ],
  },
  {
    id: 'meb-ags',
    name: 'MEB - AGS',
    description: '110 Dakika - Türkçe, Matematik, Tarih, Coğrafya, Eğitimin Temelleri, Mevzuat',
    defaultMode: 'countdown',
    totalDurationSeconds: 110 * 60, // 110 minutes
    sections: [
      { id: 'ags-tr', name: 'Türkçe' },
      { id: 'ags-mat', name: 'Matematik' },
      { id: 'ags-tar', name: 'Tarih' },
      { id: 'ags-cog', name: 'Coğrafya' },
      { id: 'ags-egt', name: 'Eğitimin Temelleri' },
      { id: 'ags-mev', name: 'Türk Milli Eğitim Mevzuatı' },
    ],
  },
  {
    id: 'osym-ales',
    name: 'ÖSYM - ALES',
    description: '150 Dakika - Sayısal (50), Sözel (50)',
    defaultMode: 'countdown',
    totalDurationSeconds: 150 * 60, // 150 minutes
    sections: [
      { id: 'ales-say', name: 'Sayısal', questionCount: 50 },
      { id: 'ales-soz', name: 'Sözel', questionCount: 50 },
    ],
  },
];
