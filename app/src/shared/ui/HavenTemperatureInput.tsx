import { Minus, Plus, Thermometer, Sparkles, AlertCircle, AlertTriangle, Flame, Check } from 'lucide-react';
import React, { useId, useMemo } from 'react';
import { getTemperatureStatus, type TemperatureStatus } from '@/features/activities/domain/dailyCareTargets';

export interface HavenTemperatureInputProps {
  value: number | string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  className?: string;
  id?: string;
  disabled?: boolean;
}

const DEFAULT_PRESETS = [36.5, 36.8, 37.2, 37.8, 38.5];
const TRACK_TICKS = [35.0, 35.5, 36.0, 36.5, 37.0, 37.5, 38.0, 38.5, 39.0, 39.5, 40.0, 40.5, 41.0, 41.5, 42.0];

export const HavenTemperatureInput: React.FC<HavenTemperatureInputProps> = ({
  value,
  onChange,
  min = 35.0,
  max = 42.0,
  step = 0.1,
  presets = DEFAULT_PRESETS,
  className = '',
  id,
  disabled = false,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const numValue = useMemo(() => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value || '36.8');
    return Number.isFinite(parsed) ? parsed : 36.8;
  }, [value]);

  const clampedValue = Math.max(min, Math.min(max, Math.round(numValue * 10) / 10));
  const percent = max > min ? Math.round(((clampedValue - min) / (max - min)) * 100) : 0;

  const status: TemperatureStatus = useMemo(() => getTemperatureStatus(clampedValue), [clampedValue]);

  // Recommended normal band (36.0 - 37.5°C)
  const normMin = 36.0;
  const normMax = 37.5;
  const recStartPct = Math.max(0, Math.min(100, ((normMin - min) / (max - min)) * 100));
  const recEndPct = Math.max(0, Math.min(100, ((normMax - min) / (max - min)) * 100));
  const recWidthPct = Math.max(0, recEndPct - recStartPct);
  const isIdeal = status.tier === 'normal';

  const adjust = (delta: number) => {
    if (disabled) return;
    const next = Math.max(min, Math.min(max, Math.round((clampedValue + delta) * 10) / 10));
    onChange(next.toFixed(1));
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      onChange(raw);
    }
  };

  const StatusIcon = useMemo(() => {
    switch (status.tier) {
      case 'hypothermia':
        return AlertCircle;
      case 'normal':
        return isIdeal ? Sparkles : Check;
      case 'elevated':
        return AlertTriangle;
      case 'fever':
      case 'high_fever':
      case 'very_high_fever':
        return Flame;
    }
  }, [status.tier, isIdeal]);

  const trackColor = status.color;
  const sliderBackground = `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${percent}%, var(--color-border-subtle, #e8ddd5) ${percent}%, var(--color-border-subtle, #e8ddd5) 100%)`;

  return (
    <div className={`haven-milk-card haven-temp-theme-${status.tone} ${className}`.trim()}>
      {/* Hero Display & Steppers (+-0.1 step) */}
      <div className="haven-milk-header">
        <button
          type="button"
          className="haven-milk-btn"
          aria-label="Giảm 0.1°C"
          disabled={disabled || clampedValue <= min}
          onClick={() => adjust(-step)}
        >
          <Minus size={15} />
          <span>0.1</span>
        </button>

        <div className="haven-milk-display">
          <div
            className="haven-milk-icon-wrap"
            aria-hidden="true"
            style={{
              backgroundColor: `${status.color}18`,
              color: status.color,
            }}
          >
            <Thermometer size={17} />
          </div>
          <div className="haven-milk-number-wrap">
            <input
              id={inputId}
              type="number"
              min={min}
              max={max}
              step={step}
              inputMode="decimal"
              value={value}
              onChange={handleDirectInput}
              className="haven-milk-number-input"
              aria-label="Thân nhiệt (°C)"
              placeholder="36.8"
              disabled={disabled}
            />
            <span
              className="haven-milk-unit"
              aria-hidden="true"
              style={{ color: status.color }}
            >
              °C
            </span>
          </div>
        </div>

        <button
          type="button"
          className="haven-milk-btn"
          aria-label="Tăng 0.1°C"
          disabled={disabled || clampedValue >= max}
          onClick={() => adjust(step)}
        >
          <Plus size={15} />
          <span>0.1</span>
        </button>
      </div>

      {/* Hardware-Accelerated Native Range Slider with Normal Range Band & On-Track Ticks */}
      <div className="haven-milk-slider-section">
        <div className="haven-milk-slider-wrap">
          {/* Normal Temperature Range Band (36.0 - 37.5) */}
          <div
            className="haven-milk-rec-band"
            style={{
              left: `${recStartPct}%`,
              width: `${recWidthPct}%`,
              backgroundColor: 'rgba(111, 139, 74, 0.22)',
            }}
            aria-hidden="true"
          />

          {/* On-Track Tick Marks */}
          <div className="haven-milk-track-ticks" aria-hidden="true">
            {TRACK_TICKS.map((tick) => {
              const tickPct = ((tick - min) / (max - min)) * 100;
              const isMajor = Math.round(tick) === tick;
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

          {/* Native Slider with Step 0.1 */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={clampedValue}
            onChange={(e) => onChange(e.target.value)}
            className="haven-milk-native-range"
            aria-label="Kéo chọn thân nhiệt"
            disabled={disabled}
            style={{ '--slider-bg': sliderBackground } as React.CSSProperties}
          />
        </div>

        {/* Dynamic Advice & Status Badge Row */}
        <div className={`haven-milk-advice-row ${isIdeal ? 'is-ideal' : ''}`}>
          <div className="haven-milk-advice-text">
            <StatusIcon size={13} className="haven-milk-advice-icon" style={{ color: status.color }} />
            <span>
              {status.advice}
            </span>
          </div>
          <span
            className="haven-milk-match-tag"
            style={{
              color: status.color,
              borderColor: `${status.color}40`,
              backgroundColor: `${status.color}10`,
            }}
          >
            {status.badgeText}
          </span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="haven-milk-presets" role="group" aria-label="Thân nhiệt nhanh">
        {presets.map((temp) => {
          const isSelected = Math.abs(clampedValue - temp) < 0.05;
          const isStandard = temp === 36.8;
          return (
            <button
              key={temp}
              type="button"
              className={`haven-milk-chip ${isSelected ? 'is-active' : ''}`}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(temp.toFixed(1))}
            >
              {temp.toFixed(1)}° {isStandard ? '• Chuẩn' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};
