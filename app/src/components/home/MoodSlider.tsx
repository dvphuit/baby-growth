import { useState } from 'react';
import { Frown, Meh, Smile, Sparkles } from 'lucide-react';

interface MoodItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const MOODS: MoodItem[] = [
  { id: 'depressed', icon: <Frown size={20} />, label: 'Quấy khóc', color: 'var(--color-depressed)', bgColor: 'var(--color-depressed-bg)' },
  { id: 'sad', icon: <Meh size={20} />, label: 'Mệt mỏi', color: 'var(--color-sad)', bgColor: 'var(--color-sad-bg)' },
  { id: 'neutral', icon: <Smile size={20} />, label: 'Bình thường', color: 'var(--color-neutral)', bgColor: 'var(--color-neutral-bg)' },
  { id: 'happy', icon: <Smile size={20} />, label: 'Vui vẻ', color: '#B5790E', bgColor: 'var(--color-happy-bg)' },
  { id: 'overjoyed', icon: <Sparkles size={20} />, label: 'Hào hứng', color: 'var(--color-overjoyed)', bgColor: 'var(--color-overjoyed-bg)' },
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
          {currentMoodObj.label}
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
                color: isSelected ? m.color : 'var(--color-text-secondary)',
              }}
            >
              <span className="mood-emoji-char">{m.icon}</span>
              <span className="mood-emoji-label">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

