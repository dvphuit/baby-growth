/**
 * Date utilities for the BabyGrowth app.
 * Replaces duplicated date formatting logic across the codebase.
 */

const VIETNAMESE_MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const DAY_NAMES_SHORT_EN = ['Sun', 'Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Format a Date to YYYY-MM-DD string */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Get today's date as YYYY-MM-DD */
export function todayStr(): string {
  return toDateStr(new Date());
}

/** Format current time as HH:MM in Vietnamese locale */
export function currentTimeStr(): string {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a date for display: "14 Tháng 8, 2026" */
export function formatVietnameseDate(date: Date): string {
  return `${date.getDate()} ${VIETNAMESE_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

/** Format YYYY-MM-DD to DD/MM/YYYY */
export function formatDateDisplay(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** Get Vietnamese month name */
export function getVietnameseMonth(month: number): string {
  return VIETNAMESE_MONTHS[month] || '';
}

/** Get English month name */
export function getMonthName(month: number): string {
  return MONTH_NAMES_EN[month] || '';
}

/** Get short day name (Vietnamese) */
export function getDayNameShort(dayOfWeek: number): string {
  return DAY_NAMES_SHORT[dayOfWeek] || '';
}

/** Get short day name (English) */
export function getDayNameShortEn(dayOfWeek: number): string {
  return DAY_NAMES_SHORT_EN[dayOfWeek] || '';
}

/** Get number of days in a month */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Get the first day of the month (0 = Sunday) */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Get the first day offset for Monday-start calendar (0 = Mon, 6 = Sun) */
export function getFirstDayOffset(year: number, month: number): number {
  return (getFirstDayOfMonth(year, month) + 6) % 7;
}
