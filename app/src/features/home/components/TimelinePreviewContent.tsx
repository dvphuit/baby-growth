import { useMemo } from 'react';
import { useActivityStore } from '@/features/activities/store/useActivityStore';
import { NotebookStory } from '@/features/timeline/components/NotebookStory';
import { HomeMomentStoryItem } from '@/features/timeline/components/HomeMomentStoryItem';
import { useHomeTimeline } from '../hooks/useHomeTimeline';
import type { ProfileMode } from '@/types';

interface TimelinePreviewContentProps {
  owner: ProfileMode;
}

export function TimelinePreviewContent({ owner }: TimelinePreviewContentProps) {
  const now = useMemo(() => new Date(), []);
  const records = useActivityStore((state) =>
    owner === 'baby' ? state.babyActivities : state.momActivities,
  );

  const { timelineEntries, openRecord, openMoment, openMomentMedia } = useHomeTimeline({
    owner,
    records,
    dayActivities: records,
    now,
  });

  if (!timelineEntries.length) return null;

  return (
    <section className="haven-home-timeline-preview" data-owner={owner} aria-label="Nhật ký trong ngày">
      <NotebookStory entries={timelineEntries} owner={owner} className="haven-home-notebook">
        <div className="journal-period-items">
          {timelineEntries.map((entry) => {
            if (entry.kind === 'moment') {
              return (
                <HomeMomentStoryItem
                  key={entry.item.id}
                  item={entry.item}
                  occurredAt={entry.occurredAt}
                  formattedTime={entry.occurredAt}
                  onOpenEntry={() => openMoment(entry.item.id)}
                  onOpenMedia={openMomentMedia}
                />
              );
            }

            return (
              <button key={entry.record.id} type="button" onClick={() => openRecord(entry.record.id)}>
                {entry.record.type}
              </button>
            );
          })}
        </div>
      </NotebookStory>
    </section>
  );
}
