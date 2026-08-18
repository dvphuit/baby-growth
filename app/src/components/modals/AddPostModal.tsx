import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Camera, Image, Images, Plus, Tag, Video, X } from 'lucide-react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { TimelineMediaAsset } from '@/components/timeline/TimelineMediaAsset';
import { readTimelineMediaFiles, removeTimelineMediaFiles } from '@/components/timeline/timelineMediaFiles';
import type { TimelineMediaItem } from '@/types';
import { BottomSheet } from '../common/BottomSheet';

type PostTagType = 'milestone' | 'feeding' | 'mom' | 'health' | 'general';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
  presetTagType?: PostTagType;
}

function localDateValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function localTimeValue(date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

export const AddPostModal: React.FC<AddPostModalProps> = ({ isOpen, onClose, onSuccessToast, presetTagType }) => {
  const addTimelineItem = useTimelineStore((state) => state.addTimelineItem);
  const [date, setDate] = useState(localDateValue);
  const [time, setTime] = useState(localTimeValue);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState(presetTagType === 'feeding' ? 'Ăn dặm' : 'Khoảnh khắc');
  const [tagType, setTagType] = useState<PostTagType>(presetTagType ?? 'general');
  const [mediaItems, setMediaItems] = useState<TimelineMediaItem[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [error, setError] = useState<string | null>(null);
  const pendingBlobIds = useRef(new Set<string>());
  const isOpenRef = useRef(isOpen);

  const discardPendingMedia = useCallback(async () => {
    const items = [...pendingBlobIds.current].map((blobId) => ({ blobId, type: 'photo' as const }));
    pendingBlobIds.current.clear();
    await removeTimelineMediaFiles(items);
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (!isOpen) void discardPendingMedia();
  }, [discardPendingMedia, isOpen]);

  useEffect(() => () => {
    isOpenRef.current = false;
    void discardPendingMedia();
  }, [discardPendingMedia]);

  const clearMedia = () => {
    setMediaItems([]);
    setMediaUrl('');
  };

  const selectFiles = async (files?: FileList | null) => {
    try {
      const nextItems = await readTimelineMediaFiles(files);
      if (nextItems.length === 0) return;
      if (!isOpenRef.current) {
        await removeTimelineMediaFiles(nextItems);
        return;
      }
      nextItems.forEach((item) => { if (item.blobId) pendingBlobIds.current.add(item.blobId); });
      setMediaItems((current) => [...current, ...nextItems]);
      setError(null);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'Không thể đọc media đã chọn.');
    }
  };

  const addMediaUrl = () => {
    const url = mediaUrl.trim();
    if (!url) return;
    setMediaItems((current) => [...current, {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      type: mediaType,
    }]);
    setMediaUrl('');
    setError(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Nhập tiêu đề khoảnh khắc.');
      return;
    }
    const pendingMedia = mediaUrl.trim()
      ? [{ url: mediaUrl.trim(), type: mediaType } satisfies TimelineMediaItem]
      : [];
    const nextMediaItems = [...mediaItems, ...pendingMedia];
    addTimelineItem({
      date,
      timeFormatted: time,
      title: title.trim(),
      content: content.trim(),
      tag,
      tagType,
      mediaItems: nextMediaItems,
      mediaUrl: nextMediaItems[0]?.url ?? null,
      mediaType: nextMediaItems[0]?.type ?? null,
      stats: [],
      type: 'daily',
    });
    pendingBlobIds.current.clear();
    onSuccessToast(`Đã lưu khoảnh khắc “${title.trim()}”.`);
    setTitle('');
    setContent('');
    clearMedia();
    setError(null);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Thêm khoảnh khắc">
      <form className="moment-form" onSubmit={submit}>
        <div className="moment-datetime-row">
          <label className="log-form-group"><span className="log-form-label"><CalendarDays size={12} /> Ngày</span><input className="log-input-control" type="date" max={localDateValue()} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label className="log-form-group"><span className="log-form-label">Thời gian</span><input className="log-input-control" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
        </div>

        <label className="log-form-group"><span className="log-form-label">Tiêu đề khoảnh khắc</span><input className="log-input-control" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Lần đầu bé tự đứng" required /></label>
        <label className="log-form-group"><span className="log-form-label">Câu chuyện</span><textarea className="log-input-control" rows={3} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Ghi lại điều đáng nhớ trong khoảnh khắc này…" /></label>

        <div className="log-form-group">
          <span className="log-form-label"><Tag size={12} /> Chủ đề</span>
          <div className="moment-tag-options">
            {[
              { label: 'Khoảnh khắc', type: 'general' as const },
              { label: 'Cột mốc', type: 'milestone' as const },
              { label: 'Ăn dặm', type: 'feeding' as const },
              { label: 'Sức khỏe', type: 'health' as const },
              { label: 'Của mẹ', type: 'mom' as const },
            ].map((option) => (
              <button type="button" key={option.type} className={tagType === option.type ? 'active' : ''} onClick={() => { setTagType(option.type); setTag(option.label); }}>{option.label}</button>
            ))}
          </div>
        </div>

        <div className="log-form-group">
          <span className="log-form-label">Ảnh và video</span>
          <div className="moment-media-source-actions">
            <label className="moment-upload-button"><Images size={16} /><span>Thư viện</span><input type="file" accept="image/*,video/*" multiple aria-label="Chọn từ thư viện" onChange={(event) => { void selectFiles(event.target.files); event.currentTarget.value = ''; }} /></label>
            <label className="moment-upload-button"><Camera size={16} /><span>Chụp ảnh</span><input type="file" accept="image/*" capture="environment" aria-label="Chụp ảnh" onChange={(event) => { void selectFiles(event.target.files); event.currentTarget.value = ''; }} /></label>
          </div>
          <span className="log-form-label moment-url-label">Hoặc thêm bằng URL</span>
          <div className="moment-media-type">
            <button type="button" className={mediaType === 'photo' ? 'active' : ''} onClick={() => setMediaType('photo')}><Image size={15} /> Ảnh</button>
            <button type="button" className={mediaType === 'video' ? 'active' : ''} onClick={() => setMediaType('video')}><Video size={15} /> Video</button>
          </div>
          <div className="moment-url-row">
            <input className="log-input-control" type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder={`Hoặc dán URL ${mediaType === 'photo' ? 'ảnh' : 'video'}`} />
            <button type="button" aria-label="Thêm media từ URL" onClick={addMediaUrl} disabled={!mediaUrl.trim()}><Plus size={16} /></button>
          </div>
        </div>

        {mediaItems.length > 0 && (
          <div className="moment-media-preview-list" aria-label={`${mediaItems.length} media đã chọn`}>
            {mediaItems.map((media, index) => (
              <div className="moment-media-preview" key={media.id ?? media.blobId ?? `${media.url}-${index}`}>
                <TimelineMediaAsset media={media} controls alt={media.name || `Ảnh ${index + 1}`} />
                <button type="button" aria-label={`Bỏ media ${index + 1}`} onClick={() => {
                  setMediaItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
                  if (media.blobId && pendingBlobIds.current.delete(media.blobId)) void removeTimelineMediaFiles([media]);
                }}><X size={15} /></button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="moment-form-error" role="alert">{error}</p>}
        <button type="submit" className="log-btn-primary"><span>Lưu khoảnh khắc</span><ArrowRight size={14} /></button>
      </form>
    </BottomSheet>
  );
};
