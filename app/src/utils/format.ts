/**
 * Formatting utilities for the BabyGrowth app.
 */

/** Format a number as Vietnamese Dong currency string */
export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

/** Generate a unique ID with a prefix */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
}
