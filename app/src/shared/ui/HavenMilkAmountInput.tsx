import { Minus, Plus, Milk, Sparkles } from 'lucide-react';
import React, { useId, useMemo } from 'react';
import { getFeedingRecommendation, type FeedingRecommendation } from '@/features/activities/domain/dailyCareTargets';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export interface HavenMilkAmountInputProps {
  value: number | string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  className?: string;
  id?: string;
  disabled?: boolean;
  recommendation?: FeedingRecommendation;
}

const DEFAULT_PRESETS = [60, 90, 120, 150, 180, 210, 240];
const TRACK_TICKS = [25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275];

export const HavenMilkAmountInput: React.FC<HavenMilkAmountInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 300,
  step = 5,
  presets = DEFAULT_PRESETS,
  className = '',
  id,
  disabled = false,
  recommendation: customRec,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const numValue = typeof value === 'number' ? value : Number.parseInt(value || '0', 10) || 0;
  const clampedValue = Math.max(min, Math.min(max, numValue));
  const percent = max > min ? Math.round(((clampedValue - min) / (max - min)) * 100) : 0;

  // Derive recommendation based on active baby's age & weight if not provided
  const familyData = useProfileStore((s) => s.familyData);
  const currentStage = useGrowthStore((s) => s.currentStageData());
  const weightKg = useMemo(() => {
    const vitalsWeight = currentStage?.todayVitals?.weight;
    if (vitalsWeight) {
      const parsed = parseFloat(vitalsWeight);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    const birthWeight = familyData?.birthWeight;
    if (birthWeight) {
      const parsed = parseFloat(birthWeight);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return null;
  }, [currentStage?.todayVitals?.weight, familyData?.birthWeight]);

  const rec = useMemo(() => {
    if (customRec) return customRec;
    return getFeedingRecommendation(familyData?.birthDate, weightKg);
  }, [customRec, familyData?.birthDate, weightKg]);

  const recStartPct = Math.max(0, Math.min(100, ((rec.minMl - min) / (max - min)) * 100));
  const recEndPct = Math.max(0, Math.min(100, ((rec.maxMl - min) / (max - min)) * 100));
  const recWidthPct = Math.max(0, recEndPct - recStartPct);

  const isWithinRange = clampedValue >= rec.minMl && clampedValue <= rec.maxMl;

  const adjust = (delta: number) => {
    if (disabled) return;
    const next = Math.max(min, Math.min(max, clampedValue + delta));
    onChange(String(next));
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const val = Number.parseInt(raw, 10);
    if (!Number.isNaN(val)) {
      onChange(String(Math.max(0, Math.min(999, val))));
    }
  };

  const sliderBackground = `linear-gradient(to right, var(--color-sage-dark, #6f8b4a) 0%, var(--color-sage-dark, #6f8b4a) ${percent}%, var(--color-border-subtle, #e8ddd5) ${percent}%, var(--color-border-subtle, #e8ddd5) 100%)`;

  return (
    <div className={`haven-milk-card ${className}`.trim()}>
      {/* Hero Display & Steppers (+-5 step) */}
      <div className="haven-milk-header">
        <button
          type="button"
          className="haven-milk-btn"
          aria-label="Giảm 5ml"
          disabled={disabled || clampedValue <= min}
          onClick={() => adjust(-step)}
        >
          <Minus size={15} />
          <span>{step}</span>
        </button>

        <div className="haven-milk-display">
          <div className="haven-milk-icon-wrap" aria-hidden="true">
            <Milk size={17} />
          </div>
          <div className="haven-milk-number-wrap">
            <input
              id={inputId}
              type="number"
              min={min}
              max={max}
              step={step}
              inputMode="numeric"
              value={value}
              onChange={handleDirectInput}
              className="haven-milk-number-input"
              aria-label="Lượng sữa (ml)"
              placeholder="0"
              disabled={disabled}
            />
            <span className="haven-milk-unit" aria-hidden="true">ml</span>
          </div>
        </div>

        <button
          type="button"
          className="haven-milk-btn"
          aria-label="Tăng 5ml"
          disabled={disabled || clampedValue >= max}
          onClick={() => adjust(step)}
        >
          <Plus size={15} />
          <span>{step}</span>
        </button>
      </div>

      {/* Hardware-Accelerated Native Range Slider with On-Track Ticks & Recommended Range Band */}
      <div className="haven-milk-slider-section">
        <div className="haven-milk-slider-wrap">
          {/* Recommended Range Highlight Band */}
          {recWidthPct > 0 && (
            <div
              className="haven-milk-rec-band"
              style={{
                left: `${recStartPct}%`,
                width: `${recWidthPct}%`,
              }}
              aria-hidden="true"
            />
          )}

          {/* On-Track Tick Marks */}
          <div className="haven-milk-track-ticks" aria-hidden="true">
            {TRACK_TICKS.map((tick) => {
              const tickPct = ((tick - min) / (max - min)) * 100;
              const isMajor = tick % 50 === 0;
              const isFilled = clampedValue >= tick;
              return (
                <div
                  key={tick}
                  className={`haven-milk-track-tick ${isMajor ? 'is-major' : 'is-minor'} ${isFilled ? 'is-filled' : ''}`}
                  style={{ left: `${tickPct}%` }}
                />
              );
            })}
          </div>

          {/* Native Slider with Step 5 */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={clampedValue}
            onChange={(e) => onChange(e.target.value)}
            className="haven-milk-native-range"
            aria-label="Kéo chọn lượng sữa"
            disabled={disabled}
            style={{ '--slider-bg': sliderBackground } as React.CSSProperties}
          />
        </div>

        {/* Dynamic Advice & Recommended Band Pill */}
        <div className={`haven-milk-advice-row ${isWithinRange ? 'is-ideal' : ''}`}>
          <div className="haven-milk-advice-text">
            <Sparkles size={13} className="haven-milk-advice-icon" />
            <span>
              Gợi ý bé {rec.ageText}: <strong>{rec.minMl}–{rec.maxMl} ml</strong>
            </span>
          </div>
          {isWithinRange && (
            <span className="haven-milk-match-tag">✓ Chuẩn mức</span>
          )}
        </div>
      </div>

      {/* Preset Chips */}
      <div className="haven-milk-presets" role="group" aria-label="Lượng sữa nhanh">
        {presets.map((ml) => {
          const isSelected = clampedValue === ml;
          return (
            <button
              key={ml}
              type="button"
              className={`haven-milk-chip ${isSelected ? 'is-active' : ''}`}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(String(ml))}
            >
              {ml} ml
            </button>
          );
        })}
      </div>
    </div>
  );
};
