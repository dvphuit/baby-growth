import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  Baby, CalendarDays, Camera, ChevronDown, ChevronUp, Clock3, Droplets, Heart, Images,
  Image as ImageIcon, Milk, MoonStar, NotebookPen, Pencil, Pill, Play, Ruler, Thermometer, Video, type LucideIcon,
} from 'lucide-react';
import { HavenAlert } from '@/components/common/HavenAlert';
import { HavenCalendar, type HavenDateRange } from '@/components/common/HavenCalendar';
import { HavenDialog } from '@/components/common/HavenDialog';
import { NotebookStory } from '@/components/timeline/NotebookStory';
import { readTimelineMediaFiles, removeTimelineMediaFiles } from '@/components/timeline/timelineMediaFiles';
import { getRealGrowthHistory } from '@/domain/growthSelectors';
import { getTimelineMediaItems } from '@/domain/timelineMedia';
import { useTimelineMediaUrl } from '@/hooks/useTimelineMediaUrl';
import { buildTimelineEntries, filterTimelineByLocalDateRange, type DerivedTimelineEntry } from '@/domain/timelineSelectors';
import { useActivityStore } from '@/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';
import type { ActivityRecord, GrowthHistoryRecord, TimelineItem, TimelineMediaItem } from '@/types';

interface TimelineViewProps {
  onOpenLightbox: (src: string, isVideo?: boolean) => void;
  onOpenAddEntry: () => void;
}

const ENTRY_META: Record<string, { icon: LucideIcon; tone: string }> = {
  feeding: { icon: Milk, tone: 'apricot' }, sleep: { icon: MoonStar, tone: 'lavender' },
  diaper: { icon: Baby, tone: 'sage' }, medicine: { icon: Pill, tone: 'rose' },
  temperature: { icon: Thermometer, tone: 'coral' }, growth: { icon: Ruler, tone: 'sage' },
  pumping: { icon: Droplets, tone: 'blue' }, mood: { icon: Heart, tone: 'rose' },
  moment: { icon: ImageIcon, tone: 'moment' },
};

type JournalTimelineEntry = DerivedTimelineEntry & { moment?: TimelineItem };

interface TimelineMediaButtonProps {
  media: TimelineMediaItem;
  className: string;
  ariaLabel: string;
  alt: string;
  onOpen: (src: string, isVideo: boolean) => void;
  imageStyle?: CSSProperties;
  playSize: number;
  showKind?: boolean;
  moreCount?: number;
}

