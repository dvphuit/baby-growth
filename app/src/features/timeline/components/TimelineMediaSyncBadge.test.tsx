import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  publishTimelineMediaSyncProgress,
  resetTimelineMediaSyncProgress,
} from '@/features/sync/timelineMediaSyncProgress';
import { TimelineMediaSyncBadge } from './TimelineMediaSyncBadge';

describe('TimelineMediaSyncBadge', () => {
  beforeEach(() => resetTimelineMediaSyncProgress());

  it('shows local, live upload progress and synced Drive states', () => {
    const { rerender } = render(
      <TimelineMediaSyncBadge media={{ id: 'media-1', blobId: 'media-1', type: 'photo' }} />,
    );
    expect(screen.getByRole('status')).toHaveAccessibleName('Đang lưu trên thiết bị, chờ đồng bộ Google Drive');
    expect(screen.getByRole('status')).toHaveClass('status-local');
    expect(screen.getByRole('status').querySelector('svg')).toBeInTheDocument();

    act(() => publishTimelineMediaSyncProgress('media-1', { status: 'uploading', progress: 63 }));
    expect(screen.getByRole('status')).toHaveAccessibleName('Đang tải lên Google Drive: 63%');
    expect(screen.getByRole('status')).toHaveClass('status-uploading');
    expect(screen.getByRole('status')).not.toHaveTextContent('63%');

    rerender(
      <TimelineMediaSyncBadge media={{ id: 'media-1', blobId: 'media-1', driveFileId: 'drive-1', type: 'photo' }} />,
    );
    expect(screen.getByRole('status')).toHaveAccessibleName('Đã đồng bộ lên Google Drive');
    expect(screen.getByRole('status')).toHaveClass('status-synced');
  });
});
