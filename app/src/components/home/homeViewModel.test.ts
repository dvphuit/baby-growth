import { describe, expect, it } from 'vitest';
import { getMoodLabel } from './homeViewModel';

describe('getMoodLabel', () => {
  it.each([
    ['Overjoyed', 'Rất vui'],
    ['Happy', 'Vui vẻ'],
    ['Neutral', 'Bình thường'],
    ['Sad', 'Buồn'],
    ['Depressed', 'Cần được quan tâm'],
  ])('maps %s', (input, expected) => expect(getMoodLabel(input)).toBe(expected));
  it('keeps unknown moods', () => expect(getMoodLabel('Curious')).toBe('Curious'));
  it('preserves empty fallback', () => expect(getMoodLabel()).toBe('Chưa cập nhật'));
});
