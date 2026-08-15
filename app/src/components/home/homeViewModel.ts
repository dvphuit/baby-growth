const MOOD_LABELS: Record<string, string> = {
  Overjoyed: 'Rất vui',
  Happy: 'Vui vẻ',
  Neutral: 'Bình thường',
  Sad: 'Buồn',
  Depressed: 'Cần được quan tâm',
};

export function getMoodLabel(mood?: string): string {
  if (!mood) return 'Chưa cập nhật';
  return MOOD_LABELS[mood] ?? mood;
}
