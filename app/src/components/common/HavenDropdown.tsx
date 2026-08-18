import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { HavenPopup } from './HavenPopup';

export interface HavenDropdownOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface HavenDropdownProps<T extends string> {
  label: string;
  value: T;
  options: HavenDropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function HavenDropdown<T extends string>({ label, value, options, onChange, className = '' }: HavenDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const SelectedIcon = selected?.icon;

  return (
    <HavenPopup
      open={open}
      onOpenChange={setOpen}
      ariaLabel={label}
      align="end"
      className={`haven-dropdown ${className}`.trim()}
      trigger={(triggerProps) => (
        <button type="button" className="haven-dropdown-trigger" aria-label={`${label}: ${selected?.label ?? ''}`} {...triggerProps}>
          {SelectedIcon && <SelectedIcon size={15} aria-hidden="true" />}
          <span>{selected?.label}</span>
          <ChevronDown size={14} className={open ? 'is-open' : ''} aria-hidden="true" />
        </button>
      )}
    >
      <div className="haven-dropdown-menu" role="listbox" aria-label={label}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`haven-dropdown-option ${isSelected ? 'selected' : ''}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {Icon && <span className="haven-dropdown-option-icon"><Icon size={16} /></span>}
              <span className="haven-dropdown-option-copy">
                <strong>{option.label}</strong>
                {option.description && <small>{option.description}</small>}
              </span>
              {isSelected && <Check size={15} className="haven-dropdown-check" />}
            </button>
          );
        })}
      </div>
    </HavenPopup>
  );
}
