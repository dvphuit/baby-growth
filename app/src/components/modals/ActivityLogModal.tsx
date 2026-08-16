import { useMemo, useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { useActivityStore } from '@/store/useActivityStore';

export type ActivityLogMode = 'feeding' | 'baby-sleep' | 'diaper' | 'mom-sleep' | 'mom-mood' | 'medicine';

interface ActivityLogModalProps {
  isOpen: boolean;
  mode: ActivityLogMode;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function localDateTimeInputValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const TITLES: Record<ActivityLogMode, string> = {
  feeding: 'Ghi cữ bú',
  'baby-sleep': 'Ghi giấc ngủ của bé',
  diaper: 'Ghi thay tã',
  'mom-sleep': 'Ghi giấc ngủ của mẹ',
  'mom-mood': 'Ghi tâm trạng của mẹ',
  medicine: 'Ghi thuốc / vitamin',
};

export function ActivityLogModal({ isOpen, mode, onClose, onSaved }: ActivityLogModalProps) {
  const addBabyActivity = useActivityStore((state) => state.addBabyActivity);
  const addMomActivity = useActivityStore((state) => state.addMomActivity);
  const [occurredAt, setOccurredAt] = useState(localDateTimeInputValue);
  const [amountMl, setAmountMl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [feedingMethod, setFeedingMethod] = useState<'bottle' | 'breast' | 'other'>('bottle');
  const [diaperKind, setDiaperKind] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'low' | 'very_low'>('good');
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitLabel = useMemo(() => TITLES[mode].replace(/^Ghi /, 'Lưu '), [mode]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const eventIso = new Date(occurredAt).toISOString();
    const duration = Number(durationMinutes);
    const amount = Number(amountMl);

    if (mode === 'feeding') {
      if ((!Number.isFinite(amount) || amount <= 0) && (!Number.isFinite(duration) || duration <= 0)) {
        setError('Nhập lượng sữa hoặc thời lượng bú.');
        return;
      }
      addBabyActivity({
        owner: 'baby', type: 'feeding', occurredAt: eventIso,
        amountMl: Number.isFinite(amount) && amount > 0 ? amount : undefined,
        durationMinutes: Number.isFinite(duration) && duration > 0 ? duration : undefined,
        method: feedingMethod,
        note: note.trim() || undefined,
      });
      onSaved('Đã lưu cữ bú.');
    } else if (mode === 'baby-sleep') {
      if (!Number.isFinite(duration) || duration <= 0) {
        setError('Thời lượng ngủ phải lớn hơn 0 phút.');
        return;
      }
      addBabyActivity({ owner: 'baby', type: 'sleep', occurredAt: eventIso, durationMinutes: duration, note: note.trim() || undefined });
      onSaved('Đã lưu giấc ngủ của bé.');
    } else if (mode === 'diaper') {
      addBabyActivity({ owner: 'baby', type: 'diaper', occurredAt: eventIso, diaperKind, note: note.trim() || undefined });
      onSaved('Đã lưu lần thay tã.');
    } else if (mode === 'mom-sleep') {
      if (!Number.isFinite(duration) || duration <= 0) {
        setError('Thời lượng ngủ phải lớn hơn 0 phút.');
        return;
      }
      addMomActivity({ owner: 'mom', type: 'sleep', occurredAt: eventIso, durationMinutes: duration, note: note.trim() || undefined });
      onSaved('Đã lưu giấc ngủ của mẹ.');
    } else if (mode === 'mom-mood') {
      addMomActivity({ owner: 'mom', type: 'mood', occurredAt: eventIso, mood, note: note.trim() || undefined });
      onSaved('Đã lưu tâm trạng của mẹ.');
    } else {
      if (!medicineName.trim()) {
        setError('Nhập tên thuốc hoặc vitamin.');
        return;
      }
      addBabyActivity({
        owner: 'baby', type: 'medicine', occurredAt: eventIso,
        name: medicineName.trim(), dose: dose.trim() || undefined, note: note.trim() || undefined,
      });
      onSaved('Đã lưu thuốc / vitamin.');
    }

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={TITLES[mode]}>
      <form onSubmit={handleSubmit}>
        <div className="log-form-group">
          <label className="log-form-label">Thời điểm</label>
          <input className="log-input-control" type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} required />
        </div>

        {mode === 'feeding' && (
          <>
            <div className="log-form-group">
              <label className="log-form-label">Lượng sữa (ml)</label>
              <input className="log-input-control" type="number" min="0" inputMode="numeric" value={amountMl} onChange={(e) => setAmountMl(e.target.value)} placeholder="Ví dụ 90" />
            </div>
            <div className="log-form-group">
              <label className="log-form-label">Thời lượng bú (phút)</label>
              <input className="log-input-control" type="number" min="0" inputMode="numeric" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="Ví dụ 20" />
            </div>
            <div className="log-form-group">
              <label className="log-form-label">Cách bú</label>
              <select className="log-input-control" value={feedingMethod} onChange={(e) => setFeedingMethod(e.target.value as typeof feedingMethod)}>
                <option value="bottle">Bình</option><option value="breast">Trực tiếp</option><option value="other">Khác</option>
              </select>
            </div>
          </>
        )}

        {(mode === 'baby-sleep' || mode === 'mom-sleep') && (
          <div className="log-form-group">
            <label className="log-form-label">Thời lượng (phút)</label>
            <input className="log-input-control" type="number" min="1" required value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="Ví dụ 90" />
          </div>
        )}

        {mode === 'diaper' && (
          <div className="log-form-group">
            <label className="log-form-label">Loại tã</label>
            <select className="log-input-control" value={diaperKind} onChange={(e) => setDiaperKind(e.target.value as typeof diaperKind)}>
              <option value="wet">Ướt</option><option value="dirty">Bẩn</option><option value="both">Cả hai</option>
            </select>
          </div>
        )}

        {mode === 'mom-mood' && (
          <div className="log-form-group">
            <label className="log-form-label">Tâm trạng</label>
            <select className="log-input-control" value={mood} onChange={(e) => setMood(e.target.value as typeof mood)}>
              <option value="great">Rất tốt</option><option value="good">Tốt</option><option value="neutral">Bình thường</option><option value="low">Không tốt</option><option value="very_low">Rất không tốt</option>
            </select>
          </div>
        )}

        {mode === 'medicine' && (
          <>
            <div className="log-form-group"><label className="log-form-label">Tên thuốc / vitamin</label><input className="log-input-control" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} required /></div>
            <div className="log-form-group"><label className="log-form-label">Liều dùng</label><input className="log-input-control" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Ví dụ 1 giọt" /></div>
          </>
        )}

        <div className="log-form-group">
          <label className="log-form-label">Ghi chú (không bắt buộc)</label>
          <textarea className="log-input-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {error && <p role="alert" style={{ color: '#B42318', fontSize: 13 }}>{error}</p>}
        <button type="submit" className="log-btn-primary">{submitLabel}</button>
      </form>
    </BottomSheet>
  );
}
