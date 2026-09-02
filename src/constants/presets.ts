import type { ExamTemplate } from '../types';

export const EXAM_PRESETS: ExamTemplate[] = [
  {
    id: 'kpss-lisans',
    name: 'KPSS Lisans (Genel Yetenek - Genel Kültür)',
    description: '130 Minutes - Turkish, Math, History, Geography, Citizenship',
    defaultMode: 'countdown',
    totalDurationSeconds: 130 * 60, // 130 minutes
    sections: [
      { id: 'kpss-tr', name: 'Türkçe' },
      { id: 'kpss-math', name: 'Matematik' },
      { id: 'kpss-hist', name: 'Tarih' },
      { id: 'kpss-geo', name: 'Coğrafya' },
      { id: 'kpss-cit', name: 'Vatandaşlık & Güncel' },
    ],
  },
  {
    id: 'kpss-standart',
    name: 'KPSS Standart',
    description: '120 Minutes - Standard exam without extra time',
    defaultMode: 'countdown',
    totalDurationSeconds: 120 * 60, // 120 minutes
    sections: [
      { id: 'kpss-std-tr', name: 'Türkçe' },
      { id: 'kpss-std-math', name: 'Matematik' },
      { id: 'kpss-std-hist', name: 'Tarih' },
      { id: 'kpss-std-geo', name: 'Coğrafya' },
      { id: 'kpss-std-cit', name: 'Vatandaşlık' },
    ],
  },
  {
    id: 'yks-tyt',
    name: 'YKS - TYT',
    description: '165 Minutes - Turkish, Social, Math, Science',
    defaultMode: 'countdown',
    totalDurationSeconds: 165 * 60, // 165 minutes
    sections: [
      { id: 'tyt-tr', name: 'Türkçe' },
      { id: 'tyt-sos', name: 'Sosyal Bilimler' },
      { id: 'tyt-mat', name: 'Temel Matematik' },
      { id: 'tyt-fen', name: 'Fen Bilimleri' },
    ],
  },
];