function TimelineMediaButton({
  media,
  className,
  ariaLabel,
  alt,
  onOpen,
  imageStyle,
  playSize,
  showKind = false,
  moreCount = 0,
}: TimelineMediaButtonProps) {
  const src = useTimelineMediaUrl(media);
  return (
    <button type="button" className={className} onClick={() => { if (src) onOpen(src, media.type === 'video'); }} aria-label={ariaLabel} disabled={!src}>
      {src && (media.type === 'video'
        ? <><video src={src} preload="metadata" /><span className="journal-media-play"><Play size={playSize} fill="currentColor" /></span>{showKind && <span className="journal-story-media-kind"><Video size={13} /> Video</span>}</>
        : <><img src={src} alt={alt} style={imageStyle} />{showKind && <span className="journal-story-media-kind"><ImageIcon size={13} /> Ảnh</span>}</>)}
      {moreCount > 0 && <span className="journal-media-more">+{moreCount}</span>}
    </button>
  );
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function formatFullDate(value: string): string {
  const formatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(dateFromKey(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatMonth(value: string): string {
  const formatted = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(dateFromKey(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function ownerLabel(owner: JournalTimelineEntry['owner']): string {
  return owner === 'baby' ? 'Của bé' : owner === 'mom' ? 'Của mẹ' : 'Hệ thống';
}

function entryMeta(entry: JournalTimelineEntry): { icon: LucideIcon; tone: string } {
  return ENTRY_META[entry.type] ?? { icon: NotebookPen, tone: 'neutral' };
}

function entryCategoryLabel(entry: JournalTimelineEntry): string {
  if (entry.moment) return entry.moment.tag;
  return {
    feeding: 'Ăn uống', sleep: 'Giấc ngủ', diaper: 'Chăm sóc', medicine: 'Sức khỏe',
    temperature: 'Sức khỏe', growth: 'Tăng trưởng', pumping: 'Sữa mẹ', mood: 'Cảm xúc',
  }[entry.type] ?? 'Ghi nhận';
}

const DAY_PERIODS = [
  { id: 'morning', start: 0, end: 12 },
  { id: 'afternoon', start: 12, end: 18 },
  { id: 'evening', start: 18, end: 24 },
] as const;

function entriesByPeriod(entries: JournalTimelineEntry[]) {
  return DAY_PERIODS.map((period) => ({
    ...period,
    entries: entries
      .filter((entry) => {
        const hour = new Date(entry.occurredAt).getHours();
        return hour >= period.start && hour < period.end;
      })
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
  })).filter((period) => period.entries.length > 0);
}

function surroundingWeek(dateKey: string): Array<{ key: string; date: Date }> {
  const selected = dateFromKey(dateKey);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selected);
    date.setDate(selected.getDate() + index - 3);
    return { key: localDateKey(date), date };
  });
}

function shiftDateKey(dateKey: string, days: number): string {
  const date = dateFromKey(dateKey);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function localDateTimeValue(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function dateInputValue(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return value;
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

function momentOccurredAt(item: Pick<TimelineItem, 'date' | 'timeFormatted'>): string {
  const [year, month, day] = item.date.split('-').map(Number);
  const [hour = 0, minute = 0] = item.timeFormatted.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0);
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

function momentOwner(item: TimelineItem): JournalTimelineEntry['owner'] {
  return item.owner ?? (item.tagType === 'mom' || item.type === 'mom' ? 'mom' : 'baby');
}

function momentEntry(item: TimelineItem): JournalTimelineEntry {
  return {
    id: `moment-${item.id}`,
    occurredAt: momentOccurredAt(item),
    owner: momentOwner(item),
    type: 'moment',
    title: item.title,
    detail: item.content,
    stats: item.stats ?? [],
    moment: item,
  };
}

type EditableTimelineSource =
  | { kind: 'activity'; record: ActivityRecord }
  | { kind: 'growth'; record: GrowthHistoryRecord }
  | { kind: 'moment'; record: TimelineItem };

interface TimelineEntryEditorProps {
  source: EditableTimelineSource;
  onCancel: () => void;
  onSaved: () => void;
}

function TimelineEntryEditor({ source, onCancel, onSaved }: TimelineEntryEditorProps) {
  const updateActivity = useActivityStore((state) => state.updateActivity);
  const updateGrowthMeasurement = useBabyStore((state) => state.updateGrowthMeasurement);
  const updateTimelineItem = useTimelineStore((state) => state.updateTimelineItem);
  const activity = source.kind === 'activity' ? source.record : null;
  const growth = source.kind === 'growth' ? source.record : null;
  const moment = source.kind === 'moment' ? source.record : null;
  const [occurredAt, setOccurredAt] = useState(() => activity
    ? localDateTimeValue(activity.occurredAt)
    : growth
      ? dateInputValue(growth.date)
      : moment
        ? `${moment.date}T${moment.timeFormatted}`
        : '');
  const [note, setNote] = useState(moment?.content ?? activity?.note ?? growth?.note ?? '');
  const [title, setTitle] = useState(moment?.title ?? '');
  const [mediaItems, setMediaItems] = useState<TimelineMediaItem[]>(() => moment ? getTimelineMediaItems(moment) : []);
  const [amount, setAmount] = useState(() => activity && 'amountMl' in activity ? String(activity.amountMl ?? '') : '');
  const [duration, setDuration] = useState(() => activity && 'durationMinutes' in activity ? String(activity.durationMinutes ?? '') : '');
  const [method, setMethod] = useState(() => activity?.type === 'feeding' ? activity.method ?? 'bottle' : 'bottle');
  const [diaperKind, setDiaperKind] = useState(() => activity?.type === 'diaper' ? activity.diaperKind : 'wet');
  const [medicineName, setMedicineName] = useState(() => activity?.type === 'medicine' ? activity.name : '');
  const [dose, setDose] = useState(() => activity?.type === 'medicine' ? activity.dose ?? '' : '');
  const [temperature, setTemperature] = useState(() => activity?.type === 'temperature' ? String(activity.temperatureC) : '');
  const [side, setSide] = useState(() => activity?.type === 'pumping' ? activity.side : 'both');
  const [mood, setMood] = useState(() => activity?.type === 'mood' ? activity.mood : 'good');
  const [weight, setWeight] = useState(() => growth ? String(growth.weight) : '');
  const [height, setHeight] = useState(() => growth ? String(growth.height) : '');
  const [headCirc, setHeadCirc] = useState(() => growth ? String(growth.headCirc) : '');
  const [error, setError] = useState<string | null>(null);
  const initialBlobIds = useRef(new Set(mediaItems.flatMap((media) => media.blobId ? [media.blobId] : [])));
  const pendingBlobIds = useRef(new Set<string>());
  const removedBlobIds = useRef(new Set<string>());
  const editorActive = useRef(true);

  const discardPendingMedia = useCallback(async () => {
    const items = [...pendingBlobIds.current].map((blobId) => ({ blobId, type: 'photo' as const }));
    pendingBlobIds.current.clear();
    await removeTimelineMediaFiles(items);
  }, []);

  useEffect(() => () => {
    editorActive.current = false;
    void discardPendingMedia();
  }, [discardPendingMedia]);

  const appendMediaFiles = async (files?: FileList | null) => {
    try {
      const nextItems = await readTimelineMediaFiles(files);
      if (nextItems.length === 0) return;
      if (!editorActive.current) {
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

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (source.kind === 'moment') {
      if (!title.trim()) {
        setError('Nhập tiêu đề khoảnh khắc.');
        return;
      }
      const [date, time] = occurredAt.split('T');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}/.test(time ?? '')) {
        setError('Thời điểm chưa hợp lệ.');
        return;
      }
      updateTimelineItem(source.record.id, {
        date,
        timeFormatted: time.slice(0, 5),
        title: title.trim(),
        content: note.trim(),
        mediaItems: mediaItems.filter((media) => media.blobId || media.driveFileId || media.url?.trim()),
      });
      pendingBlobIds.current.clear();
      await removeTimelineMediaFiles([...removedBlobIds.current].map((blobId) => ({ blobId, type: 'photo' })));
      removedBlobIds.current.clear();
      onSaved();
      return;
    }

    if (source.kind === 'growth') {
      const nextWeight = Number(weight);
      const nextHeight = Number(height);
      const nextHeadCirc = Number(headCirc);
      if (![nextWeight, nextHeight, nextHeadCirc].every((value) => Number.isFinite(value) && value >= 0)) {
        setError('Các số đo phải là số hợp lệ.');
        return;
      }
      updateGrowthMeasurement(source.record.id, {
        date: occurredAt,
        weight: nextWeight,
        height: nextHeight,
        headCirc: nextHeadCirc,
        note: note.trim(),
      });
      onSaved();
      return;
    }

    const occurredDate = new Date(occurredAt);
    if (!Number.isFinite(occurredDate.getTime())) {
      setError('Thời điểm chưa hợp lệ.');
      return;
    }
    const common = { occurredAt: occurredDate.toISOString(), note: note.trim() || undefined };
    const current = source.record;
    let patch: Partial<ActivityRecord> = common;

    if (current.type === 'feeding') {
      const nextAmount = Number(amount);
      const nextDuration = Number(duration);
      if ((!Number.isFinite(nextAmount) || nextAmount <= 0) && (!Number.isFinite(nextDuration) || nextDuration <= 0)) {
        setError('Nhập lượng sữa hoặc thời lượng bú.');
        return;
      }
      patch = { ...common, amountMl: nextAmount > 0 ? nextAmount : undefined, durationMinutes: nextDuration > 0 ? nextDuration : undefined, method } as Partial<ActivityRecord>;
    } else if (current.type === 'sleep') {
      const nextDuration = Number(duration);
      if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
        setError('Thời lượng phải lớn hơn 0 phút.');
        return;
      }
      patch = { ...common, durationMinutes: nextDuration } as Partial<ActivityRecord>;
    } else if (current.type === 'diaper') {
      patch = { ...common, diaperKind } as Partial<ActivityRecord>;
    } else if (current.type === 'medicine') {
      if (!medicineName.trim()) {
        setError('Nhập tên thuốc hoặc vitamin.');
        return;
      }
      patch = { ...common, name: medicineName.trim(), dose: dose.trim() || undefined } as Partial<ActivityRecord>;
    } else if (current.type === 'temperature') {
      const nextTemperature = Number(temperature);
      if (!Number.isFinite(nextTemperature) || nextTemperature <= 0) {
        setError('Nhiệt độ chưa hợp lệ.');
        return;
      }
      patch = { ...common, temperatureC: nextTemperature } as Partial<ActivityRecord>;
    } else if (current.type === 'pumping') {
      const nextAmount = Number(amount);
      if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
        setError('Lượng sữa phải lớn hơn 0 ml.');
        return;
      }
      patch = { ...common, amountMl: nextAmount, side } as Partial<ActivityRecord>;
    } else if (current.type === 'mood') {
      patch = { ...common, mood } as Partial<ActivityRecord>;
    }

    updateActivity(current.id, patch);
    onSaved();
  };

  return (
    <form className="journal-edit-form" onSubmit={save}>
      <label><span>{source.kind === 'growth' ? 'Ngày đo' : 'Thời điểm'}</span><input type={source.kind === 'growth' ? 'date' : 'datetime-local'} value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} required /></label>
      {moment && <>
        <label className="journal-edit-wide"><span>Tiêu đề</span><input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <div className="journal-edit-media-list">
          <span>Ảnh và video</span>
          <div className="moment-media-source-actions">
            <label className="moment-upload-button"><Images size={15} /><span>Thư viện</span><input type="file" accept="image/*,video/*" multiple aria-label="Chọn từ thư viện" onChange={(event) => { void appendMediaFiles(event.target.files); event.currentTarget.value = ''; }} /></label>
            <label className="moment-upload-button"><Camera size={15} /><span>Chụp ảnh</span><input type="file" accept="image/*" capture="environment" aria-label="Chụp ảnh" onChange={(event) => { void appendMediaFiles(event.target.files); event.currentTarget.value = ''; }} /></label>
          </div>
          {mediaItems.map((media, index) => (
            <div className="journal-edit-media-row" key={media.id ?? media.blobId ?? index}>
              <select aria-label={`Loại media ${index + 1}`} value={media.type} onChange={(event) => setMediaItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as TimelineMediaItem['type'] } : item))}><option value="photo">Ảnh</option><option value="video">Video</option></select>
              {media.blobId
                ? <input aria-label={`Media cục bộ ${index + 1}`} value={media.name || 'Tệp lưu trên thiết bị'} readOnly />
                : <input aria-label={`URL media ${index + 1}`} type="url" value={media.url ?? ''} onChange={(event) => setMediaItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="URL media" />}
              <button type="button" aria-label={`Bỏ media ${index + 1}`} onClick={() => {
                setMediaItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
                if (!media.blobId) return;
                if (pendingBlobIds.current.delete(media.blobId)) void removeTimelineMediaFiles([media]);
                else if (initialBlobIds.current.has(media.blobId)) removedBlobIds.current.add(media.blobId);
              }}>Bỏ</button>
            </div>
          ))}
          <button type="button" className="journal-edit-add-media" onClick={() => setMediaItems((current) => [...current, { id: `media-${Date.now()}`, url: '', type: 'photo' }])}>+ Thêm media</button>
        </div>
      </>}
      {activity?.type === 'feeding' && <><label><span>Lượng sữa (ml)</span><input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label><span>Thời lượng (phút)</span><input type="number" min="0" value={duration} onChange={(event) => setDuration(event.target.value)} /></label><label><span>Cách bú</span><select value={method} onChange={(event) => setMethod(event.target.value as typeof method)}><option value="bottle">Bình</option><option value="breast">Trực tiếp</option><option value="other">Khác</option></select></label></>}
      {activity?.type === 'sleep' && <label><span>Thời lượng (phút)</span><input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} required /></label>}
      {activity?.type === 'diaper' && <label><span>Loại tã</span><select value={diaperKind} onChange={(event) => setDiaperKind(event.target.value as typeof diaperKind)}><option value="wet">Ướt</option><option value="dirty">Bẩn</option><option value="both">Cả hai</option></select></label>}
      {activity?.type === 'medicine' && <><label><span>Tên thuốc / vitamin</span><input value={medicineName} onChange={(event) => setMedicineName(event.target.value)} required /></label><label><span>Liều dùng</span><input value={dose} onChange={(event) => setDose(event.target.value)} /></label></>}
      {activity?.type === 'temperature' && <label><span>Nhiệt độ (°C)</span><input type="number" min="30" max="45" step="0.1" value={temperature} onChange={(event) => setTemperature(event.target.value)} required /></label>}
      {activity?.type === 'pumping' && <><label><span>Lượng sữa (ml)</span><input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label><span>Bên hút</span><select value={side} onChange={(event) => setSide(event.target.value as typeof side)}><option value="left">Bên trái</option><option value="right">Bên phải</option><option value="both">Hai bên</option></select></label></>}
      {activity?.type === 'mood' && <label><span>Tâm trạng</span><select value={mood} onChange={(event) => setMood(event.target.value as typeof mood)}><option value="great">Rất tốt</option><option value="good">Tốt</option><option value="neutral">Bình thường</option><option value="low">Không tốt</option><option value="very_low">Rất không tốt</option></select></label>}
      {growth && <div className="journal-edit-measurements"><label><span>Cân nặng (kg)</span><input type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} /></label><label><span>Chiều cao (cm)</span><input type="number" min="0" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} /></label><label><span>Vòng đầu (cm)</span><input type="number" min="0" step="0.1" value={headCirc} onChange={(event) => setHeadCirc(event.target.value)} /></label></div>}
      <label className="journal-edit-note"><span>{moment ? 'Câu chuyện' : 'Ghi chú'}</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} /></label>
      {error && <p className="journal-edit-error" role="alert">{error}</p>}
      <div className="journal-edit-actions"><button type="button" onClick={() => { void discardPendingMedia().finally(onCancel); }}>Hủy</button><button type="submit">Lưu thay đổi</button></div>
    </form>
  );
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onOpenLightbox }) => {
  const babyActivities = useActivityStore((state) => state.babyActivities);
  const momActivities = useActivityStore((state) => state.momActivities);
  const rawGrowthHistory = useBabyStore((state) => state.currentStageData().growthHistory);
  const birthDate = useBabyStore((state) => state.familyData.birthDate);
  const timelineItems = useTimelineStore((state) => state.timelineItems);
  const ownerFilter = useUIStore((state) => state.profileMode);
  const growthHistory = useMemo(() => getRealGrowthHistory(rawGrowthHistory), [rawGrowthHistory]);
  const [selectedRange, setSelectedRange] = useState<HavenDateRange>(() => {
    const today = localDateKey();
    return { start: today, end: today };
  });
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [weekDragX, setWeekDragX] = useState(0);
  const [weekSettling, setWeekSettling] = useState(false);
  const weekPagerRef = useRef<HTMLDivElement>(null);
  const weekSwipeStartX = useRef<number | null>(null);
  const pendingWeekDays = useRef(0);
  const suppressWeekClick = useRef(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState(false);
  const selectedDate = selectedRange.end ?? selectedRange.start;

  const entries = useMemo<JournalTimelineEntry[]>(() => [
    ...buildTimelineEntries({ babyActivities, momActivities, growthHistory }),
    ...timelineItems.map(momentEntry),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()), [babyActivities, growthHistory, momActivities, timelineItems]);
  const ownerEntries = useMemo(() => entries.filter((entry) => entry.owner === ownerFilter), [entries, ownerFilter]);
  const highlightedDates = useMemo(
    () => [...new Set(ownerEntries.map((entry) => localDateKey(new Date(entry.occurredAt))))],
    [ownerEntries],
  );
  const highlightedDateSet = useMemo(() => new Set(highlightedDates), [highlightedDates]);
  const visibleEntries = useMemo(
    () => filterTimelineByLocalDateRange(ownerEntries, selectedRange.start, selectedRange.end ?? selectedRange.start),
    [ownerEntries, selectedRange],
  );
  const entryGroups = useMemo(() => {
    const groups = new Map<string, JournalTimelineEntry[]>();
    visibleEntries.forEach((entry) => {
      const key = localDateKey(new Date(entry.occurredAt));
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });
    return [...groups.entries()].map(([key, groupEntries]) => ({ key, entries: groupEntries }));
  }, [visibleEntries]);
  const calendarBounds = useMemo(() => {
    const entryDates = ownerEntries.map((entry) => localDateKey(new Date(entry.occurredAt)));
    const normalizedBirthDate = dateInputValue(birthDate);
    const minimumCandidates = [normalizedBirthDate, ...entryDates].filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
    const maximumCandidates = [localDateKey(), ...entryDates];
    return {
      min: minimumCandidates.sort()[0] ?? '2000-01-01',
      max: maximumCandidates.sort().at(-1) ?? localDateKey(),
    };
  }, [birthDate, ownerEntries]);
  const isRange = Boolean(selectedRange.end && selectedRange.end !== selectedRange.start);
  const selectedDateLabel = isRange
    ? `${formatFullDate(selectedRange.start)} – ${formatFullDate(selectedRange.end ?? selectedRange.start)}`
    : formatFullDate(selectedRange.start);
  const selectedEntry = useMemo(
    () => selectedEntryId ? entries.find((entry) => entry.id === selectedEntryId) ?? null : null,
    [entries, selectedEntryId],
  );
  const selectedSource = useMemo<EditableTimelineSource | null>(() => {
    if (!selectedEntry) return null;
    if (selectedEntry.moment) return { kind: 'moment', record: selectedEntry.moment };
    if (selectedEntry.type === 'growth') {
      const growthId = selectedEntry.id.replace(/^growth-/, '');
      const record = growthHistory.find((item) => item.id === growthId);
      return record ? { kind: 'growth', record } : null;
    }
    const record = [...babyActivities, ...momActivities].find((item) => item.id === selectedEntry.id);
    return record ? { kind: 'activity', record } : null;
  }, [babyActivities, growthHistory, momActivities, selectedEntry]);

  const openEntry = (entry: JournalTimelineEntry) => {
    setSelectedEntryId(entry.id);
    setEditingEntry(false);
  };

  const selectQuickDate = (dateKey: string) => {
    if (suppressWeekClick.current || dateKey < calendarBounds.min || dateKey > calendarBounds.max) return;
    setSelectedRange({ start: dateKey, end: dateKey });
  };

  const selectToday = () => {
    const today = localDateKey();
    if (today < calendarBounds.min || today > calendarBounds.max) return;
    setSelectedRange({ start: today, end: today });
  };

  const weekPageWidth = () => weekPagerRef.current?.clientWidth || 320;

  const canShiftWeek = (days: number) => {
    const target = shiftDateKey(selectedDate, days);
    return target >= calendarBounds.min && target <= calendarBounds.max;
  };

  const settleWeek = (days: number) => {
    if (days !== 0 && !canShiftWeek(days)) days = 0;
    pendingWeekDays.current = days;
    setWeekSettling(true);
    setWeekDragX(days > 0 ? -weekPageWidth() : days < 0 ? weekPageWidth() : 0);
  };

  const finishWeekSwipe = () => {
    if (weekSwipeStartX.current === null) return;
    weekSwipeStartX.current = null;
    const width = weekPageWidth();
    const threshold = Math.max(42, Math.min(72, width * 0.18));
    if (Math.abs(weekDragX) < threshold) settleWeek(0);
    else settleWeek(weekDragX < 0 ? 7 : -7);
    if (Math.abs(weekDragX) > 8) {
      suppressWeekClick.current = true;
      requestAnimationFrame(() => { suppressWeekClick.current = false; });
    }
  };

  const completeWeekSettle = () => {
    const days = pendingWeekDays.current;
    pendingWeekDays.current = 0;
    setWeekSettling(false);
    setWeekDragX(0);
    if (days !== 0) {
      const nextDate = shiftDateKey(selectedDate, days);
      setSelectedRange({ start: nextDate, end: nextDate });
    }
  };

  return (
    <main className="journal-page">
      <section className="journal-calendar" aria-label="Chọn ngày xem nhật ký">
        <div className="journal-calendar-bar">
          <div className="journal-calendar-title"><CalendarDays size={17} /><strong>{formatMonth(selectedDate)}</strong></div>
          <div className="journal-calendar-actions">
            <button type="button" className="journal-today-button" onClick={selectToday}>Hôm nay</button>
            <button type="button" aria-expanded={calendarExpanded} onClick={() => setCalendarExpanded((expanded) => !expanded)}>
              {calendarExpanded ? 'Thu gọn' : 'Mở lịch'}
              {calendarExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <div className={`journal-calendar-switch ${calendarExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="journal-week-shell" aria-hidden={calendarExpanded}>
            <div>
              <div
                ref={weekPagerRef}
                className="journal-week-pager"
                onPointerDown={(event) => {
                  if (weekSettling) return;
                  weekSwipeStartX.current = event.clientX;
                  setWeekDragX(0);
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (weekSwipeStartX.current === null || weekSettling) return;
                  let distance = event.clientX - weekSwipeStartX.current;
                  if ((distance > 0 && !canShiftWeek(-7)) || (distance < 0 && !canShiftWeek(7))) distance *= 0.22;
                  setWeekDragX(Math.max(-weekPageWidth(), Math.min(weekPageWidth(), distance)));
                }}
                onPointerUp={finishWeekSwipe}
                onPointerCancel={() => { weekSwipeStartX.current = null; settleWeek(0); }}
              >
                <div
                  className={`journal-week-track ${weekSettling ? 'is-settling' : 'is-dragging'}`}
                  style={{ transform: `translate3d(calc(-33.333333% + ${weekDragX}px), 0, 0)` }}
                  onTransitionEnd={(event) => { if (event.target === event.currentTarget) completeWeekSettle(); }}
                >
                  {[-7, 0, 7].map((offset) => {
                    const currentPage = offset === 0;
                    return (
                      <div className="journal-week-page" key={offset} aria-hidden={!currentPage}>
                        <div className="journal-week-strip" role={currentPage ? 'group' : undefined} aria-label={currentPage ? '7 ngày quanh ngày đang chọn' : undefined}>
                          {surroundingWeek(shiftDateKey(selectedDate, offset)).map(({ key, date }) => {
                            const selected = key === selectedRange.start || key === selectedRange.end;
                            const inRange = Boolean(selectedRange.end && key > selectedRange.start && key < selectedRange.end);
                            const disabled = key < calendarBounds.min || key > calendarBounds.max;
                            return (
                              <button type="button" key={key} disabled={disabled} className={`${date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : ''} ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`.trim()} aria-pressed={currentPage ? selected || inRange : undefined} aria-label={formatFullDate(key)} tabIndex={currentPage && !calendarExpanded ? undefined : -1} onClick={() => selectQuickDate(key)}>
                                <span>{new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).replace('.', '')}</span>
                                <strong>{date.getDate()}</strong>
                                <i className={highlightedDateSet.has(key) ? 'has-entry' : ''} aria-hidden="true" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="journal-month-shell" aria-hidden={!calendarExpanded}>
            <div><HavenCalendar mode="range" value={selectedRange} highlightedDates={highlightedDates} minDate={calendarBounds.min} maxDate={calendarBounds.max} onChange={setSelectedRange} /></div>
          </div>
        </div>
      </section>

      <section className="journal-feed" key={`${ownerFilter}-${selectedRange.start}-${selectedRange.end ?? 'open'}`} aria-live="polite">
        {visibleEntries.length === 0 ? (
          <>
            <header className="journal-day-header">
              <h2>{selectedDateLabel}</h2>
              <span>0 ghi nhận</span>
            </header>
            <HavenAlert tone={ownerFilter === 'baby' ? 'sage' : 'info'} icon={NotebookPen} title={`Chưa có nhật ký của ${ownerFilter === 'baby' ? 'bé' : 'mẹ'} trong ${isRange ? 'khoảng này' : 'ngày này'}`}>
              Ghi nhận mới sẽ được thêm từ Trang chủ.
            </HavenAlert>
          </>
        ) : entryGroups.map((group) => (
          <section className="journal-day-group" key={group.key}>
            <header className="journal-day-header">
              <h2>{formatFullDate(group.key)}</h2>
              <span>{group.entries.length} ghi nhận</span>
            </header>
            <NotebookStory entries={group.entries} owner={ownerFilter}>
              {entriesByPeriod(group.entries).map((period) => (
                  <section className={`journal-period period-${period.id}`} key={period.id}>
                    <div className="journal-period-items">
                      {period.entries.map((entry) => {
                        const meta = entryMeta(entry);
                        const Icon = meta.icon;
                        const item = entry.moment;
                        const mediaItems = item ? getTimelineMediaItems(item) : [];
                        const visibleMediaItems = mediaItems.slice(0, 4);
                        const summary = !item ? (entry.stats.length > 0 ? entry.stats.join(' · ') : entry.detail) : '';
                        const supportingDetail = item ? entry.detail : entry.stats.length > 0 ? entry.detail : '';
                        return (
                          <div className={`journal-story-item tone-${meta.tone} ${item ? 'is-moment' : ''}`} key={entry.id}>
                            <time className="journal-story-time" dateTime={entry.occurredAt}>{formatTime(entry.occurredAt)}</time>
                            <span className="journal-story-icon" aria-hidden="true"><Icon size={16} /></span>
                            <article className="journal-story-content">
                              <button type="button" className="journal-story-main" onClick={() => openEntry(entry)} aria-label={`${entry.title}, ${formatTime(entry.occurredAt)}`}>
                                <span className="journal-story-heading">
                                  <strong className="journal-story-title">{entry.title}</strong>
                                  {summary && <><span className="journal-story-separator" aria-hidden="true">·</span><span className="journal-story-summary">{summary}</span></>}
                                </span>
                                {supportingDetail && <span className="journal-story-detail">{supportingDetail}</span>}
                              </button>
                              {mediaItems.length > 0 && (
                                <div className={`journal-story-media-bento count-${visibleMediaItems.length}`} aria-label={`${mediaItems.length} media của ${item?.title}`}>
                                  {visibleMediaItems.map((media, index) => (
                                    <TimelineMediaButton
                                      className="journal-story-media"
                                      key={media.id ?? media.blobId ?? `${media.url}-${index}`}
                                      media={media}
                                      onOpen={onOpenLightbox}
                                      ariaLabel={mediaItems.length === 1
                                        ? `Mở ${media.type === 'video' ? 'video' : 'ảnh'} ${item?.title}`
                                        : `Mở ${media.type === 'video' ? 'video' : 'ảnh'} ${index + 1} của ${item?.title}`}
                                      alt=""
                                      imageStyle={{ objectPosition: `${media.focalX ?? 50}% ${media.focalY ?? 38}%` }}
                                      playSize={19}
                                      showKind
                                      moreCount={index === 3 && mediaItems.length > 4 ? mediaItems.length - 4 : 0}
                                    />
                                  ))}
                                </div>
                              )}
                            </article>
                          </div>
                        );
                      })}
                    </div>
                  </section>
              ))}
            </NotebookStory>
          </section>
        ))}
      </section>

      <HavenDialog
        open={selectedEntry !== null}
        onClose={() => { setSelectedEntryId(null); setEditingEntry(false); }}
        title={selectedEntry?.title ?? 'Chi tiết ghi nhận'}
        description={selectedEntry ? `${ownerLabel(selectedEntry.owner)} · ${formatFullDate(localDateKey(new Date(selectedEntry.occurredAt)))}` : undefined}
        footer={!editingEntry && selectedEntry ? (
          <>
            {selectedSource && <button type="button" className="haven-dialog-primary" onClick={() => setEditingEntry(true)}><Pencil size={15} /> Chỉnh sửa</button>}
            <button type="button" className="haven-dialog-secondary" onClick={() => setSelectedEntryId(null)}>Đóng</button>
          </>
        ) : undefined}
      >
        {selectedEntry && (editingEntry && selectedSource ? (
          <TimelineEntryEditor key={selectedEntry.id} source={selectedSource} onCancel={() => setEditingEntry(false)} onSaved={() => setEditingEntry(false)} />
        ) : (() => {
          const meta = entryMeta(selectedEntry);
          const Icon = meta.icon;
          const item = selectedEntry.moment;
          const mediaItems = item ? getTimelineMediaItems(item) : [];
          return (
            <div className={`journal-detail tone-${meta.tone}`}>
              {mediaItems.length > 0 && (
                <div className="journal-detail-media-list" aria-label={`${mediaItems.length} media của ${item?.title}`}>
                  {mediaItems.map((media, index) => (
                    <TimelineMediaButton
                      className="journal-detail-media-item"
                      key={media.id ?? media.blobId ?? `${media.url}-${index}`}
                      media={media}
                      onOpen={onOpenLightbox}
                      ariaLabel={mediaItems.length === 1
                        ? `Mở ${media.type === 'video' ? 'video' : 'ảnh'} ${item?.title}`
                        : `Mở ${media.type === 'video' ? 'video' : 'ảnh'} ${index + 1} của ${item?.title}`}
                      alt={item?.title ?? ''}
                      playSize={22}
                      showKind={media.type === 'video'}
                    />
                  ))}
                </div>
              )}
              <div className="journal-detail-overview">
                <span className="journal-detail-icon"><Icon size={21} /></span>
                <div><small>{entryCategoryLabel(selectedEntry)}</small><strong><Clock3 size={15} /> {formatTime(selectedEntry.occurredAt)}</strong></div>
              </div>
              {selectedEntry.detail && <p className="journal-detail-copy">{selectedEntry.detail}</p>}
              {selectedEntry.stats.length > 0 && <div className="journal-detail-stats">{selectedEntry.stats.map((stat) => <span key={stat}>{stat}</span>)}</div>}
            </div>
          );
        })())}
      </HavenDialog>
    </main>
  );
};
