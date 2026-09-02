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
  {
    id: 'meb-ags',
    name: 'MEB - AGS (Akademi Giriş Sınavı)',
    description: '110 Minutes - Turkish, Math, History, Geography, Education, Legislation',
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
    description: '150 Minutes - Numerical, Verbal',
    defaultMode: 'countdown',
    totalDurationSeconds: 150 * 60, // 150 minutes
    sections: [
      { id: 'ales-say', name: 'Sayısal' },
      { id: 'ales-soz', name: 'Sözel' },
    ],
  },
];
