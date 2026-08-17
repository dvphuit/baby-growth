import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SYNC_KEYS } from './googleDriveSync';
import { useActivityStore } from '@/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useChatStore } from '@/store/useChatStore';
import { useMomStore } from '@/store/useMomStore';
import { useReminderStore } from '@/store/useReminderStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';

const persistence = vi.hoisted(() => ({
  getAllLocalRecords: vi.fn(),
  getLocalRecord: vi.fn(),
  removeLocalRecord: vi.fn(),
  setLocalRecord: vi.fn(),
  subscribeLocalRecordChanges: vi.fn(),
  waitForLocalRecordWrites: vi.fn(),
  indexedDbStorage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

const drive = vi.hoisted(() => ({
  overwriteDriveBackupWithLocalData: vi.fn(),
  runWithAutoSyncPaused: vi.fn(),
}));

vi.mock('./localDb', () => persistence);
vi.mock('./googleDriveSync', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./googleDriveSync')>()),
  overwriteDriveBackupWithLocalData: drive.overwriteDriveBackupWithLocalData,
  runWithAutoSyncPaused: drive.runWithAutoSyncPaused,
}));

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 10; index += 1) await Promise.resolve();
}

function seedTrackingData(): void {
  useBabyStore.getState().initializeChildProfile({
    childName: 'Bơ', childFullName: 'Nguyễn An', birthDate: '2026-01-05', birthTime: '07:30',
    gender: 'girl', bloodType: 'A+', childAvatar: '/baby.jpg', momName: 'Mai', momAvatar: '/mom.jpg',
    birthWeight: '3.2 kg', birthHeight: '49 cm', headCircAtBirth: '34 cm', hospital: 'Từ Dũ',
  }, { weight: 3.2, height: 49, headCirc: 34 });
  useBabyStore.getState().addGrowthMeasurement({ weight: 5.1, height: 58, headCirc: 38, date: '2026-03-05' });
  useMomStore.getState().addPumpingSession(90);
  useActivityStore.getState().addBabyActivity({
    owner: 'baby', type: 'diaper', occurredAt: '2026-08-17T08:00:00.000Z', diaperKind: 'wet',
  });
  useTimelineStore.getState().addTimelineItem({ title: 'Tracked timeline item' });
  useChatStore.getState().addChatMessage('user', 'Tracked chat message');
  useReminderStore.getState().createReminder({
    type: 'medicine', title: 'Vitamin D', mode: 'fixed', triggerAt: '08:00', enabled: true,
  });
  useUIStore.getState().setTab('timeline');
  useUIStore.getState().setCurrentSubView('calendar');
  useUIStore.getState().setSearchQuery('sleep');
  useUIStore.getState().setProfileMode('mom');
}

function expectTrackingDataReset(): void {
  const baby = useBabyStore.getState();
  expect(baby.currentStageData().growthHistory).toHaveLength(1);
  expect(baby.currentStageData().growthHistory[0]).toMatchObject({
    date: '2026-01-05', weight: 3.2, height: 49, headCirc: 34,
  });
  expect(useMomStore.getState().momData.pumping).toMatchObject({ todayTotal: '0 ml', sessionsToday: 0, history: [] });
  expect(useActivityStore.getState()).toMatchObject({ babyActivities: [], momActivities: [] });
  expect(useTimelineStore.getState().timelineItems).toEqual([]);
  expect(useChatStore.getState().chatMessages).toEqual([]);
  expect(useReminderStore.getState()).toMatchObject({ reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false });
  expect(useUIStore.getState()).toMatchObject({ currentTab: 'home', currentSubView: null, searchQuery: '', profileMode: 'baby' });
}

describe('resetTrackingData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistence.waitForLocalRecordWrites.mockResolvedValue(undefined);
    drive.overwriteDriveBackupWithLocalData.mockResolvedValue(undefined);
    drive.runWithAutoSyncPaused.mockImplementation(async (operation) => operation({
      overwriteDriveBackupWithLocalData: drive.overwriteDriveBackupWithLocalData,
    }));
    useBabyStore.getState().resetToDefaults();
    useMomStore.getState().resetTrackingData();
    useActivityStore.getState().resetTrackingData();
    useTimelineStore.getState().resetTrackingData();
    useChatStore.getState().resetTrackingData();
    useReminderStore.getState().resetTrackingData();
    useUIStore.getState().resetTrackingData();
  });

  afterEach(() => {
    useBabyStore.getState().resetToDefaults();
  });

  it('resets every local store and persists it before overwriting the Drive backup', async () => {
    seedTrackingData();
    drive.overwriteDriveBackupWithLocalData.mockImplementation(async () => {
      expect(persistence.waitForLocalRecordWrites).toHaveBeenCalledWith(SYNC_KEYS);
      expectTrackingDataReset();
    });

    const { resetTrackingData } = await import('./trackingDataReset');

    await expect(resetTrackingData()).resolves.toEqual({ status: 'synced' });
  });

  it('reports local-only success when Drive overwrite fails after local reset', async () => {
    seedTrackingData();
    drive.overwriteDriveBackupWithLocalData.mockRejectedValue(new Error('Drive unavailable'));
    const { resetTrackingData } = await import('./trackingDataReset');

    await expect(resetTrackingData()).resolves.toEqual({ status: 'local-only', error: 'Drive unavailable' });
    expectTrackingDataReset();
  });

  it('is idempotent and does not recreate tracked demo content', async () => {
    seedTrackingData();
    const { resetTrackingData } = await import('./trackingDataReset');

    await expect(resetTrackingData()).resolves.toEqual({ status: 'synced' });
    await expect(resetTrackingData()).resolves.toEqual({ status: 'synced' });

    expectTrackingDataReset();
    expect(drive.overwriteDriveBackupWithLocalData).toHaveBeenCalledTimes(2);
  });

  it('waits for delayed store rehydration before clearing tracking data', async () => {
    seedTrackingData();
    let finishRehydration: (() => void) | undefined;
    vi.spyOn(useActivityStore.persist, 'hasHydrated').mockReturnValue(false);
    vi.spyOn(useActivityStore.persist, 'rehydrate').mockImplementation(() => new Promise((resolve) => {
      finishRehydration = resolve;
    }));
    const { resetTrackingData } = await import('./trackingDataReset');

    const reset = resetTrackingData();
    await flushMicrotasks();

    expect(drive.overwriteDriveBackupWithLocalData).not.toHaveBeenCalled();
    expect(useActivityStore.getState().babyActivities).not.toEqual([]);

    finishRehydration?.();
    await expect(reset).resolves.toEqual({ status: 'synced' });
    expect(useActivityStore.getState().babyActivities).toEqual([]);
  });

  it('continues with in-memory data when IndexedDB hydration fails without a finish event', async () => {
    seedTrackingData();
    vi.spyOn(useActivityStore.persist, 'hasHydrated').mockReturnValue(false);
    const onFinishHydration = vi.spyOn(useActivityStore.persist, 'onFinishHydration');
    persistence.indexedDbStorage.getItem.mockRejectedValueOnce(new Error('IndexedDB unavailable'));
    const { resetTrackingData } = await import('./trackingDataReset');

    const reset = resetTrackingData();
    await flushMicrotasks();

    expect(drive.overwriteDriveBackupWithLocalData).toHaveBeenCalledOnce();
    expect(persistence.indexedDbStorage.getItem).toHaveBeenCalled();
    expect(onFinishHydration).not.toHaveBeenCalled();
    await expect(reset).resolves.toEqual({ status: 'synced' });
    expect(useActivityStore.getState().babyActivities).toEqual([]);
  });
});
