import React, { useEffect, useState, useRef, useCallback, useId } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  dismissible?: boolean;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Material Motion 3 (M3) Bottom Sheet Component
 * - Emphasized Decelerate for entrance: cubic-bezier(0.05, 0.7, 0.1, 1.0), 380ms
 * - Emphasized Accelerate for exit: cubic-bezier(0.3, 0, 0.8, 0.15), 250ms
 * - Fluid 1:1 hardware-accelerated pointer tracking on swipe down
 * - Spring recovery when drag is canceled: cubic-bezier(0.1, 0.9, 0.2, 1.0), 320ms
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  dismissible = true,
  children,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isEntered, setIsEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isClosingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

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

  // Entrance transition lifecycle
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      isClosingRef.current = false;
      setDragY(0);
      setIsDragging(false);

      // Trigger transition to entered state on next frame
      const frameId = requestAnimationFrame(() => {
        setIsEntered(true);
      });
      return () => cancelAnimationFrame(frameId);
    } else {
      setIsEntered(false);
      setIsClosing(false);
      isClosingRef.current = false;
      setIsRendered(false);
      setDragY(0);
    }
  }, [isOpen]);

  const handleTriggerClose = useCallback(() => {
    if (!dismissible || isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    setIsEntered(false);
    setIsDragging(false);

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
      isClosingRef.current = false;
      setDragY(0);
    }, 250);
  }, [dismissible, onClose]);

  useEffect(() => {
    if (!isOpen || !isRendered) return;
    const frameId = requestAnimationFrame(() => {
      const focusable = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? sheetRef.current)?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (dismissible) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragY(0);
  }, [dismissible]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && dismissible && !isClosingRef.current) {
        handleTriggerClose();
        return;
      }
      if (e.key === 'Tab' && isOpen && sheetRef.current) {
        const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) {
          e.preventDefault();
          sheetRef.current.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const activeIsFocusable = focusable.includes(active as HTMLElement);
        if (e.shiftKey && (active === first || !activeIsFocusable)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !activeIsFocusable)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, isOpen, handleTriggerClose]);

  // Pointer / Touch Handlers for 1:1 Fluid Tracking
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!dismissible || isClosingRef.current) return;
    const isAtTop = !sheetRef.current || sheetRef.current.scrollTop <= 0;
    if (isAtTop) {
      startYRef.current = e.clientY;
      startTimeRef.current = Date.now();
      isDraggingRef.current = true;
      setIsDragging(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        // ignore if not supported
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dismissible || !isDraggingRef.current || isClosingRef.current) return;
    const currentY = e.clientY;
    const diffY = currentY - startYRef.current;

    if (diffY > 0) {
      // Pulling down: direct 1:1 hardware-accelerated follow
      setDragY(diffY);
    } else {
      // Pulling up: subtle rubber-band resistance
      setDragY(Math.max(-24, diffY * 0.15));
      if (sheetRef.current && sheetRef.current.scrollTop > 0) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dismissible) {
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragY(0);
      return;
    }
    if (!isDraggingRef.current || isClosingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    const elapsed = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = dragY / elapsed;

    // Dismiss criteria (M3 standard): dragged down > 80px or flick velocity > 0.45px/ms
    if (dragY > 80 || (velocity > 0.45 && dragY > 20)) {
      handleTriggerClose();
    } else {
      // Spring smoothly back to rest position
      setDragY(0);
    }
  };

  if (!isOpen && !isRendered) return null;

  // Material Backdrop Scrim Opacity calculation
  const backdropOpacity = isClosing || !isEntered
    ? 0
    : isDragging && dragY > 0
    ? Math.max(0.05, 1 - dragY / 320)
    : 1;

  const backdropStyle: React.CSSProperties = {
    opacity: backdropOpacity,
    transition: isDragging
      ? 'none'
      : isClosing
      ? 'opacity 240ms cubic-bezier(0.3, 0, 0.8, 0.15)'
      : 'opacity 350ms cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  };

  // Material Sheet Transform & Transition calculation
  const sheetTransform = isClosing || !isEntered
    ? 'translate3d(0, 100%, 0)'
    : isDragging
    ? `translate3d(0, ${Math.max(0, dragY)}px, 0)`
    : 'translate3d(0, 0, 0)';

  const sheetTransition = isDragging
    ? 'none'
    : isClosing
    ? 'transform 250ms cubic-bezier(0.3, 0, 0.8, 0.15)'
    : isEntered && dragY === 0
    ? 'transform 380ms cubic-bezier(0.05, 0.7, 0.1, 1.0)'
    : 'transform 320ms cubic-bezier(0.1, 0.9, 0.2, 1.0)';

  const sheetStyle: React.CSSProperties = {
    transform: sheetTransform,
    transition: sheetTransition,
  };

  return (
    <div
      className={`modal-backdrop ${isEntered ? 'open' : ''} ${isClosing ? 'closing' : ''}`}
      style={backdropStyle}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) handleTriggerClose();
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Hộp thoại'}
        tabIndex={-1}
        className={`bottom-sheet ${isClosing ? 'closing' : ''} ${isDragging ? 'is-dragging' : ''}`}
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle header area with high-priority 1:1 finger tracking */}
        <div
          ref={dragHandleRef}
          className="sheet-drag-handle-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none', cursor: dismissible ? 'grab' : 'default' }}
        >
          <div
            className="sheet-handle-bar"
            onClick={handleTriggerClose}
            title="Kéo xuống hoặc chạm để đóng"
          />

          {title && (
            <div className="sheet-header-row">
              <h3 className="sheet-title" id={titleId}>{title}</h3>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={handleTriggerClose}
                title="Đóng"
                aria-label="Đóng"
                disabled={!dismissible}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="sheet-content-body">{children}</div>
      </div>
    </div>
  );
};
