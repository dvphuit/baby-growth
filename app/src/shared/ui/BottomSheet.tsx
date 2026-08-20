import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import {
  havenOverlayTransition,
  havenOverlayVariants,
  havenPressStrong,
  havenSheetTransition,
  havenSheetVariants,
  havenSnappySpring,
} from '@/shared/motion/motionPresets';
import { useModalSurfaceLayoutId } from '@/shared/motion/modalMotionContext';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  dismissible?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  dismissible = true,
  children,
  footer,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const dragControls = useDragControls();
  const surfaceLayoutId = useModalSurfaceLayoutId();

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    return () => {
      const previouslyFocused = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frameId = requestAnimationFrame(() => {
      const focusable = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? sheetRef.current)?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !sheetRef.current) return;
      const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        sheetRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const activeIsFocusable = focusable.includes(active as HTMLElement);

      if (event.shiftKey && (active === first || !activeIsFocusable)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !activeIsFocusable)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, isOpen, onClose]);

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissible || (contentRef.current?.scrollTop ?? 0) > 0) return;
    dragControls.start(event);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!dismissible) return;
    const shouldDismiss = info.offset.y > 80 || (info.velocity.y > 450 && info.offset.y > 20);
    if (shouldDismiss) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="haven-bottom-sheet"
          className="modal-backdrop open"
          variants={havenOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={havenOverlayTransition}
          onClick={(event) => {
            if (dismissible && event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            layoutId={surfaceLayoutId}
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : 'Hộp thoại'}
            tabIndex={-1}
            className="bottom-sheet"
            variants={havenSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={havenSheetTransition}
            drag={dismissible ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.7 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="sheet-drag-handle-area"
              tabIndex={-1}
              onPointerDown={handleDragStart}
              style={{ touchAction: 'none', cursor: dismissible ? 'grab' : 'default' }}
            >
              <motion.div
                className="sheet-handle-bar"
                tabIndex={-1}
                title={dismissible ? 'Kéo xuống hoặc chạm để đóng' : undefined}
                whileHover={dismissible ? { scaleX: 1.12 } : undefined}
                whileTap={dismissible ? { scaleX: 0.94 } : undefined}
                transition={havenSnappySpring}
                onClick={() => {
                  if (dismissible) onClose();
                }}
              />

              {title && (
                <div className="sheet-header-row">
                  <h3 className="sheet-title" id={titleId}>{title}</h3>
                  <motion.button
                    type="button"
                    className="sheet-close-btn"
                    onClick={() => {
                      if (dismissible) onClose();
                    }}
                    title="Đóng"
                    aria-label="Đóng"
                    disabled={!dismissible}
                    whileTap={dismissible ? havenPressStrong : undefined}
                    whileHover={dismissible ? { scale: 1.06 } : undefined}
                    transition={havenSnappySpring}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              )}
            </div>

            <div ref={contentRef} className="sheet-content-body">{children}</div>
            {footer && <motion.div layout="position" className="sheet-footer">{footer}</motion.div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
