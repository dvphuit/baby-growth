/**
 * Calendar navigation and grid generation hook.
 * Extracted from TimelineView's inline calendar logic.
 */
import { useMemo, useCallback } from 'react';
import {
  toDateStr,
  getMonthName,
  getDayNameShortEn,
  getDaysInMonth,
  getFirstDayOffset,
} from '@/utils/date';
import type { CalendarRangeEvent } from '@/types';

export interface CalendarCell {
  dayNum: number;
  dateStr: string;
  isCurrentMonth: boolean;
}

export interface CollapsedCell {
  dateStr: string;
  dayNum: number;
  dayName: string;
}

export interface UseCalendarOptions {
  selectedDate: string;
  year: number;
  month: number;
  isCollapsed: boolean;
}

export interface UseCalendarReturn {
  monthTitle: string;
  collapsedCells: CollapsedCell[];
  expandedCells: CalendarCell[];
  navigatePrev: () => { year: number; month: number; selectedDate?: string };
  navigateNext: () => { year: number; month: number; selectedDate?: string };
  totalRows: number;
}

export function useCalendar({
  selectedDate,
  year,
  month,
  isCollapsed,
}: UseCalendarOptions): UseCalendarReturn {
  const monthTitle = `${getMonthName(month)} ${year}`;

  // 7-day collapsed strip centered on selected date
  const collapsedCells = useMemo<CollapsedCell[]>(() => {
    const selectedDateObj = new Date(selectedDate);
    const cells: CollapsedCell[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDateObj);
      d.setDate(selectedDateObj.getDate() + i);
      cells.push({
        dateStr: toDateStr(d),
        dayNum: d.getDate(),
        dayName: getDayNameShortEn(d.getDay()),
      });
    }
    return cells;
  }, [selectedDate]);

  // Full month grid
  const expandedCells = useMemo<CalendarCell[]>(() => {
    const firstDayOffset = getFirstDayOffset(year, month);
    const daysInCurrentMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const cells: CalendarCell[] = [];

    // Leading days from previous month
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        dayNum: d,
        dateStr: toDateStr(prevDate),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currentDate = new Date(year, month, d);
      cells.push({
        dayNum: d,
        dateStr: toDateStr(currentDate),
        isCurrentMonth: true,
      });
    }

    // Trailing days to fill last row
    const remainder = cells.length % 7;
    if (remainder > 0) {
      const needed = 7 - remainder;
      for (let d = 1; d <= needed; d++) {
        const nextDate = new Date(year, month + 1, d);
        cells.push({
          dayNum: d,
          dateStr: toDateStr(nextDate),
          isCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [year, month]);

  const totalRows = Math.ceil(expandedCells.length / 7);

  const navigatePrev = useCallback(() => {
    if (isCollapsed) {
      const selectedDateObj = new Date(selectedDate);
      const newDate = new Date(selectedDateObj);
      newDate.setDate(selectedDateObj.getDate() - 7);
      return {
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        selectedDate: toDateStr(newDate),
      };
    }
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    return { year: newYear, month: newMonth };
  }, [isCollapsed, selectedDate, year, month]);

  const navigateNext = useCallback(() => {
    if (isCollapsed) {
      const selectedDateObj = new Date(selectedDate);
      const newDate = new Date(selectedDateObj);
      newDate.setDate(selectedDateObj.getDate() + 7);
      return {
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        selectedDate: toDateStr(newDate),
      };
    }
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    return { year: newYear, month: newMonth };
  }, [isCollapsed, selectedDate, year, month]);

  return {
    monthTitle,
    collapsedCells,
    expandedCells,
    navigatePrev,
    navigateNext,
    totalRows,
  };
}

/** Determine range segment class for a date within calendar range events */
export function getRangeInfo(
  dateStr: string,
  colIndex: number,
  rangeEvents: CalendarRangeEvent[]
): { activeRange: CalendarRangeEvent | null; rangeClass: string } {
  for (const evt of rangeEvents) {
    if (dateStr >= evt.startDate && dateStr <= evt.endDate) {
      const isRangeStart = dateStr === evt.startDate || colIndex === 0;
      const isRangeEnd = dateStr === evt.endDate || colIndex === 6;

      let rangeClass = 'range-middle';
      if (isRangeStart && isRangeEnd) rangeClass = 'range-single';
      else if (isRangeStart) rangeClass = 'range-start';
      else if (isRangeEnd) rangeClass = 'range-end';

      return { activeRange: evt, rangeClass };
    }
  }
  return { activeRange: null, rangeClass: '' };
}
