import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface HavenDateRange {
  start: string;
  end: string | null;
}

type HavenCalendarProps = {
  highlightedDates?: string[];
  className?: string;
  minDate?: string;
  maxDate?: string;
} & (
  | { mode: 'single'; value: string; onChange: (value: string) => void }
  | { mode: 'range'; value: HavenDateRange; onChange: (value: HavenDateRange) => void }
);

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function initialMonth(props: HavenCalendarProps): Date {
  return parseDateKey(props.mode === 'single' ? props.value : props.value.start);
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date);
}

function monthCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, key: toDateKey(date), currentMonth: date.getMonth() === month.getMonth() };
  });
}

export function HavenCalendar(props: HavenCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => initialMonth(props));
  const [dragX, setDragX] = useState(0);
  const [settling, setSettling] = useState(false);
  const pagerRef = useRef<HTMLDivElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const pendingMonth = useRef(0);
  const suppressClick = useRef(false);
  const todayKey = toDateKey(new Date());
  const highlighted = useMemo(() => new Set(props.highlightedDates ?? []), [props.highlightedDates]);
  const selectedAnchor = props.mode === 'single' ? props.value : props.value.end ?? props.value.start;

  useEffect(() => {
    const selectedMonth = parseDateKey(selectedAnchor);
    setVisibleMonth((current) => {
      if (selectedMonth.getMonth() === current.getMonth() && selectedMonth.getFullYear() === current.getFullYear()) return current;
      return new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1, 12);
    });
  }, [selectedAnchor]);

  const isDisabled = (key: string) => Boolean(
    (props.minDate && key < props.minDate) || (props.maxDate && key > props.maxDate)
  );

  const canNavigate = (offset: number) => {
    const target = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1, 12);
    if (offset < 0 && props.minDate) {
      const targetEnd = toDateKey(new Date(target.getFullYear(), target.getMonth() + 1, 0, 12));
      return targetEnd >= props.minDate;
    }
    if (offset > 0 && props.maxDate) return toDateKey(target) <= props.maxDate;
    return true;
  };

  const selectDate = (key: string) => {
    if (suppressClick.current || isDisabled(key)) return;
    const date = parseDateKey(key);
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12));
    }

    if (props.mode === 'single') {
      props.onChange(key);
      return;
    }

    if (!props.value.start || props.value.end) {
      props.onChange({ start: key, end: null });
    } else if (key < props.value.start) {
      props.onChange({ start: key, end: props.value.start });
    } else {
      props.onChange({ start: props.value.start, end: key });
    }
  };

  const pageWidth = () => pagerRef.current?.clientWidth || 320;

  const settleToMonth = (offset: number) => {
    if (offset !== 0 && !canNavigate(offset)) offset = 0;
    pendingMonth.current = offset;
    setSettling(true);
    setDragX(offset > 0 ? -pageWidth() : offset < 0 ? pageWidth() : 0);
  };

  const finishSwipe = () => {
    if (swipeStartX.current === null) return;
    swipeStartX.current = null;
    const width = pageWidth();
    const threshold = Math.max(42, Math.min(72, width * 0.18));
    if (Math.abs(dragX) < threshold) settleToMonth(0);
    else settleToMonth(dragX < 0 ? 1 : -1);
    if (Math.abs(dragX) > 8) {
      suppressClick.current = true;
      requestAnimationFrame(() => { suppressClick.current = false; });
    }
  };

  const completeSettle = () => {
    const offset = pendingMonth.current;
    pendingMonth.current = 0;
    setSettling(false);
    setDragX(0);
    if (offset !== 0) {
      setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
    }
  };

  const renderMonth = (month: Date, currentPage: boolean) => (
    <div className="haven-calendar-page" aria-hidden={!currentPage}>
      <div className="haven-calendar-grid" role={currentPage ? 'grid' : undefined} aria-label={currentPage ? (props.mode === 'single' ? 'Chọn ngày' : 'Chọn khoảng ngày') : undefined}>
        {monthCells(month).map(({ date, key, currentMonth }) => {
          const isSingleSelected = props.mode === 'single' && key === props.value;
          const rangeStart = props.mode === 'range' && key === props.value.start;
          const rangeEnd = props.mode === 'range' && key === props.value.end;
          const inRange = props.mode === 'range' && Boolean(props.value.end) && key > props.value.start && key < (props.value.end ?? '');
          const disabled = isDisabled(key);
          const className = [
            'haven-calendar-day', currentMonth ? '' : 'other-month',
            date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : '',
            key === todayKey ? 'today' : '', disabled ? 'disabled' : '',
            isSingleSelected || rangeStart || rangeEnd ? 'selected' : '',
            rangeStart ? 'range-start' : '', rangeEnd ? 'range-end' : '', inRange ? 'in-range' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={key}
              type="button"
              className={className}
              role={currentPage ? 'gridcell' : undefined}
              aria-label={new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(date)}
              aria-selected={currentPage ? isSingleSelected || rangeStart || rangeEnd || inRange : undefined}
              disabled={disabled}
              tabIndex={currentPage ? undefined : -1}
              onClick={() => selectDate(key)}
            >
              <span>{date.getDate()}</span>
              {highlighted.has(key) && <i aria-label="Có ghi nhận" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12);
  const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1, 12);

  return (
    <div className={`haven-calendar ${props.className ?? ''}`.trim()}>
      <div className="haven-calendar-header">
        <button type="button" aria-label="Tháng trước" disabled={!canNavigate(-1)} onClick={() => settleToMonth(-1)}><ChevronLeft size={17} /></button>
        <strong>{monthLabel(visibleMonth)}</strong>
        <button type="button" aria-label="Tháng sau" disabled={!canNavigate(1)} onClick={() => settleToMonth(1)}><ChevronRight size={17} /></button>
      </div>

      <div className="haven-calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => <span key={day} className={day === 'T7' || day === 'CN' ? 'weekend' : ''}>{day}</span>)}
      </div>

      <div
        ref={pagerRef}
        className="haven-calendar-pager"
        onPointerDown={(event) => {
          if (settling) return;
          swipeStartX.current = event.clientX;
          setDragX(0);
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (swipeStartX.current === null || settling) return;
          let distance = event.clientX - swipeStartX.current;
          if ((distance > 0 && !canNavigate(-1)) || (distance < 0 && !canNavigate(1))) distance *= 0.22;
          setDragX(Math.max(-pageWidth(), Math.min(pageWidth(), distance)));
        }}
        onPointerUp={finishSwipe}
        onPointerCancel={() => { swipeStartX.current = null; settleToMonth(0); }}
      >
        <div
          className={`haven-calendar-track ${settling ? 'is-settling' : 'is-dragging'}`}
          style={{ transform: `translate3d(calc(-33.333333% + ${dragX}px), 0, 0)` }}
          onTransitionEnd={(event) => { if (event.target === event.currentTarget) completeSettle(); }}
        >
          {renderMonth(previousMonth, false)}
          {renderMonth(visibleMonth, true)}
          {renderMonth(nextMonth, false)}
        </div>
      </div>

      <div className="haven-calendar-footer">
        <span><CalendarDays size={14} />{props.mode === 'single' ? 'Chọn một ngày để xem nhật ký' : props.value.end ? 'Đã chọn đủ khoảng ngày' : 'Chọn ngày kết thúc'}</span>
        <button type="button" disabled={isDisabled(todayKey)} onClick={() => {
          const today = new Date();
          setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12));
          if (props.mode === 'single') props.onChange(todayKey);
          else props.onChange({ start: todayKey, end: todayKey });
        }}>Hôm nay</button>
      </div>
    </div>
  );
}
