import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

function replaceExact(file, from, to) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(from)) {
    throw new Error(`Expected text not found in ${file}: ${from.slice(0, 120)}`);
  }
  writeFileSync(file, source.replace(from, to));
}

mkdirSync('src/features/home/hooks', { recursive: true });
writeFileSync('src/features/home/hooks/useHomeTimeline.ts', `import { useMemo, useState } from 'react';
import {
  isTimelineMomentOnLocalDay,
  timelineMomentOccurredAt,
  timelineMomentOwner,
  useTimelineStore,
  type JournalTimelineEntry,
  type MomentMediaPreviewState,
} from '@/features/timeline';
import type { ActivityRecord, ProfileMode, TimelineItem, TimelineMediaItem } from '@/types';

type OwnerActivity<T extends ProfileMode> = Extract<ActivityRecord, { owner: T }>;

export type HomeTimelineEntry<T extends ProfileMode> =
  | { kind: 'activity'; occurredAt: string; record: OwnerActivity<T> }
  | { kind: 'moment'; occurredAt: string; item: TimelineItem };

interface UseHomeTimelineOptions<T extends ProfileMode> {
  owner: T;
  records: OwnerActivity<T>[];
  dayActivities: OwnerActivity<T>[];
  now: Date;
}

export function useHomeTimeline<T extends ProfileMode>({
  owner,
  records,
  dayActivities,
  now,
}: UseHomeTimelineOptions<T>) {
  const timelineItems = useTimelineStore((state) => state.timelineItems);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [momentPreview, setMomentPreview] = useState<MomentMediaPreviewState | null>(null);

  const dayMoments = useMemo(
    () => timelineItems.filter((item) => timelineMomentOwner(item) === owner && isTimelineMomentOnLocalDay(item, now)),
    [now, owner, timelineItems],
  );

  const timelineEntries = useMemo<HomeTimelineEntry<T>[]>(() => {
    const activityEntries: HomeTimelineEntry<T>[] = dayActivities.map((record) => ({
      kind: 'activity',
      occurredAt: record.occurredAt,
      record,
    }));
    const momentEntries: HomeTimelineEntry<T>[] = dayMoments.map((item) => ({
      kind: 'moment',
      occurredAt: timelineMomentOccurredAt(item),
      item,
    }));
    return [...activityEntries, ...momentEntries]
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }, [dayActivities, dayMoments]);

  const selectedRecord = selectedRecordId
    ? records.find((item) => item.id === selectedRecordId) ?? null
    : null;
  const selectedMoment = selectedMomentId
    ? timelineItems.find((item) => item.id === selectedMomentId) ?? null
    : null;
  const selectedMomentEntry: JournalTimelineEntry | null = selectedMoment ? {
    id: \`moment-\${selectedMoment.id}\`,
    occurredAt: timelineMomentOccurredAt(selectedMoment),
    owner: timelineMomentOwner(selectedMoment),
    type: 'moment',
    title: selectedMoment.title,
    detail: selectedMoment.content,
    stats: selectedMoment.stats ?? [],
    moment: selectedMoment,
  } : null;

  const openRecord = (id: string) => {
    setSelectedMomentId(null);
    setSelectedRecordId(id);
  };

  const openMoment = (id: string) => {
    setSelectedRecordId(null);
    setSelectedMomentId(id);
  };

  const openMomentMedia = (
    items: TimelineMediaItem[],
    initialIndex: number,
    title: string,
    layoutId: string,
    originSrc: string,
    getLayoutId?: (index: number, media: TimelineMediaItem) => string,
  ) => setMomentPreview({ items, initialIndex, title, layoutId, originSrc, getLayoutId });

  const closeEntry = () => {
    setSelectedRecordId(null);
    setSelectedMomentId(null);
  };

  return {
    timelineEntries,
    selectedRecord,
    selectedMomentEntry,
    momentPreview,
    openRecord,
    openMoment,
    openMomentMedia,
    closeEntry,
    closeMomentPreview: () => setMomentPreview(null),
  };
}
`);

replaceExact(
  'src/features/timeline/index.ts',
  "export * from './components/TimelineEntryDialog';\n",
  "export * from './components/TimelineEntryDialog';\nexport { isTimelineMomentOnLocalDay, timelineMomentOccurredAt, timelineMomentOwner } from './domain/timelineMedia';\nexport { useTimelineStore } from './store/useTimelineStore';\n",
);

for (const file of [
  'src/features/home/components/BabyHomeView.tsx',
  'src/features/home/components/MomHomeView.tsx',
]) {
  replaceExact(file, "import { useMemo, useState } from 'react';", "import { useMemo } from 'react';");
  replaceExact(
    file,
    "import { MomentMediaPreview, type MomentMediaPreviewState } from '@/features/timeline';\nimport { TimelineEntryDialog, type JournalTimelineEntry } from '@/features/timeline';\nimport { isTimelineMomentOnLocalDay, timelineMomentOccurredAt, timelineMomentOwner } from '@/features/timeline/domain/timelineMedia';\nimport { useTimelineStore } from '@/features/timeline/store/useTimelineStore';",
    "import { MomentMediaPreview, TimelineEntryDialog } from '@/features/timeline';\nimport { useHomeTimeline } from '../hooks/useHomeTimeline';",
  );
  replaceExact(file, '  const timelineItems = useTimelineStore((state) => state.timelineItems);\n', '');
  replaceExact(
    file,
    "  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);\n  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);\n  const [momentPreview, setMomentPreview] = useState<MomentMediaPreviewState | null>(null);\n  const selectedRecord = selectedRecordId\n    ? records.find((item) => item.id === selectedRecordId) ?? null\n    : null;\n\n",
    '',
  );
}

