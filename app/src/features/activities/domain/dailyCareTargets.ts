export interface SleepTarget {
  minMinutes: number;
  maxMinutes: number;
  label: string;
}

export interface MilkTarget {
  targetMl: number | null;
  label: string;
  detail: string;
}

function parseLocalDate(dateStr: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function getAgeInMonths(birthDate: string, now: Date): number | null {
  const birth = parseLocalDate(birthDate);
  if (!birth) return null;

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function getSleepTarget(birthDate: string, now: Date): SleepTarget {
  const ageMonths = getAgeInMonths(birthDate, now);

  if (ageMonths == null || ageMonths < 4) return { minMinutes: 14 * 60, maxMinutes: 17 * 60, label: '14–17 giờ / 24 giờ' };
  if (ageMonths < 12) return { minMinutes: 12 * 60, maxMinutes: 16 * 60, label: '12–16 giờ / 24 giờ' };
  if (ageMonths < 36) return { minMinutes: 11 * 60, maxMinutes: 14 * 60, label: '11–14 giờ / 24 giờ' };
  if (ageMonths < 72) return { minMinutes: 10 * 60, maxMinutes: 13 * 60, label: '10–13 giờ / 24 giờ' };
  if (ageMonths < 156) return { minMinutes: 9 * 60, maxMinutes: 12 * 60, label: '9–12 giờ / 24 giờ' };
  return { minMinutes: 8 * 60, maxMinutes: 10 * 60, label: '8–10 giờ / 24 giờ' };
}

export function getMilkTarget(birthDate: string, weightKg: number | null, now: Date): MilkTarget {
  const ageMonths = getAgeInMonths(birthDate, now);

  if (ageMonths == null) {
    return { targetMl: null, label: 'Chưa đủ dữ liệu', detail: 'Cập nhật ngày sinh để có mốc tham khảo.' };
  }

  if (ageMonths < 7) {
    if (!weightKg || weightKg <= 0) {
      return { targetMl: null, label: 'Cần cân nặng', detail: 'Cập nhật cân nặng để ước tính mốc bình sữa.' };
    }
    const targetMl = Math.min(960, Math.round((weightKg * 165) / 10) * 10);
    return { targetMl, label: `Khoảng ${targetMl.toLocaleString('vi-VN')} ml`, detail: 'Ước tính cho sữa đo được bằng ml.' };
  }

  if (ageMonths < 10) {
    return { targetMl: 600, label: 'Khoảng 600 ml', detail: 'Mốc tham khảo khi bé đã bắt đầu ăn dặm.' };
  }

  if (ageMonths < 12) {
    return { targetMl: 400, label: 'Khoảng 400 ml', detail: 'Mốc tham khảo khi bé ăn 3 bữa và khoảng 3 cữ sữa.' };
  }

  return { targetMl: null, label: 'Theo chế độ ăn', detail: 'Sau 12 tháng không đặt mục tiêu sữa theo ml tại đây.' };
}

export interface FeedingRecommendation {
  minMl: number;
  maxMl: number;
  label: string;
  ageText: string;
}

export function getFeedingRecommendation(
  birthDate?: string | null,
  weightKg?: number | null,
  now = new Date(),
): FeedingRecommendation {
  if (!birthDate) {
    return {
      minMl: 90,
      maxMl: 150,
      label: 'Gợi ý: 90 – 150 ml / cữ',
      ageText: 'Mức chuẩn tham khảo',
    };
  }

  const birth = parseLocalDate(birthDate);
  if (!birth) {
    return {
      minMl: 90,
      maxMl: 150,
      label: 'Gợi ý: 90 – 150 ml / cữ',
      ageText: 'Mức chuẩn tham khảo',
    };
  }

  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = getAgeInMonths(birthDate, now) ?? 0;

  let minMl = 90;
  let maxMl = 150;
  let ageText = '';

  if (diffDays <= 3) {
    minMl = 30;
    maxMl = 60;
    ageText = `${Math.max(1, diffDays)} ngày tuổi`;
  } else if (diffDays <= 14) {
    minMl = 60;
    maxMl = 90;
    ageText = `${diffDays} ngày tuổi`;
  } else if (diffWeeks < 4) {
    minMl = 60;
    maxMl = 90;
    ageText = `${diffWeeks} tuần tuổi`;
  } else if (diffMonths < 2) {
    minMl = 90;
    maxMl = 120;
    ageText = '1–2 tháng tuổi';
  } else if (diffMonths < 4) {
    minMl = 120;
    maxMl = 150;
    ageText = '2–4 tháng tuổi';
  } else if (diffMonths < 6) {
    minMl = 150;
    maxMl = 180;
    ageText = '4–6 tháng tuổi';
  } else if (diffMonths < 9) {
    minMl = 180;
    maxMl = 210;
    ageText = '6–9 tháng tuổi';
  } else if (diffMonths < 12) {
    minMl = 180;
    maxMl = 240;
    ageText = '9–12 tháng tuổi';
  } else {
    minMl = 150;
    maxMl = 240;
    ageText = 'Trên 1 tuổi';
  }

  if (weightKg && weightKg > 0 && diffDays > 14 && diffMonths < 7) {
    const weightMin = Math.round((weightKg * 20) / 5) * 5;
    const weightMax = Math.round((weightKg * 28) / 5) * 5;
    minMl = Math.max(30, Math.min(minMl, weightMin));
    maxMl = Math.min(260, Math.max(maxMl, weightMax));
    ageText += ` · ${weightKg} kg`;
  }

  return {
    minMl,
    maxMl,
    label: `Gợi ý: ${minMl} – ${maxMl} ml / cữ`,
    ageText,
  };
}

export interface TemperatureStatus {
  tier: 'hypothermia' | 'normal' | 'elevated' | 'fever' | 'high_fever' | 'very_high_fever';
  label: string;
  tone: 'cool' | 'sage' | 'amber' | 'coral' | 'crimson';
  color: string;
  badgeText: string;
  advice: string;
}

export function getTemperatureStatus(tempC: number): TemperatureStatus {
  if (tempC < 36.0) {
    return {
      tier: 'hypothermia',
      label: 'Hạ thân nhiệt',
      tone: 'cool',
      color: '#3B82F6',
      badgeText: '⚠️ Hạ thân nhiệt',
      advice: 'Thân nhiệt thấp (< 36.0°C). Cần ủ ấm cho bé và đo lại sau 15–30 phút.',
    };
  }
  if (tempC < 37.5) {
    return {
      tier: 'normal',
      label: 'Bình thường',
      tone: 'sage',
      color: '#6F8B4A',
      badgeText: '✓ Thân nhiệt tốt',
      advice: 'Nhiệt độ đang trong khoảng tham khảo 36.0–37.4°C.',
    };
  }
  if (tempC < 38) {
    return {
      tier: 'elevated',
      label: 'Hơi cao',
      tone: 'amber',
      color: '#D97706',
      badgeText: 'Theo dõi',
      advice: 'Thân nhiệt hơi cao (37.5–37.9°C). Cho bé nghỉ, mặc thoáng và đo lại sau 15–30 phút.',
    };
  }
  if (tempC < 39) {
    return {
      tier: 'fever',
      label: 'Có sốt',
      tone: 'coral',
      color: '#EA580C',
      badgeText: 'Sốt ≥ 38°C',
      advice: 'Có sốt (38.0–38.9°C). Theo dõi triệu chứng và bảo đảm bé được bú/uống đủ.',
    };
  }
  if (tempC < 40) {
    return {
      tier: 'high_fever',
      label: 'Sốt cao',
      tone: 'coral',
      color: '#D9480F',
      badgeText: 'Sốt cao',
      advice: 'Sốt cao (39.0–39.9°C). Theo dõi sát và liên hệ bác sĩ nếu bé mệt hoặc sốt kéo dài.',
    };
  }
  return {
    tier: 'very_high_fever',
    label: 'Sốt rất cao',
    tone: 'crimson',
    color: '#DC2626',
    badgeText: '🚨 Nguy hiểm',
    advice: 'Sốt từ 40°C. Cần liên hệ cơ sở y tế ngay và theo dõi sát tình trạng của bé.',
  };
}
