import { lazy, Suspense } from 'react';
import type { ProfileMode } from '@/types';

const TimelinePreviewContent = lazy(async () => ({
  default: (await import('./TimelinePreviewContent')).TimelinePreviewContent,
}));

interface HomeTimelinePreviewProps {
  owner: ProfileMode;
}

export function HomeTimelinePreview({ owner }: HomeTimelinePreviewProps) {
  return (
    <Suspense fallback={<div className="route-loading-state" role="status">Đang mở nhật ký…</div>}>
      <TimelinePreviewContent owner={owner} />
    </Suspense>
  );
}
