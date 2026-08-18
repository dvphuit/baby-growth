import type {
  FamilyData,
  GrowthHistoryRecord,
  TimelineItem,
  ChatMessage,
} from '@/types';
import type { MomData } from '@/types';
import type { Reminder } from '@/types/reminder';
import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useReminderStore } from '@/store/useReminderStore';
import { useChatStore } from '@/store/useChatStore';
import { useActivityStore } from '@/store/useActivityStore';
import type { NewBabyActivity, NewMomActivity } from '@/store/useActivityStore';
import { setLocalRecord } from '@/services/localDb';
import { isGoogleConfigured } from '@/services/googleDriveSync';

function isoDate(yearsAgo = 0, monthsAgo = 0, daysAgo = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo, d.getMonth() - monthsAgo, d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function viDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const BIRTH_DATE = '2026-08-05';

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const MOCK_FAMILY: Partial<FamilyData> = {
  childName: 'Bé Bơ',
  childFullName: 'Minh Châu',
  birthDate: BIRTH_DATE,
  birthTime: '05:43',
  gender: 'boy',
  bloodType: 'Chưa rõ',
  childAvatar: '/assets/avatars/baby_avatar.jpg',
  momName: 'Mẹ Thảo',
  momAvatar: '/assets/avatars/mom_avatar.jpg',
  dadName: 'Ba Phú',
  dadAvatar: '/assets/avatars/dad_avatar.jpg',
  birthWeight: '3.1',
  birthHeight: '50',
  headCircAtBirth: '30',
  hospital: 'BV Nhân Dân Gia Định',
  insuranceCode: 'HS-2026-0085',
  allergies: [],
  notes: 'Bé sinh thường, theo dõi vàng da sinh lý tuần đầu.',
};

const BIRTH_VITALS = { weight: 3.1, height: 50, headCirc: 30 };

function growthRecord(
  id: string,
  date: string,
  ageText: string,
  labelIndex: number,
  weight: number,
  height: number,
  headCirc: number,
  note: string,
): GrowthHistoryRecord {
  return {
    id,
    date,
    ageText,
    labelIndex,
    weight,
    height,
    headCirc,
    percentileLabel: 'P50 - P75',
    status: 'optimal',
    note,
  };
}

const GROWTH_RECORDS: GrowthHistoryRecord[] = [
  growthRecord('gh_mock_1w', addDays(BIRTH_DATE, 7), '1 tuần', 0, 3.4, 51.5, 31.5, 'Tăng cân tốt, bú mẹ hoàn toàn.'),
  growthRecord('gh_mock_2w', addDays(BIRTH_DATE, 13), '2 tuần', 1, 3.6, 52.0, 32.0, 'Ngủ ngoan, vàng da đã giảm.'),
];

function timelineItem(
  id: string,
  date: string,
  title: string,
  content: string,
  tag: string,
  tagType: TimelineItem['tagType'],
  type: TimelineItem['type'],
): TimelineItem {
  return {
    id,
    stage: 'stage_0_1',
    date,
    timeFormatted: '20:15',
    time: `${viDate(date)} • 20:15`,
    author: MOCK_FAMILY.momName!,
    authorAvatar: MOCK_FAMILY.momAvatar!,
    title,
    content,
    mediaUrl: null,
    mediaType: null,
    stats: ['❤️ 12', '💬 3'],
    likes: 12,
    comments: 3,
    userLiked: true,
    tag,
    tagType,
    type,
  };
}

const TIMELINE_ITEMS: TimelineItem[] = [
  timelineItem('tl_mock_1', isoDate(0, 0, 1), 'Bé bú mẹ rất ngoan', 'Bơ bú đều 2-3 tiếng/lần, ngủ nhiều trong ngày 😴', 'Sinh hoạt', 'feeding', 'daily'),
  timelineItem('tl_mock_2', isoDate(0, 0, 3), 'Chăm sóc rốn & thay tã', 'Vệ sinh rốn sạch sẽ mỗi ngày, tã ướt đều 6-8 chiếc/ngày', 'Chăm sóc', 'health', 'daily'),
  timelineItem('tl_mock_3', isoDate(0, 0, 5), 'Mẹ hồi phục sau sinh', 'Vết khâu đã đỡ đau, Mẹ tập đi lại nhẹ nhàng và hợp tác cho con bú 💕', 'Tâm trạng Mẹ', 'mom', 'daily'),
];

const EXPENSES: Array<Pick<import('@/types/expense').ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>> = [
  { amount: 850000, category: 'Sữa & ăn dặm', occurredAt: isoDate(0, 0, 4), note: 'Sữa công thức + bột ăn dặm' },
  { amount: 420000, category: 'Tã bỉm & vệ sinh', occurredAt: isoDate(0, 0, 6), note: 'Tã Merries size M' },
  { amount: 600000, category: 'Y tế & tiêm chủng', occurredAt: isoDate(0, 1, 2), note: 'Tiêm 6in1 mũi 2' },
  { amount: 350000, category: 'Quần áo & đồ dùng', occurredAt: isoDate(0, 1, 10), note: 'Set áo mùa hè' },
  { amount: 280000, category: 'Sách & đồ chơi', occurredAt: isoDate(0, 1, 15), note: 'Đồ chơi gỗ vận động' },
  { amount: 500000, category: 'Mẹ & gia đình', occurredAt: isoDate(0, 1, 18), note: 'Vitamin tổng hợp cho Mẹ' },
];

function triggerAt(hour: number, minute: number, daysFromNow = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function reminder(
  id: string,
  type: Reminder['type'],
  title: string,
  trigger: string,
  repeat: Reminder['repeat'],
): Reminder {
  const now = new Date().toISOString();
  return {
    id,
    type,
    title,
    enabled: true,
    mode: 'fixed',
    triggerAt: trigger,
    repeat,
    quickLogAction: type === 'feeding' ? 'feeding' : type === 'medicine' ? 'medicine' : undefined,
    note: '',
    createdAt: now,
    updatedAt: now,
  };
}

const REMINDERS: Reminder[] = [
  reminder('rem_mock_1', 'feeding', 'Cữ bú 20:00', triggerAt(20, 0), 'daily'),
  reminder('rem_mock_2', 'medicine', 'Uống vitamin D3', triggerAt(8, 0), 'daily'),
  reminder('rem_mock_3', 'vaccination', 'Tiêm nhắc 6in1 mũi 3', triggerAt(9, 30, 5), 'none'),
  reminder('rem_mock_4', 'appointment', 'Đo cân nặng tháng', triggerAt(19, 0, 10), 'none'),
];

const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm_mock_1',
    sender: 'user',
    text: 'Bé đi ngoài phân hơi lỏng 3 lần hôm nay, có sao không ạ?',
    time: '09:02',
  },
  {
    id: 'm_mock_2',
    sender: 'ai',
    text: 'Phân lỏng 3 lần/ngày ở Bé sơ sinh thường là bình thường nếu Bé vẫn bú tốt, tiểu nhiều và không sốt. Mẹ hãy theo dõi thêm dấu hiệu mất nước (miệng khô, ít tã ướt). Nếu có sốt, phân có máu hoặc Bé lờ đờ, hãy gặp bác sĩ sớm.',
    time: '09:03',
  },
];

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const BABY_ACTIVITIES: NewBabyActivity[] = [
  { owner: 'baby', type: 'feeding', occurredAt: todayAt(7, 0), amountMl: 90, durationMinutes: 22, method: 'breast', side: 'both' },
  { owner: 'baby', type: 'diaper', occurredAt: todayAt(9, 30), diaperKind: 'wet' },
  { owner: 'baby', type: 'sleep', occurredAt: todayAt(10, 0), durationMinutes: 120 },
  { owner: 'baby', type: 'feeding', occurredAt: todayAt(13, 0), amountMl: 100, durationMinutes: 18, method: 'bottle' },
  { owner: 'baby', type: 'diaper', occurredAt: todayAt(15, 0), diaperKind: 'dirty' },
  { owner: 'baby', type: 'temperature', occurredAt: todayAt(18, 0), temperatureC: 36.8 },
  { owner: 'baby', type: 'feeding', occurredAt: todayAt(20, 0), amountMl: 95, durationMinutes: 20, method: 'breast', side: 'both' },
];

