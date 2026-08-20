import type { ReactNode } from 'react';

export type AppBarTone = 'baby' | 'mom' | 'neutral';
export type AppBarVariant = 'profile' | 'page';

export interface AppBarProps {
  id?: string;
  className?: string;
  ariaLabel?: string;
  tone?: AppBarTone;
  variant?: AppBarVariant;
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
}

export const AppBar: React.FC<AppBarProps> = ({
  id,
  className = '',
  ariaLabel,
  tone = 'neutral',
  variant = 'profile',
  start,
  center,
  end,
}) => (
  <header
    id={id}
    className={`app-bar app-bar-${tone} app-bar-${variant} ${className}`.trim()}
    aria-label={ariaLabel}
  >
    {start ? <div className="app-bar-start">{start}</div> : null}
    {center ? <div className="app-bar-center">{center}</div> : null}
    {end ? <div className="app-bar-end">{end}</div> : null}
  </header>
);
