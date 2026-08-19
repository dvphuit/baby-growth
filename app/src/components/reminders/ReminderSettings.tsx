import { useMemo, useState } from 'react';
import { Bell, BellOff, Trash2 } from 'lucide-react';
import { HavenDatePicker } from '../common/HavenDatePicker';
import { HavenDropdown } from '../common/HavenDropdown';
import { getNotificationCapability, requestSystemNotificationPermission } from '@/services/notificationService';
import { useReminderStore } from '@/store/useReminderStore';
import type { ReminderMode, ReminderType } from '@/types/reminder';

function localDateTimeInputValue(date = new Date(Date.now() + 60 * 60_000)): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const TYPE_LABELS: Record<ReminderType, string> = {
  feeding: 'Cữ bú',
  pumping: 'Hút sữa',
  medicine: 'Thuốc / vitamin',
  vaccination: 'Tiêm chủng',
  appointment: 'Tái khám',
  custom: 'Tùy chỉnh',
};

const QUICK_LOG_ACTION: Partial<Record<ReminderType, string>> = {
  feeding: 'feeding',
  pumping: 'pumping',
  medicine: 'medicine',
};

export function ReminderSettings() {
  const reminders = useReminderStore((state) => state.reminders);
  const createReminder = useReminderStore((state) => state.createReminder);
  const updateReminder = useReminderStore((state) => state.updateReminder);
  const deleteReminder = useReminderStore((state) => state.deleteReminder);
  const systemNotificationsEnabled = useReminderStore((state) => state.systemNotificationsEnabled);
  const setSystemNotificationsEnabled = useReminderStore((state) => state.setSystemNotificationsEnabled);

  const [type, setType] = useState<ReminderType>('feeding');
  const [mode, setMode] = useState<ReminderMode>('relative');
  const [title, setTitle] = useState('Nhắc cữ bú');
  const [intervalMinutes, setIntervalMinutes] = useState('180');
  const [triggerAt, setTriggerAt] = useState(localDateTimeInputValue);
  const [repeat, setRepeat] = useState<'none' | 'daily'>('none');
  const [note, setNote] = useState('');
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  const relativeAllowed = type === 'feeding' || type === 'pumping';
  const capability = getNotificationCapability();

  const suggestion = useMemo(() => {
    if (type === 'feeding') return 180;
    if (type === 'pumping') return 240;
    return null;
  }, [type]);

  const handleTypeChange = (next: ReminderType) => {
    setType(next);
    setTitle(`Nhắc ${TYPE_LABELS[next].toLowerCase()}`);
    if (next === 'feeding') {
      setMode('relative');
      setIntervalMinutes('180');
    } else if (next === 'pumping') {
      setMode('relative');
      setIntervalMinutes('240');
    } else {
      setMode('fixed');
    }
  };

  const handleSystemToggle = async () => {
    if (systemNotificationsEnabled) {
      setSystemNotificationsEnabled(false);
      return;
    }
    const permission = await requestSystemNotificationPermission();
    if (permission === 'granted') {
      setSystemNotificationsEnabled(true);
      setPermissionMessage('Thông báo hệ thống đã bật.');
    } else {
      setSystemNotificationsEnabled(false);
      setPermissionMessage('Không có quyền notification; reminder trong app vẫn hoạt động.');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const interval = Number(intervalMinutes);
    if (mode === 'relative' && (!Number.isFinite(interval) || interval <= 0)) return;

    createReminder({
      type,
      title: title.trim() || TYPE_LABELS[type],
      enabled: true,
      mode,
      triggerAt: mode === 'fixed' ? new Date(triggerAt).toISOString() : undefined,
      intervalMinutes: mode === 'relative' ? interval : undefined,
      repeat: mode === 'fixed' ? repeat : 'none',
      quickLogAction: QUICK_LOG_ACTION[type],
      note: note.trim() || undefined,
    });
  };

  return (
    <div>
      <section style={{ marginBottom: 18 }}>
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow">HỆ THỐNG</div>
            <h4 className="section-title">Notification hệ thống</h4>
          </div>
          <button type="button" className="metric-pill-choice" onClick={() => void handleSystemToggle()} disabled={capability === 'unsupported'}>
            {systemNotificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            {systemNotificationsEnabled ? 'Đang bật' : 'Bật'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
          Reminder trong app luôn hoạt động. Notification hệ thống là best-effort khi PWA/browser còn có thể chạy service worker.
        </p>
        {permissionMessage && <p style={{ fontSize: 12 }}>{permissionMessage}</p>}
      </section>

      <form onSubmit={handleSubmit}>
        <div className="section-eyebrow">TẠO REMINDER</div>
        <div className="log-form-group">
          <label className="log-form-label">Loại</label>
          <HavenDropdown
            label="Loại reminder"
            value={type}
            onChange={(val) => handleTypeChange(val as ReminderType)}
            options={Object.entries(TYPE_LABELS).map(([value, label]) => ({
              value: value as ReminderType,
              label,
            }))}
          />
        </div>
        <div className="log-form-group">
          <label className="log-form-label">Tiêu đề</label>
          <input className="log-input-control" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>

        {relativeAllowed && (
          <div className="log-form-group">
            <label className="log-form-label">Cách nhắc</label>
            <HavenDropdown
              label="Cách nhắc"
              value={mode}
              onChange={(val) => setMode(val as ReminderMode)}
              options={[
                { value: 'relative', label: 'Sau lần ghi gần nhất' },
                { value: 'fixed', label: 'Theo giờ cố định' },
              ]}
            />
          </div>
        )}

        {mode === 'relative' && relativeAllowed ? (
          <div className="log-form-group">
            <label className="log-form-label">Khoảng thời gian (phút)</label>
            <input className="log-input-control" type="number" min="1" value={intervalMinutes} onChange={(event) => setIntervalMinutes(event.target.value)} required />
            {suggestion && <small style={{ color: 'var(--color-text-muted)' }}>Gợi ý mặc định {suggestion} phút — có thể chỉnh.</small>}
          </div>
        ) : (
          <>
            <div className="log-form-group">
              <label className="log-form-label">Thời điểm</label>
              <HavenDatePicker
                label="Thời điểm"
                value={triggerAt}
                showTime
                onChange={setTriggerAt}
              />
            </div>
            <div className="log-form-group">
              <label className="log-form-label">Lặp lại</label>
              <HavenDropdown
                label="Lặp lại"
                value={repeat}
                onChange={(val) => setRepeat(val as typeof repeat)}
                options={[
                  { value: 'none', label: 'Không lặp' },
                  { value: 'daily', label: 'Mỗi ngày' },
                ]}
              />
            </div>
          </>
        )}

        <div className="log-form-group">
          <label className="log-form-label">Ghi chú</label>
          <input className="log-input-control" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Không bắt buộc" />
        </div>
        <button type="submit" className="log-btn-primary">Tạo & bật reminder</button>
      </form>

      {reminders.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <div className="section-eyebrow">ĐANG CÓ</div>
          <div className="timeline-list" style={{ marginTop: 8 }}>
            {reminders.map((reminder) => (
              <div key={reminder.id} className="timeline-item-card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <strong>{reminder.title}</strong>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                    {TYPE_LABELS[reminder.type]} · {reminder.mode === 'relative' ? `sau ${reminder.intervalMinutes} phút` : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(reminder.triggerAt!))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="metric-pill-choice" onClick={() => updateReminder(reminder.id, { enabled: !reminder.enabled })}>{reminder.enabled ? 'Tắt' : 'Bật'}</button>
                  <button type="button" aria-label={`Xóa ${reminder.title}`} className="metric-pill-choice" onClick={() => deleteReminder(reminder.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
