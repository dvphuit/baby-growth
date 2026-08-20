import { useTimelineStore } from '@/store/useTimelineStore';
import { CALENDAR_RANGE_EVENTS } from '@/data/seedData';

export const CalendarStrip: React.FC = () => {
  const selectedCalendarDate = useTimelineStore(s => s.selectedCalendarDate);
  const setSelectedCalendarDate = useTimelineStore(s => s.setSelectedCalendarDate);
  const calendarYear = useTimelineStore(s => s.calendarYear);
  const calendarMonth = useTimelineStore(s => s.calendarMonth);
  const setCalendarMonth = useTimelineStore(s => s.setCalendarMonth);
  const calendarViewMode = useTimelineStore(s => s.calendarViewMode);
  const toggleCalendarViewMode = useTimelineStore(s => s.toggleCalendarViewMode);
  const timelineItems = useTimelineStore(s => s.timelineItems);

  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(calendarYear - 1, 11);
    } else {
      setCalendarMonth(calendarYear, calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(calendarYear + 1, 0);
    } else {
      setCalendarMonth(calendarYear, calendarMonth + 1);
    }
  };

  // Helper to check if a date is within any calendar range event
  const isDateInRange = (dateStr: string) => {
    return CALENDAR_RANGE_EVENTS.some((ev) => dateStr >= ev.startDate && dateStr <= ev.endDate);
  };

  // Helper to check if date has entries
  const hasEntries = (dateStr: string) => {
    return timelineItems.some((item) => item.date === dateStr);
  };

  // Generate 7-day strip based on selected date
  const renderCollapsedStrip = () => {
    const baseDate = new Date(selectedCalendarDate || '2025-01-28');
    if (isNaN(baseDate.getTime())) return null;

    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + offset);
      const dateStr = d.toISOString().split('T')[0];
      const isSelected = dateStr === selectedCalendarDate;
      const inRange = isDateInRange(dateStr);
      const hasLog = hasEntries(dateStr);

      days.push(
        <button
          key={dateStr}
          className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
          onClick={() => {
            setSelectedCalendarDate(dateStr);
            setCalendarMonth(d.getFullYear(), d.getMonth());
          }}
        >
          <span className="cal-day-name">{dayNames[d.getDay()]}</span>
          <span className="cal-day-num">{d.getDate()}</span>
          {hasLog && <span className="cal-dot-indicator"></span>}
        </button>
      );
    }

    return <div className="calendar-week-strip">{days}</div>;
  };

  // Generate full-month grid
  const renderExpandedMonth = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const cells = [];

    // Empty lead cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty_${i}`} className="calendar-grid-cell empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calendarMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${calendarYear}-${mm}-${dd}`;
      const isSelected = dateStr === selectedCalendarDate;
      const inRange = isDateInRange(dateStr);
      const hasLog = hasEntries(dateStr);

      cells.push(
        <button
          key={dateStr}
          className={`calendar-grid-cell ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
          onClick={() => setSelectedCalendarDate(dateStr)}
        >
          <span className="grid-day-num">{d}</span>
          {hasLog && <span className="cal-dot-indicator"></span>}
        </button>
      );
    }

    return (
      <div className="calendar-full-month-box">
        <div className="calendar-grid-header">
          {dayNames.map((n) => (
            <span key={n} className="grid-head-cell">
              {n}
            </span>
          ))}
        </div>
        <div className="calendar-grid-matrix">{cells}</div>
      </div>
    );
  };

  return (
    <div className="calendar-component-wrapper">
      {/* Calendar Month Selector & Expand Toggle */}
      <div className="calendar-top-bar">
        <div className="calendar-month-selector">
          <button className="cal-nav-arrow-btn" onClick={handlePrevMonth}>
            ◀
          </button>
          <span className="cal-month-title">
            {monthNames[calendarMonth]}, {calendarYear}
          </span>
          <button className="cal-nav-arrow-btn" onClick={handleNextMonth}>
            ▶
          </button>
        </div>

        <button className="cal-view-toggle-btn" onClick={toggleCalendarViewMode}>
          <span>{calendarViewMode === 'collapsed' ? 'Mở rộng 📅' : 'Thu gọn ⚡'}</span>
        </button>
      </div>

      {calendarViewMode === 'collapsed' ? renderCollapsedStrip() : renderExpandedMonth()}
    </div>
  );
};
