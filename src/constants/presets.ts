import type { ExamTemplate } from '../types';

export const EXAM_PRESETS: ExamTemplate[] = [
  {
    id: 'kpss-lisans',
    name: 'KPSS',
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
    name: 'TYT',
    description: '165 Dakika - Türkçe (40), Sosyal Bilimler (20), Temel Matematik (40), Fen Bilimleri (20)',
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
    id: 'yks-ayt',
    name: 'AYT',
    description: '180 Dakika - Matematik (40), Fizik (14), Kimya (13), Biyoloji (13), Edebiyat (24), Tarih (10), Coğrafya (6)',
    defaultMode: 'countdown',
    totalDurationSeconds: 180 * 60, // 180 minutes
    sections: [
      { id: 'ayt-mat', name: 'Matematik', questionCount: 40 },
      { id: 'ayt-fiz', name: 'Fizik', questionCount: 14 },
      { id: 'ayt-kim', name: 'Kimya', questionCount: 13 },
      { id: 'ayt-biy', name: 'Biyoloji', questionCount: 13 },
      { id: 'ayt-edb', name: 'Edebiyat', questionCount: 24 },
      { id: 'ayt-tar', name: 'Tarih-1', questionCount: 10 },
      { id: 'ayt-cog', name: 'Coğrafya-1', questionCount: 6 },
    ],
  },
  {
    id: 'osym-ales',
    name: 'ALES',
    description: '150 Dakika - Sayısal (50), Sözel (50)',
    defaultMode: 'countdown',
    totalDurationSeconds: 150 * 60, // 150 minutes
    sections: [
      { id: 'ales-say', name: 'Sayısal', questionCount: 50 },
      { id: 'ales-soz', name: 'Sözel', questionCount: 50 },
    ],
  },
];

