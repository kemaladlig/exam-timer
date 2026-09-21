export type KpssLevel = 'lisans' | 'onlisans' | 'ortaogretim';

export interface KpssConfig {
  id: KpssLevel;
  name: string;
  shortName: string;
  scoreType: 'P3' | 'P93' | 'P94';
  description: string;
  // ÖSYM ASP ve Standart Sapma Parametreleri
  meanGy: number;
  stdGy: number;
  meanGk: number;
  stdGk: number;
  meanAsp: number;
  stdAsp: number;
  maxAsp: number;
}

/**
 * ÖSYM'nin gerçek Ağırlıklı Standart Puan (ASP) ve Standart Sapma tablosu.
 * Formül:
 *   SP_GY = 50 + 10 * ((GY_Net - Mean_GY) / Std_GY)
 *   SP_GK = 50 + 10 * ((GK_Net - Mean_GK) / Std_GK)
 *   ASP = 0.50 * SP_GY + 0.50 * SP_GK
 *   KPSS_Puanı = 70 + (30 * [2 * (ASP - Mean_ASP) - Std_ASP]) / ([2 * (Max_ASP - Mean_ASP)] - Std_ASP)
 */
export const KPSS_LEVELS: Record<KpssLevel, KpssConfig> = {
  lisans: {
    id: 'lisans',
    name: 'Lisans',
    shortName: 'Lisans (P3)',
    scoreType: 'P3',
    description: 'B Grubu Lisans Mezunları',
    meanGy: 17.80,
    stdGy: 11.80,
    meanGk: 16.50,
    stdGk: 11.00,
    meanAsp: 50.0,
    stdAsp: 8.80,
    maxAsp: 96.20,
  },
  onlisans: {
    id: 'onlisans',
    name: 'Önlisans',
    shortName: 'Önlisans (P93)',
    scoreType: 'P93',
    description: '2 Yıllık Üniversite Mezunları',
    meanGy: 15.80,
    stdGy: 10.40,
    meanGk: 14.20,
    stdGk: 9.80,
    meanAsp: 50.0,
    stdAsp: 8.80,
    maxAsp: 97.40,
  },
  ortaogretim: {
    id: 'ortaogretim',
    name: 'Ortaöğretim',
    shortName: 'Ortaöğretim (P94)',
    scoreType: 'P94',
    description: 'Lise Mezunları',
    meanGy: 14.60,
    stdGy: 9.60,
    meanGk: 13.20,
    stdGk: 9.00,
    meanAsp: 50.0,
    stdAsp: 8.70,
    maxAsp: 98.20,
  },
};

/**
 * ÖSYM Resmi ASP Formülü ile KPSS Tahmini Puanını hesaplar.
 * @param gyNet Genel Yetenek Neti
 * @param gkNet Genel Kültür Neti
 * @param level Sınav seviyesi (lisans, onlisans, ortaogretim)
 */
export function calculateKpssScore(
  gyNet: number,
  gkNet: number,
  level: KpssLevel = 'lisans'
) {
  const config = KPSS_LEVELS[level];
  const safeGy = Math.max(0, gyNet);
  const safeGk = Math.max(0, gkNet);

  if (safeGy === 0 && safeGk === 0) {
    return {
      score: 0,
      isValid: false,
      scoreType: config.scoreType,
      asp: 0,
      levelName: config.name,
    };
  }

  // ÖSYM Kuralı: Puanın hesaplanabilmesi için her iki testten en az 1 net yapılmalıdır
  const isValid = safeGy >= 1.0 && safeGk >= 1.0;

  // 1. Genel Yetenek ve Genel Kültür Standart Puanları (SP)
  const spGy = 50 + 10 * ((safeGy - config.meanGy) / config.stdGy);
  const spGk = 50 + 10 * ((safeGk - config.meanGk) / config.stdGk);

  // 2. Ağırlıklı Standart Puan (ASP) (%50 GY + %50 GK)
  const asp = 0.5 * spGy + 0.5 * spGk;

  // 3. ÖSYM Nihai KPSS Puanı Dönüşüm Formülü:
  // KPSS = 70 + (30 * [2 * (ASP - X) - S]) / ([2 * (B - X)] - S)
  const numerator = 30 * (2 * (asp - config.meanAsp) - config.stdAsp);
  const denominator = 2 * (config.maxAsp - config.meanAsp) - config.stdAsp;

  const rawScore = 70 + numerator / denominator;
  const clampedScore = Math.min(100, Math.max(0, parseFloat(rawScore.toFixed(3))));

  // Yuvarlanmış 2 haneli gösterim için:
  const displayScore = parseFloat(clampedScore.toFixed(2));

  return {
    score: displayScore,
    rawScore: clampedScore,
    isValid,
    scoreType: config.scoreType,
    asp: parseFloat(asp.toFixed(2)),
    levelName: config.name,
  };
}
