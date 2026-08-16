import type { BabyActivity, GrowthHistoryRecord, MomActivity } from '@/types';

export interface DerivedTimelineEntry {
  id: string;
  occurredAt: string;
  owner: 'baby' | 'mom' | 'system';
  type: string;
  title: string;
  detail: string;
  stats: string[];
}

function babyEntry(record: BabyActivity): DerivedTimelineEntry {
  switch (record.type) {
    case 'feeding':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'baby', type: record.type, title: 'Cữ bú', detail: record.note ?? 'Đã ghi nhận cữ bú.', stats: [record.amountMl ? `${record.amountMl} ml` : '', record.durationMinutes ? `${record.durationMinutes} phút` : ''].filter(Boolean) };
    case 'sleep':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'baby', type: record.type, title: 'Giấc ngủ của bé', detail: record.note ?? 'Đã ghi nhận giấc ngủ.', stats: [`${record.durationMinutes} phút`] };
    case 'diaper':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'baby', type: record.type, title: 'Thay tã', detail: record.note ?? 'Đã ghi nhận thay tã.', stats: [record.diaperKind === 'wet' ? 'Ướt' : record.diaperKind === 'dirty' ? 'Bẩn' : 'Ướt + bẩn'] };
    case 'medicine':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'baby', type: record.type, title: record.name, detail: record.note ?? 'Thuốc / vitamin', stats: record.dose ? [record.dose] : [] };
    case 'temperature':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'baby', type: record.type, title: 'Nhiệt độ', detail: record.note ?? 'Đã đo nhiệt độ.', stats: [`${record.temperatureC} °C`] };
    default:
      return { id: record.id, occurredAt: record.occurredAt, owner: 'baby', type: record.type, title: 'Ghi chú sức khỏe', detail: record.note ?? '', stats: [] };
  }
}

function momEntry(record: MomActivity): DerivedTimelineEntry {
  switch (record.type) {
    case 'pumping':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'mom', type: record.type, title: 'Hút sữa', detail: record.note ?? 'Đã ghi nhận cữ hút sữa.', stats: [`${record.amountMl} ml`, record.side === 'both' ? '2 bên' : record.side === 'left' ? 'Bên trái' : 'Bên phải'] };
    case 'sleep':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'mom', type: record.type, title: 'Giấc ngủ của mẹ', detail: record.note ?? 'Đã ghi nhận giấc ngủ.', stats: [`${record.durationMinutes} phút`] };
    case 'mood':
      return { id: record.id, occurredAt: record.occurredAt, owner: 'mom', type: record.type, title: 'Tâm trạng', detail: record.note ?? 'Đã ghi nhận tâm trạng.', stats: [record.mood] };
    default:
      return { id: record.id, occurredAt: record.occurredAt, owner: 'mom', type: record.type, title: 'Phục hồi', detail: record.note ?? '', stats: [] };
  }
}

function parseGrowthDate(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isFinite(parsed.getTime())) return parsed.toISOString();
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0).toISOString();
}

function growthEntry(record: GrowthHistoryRecord): DerivedTimelineEntry | null {
  const occurredAt = parseGrowthDate(record.date);
  if (!occurredAt) return null;
  return {
    id: `growth-${record.id}`,
    occurredAt,
    owner: 'baby',
    type: 'growth',
    title: 'Cân đo tăng trưởng',
    detail: record.note || 'Đã ghi nhận số đo.',
    stats: [`${record.weight} kg`, `${record.height} cm`, `${record.headCirc} cm vòng đầu`],
  };
}

export function buildTimelineEntries(input: {
  babyActivities: BabyActivity[];
  momActivities: MomActivity[];
  growthHistory?: GrowthHistoryRecord[];
}): DerivedTimelineEntry[] {
  return [
    ...input.babyActivities.map(babyEntry),
    ...input.momActivities.map(momEntry),
    ...(input.growthHistory ?? []).map(growthEntry).filter((entry): entry is DerivedTimelineEntry => entry !== null),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function filterTimelineByLocalDate(entries: DerivedTimelineEntry[], date: string): DerivedTimelineEntry[] {
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(year, month - 1, day).getTime();
  const end = new Date(year, month - 1, day + 1).getTime();
  return entries.filter((entry) => {
    const time = new Date(entry.occurredAt).getTime();
    return time >= start && time < end;
  });
}
