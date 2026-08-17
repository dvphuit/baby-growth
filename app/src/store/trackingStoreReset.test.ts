import { beforeEach, describe, expect, it, vi } from 'vitest';
import { todayStr } from '@/utils/date';

vi.mock('@/services/localDb', () => ({
  indexedDbStorage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { useActivityStore } from './useActivityStore';
import { useChatStore } from './useChatStore';
import { useReminderStore } from './useReminderStore';
import { useTimelineStore } from './useTimelineStore';
import { useUIStore } from './useUIStore';

describe('tracking auxiliary-store reset', () => {
  beforeEach(() => {
    useActivityStore.setState({ babyActivities: [], momActivities: [] });
    useChatStore.setState({ chatMessages: [] });
    useReminderStore.setState({ reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false });
    useTimelineStore.setState({
      timelineItems: [],
      selectedCalendarDate: todayStr(),
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
      calendarViewMode: 'collapsed',
      timelineFilter: 'all',
      currentTimelineSubTab: 'feed',
    });
    useUIStore.setState({ currentTab: 'home', currentSubView: null, searchQuery: '', profileMode: 'baby' });
  });

  it('clears persisted records and restores auxiliary operational defaults', () => {
    useActivityStore.getState().addBabyActivity({
      owner: 'baby', type: 'diaper', occurredAt: '2026-08-17T08:00:00.000Z', diaperKind: 'wet',
    });
    useActivityStore.getState().addMomActivity({
      owner: 'mom', type: 'mood', occurredAt: '2026-08-17T08:00:00.000Z', mood: 'neutral',
    });
    useTimelineStore.getState().addTimelineItem({ title: 'New timeline record' });
    useTimelineStore.getState().setSelectedCalendarDate('2026-08-01');
    useTimelineStore.getState().setCalendarMonth(2025, 11);
    useTimelineStore.getState().setCalendarViewMode('expanded');
    useTimelineStore.getState().setTimelineFilter('health');
    useTimelineStore.getState().setCurrentTimelineSubTab('mood-history');
    useChatStore.getState().addChatMessage('user', 'New chat message');
    const reminder = useReminderStore.getState().createReminder({
      type: 'medicine', title: 'Vitamin D', mode: 'fixed', triggerAt: '08:00', enabled: true,
    });
    useReminderStore.getState().completeOccurrence({
      occurrenceId: 'vitamin-d-2026-08-17',
      reminderId: reminder.id,
      dueAt: '2026-08-17T08:00:00.000Z',
      originalDueAt: '2026-08-17T08:00:00.000Z',
      reminder,
    });
    useReminderStore.getState().setSystemNotificationsEnabled(true);
    useUIStore.getState().setTab('timeline');
    useUIStore.getState().setCurrentSubView('calendar');
    useUIStore.getState().setSearchQuery('sleep');
    useUIStore.getState().setProfileMode('mom');

    useActivityStore.getState().resetTrackingData();
    useTimelineStore.getState().resetTrackingData();
    useChatStore.getState().resetTrackingData();
    useReminderStore.getState().resetTrackingData();
    useUIStore.getState().resetTrackingData();

    expect(useActivityStore.getState()).toMatchObject({ babyActivities: [], momActivities: [] });
    expect(useTimelineStore.getState()).toMatchObject({
      timelineItems: [],
      selectedCalendarDate: todayStr(),
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
      calendarViewMode: 'collapsed',
      timelineFilter: 'all',
      currentTimelineSubTab: 'feed',
    });
    expect(useChatStore.getState().chatMessages).toEqual([]);
    expect(useReminderStore.getState()).toMatchObject({
      reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false,
    });
    expect(useUIStore.getState()).toMatchObject({
      currentTab: 'home', currentSubView: null, searchQuery: '', profileMode: 'baby',
    });
  });
});
