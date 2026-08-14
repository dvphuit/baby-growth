import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimelineItem, CalendarViewMode } from '@/types';
import { INITIAL_TIMELINE_ITEMS, FAMILY_DATA } from '@/data/seedData';
import { todayStr, currentTimeStr } from '@/utils/date';
import { generateId } from '@/utils/format';
import { useUIStore } from './useUIStore';
import { useBabyStore } from './useBabyStore';

interface TimelineStoreState {
  timelineItems: TimelineItem[];
  selectedCalendarDate: string;
  calendarYear: number;
  calendarMonth: number;
  calendarViewMode: CalendarViewMode;
  timelineFilter: string;
  currentTimelineSubTab: 'feed' | 'mood-history';

  addTimelineItem: (item: Partial<TimelineItem>) => void;
  toggleLike: (id: string) => void;
  setSelectedCalendarDate: (date: string) => void;
  setCalendarMonth: (year: number, month: number) => void;
  setCalendarViewMode: (mode: CalendarViewMode) => void;
  toggleCalendarViewMode: () => void;
  setTimelineFilter: (filter: string) => void;
  setCurrentTimelineSubTab: (subTab: 'feed' | 'mood-history') => void;
}

export const useTimelineStore = create<TimelineStoreState>()(
  persist(
    (set) => ({
      timelineItems: INITIAL_TIMELINE_ITEMS,
      selectedCalendarDate: todayStr(),
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
      calendarViewMode: 'collapsed',
      timelineFilter: 'all',
      currentTimelineSubTab: 'feed',

      addTimelineItem: (item) => {
        const dateStr = item.date || todayStr();
        const timeNow = currentTimeStr();
        const dateParts = dateStr.split('-');
        const formattedDay =
          dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateStr;

        const profileMode = useUIStore.getState().profileMode;
        const currentStage = useBabyStore.getState().currentStage;

        const newItem: TimelineItem = {
          id: generateId('tl'),
          stage: currentStage,
          date: dateStr,
          timeFormatted: timeNow,
          time: `${formattedDay} • ${timeNow}`,
          author: profileMode === 'mom' ? FAMILY_DATA.momName : FAMILY_DATA.momName,
          authorAvatar: profileMode === 'mom' ? FAMILY_DATA.momAvatar : FAMILY_DATA.momAvatar,
          title: item.title || 'Nhật ký mới',
          content: item.content || '',
          mediaUrl: item.mediaUrl || null,
          mediaType: item.mediaType || null,
          stats: item.stats || [],
          likes: 1,
          comments: 0,
          userLiked: true,
          tag: item.tag || 'Nhật ký',
          tagType: item.tagType || 'general',
          type: item.type || 'daily',
        };

        set((state) => ({
          timelineItems: [newItem, ...state.timelineItems],
        }));
      },

      toggleLike: (id) => set((state) => ({
        timelineItems: state.timelineItems.map((item) => {
          if (item.id === id) {
            const userLiked = !item.userLiked;
            return {
              ...item,
              userLiked,
              likes: item.likes + (userLiked ? 1 : -1),
            };
          }
          return item;
        }),
      })),

      setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),
      setCalendarMonth: (year, month) => set({ calendarYear: year, calendarMonth: month }),
      setCalendarViewMode: (mode) => set({ calendarViewMode: mode }),
      toggleCalendarViewMode: () => set((state) => ({
        calendarViewMode: state.calendarViewMode === 'collapsed' ? 'expanded' : 'collapsed'
      })),
      setTimelineFilter: (filter) => set({ timelineFilter: filter }),
      setCurrentTimelineSubTab: (subTab) => set({ currentTimelineSubTab: subTab }),
    }),
    {
      name: 'babygrowth_v2_timeline',
      partialize: (state) => ({
        timelineItems: state.timelineItems,
        selectedCalendarDate: state.selectedCalendarDate,
        calendarViewMode: state.calendarViewMode,
      }),
    }
  )
);
