import { lazy, Suspense } from 'react';
import type { ProfileMode } from '@/features/profile';

const TimelinePreviewContent = lazy(async () => {
  const [timelineFeature, module] = await Promise.all([
    import('@/features/timeline'),
    import('./TimelinePreviewContent'),
  ]);
  await timelineFeature.loadTimelineStyles();
  return { default: module.TimelinePreviewContent };
});

interface LazyHomeTimelinePreviewProps {
  owner: ProfileMode;
  onAddActivity: () => void;
}

export function LazyHomeTimelinePreview({ owner, onAddActivity }: LazyHomeTimelinePreviewProps) {
  return (
    <Suspense fallback={<div className="route-loading-state" role="status">Đang mở nhật ký…</div>}>
      <TimelinePreviewContent owner={owner} onAddActivity={onAddActivity} />
    </Suspense>
  );
}
