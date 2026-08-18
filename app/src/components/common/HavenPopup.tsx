import { useEffect, useId, useRef, type ReactNode } from 'react';

interface PopupTriggerProps {
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'dialog';
  onClick: () => void;
}

interface HavenPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: (props: PopupTriggerProps) => ReactNode;
  children: ReactNode;
  ariaLabel: string;
  align?: 'start' | 'end';
  className?: string;
}

export function HavenPopup({
  open,
  onOpenChange,
  trigger,
  children,
  ariaLabel,
  align = 'start',
  className = '',
}: HavenPopupProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenChange, open]);

  return (
    <div ref={rootRef} className={`haven-popup-root ${className}`.trim()}>
      {trigger({
        'aria-controls': panelId,
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        onClick: () => onOpenChange(!open),
      })}
      {open && (
        <div id={panelId} className={`haven-popup-panel align-${align}`} role="dialog" aria-label={ariaLabel}>
          {children}
        </div>
      )}
    </div>
  );
}