replaceExact(
  'src/features/home/components/BabyHomeView.tsx',
  "  const dayMoments = useMemo(\n    () => timelineItems.filter((item) => timelineMomentOwner(item) === 'baby' && isTimelineMomentOnLocalDay(item, now)),\n    [now, timelineItems],\n  );\n  const timelineEntries = useMemo(() => [\n    ...dayActivities.map((record) => ({ kind: 'activity' as const, occurredAt: record.occurredAt, record })),\n    ...dayMoments.map((item) => ({ kind: 'moment' as const, occurredAt: timelineMomentOccurredAt(item), item })),\n  ].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()), [dayActivities, dayMoments]);\n  const selectedMoment = selectedMomentId\n    ? timelineItems.find((item) => item.id === selectedMomentId) ?? null\n    : null;\n  const selectedMomentEntry: JournalTimelineEntry | null = selectedMoment ? {\n    id: `moment-${selectedMoment.id}`,\n    occurredAt: timelineMomentOccurredAt(selectedMoment),\n    owner: timelineMomentOwner(selectedMoment),\n    type: 'moment',\n    title: selectedMoment.title,\n    detail: selectedMoment.content,\n    stats: selectedMoment.stats ?? [],\n    moment: selectedMoment,\n  } : null;\n",
  "  const {\n    timelineEntries,\n    selectedRecord,\n    selectedMomentEntry,\n    momentPreview,\n    openRecord,\n    openMoment,\n    openMomentMedia,\n    closeEntry,\n    closeMomentPreview,\n  } = useHomeTimeline({ owner: 'baby', records, dayActivities, now });\n",
);

replaceExact(
  'src/features/home/components/MomHomeView.tsx',
  "  const dayMoments = useMemo(\n    () => timelineItems.filter((item) => timelineMomentOwner(item) === 'mom' && isTimelineMomentOnLocalDay(item, now)),\n    [now, timelineItems],\n  );\n  const timelineEntries = useMemo(() => [\n    ...dayActivities.map((record) => ({ kind: 'activity' as const, occurredAt: record.occurredAt, record })),\n    ...dayMoments.map((item) => ({ kind: 'moment' as const, occurredAt: timelineMomentOccurredAt(item), item })),\n  ].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()), [dayActivities, dayMoments]);\n  const selectedMoment = selectedMomentId\n    ? timelineItems.find((item) => item.id === selectedMomentId) ?? null\n    : null;\n  const selectedMomentEntry: JournalTimelineEntry | null = selectedMoment ? {\n    id: `moment-${selectedMoment.id}`,\n    occurredAt: timelineMomentOccurredAt(selectedMoment),\n    owner: timelineMomentOwner(selectedMoment),\n    type: 'moment',\n    title: selectedMoment.title,\n    detail: selectedMoment.content,\n    stats: selectedMoment.stats ?? [],\n    moment: selectedMoment,\n  } : null;\n",
  "  const {\n    timelineEntries,\n    selectedRecord,\n    selectedMomentEntry,\n    momentPreview,\n    openRecord,\n    openMoment,\n    openMomentMedia,\n    closeEntry,\n    closeMomentPreview,\n  } = useHomeTimeline({ owner: 'mom', records, dayActivities, now });\n",
);

for (const file of [
  'src/features/home/components/BabyHomeView.tsx',
  'src/features/home/components/MomHomeView.tsx',
]) {
  replaceExact(
    file,
    "                        onOpenEntry={() => {\n                          setSelectedRecordId(null);\n                          setSelectedMomentId(timelineEntry.item.id);\n                        }}\n                        onOpenMedia={(items, initialIndex, title, layoutId, originSrc, getLayoutId) => setMomentPreview({\n                          items, initialIndex, title, layoutId, originSrc, getLayoutId,\n                        })}",
    "                        onOpenEntry={() => openMoment(timelineEntry.item.id)}\n                        onOpenMedia={openMomentMedia}",
  );
  replaceExact(
    file,
    "                          onClick={() => {\n                            setSelectedMomentId(null);\n                            setSelectedRecordId(record.id);\n                          }}",
    "                          onClick={() => openRecord(record.id)}",
  );
  replaceExact(
    file,
    "        onClose={() => {\n          setSelectedRecordId(null);\n          setSelectedMomentId(null);\n        }}\n        onOpenMomentMedia={(items, initialIndex, title, layoutId, originSrc, getLayoutId) => setMomentPreview({\n          items, initialIndex, title, layoutId, originSrc, getLayoutId,\n        })}",
    "        onClose={closeEntry}\n        onOpenMomentMedia={openMomentMedia}",
  );
  replaceExact(
    file,
    '      <MomentMediaPreview preview={momentPreview} onClose={() => setMomentPreview(null)} />',
    '      <MomentMediaPreview preview={momentPreview} onClose={closeMomentPreview} />',
  );
}

console.log('Home timeline state consolidated successfully.');
