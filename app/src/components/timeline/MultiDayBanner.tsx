import { useTimelineStore } from '@/store/useTimelineStore';
import { CALENDAR_RANGE_EVENTS } from '../../data/seedData';

export const MultiDayBanner: React.FC = () => {
  const selectedCalendarDate = useTimelineStore(s => s.selectedCalendarDate);

  const activeEvent =
    CALENDAR_RANGE_EVENTS.find(
      (ev) => selectedCalendarDate >= ev.startDate && selectedCalendarDate <= ev.endDate
    ) || CALENDAR_RANGE_EVENTS[0];

  if (!activeEvent) return null;

  return (
    <div className="range-event-banner-card">
      <div className="range-banner-header">
        <div className="range-badge-pill">
          <span>{activeEvent.icon}</span>
          <span>{activeEvent.badge}</span>
        </div>
        <span className="range-dates-text">
          {activeEvent.startDate} &rarr; {activeEvent.endDate}
        </span>
      </div>

      <h4 className="range-banner-title">{activeEvent.title}</h4>
      <p className="range-banner-sub">{activeEvent.subtitle}</p>

      <div className="range-banner-note-box">
        <span>💡</span>
        <span>{activeEvent.note}</span>
      </div>
    </div>
  );
};
