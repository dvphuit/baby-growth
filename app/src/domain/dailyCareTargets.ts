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
