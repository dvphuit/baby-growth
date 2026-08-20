import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/data/localDb', () => ({
  indexedDbStorage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { useActivityStore } from '@/features/activities/store/useActivityStore';
import { createDefaultMedicationCatalog } from '@/features/activities/domain/medicationCatalog';

describe('useActivityStore', () => {
  beforeEach(() => {
    useActivityStore.setState({
      babyActivities: [],
      momActivities: [],
      medicationCatalog: createDefaultMedicationCatalog(),
    });
  });

  it('adds and deletes a baby activity', () => {
    const record = useActivityStore.getState().addBabyActivity({
      owner: 'baby',
      type: 'diaper',
      occurredAt: new Date('2026-08-16T08:00:00Z').toISOString(),
      diaperKind: 'wet',
    });
    expect(record.id).toBeTruthy();
    expect(record.createdAt).toBeTruthy();
    expect(useActivityStore.getState().babyActivities).toHaveLength(1);
    useActivityStore.getState().deleteActivity(record.id);
    expect(useActivityStore.getState().babyActivities).toHaveLength(0);
  });

  it('adds and updates a mom activity', () => {
    const record = useActivityStore.getState().addMomActivity({ owner: 'mom', type: 'mood', occurredAt: new Date('2026-08-16T08:00:00Z').toISOString(), mood: 'neutral' });
    useActivityStore.getState().updateActivity(record.id, { note: 'Mệt nhẹ' });
    expect(useActivityStore.getState().momActivities[0].note).toBe('Mệt nhẹ');
  });

  it('keeps default medication presets and remembers custom medications with their last dose', () => {
    expect(useActivityStore.getState().medicationCatalog.map((item) => item.name)).toEqual(
      createDefaultMedicationCatalog().map((item) => item.name),
    );

    useActivityStore.getState().upsertMedication({ name: 'D3K2', dose: '1 giọt' });
    useActivityStore.getState().upsertMedication({ name: 'Men vi sinh riêng', dose: '2 giọt' });

    expect(useActivityStore.getState().medicationCatalog).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'D3K2', builtIn: true, lastDose: '1 giọt' }),
      expect.objectContaining({ name: 'Men vi sinh riêng', builtIn: false, lastDose: '2 giọt' }),
    ]));

    useActivityStore.getState().resetTrackingData();
    expect(useActivityStore.getState().medicationCatalog.map((item) => item.name)).toEqual(
      createDefaultMedicationCatalog().map((item) => item.name),
    );
    expect(useActivityStore.getState().medicationCatalog.every((item) => item.lastDose === undefined)).toBe(true);
  });

  it('deletes custom medications but protects built-in presets', () => {
    const custom = useActivityStore.getState().upsertMedication({ name: 'Thuốc theo toa' });
    const builtIn = useActivityStore.getState().medicationCatalog.find((item) => item.name === 'D3')!;

    useActivityStore.getState().deleteMedication(custom.id);
    useActivityStore.getState().deleteMedication(builtIn.id);

    expect(useActivityStore.getState().medicationCatalog).not.toContainEqual(
      expect.objectContaining({ id: custom.id }),
    );
    expect(useActivityStore.getState().medicationCatalog).toContainEqual(
      expect.objectContaining({ id: builtIn.id, builtIn: true }),
    );
  });
});