const MOM_ACTIVITIES: NewMomActivity[] = [
  { owner: 'mom', type: 'pumping', occurredAt: todayAt(8, 0), amountMl: 120, side: 'both' },
  { owner: 'mom', type: 'mood', occurredAt: todayAt(9, 0), mood: 'good' },
  { owner: 'mom', type: 'sleep', occurredAt: todayAt(13, 30), durationMinutes: 90 },
  { owner: 'mom', type: 'pumping', occurredAt: todayAt(14, 0), amountMl: 110, side: 'left' },
  { owner: 'mom', type: 'recovery_note', occurredAt: todayAt(19, 0), note: 'Vết khâu đã khô, đi lại nhẹ nhàng được.' },
];

const MOCK_MOM: Partial<MomData> = {
  name: 'Mẹ Thảo',
  postpartumDay: '13',
  wellnessScore: 82,
  mentalHealth: {
    epdsScore: '4',
    status: 'Tâm lý ổn định',
    sleepDebt: '6h',
  },
  pumping: {
    todayTotal: '420 ml',
    sessionsToday: 3,
    freezerStock: '2.6 L',
    lastSession: '140 ml',
    time: 'Lúc 18:30 (2 bên)',
    history: [
      { time: '18:30', amount: '140 ml', note: 'Hút bên: 2 bên' },
      { time: '13:00', amount: '130 ml', note: 'Hút bên: 2 bên' },
      { time: '07:45', amount: '150 ml', note: 'Hút bên: 2 bên' },
    ],
  },
  recovery: {
    uterusStatus: 'Hồi phục tốt',
    lochia: 'Đã hết',
    weightLoss: '-6 kg',
  },
};

