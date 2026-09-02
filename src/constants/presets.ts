import type { ExamTemplate } from '../types';

export const EXAM_PRESETS: ExamTemplate[] = [
  {
    id: 'kpss-lisans',
    name: 'KPSS Lisans (Genel Yetenek - Genel Kültür)',
    description: '130 Minutes - Turkish, Math, History, Geography, Citizenship',
    defaultMode: 'countdown',
    totalDurationSeconds: 130 * 60, // 130 minutes
    sections: [
      { id: 'kpss-tr', name: 'Türkçe', questionCount: 30 },
      { id: 'kpss-math', name: 'Matematik', questionCount: 30 },
      { id: 'kpss-hist', name: 'Tarih', questionCount: 27 },
      { id: 'kpss-geo', name: 'Coğrafya', questionCount: 18 },
      { id: 'kpss-cit', name: 'Vatandaşlık & Güncel', questionCount: 15 },
    ],
  },
  {
    id: 'kpss-standart',
    name: 'KPSS Standart',
    description: '120 Minutes - Standard exam without extra time',
    defaultMode: 'countdown',
    totalDurationSeconds: 120 * 60, // 120 minutes
    sections: [
      { id: 'kpss-std-tr', name: 'Türkçe', questionCount: 30 },
      { id: 'kpss-std-math', name: 'Matematik', questionCount: 30 },
      { id: 'kpss-std-hist', name: 'Tarih', questionCount: 27 },
      { id: 'kpss-std-geo', name: 'Coğrafya', questionCount: 18 },
      { id: 'kpss-std-cit', name: 'Vatandaşlık', questionCount: 15 },
    ],
  },
  {
    id: 'yks-tyt',
    name: 'YKS - TYT',
    description: '165 Minutes - Turkish, Social, Math, Science',
    defaultMode: 'countdown',
    totalDurationSeconds: 165 * 60, // 165 minutes
    sections: [
      { id: 'tyt-tr', name: 'Türkçe', questionCount: 40 },
      { id: 'tyt-sos', name: 'Sosyal Bilimler', questionCount: 20 },
      { id: 'tyt-mat', name: 'Temel Matematik', questionCount: 40 },
      { id: 'tyt-fen', name: 'Fen Bilimleri', questionCount: 20 },
    ],
  },
];
