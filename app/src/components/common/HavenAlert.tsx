import { AlertCircle, CheckCircle2, Info, Sparkles, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertTone = 'info' | 'success' | 'warning' | 'sage';

interface HavenAlertProps {
  title: string;
  children?: ReactNode;
  tone?: AlertTone;
  action?: ReactNode;
  icon?: LucideIcon;
  live?: boolean;
}

const TONE_ICONS: Record<AlertTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  sage: Sparkles,
};

export function HavenAlert({ title, children, tone = 'info', action, icon, live = false }: HavenAlertProps) {
  const Icon = icon ?? TONE_ICONS[tone];
  return (
    <div className={`haven-alert tone-${tone}`} role={live ? 'alert' : 'status'} aria-live={live ? 'assertive' : 'polite'}>
      <span className="haven-alert-icon" aria-hidden="true"><Icon size={18} /></span>
      <div className="haven-alert-copy">
        <strong>{title}</strong>
        {children && <div>{children}</div>}
      </div>
      {action && <div className="haven-alert-action">{action}</div>}
    </div>
  );
}