/** Pushes a full set of demo records into every store. Intended for local
 * development only; never call this in production builds. */
export function seedMockData(): void {
  const baby = useBabyStore.getState();
  baby.initializeChildProfile(MOCK_FAMILY, BIRTH_VITALS);

  const babyAfter = useBabyStore.getState();
  GROWTH_RECORDS.forEach((record) => {
    if (!babyAfter.stages[babyAfter.currentStage]?.growthHistory?.some((r) => r.id === record.id)) {
      babyAfter.addGrowthMeasurement({
        weight: record.weight,
        height: record.height,
        headCirc: record.headCirc,
        date: record.date,
        note: record.note,
      });
    }
  });
  useBabyStore.getState().setMonthlyExpenseBudget(8_000_000);
  EXPENSES.forEach((entry) => useBabyStore.getState().addExpenseRecord(entry));

  useMomStore.getState().updateMomData(MOCK_MOM);

  TIMELINE_ITEMS.forEach((item) =>
    useTimelineStore.getState().addTimelineItem({
      title: item.title,
      content: item.content,
      tag: item.tag,
      tagType: item.tagType,
      type: item.type,
      date: item.date,
    }),
  );

  REMINDERS.forEach((r) =>
    useReminderStore.getState().createReminder({
      type: r.type,
      title: r.title,
      enabled: r.enabled,
      mode: r.mode,
      triggerAt: r.triggerAt,
      repeat: r.repeat,
      quickLogAction: r.quickLogAction,
      note: r.note,
    }),
  );

  BABY_ACTIVITIES.forEach((activity) => useActivityStore.getState().addBabyActivity(activity));
  MOM_ACTIVITIES.forEach((activity) => useActivityStore.getState().addMomActivity(activity));

  const chat = useChatStore.getState();
  if (chat.chatMessages.length <= 1) {
    chat.clearChat();
    CHAT_MESSAGES.forEach((m) => chat.addChatMessage(m.sender, m.text));
  }

  // Disable Google auto-sync so local dev never triggers a Drive login.
  void setLocalRecord(
    'babygrowth_v2_sync_meta',
    JSON.stringify({
      lastSyncedFingerprint: null,
      remoteFileId: null,
      lastSyncedAt: null,
      autoSyncEnabled: false,
    }),
  );
}

export function isMockDataEnabled(): boolean {
  if (!import.meta.env.DEV) return false;

  try {
    // Explicit opt-out wins over everything.
    if (localStorage.getItem('babygrowth_mock') === '0') return false;
    if (new URLSearchParams(window.location.search).has('nomock')) return false;
  } catch {
    // Ignore storage/URL access errors in restricted environments.
  }

  if (import.meta.env.VITE_MOCK_DATA === 'true') return true;
  try {
    if (localStorage.getItem('babygrowth_mock') === '1') return true;
    if (new URLSearchParams(window.location.search).has('mock')) return true;
  } catch {
    // Ignore storage/URL access errors in restricted environments.
  }

  // Default to mock data in local dev when Google Drive is not configured,
  // so onboarding can be skipped without a real OAuth setup.
  if (!isGoogleConfigured()) return true;

  return false;
}
