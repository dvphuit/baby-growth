import { beforeEach, describe, expect, it, vi } from 'vitest';
import { detectTimelineMediaType, readTimelineMediaFiles } from './timelineMediaFiles';

const localMedia = vi.hoisted(() => ({
  setLocalMedia: vi.fn(),
  removeLocalMedia: vi.fn(),
}));

vi.mock('@/services/localDb', () => localMedia);

describe('timelineMediaFiles', () => {
  beforeEach(() => {
    localMedia.setLocalMedia.mockResolvedValue(undefined);
    localMedia.removeLocalMedia.mockResolvedValue(undefined);
  });

  it('persists the original file as a blob and returns only its local id', async () => {
    const file = new File(['image-bytes'], 'baby.jpg', { type: 'image/jpeg' });
    const files = { 0: file, length: 1, item: () => file, [Symbol.iterator]: function* iterator() { yield file; } } as unknown as FileList;

    const [media] = await readTimelineMediaFiles(files);

    expect(localMedia.setLocalMedia).toHaveBeenCalledWith(media.blobId, file);
    expect(media).toMatchObject({ blobId: media.id, type: 'photo', name: 'baby.jpg', focalX: 50, focalY: 38 });
    expect(media.url).toBeUndefined();
  });

  it('stores large media without an application-level size cap', async () => {
    const file = new File([new Uint8Array(16 * 1024 * 1024)], 'large.mp4', { type: 'video/mp4' });
    const files = { 0: file, length: 1, item: () => file, [Symbol.iterator]: function* iterator() { yield file; } } as unknown as FileList;

    const [media] = await readTimelineMediaFiles(files);

    expect(localMedia.setLocalMedia).toHaveBeenCalledWith(media.blobId, file);
    expect(media.type).toBe('video');
  });

  it('detects photo and video types from MIME values or file extensions', () => {
    expect(detectTimelineMediaType('gallery-item', 'image/heic')).toBe('photo');
    expect(detectTimelineMediaType('gallery-item', 'video/quicktime')).toBe('video');
    expect(detectTimelineMediaType('https://example.com/photo.webp?size=large')).toBe('photo');
    expect(detectTimelineMediaType('https://example.com/clip.MOV#preview')).toBe('video');
  });
});
