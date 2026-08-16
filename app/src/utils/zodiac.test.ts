import { describe, expect, it } from 'vitest';
import { getZodiacSign } from './zodiac';

describe('getZodiacSign', () => {
  it('handles sign boundaries deterministically', () => {
    expect(getZodiacSign('2026-03-20')).toContain('Song Ngư');
    expect(getZodiacSign('2026-03-21')).toContain('Bạch Dương');
    expect(getZodiacSign('2026-04-19')).toContain('Bạch Dương');
    expect(getZodiacSign('2026-04-20')).toContain('Kim Ngưu');
    expect(getZodiacSign('2026-12-21')).toContain('Nhân Mã');
    expect(getZodiacSign('2026-12-22')).toContain('Ma Kết');
  });

  it('returns an explicit value for invalid input', () => {
    expect(getZodiacSign('not-a-date')).toBe('Chưa xác định');
  });
});
