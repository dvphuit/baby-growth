import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { havenPopupTransition, havenPopupVariants } from '@/components/motion/motionPresets';

interface PopupTriggerProps {
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'listbox';
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

interface Coords {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  placement: 'below' | 'above';
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const panelId = useId();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placement = spaceBelow < 220 && spaceAbove > spaceBelow ? 'above' : 'below';
    const width = rect.width;
    let left = align === 'end' ? rect.right - width : rect.left;
    left = Math.max(12, Math.min(viewportWidth - width - 12, left));

    if (placement === 'above') {
      setCoords({ bottom: viewportHeight - rect.top + 4, left, width, placement });
    } else {
      setCoords({ top: rect.bottom + 4, left, width, placement });
    }
  }, [align]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    const handleScrollOrResize = () => updatePosition();

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [onOpenChange, open, updatePosition]);

  return (
    <div ref={triggerRef} className={`haven-popup-root ${className}`.trim()}>
      {trigger({
        'aria-controls': panelId,
        'aria-expanded': open,
        'aria-haspopup': 'listbox',
        onClick: () => onOpenChange(!open),
      })}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && coords && (
            <motion.div
              ref={panelRef}
              id={panelId}
              className={`haven-popup-panel align-${align} open-${coords.placement}`}
              role="region"
              aria-label={ariaLabel}
              custom={coords.placement}
              variants={havenPopupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={havenPopupTransition}
              style={{
                position: 'fixed',
                top: coords.top !== undefined ? `${coords.top}px` : 'auto',
                bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 2500,
                transformOrigin: coords.placement === 'above' ? 'bottom center' : 'top center',
              }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
