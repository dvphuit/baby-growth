import { beforeEach, describe, expect, it } from 'vitest';
import { useActivityStore } from './useActivityStore';

describe('useActivityStore', () => {
  beforeEach(() => {
    useActivityStore.setState({ babyActivities: [], momActivities: [] });
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
    const record = useActivityStore.getState().addMomActivity({
      owner: 'mom',
      type: 'mood',
      occurredAt: new Date('2026-08-16T08:00:00Z').toISOString(),
      mood: 'neutral',
    });

    useActivityStore.getState().updateActivity(record.id, { note: 'Mệt nhẹ' });
    expect(useActivityStore.getState().momActivities[0].note).toBe('Mệt nhẹ');
  });
});
