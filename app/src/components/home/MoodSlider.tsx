import { useState } from 'react';

interface MoodItem {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
}

const MOODS: MoodItem[] = [
  { id: 'depressed', emoji: '😭', label: 'Quấy khóc', color: 'var(--color-depressed)', bgColor: 'var(--color-depressed-bg)' },
  { id: 'sad', emoji: '🙁', label: 'Mệt mỏi', color: 'var(--color-sad)', bgColor: 'var(--color-sad-bg)' },
  { id: 'neutral', emoji: '😐', label: 'Bình thường', color: 'var(--color-neutral)', bgColor: 'var(--color-neutral-bg)' },
  { id: 'happy', emoji: '😊', label: 'Vui vẻ', color: 'var(--color-happy)', bgColor: 'var(--color-happy-bg)' },
  { id: 'overjoyed', emoji: '🤩', label: 'Hào hứng', color: 'var(--color-overjoyed)', bgColor: 'var(--color-overjoyed-bg)' },
];

export const MoodSlider: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('happy');

  const currentMoodObj = MOODS.find((m) => m.id === selectedMood) || MOODS[3];

  return (
    <div className="mood-slider-section">
      <div className="section-header-row">
        <h3 className="section-title">Tâm trạng & Cảm xúc của Bé</h3>
        <span
          className="mood-current-badge"
          style={{ backgroundColor: currentMoodObj.bgColor, color: currentMoodObj.color }}
        >
          {currentMoodObj.emoji} {currentMoodObj.label}
        </span>
      </div>

      <div className="mood-spectrum-track">
        {MOODS.map((m) => {
          const isSelected = m.id === selectedMood;
          return (
            <button
              key={m.id}
              className={`mood-emoji-button ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedMood(m.id)}
              style={{
                borderColor: isSelected ? 'var(--color-primary-dark)' : 'transparent',
                backgroundColor: isSelected ? m.bgColor : '#FFFFFF',
              }}
            >
              <span className="mood-emoji-char">{m.emoji}</span>
              <span className="mood-emoji-label">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
