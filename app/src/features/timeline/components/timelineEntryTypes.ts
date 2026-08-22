import type { ActivityRecord } from '@/features/activities';
import type { GrowthHistoryRecord } from '@/features/growth';
import type { TimelineItem } from '@/features/timeline/domain/types';
import type { DerivedTimelineEntry } from '@/features/timeline/domain/timelineSelectors';

export type JournalTimelineEntry = DerivedTimelineEntry & { moment?: TimelineItem };

export type EditableTimelineSource =
  | { kind: 'activity'; record: ActivityRecord }
  | { kind: 'growth'; record: GrowthHistoryRecord }
  | { kind: 'moment'; record: TimelineItem };
