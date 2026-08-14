import { useTimelineStore } from '@/store/useTimelineStore';
import { CALENDAR_RANGE_EVENTS } from '../../data/seedData';
import type { CalendarRangeEvent } from '../../types';
import {
  Calendar,
  CalendarDays,
  Smile,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Heart,
  MessageSquare,
  HeartPulse,
  Frown,
  Meh,
  SmilePlus,
} from 'lucide-react';

interface TimelineViewProps {
  onOpenLightbox: (src: string, isVideo?: boolean) => void;
  onOpenAddEntry: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  onOpenLightbox,
  onOpenAddEntry,
}) => {
  const selectedCalendarDate = useTimelineStore(s => s.selectedCalendarDate);
  const setSelectedCalendarDate = useTimelineStore(s => s.setSelectedCalendarDate);
  const calendarYear = useTimelineStore(s => s.calendarYear);
  const calendarMonth = useTimelineStore(s => s.calendarMonth);
  const setCalendarMonth = useTimelineStore(s => s.setCalendarMonth);
  const calendarViewMode = useTimelineStore(s => s.calendarViewMode);
  const toggleCalendarViewMode = useTimelineStore(s => s.toggleCalendarViewMode);
  const currentTimelineSubTab = useTimelineStore(s => s.currentTimelineSubTab);
  const setCurrentTimelineSubTab = useTimelineStore(s => s.setCurrentTimelineSubTab);
  const timelineItems = useTimelineStore(s => s.timelineItems);
  const toggleLike = useTimelineStore(s => s.toggleLike);

  const isCollapsed = calendarViewMode === 'collapsed';
  const selectedDate = selectedCalendarDate || '2025-01-28';
  const selectedDateObj = new Date(selectedDate);

  const year = calendarYear !== undefined ? calendarYear : selectedDateObj.getFullYear();
  const month = calendarMonth !== undefined ? calendarMonth : selectedDateObj.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthTitle = `${monthNames[month]} ${year}`;
  const rangeEvents = CALENDAR_RANGE_EVENTS;

  // Navigation handlers
  const handlePrev = () => {
    if (isCollapsed) {
      const newDate = new Date(selectedDateObj);
      newDate.setDate(selectedDateObj.getDate() - 7);
      const y = newDate.getFullYear();
      const m = String(newDate.getMonth() + 1).padStart(2, '0');
      const d = String(newDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      setSelectedCalendarDate(dateStr);
      setCalendarMonth(y, newDate.getMonth());
    } else {
      let newMonth = month - 1;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      setCalendarMonth(newYear, newMonth);
    }
  };

  const handleNext = () => {
    if (isCollapsed) {
      const newDate = new Date(selectedDateObj);
      newDate.setDate(selectedDateObj.getDate() + 7);
      const y = newDate.getFullYear();
      const m = String(newDate.getMonth() + 1).padStart(2, '0');
      const d = String(newDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      setSelectedCalendarDate(dateStr);
      setCalendarMonth(y, newDate.getMonth());
    } else {
      let newMonth = month + 1;
      let newYear = year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setCalendarMonth(newYear, newMonth);
    }
  };

  const handleQuickSwitch = () => {
    if (year === 2025 && month === 0) {
      setCalendarMonth(2026, 7); // Aug 2026
      setSelectedCalendarDate('2026-08-14');
    } else {
      setCalendarMonth(2025, 0); // Jan 2025
      setSelectedCalendarDate('2025-01-28');
    }
  };

  // Render 7-day collapsed strip
  const renderCollapsedStrip = () => {
    const collapsedCells = [];
    const dayNamesShort = ['Sun', 'Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDateObj);
      d.setDate(selectedDateObj.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dt}`;
      const dayName = dayNamesShort[d.getDay()];

      collapsedCells.push({
        dateStr,
        dayNum: d.getDate(),
        dayName,
      });
    }

    return (
      <div className="calendar-collapsed-strip" id="calendarCollapsedStrip">
        {collapsedCells.map((cell, colIndex) => {
          const isSelected = cell.dateStr === selectedDate;
          let activeRange: CalendarRangeEvent | null = null;
          let rangeClass = '';

          for (const evt of rangeEvents) {
            if (cell.dateStr >= evt.startDate && cell.dateStr <= evt.endDate) {
              activeRange = evt;
              const isRangeStart = cell.dateStr === evt.startDate || colIndex === 0;
              const isRangeEnd = cell.dateStr === evt.endDate || colIndex === 6;

              if (isRangeStart && isRangeEnd) {
                rangeClass = 'range-single';
              } else if (isRangeStart) {
                rangeClass = 'range-start';
              } else if (isRangeEnd) {
                rangeClass = 'range-end';
              } else {
                rangeClass = 'range-middle';
              }
              break;
            }
          }

          return (
            <div
              key={cell.dateStr}
              className={`collapsed-date-cell ${isSelected ? 'selected' : ''} ${
                activeRange ? 'in-range' : ''
              }`}
              onClick={() => setSelectedCalendarDate(cell.dateStr)}
              style={{ cursor: 'pointer' }}
            >
              <span className="collapsed-weekday-label">{cell.dayName}</span>
              <div className="collapsed-bubble-wrap">
                {activeRange && <div className={`range-segment-bar ${rangeClass}`}></div>}
                <div className="date-bubble">{cell.dayNum}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Full Month Matrix
  const renderExpandedMonth = () => {
    const firstDayRaw = new Date(year, month, 1).getDay(); // 0 = Sun
    const firstDayOffset = (firstDayRaw + 6) % 7; // 0 = Mon, ..., 6 = Sun
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Leading days from previous month
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, d);
      const y = prevMonthDate.getFullYear();
      const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
      const dateStr = `${y}-${m}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const m = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${m}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month
    const remainingCells = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
    const totalCellsNeeded = cells.length + remainingCells < 35 ? 35 : cells.length + remainingCells;
    const trailingCount = totalCellsNeeded - cells.length;

    for (let d = 1; d <= trailingCount; d++) {
      const nextMonthDate = new Date(year, month + 1, d);
      const y = nextMonthDate.getFullYear();
      const m = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
      const dateStr = `${y}-${m}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
      });
    }

    return (
      <>
        <div className="calendar-weekdays-grid">
          <span className="calendar-weekday-label">Mo</span>
          <span className="calendar-weekday-label">Tue</span>
          <span className="calendar-weekday-label">Wed</span>
          <span className="calendar-weekday-label">Thu</span>
          <span className="calendar-weekday-label">Fri</span>
          <span className="calendar-weekday-label">Sat</span>
          <span className="calendar-weekday-label">Sun</span>
        </div>

        <div className="calendar-days-grid" id="calendarDaysGrid">
          {cells.map((cell, index) => {
            const colIndex = index % 7;
            const isSelected = cell.dateStr === selectedDate;
            let activeRange: CalendarRangeEvent | null = null;
            let rangeClass = '';

            for (const evt of rangeEvents) {
              if (cell.dateStr >= evt.startDate && cell.dateStr <= evt.endDate) {
                activeRange = evt;
                const isRangeStart = cell.dateStr === evt.startDate;
                const isRangeEnd = cell.dateStr === evt.endDate;
                const isRowStart = colIndex === 0;
                const isRowEnd = colIndex === 6;

                if (isRangeStart && isRangeEnd) {
                  rangeClass = 'range-single';
                } else if (isRangeStart) {
                  rangeClass = 'range-start';
                } else if (isRangeEnd) {
                  rangeClass = 'range-end';
                } else if (isRowStart) {
                  rangeClass = 'range-row-start';
                } else if (isRowEnd) {
                  rangeClass = 'range-row-end';
                } else {
                  rangeClass = 'range-middle';
                }
                break;
              }
            }

            return (
              <div
                key={cell.dateStr}
                className={`calendar-date-cell ${
                  cell.isCurrentMonth ? 'current-month' : 'other-month'
                } ${activeRange ? 'in-range' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedCalendarDate(cell.dateStr)}
                style={{ cursor: 'pointer' }}
              >
                {activeRange && <div className={`range-segment-bar ${rangeClass}`}></div>}
                <div className="date-bubble">{cell.dayNum}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Selected date label & banner
  const selDay = selectedDateObj.getDate();
  const selMonth = selectedDateObj.getMonth() + 1;
  const selYear = selectedDateObj.getFullYear();
  const formattedDateLabel = `Ngày ${selDay} Tháng ${selMonth}, ${selYear}`;

  const selectedRange = rangeEvents.find(
    (evt) => selectedDate >= evt.startDate && selectedDate <= evt.endDate
  );

  let matchingItems = timelineItems.filter((item) => item.date === selectedDate);
  if (matchingItems.length === 0) {
    if (selectedDate === '2025-01-28' || selectedDate === '2026-08-14') {
      matchingItems = timelineItems.slice(0, 3);
    }
  }

  return (
    <div className="timeline-view-wrapper">
      {/* Subtab Segmented Nav */}
      <div className="timeline-segmented-nav">
        <button
          className={`timeline-segment-btn ${currentTimelineSubTab === 'feed' ? 'active' : ''}`}
          onClick={() => setCurrentTimelineSubTab('feed')}
        >
          <CalendarDays size={13} strokeWidth={2.2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Lịch trình & Nhật ký
        </button>
        <button
          className={`timeline-segment-btn ${
            currentTimelineSubTab === 'mood-history' ? 'active' : ''
          }`}
          onClick={() => setCurrentTimelineSubTab('mood-history')}
        >
          <Smile size={13} strokeWidth={2.2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Cảm xúc (Mood)
        </button>
      </div>

      {currentTimelineSubTab === 'mood-history' ? (
        <div className="mood-history-container">
          <div className="mood-history-row-card">
            <div className="mood-date-col">
              <span className="mood-date-month">TH8</span>
              <span className="mood-date-num">14</span>
            </div>
            <div className="mood-info-col">
              <span className="mood-info-title">Overjoyed (Hào hứng)</span>
              <span className="mood-info-vitals">
                <Heart size={11} fill="#E87A90" color="#E87A90" style={{ display: 'inline', verticalAlign: 'middle' }} /> 96 bpm • <HeartPulse size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 121 sys
              </span>
            </div>
            <div className="mood-face-circle overjoyed">
              <SmilePlus size={20} strokeWidth={2.4} />
            </div>
          </div>

          <div className="mood-history-row-card">
            <div className="mood-date-col">
              <span className="mood-date-month">TH8</span>
              <span className="mood-date-num">13</span>
            </div>
            <div className="mood-info-col">
              <span className="mood-info-title">Happy (Vui vẻ)</span>
              <span className="mood-info-vitals">
                <Heart size={11} fill="#E87A90" color="#E87A90" style={{ display: 'inline', verticalAlign: 'middle' }} /> 65 bpm • <HeartPulse size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 111 sys
              </span>
            </div>
            <div className="mood-face-circle happy">
              <Smile size={20} strokeWidth={2.4} />
            </div>
          </div>

          <div className="mood-history-row-card">
            <div className="mood-date-col">
              <span className="mood-date-month">TH8</span>
              <span className="mood-date-num">12</span>
            </div>
            <div className="mood-info-col">
              <span className="mood-info-title">Neutral (Bình thường)</span>
              <span className="mood-info-vitals">
                <Heart size={11} fill="#E87A90" color="#E87A90" style={{ display: 'inline', verticalAlign: 'middle' }} /> 77 bpm • <HeartPulse size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 115 sys
              </span>
            </div>
            <div className="mood-face-circle neutral">
              <Meh size={20} strokeWidth={2.4} />
            </div>
          </div>

          <div className="mood-history-row-card">
            <div className="mood-date-col">
              <span className="mood-date-month">TH8</span>
              <span className="mood-date-num">11</span>
            </div>
            <div className="mood-info-col">
              <span className="mood-info-title">Sad (Mọc răng)</span>
              <span className="mood-info-vitals">
                <Heart size={11} fill="#E87A90" color="#E87A90" style={{ display: 'inline', verticalAlign: 'middle' }} /> 99 bpm • <HeartPulse size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 130 sys
              </span>
            </div>
            <div className="mood-face-circle sad">
              <Frown size={20} strokeWidth={2.4} />
            </div>
          </div>

          <div className="mood-history-row-card">
            <div className="mood-date-col">
              <span className="mood-date-month">TH8</span>
              <span className="mood-date-num">10</span>
            </div>
            <div className="mood-info-col">
              <span className="mood-info-title">Depressed (Sau tiêm)</span>
              <span className="mood-info-vitals">
                <Heart size={11} fill="#E87A90" color="#E87A90" style={{ display: 'inline', verticalAlign: 'middle' }} /> 112 bpm • <HeartPulse size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 140 sys
              </span>
            </div>
            <div className="mood-face-circle depressed">
              <Frown size={20} strokeWidth={2.4} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ORGANIC CALENDAR CARD */}
          <div className="organic-calendar-card">
            {/* Month Header Row */}
            <div className="calendar-header-row">
              <div className="calendar-month-title">{monthTitle}</div>
              <div className="calendar-nav-group">
                <button
                  className="calendar-view-toggle-btn"
                  id="btnToggleCalendarMode"
                  onClick={toggleCalendarViewMode}
                  title={isCollapsed ? 'Xem cả tháng' : 'Thu gọn 7 ngày'}
                >
                  <span>{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
                  {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                </button>
                <button className="calendar-nav-btn" onClick={handlePrev}>
                  <ChevronLeft size={14} />
                </button>
                <button className="calendar-nav-btn" onClick={handleNext}>
                  <ChevronRight size={14} />
                </button>
                <button className="calendar-today-pill" onClick={handleQuickSwitch}>
                  {year === 2025 && month === 0 ? 'T8/2026' : 'T1/2025'}
                </button>
              </div>
            </div>

            {/* Calendar Body */}
            {isCollapsed ? renderCollapsedStrip() : renderExpandedMonth()}

            {/* Bottom Pull Handle */}
            <div
              className="calendar-expand-handle-row"
              onClick={toggleCalendarViewMode}
              title={isCollapsed ? 'Nhấn để xem cả tháng' : 'Nhấn để thu gọn 7 ngày'}
              style={{ cursor: 'pointer' }}
            >
              <div className="calendar-expand-handle-pill"></div>
            </div>
          </div>

          {/* Multi-Day Range Event Banner */}
          {selectedRange && (
            <div className="calendar-range-banner">
              <div className="calendar-range-left">
                <span className="calendar-range-icon">
                  <Sparkles size={16} color="var(--color-sage-dark)" />
                </span>
                <div className="calendar-range-info">
                  <span className="calendar-range-badge">
                    ★ {selectedRange.badge || 'Sự kiện nổi bật'}
                  </span>
                  <span className="calendar-range-title">{selectedRange.title}</span>
                  <span className="calendar-range-desc">
                    {selectedRange.subtitle || selectedRange.note || ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Schedule / Diary Section Header */}
          <div className="calendar-schedule-header">
            <div className="calendar-schedule-title">
              <Calendar size={14} strokeWidth={2.2} />
              <span>{formattedDateLabel}</span>
            </div>
            <button
              className="calendar-add-entry-btn"
              id="btnCalendarAddEntry"
              onClick={onOpenAddEntry}
            >
              <Plus size={12} strokeWidth={2.4} />
              <span>Viết nhật ký</span>
            </button>
          </div>

          {/* Time Capsule Memory Flashback */}
          <div className="time-capsule-card">
            <div className="time-capsule-info">
              <span className="capsule-badge">
                <Sparkles size={10} /> KỶ NIỆM NGÀY NÀY
              </span>
              <span className="capsule-title">Lần đầu Bé Bơ cất tiếng gọi "Mẹ"</span>
              <span className="capsule-desc">
                Khoảnh khắc xúc động cả gia đình lúc 09:15 sáng.
              </span>
            </div>
            <img
              className="capsule-thumb"
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150&auto=format&fit=crop&q=80"
              alt="Flashback"
            />
          </div>

          {/* Filter & Stream */}
          <div className="timeline-filter-row">
            <span className="timeline-filter-title">Lịch trình & Ghi chép</span>
            <span className="timeline-filter-dropdown">
              <span>Tất cả cữ</span>
              <ChevronDown size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </span>
          </div>

          {matchingItems.length > 0 ? (
            <div className="connected-timeline-stream">
              {matchingItems.map((item) => (
                <div key={item.id} className="timeline-stream-node">
                  <div className="timeline-time-badge">
                    {item.timeFormatted ||
                      (item.time ? item.time.split('•')[1] || item.time : '08:30')}
                  </div>
                  <div className="timeline-stream-card">
                    <div className="node-card-top-row">
                      <span className={`node-card-tag-pill ${item.tagType || 'milestone'}`}>
                        {item.tag || 'Nhật ký'}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          color: 'var(--color-text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {item.author || 'Mẹ Thảo'}
                      </span>
                    </div>

                    <div className="node-card-title">{item.title}</div>
                    <div className="node-card-body">{item.content}</div>

                    {item.mediaUrl && (
                      <div
                        className="node-media-box"
                        onClick={() => onOpenLightbox(item.mediaUrl!)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          className="node-media-img"
                          src={item.mediaUrl}
                          alt={item.title}
                        />
                      </div>
                    )}

                    {item.stats && item.stats.length > 0 && (
                      <div className="node-card-stats-row">
                        {item.stats.map((st, sIdx) => (
                          <span key={sIdx} className="node-stat-chip">
                            {st}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="node-card-footer">
                      <div className="node-meta-left">
                        <Sparkles size={11} color="var(--color-sage-dark)" />
                        <span>Ghi nhận AI</span>
                      </div>
                      <div className="node-meta-actions">
                        <button
                          className={`node-action-btn ${item.userLiked ? 'liked' : ''}`}
                          onClick={() => toggleLike(item.id)}
                        >
                          <Heart
                            size={12}
                            fill={item.userLiked ? '#E87A90' : 'none'}
                            color={item.userLiked ? '#E87A90' : 'currentColor'}
                          />
                          <span>{item.likes || 12}</span>
                        </button>
                        <button className="node-action-btn">
                          <MessageSquare size={12} />
                          <span>{item.comments || 3}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="calendar-empty-day-box">
              <div className="calendar-empty-icon">
                <CalendarDays size={28} color="var(--color-sage-dark)" />
              </div>
              <div className="calendar-empty-title">
                Chưa có ghi chép ngày {selDay}/{selMonth}
              </div>
              <div className="calendar-empty-sub">
                Hãy lưu lại cữ ăn, cữ ngủ hoặc những khoảnh khắc đáng yêu của bé hôm nay.
              </div>
              <button className="calendar-add-entry-btn" onClick={onOpenAddEntry}>
                <Plus size={12} strokeWidth={2.4} />
                <span>Thêm Nhật ký & Cữ sinh hoạt</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
