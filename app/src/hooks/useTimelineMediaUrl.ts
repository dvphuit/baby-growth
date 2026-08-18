import { useEffect, useState } from 'react';
import { downloadTimelineMediaFromDrive } from '@/services/googleDriveSync';
import { getLocalMedia } from '@/services/localDb';
import type { TimelineMediaItem } from '@/types';

export function useTimelineMediaUrl(media: TimelineMediaItem): string | null {
  const remoteUrl = media.url?.trim() || null;
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(remoteUrl);

  useEffect(() => {
    if (remoteUrl) {
      setResolvedUrl(remoteUrl);
      return undefined;
    }
    if (!media.blobId && !media.driveFileId) {
      setResolvedUrl(null);
      return undefined;
    }

    let active = true;
    let objectUrl: string | null = null;
    setResolvedUrl(null);
    void (async () => {
      const localBlob = media.blobId ? await getLocalMedia(media.blobId) : null;
      return localBlob ?? (media.driveFileId
        ? downloadTimelineMediaFromDrive(media.driveFileId, { interactive: false })
        : null);
    })().then((blob) => {
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setResolvedUrl(objectUrl);
    }).catch(() => {
      if (active) setResolvedUrl(null);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media.blobId, media.driveFileId, remoteUrl]);

  return resolvedUrl;
}
