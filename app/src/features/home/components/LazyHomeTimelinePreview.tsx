import { lazy, Suspense } from 'react';
import type { ProfileMode } from '@/types';

const HomeTimelinePreview = lazy(async () => ({
  default: (await import('./HomeTimelinePreview')).HomeTimelinePreview,
}));

interface LazyHomeTimelinePreviewProps {
  owner: ProfileMode;
}

export function LazyHomeTimelinePreview({ owner }: LazyHomeTimelinePreviewProps) {
  return (
    <Suspense fallback={<div className="route-loading-state" role="status">Đang mở nhật ký…</div>}>
      <HomeTimelinePreview owner={owner} />
    </Suspense>
  );
}
