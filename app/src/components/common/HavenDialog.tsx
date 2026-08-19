import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  havenDialogTransition,
  havenDialogVariants,
  havenLayoutTransition,
  havenOverlayTransition,
  havenOverlayVariants,
  havenPressStrong,
} from '@/components/motion/motionPresets';

interface HavenDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  modal?: boolean;
  className?: string;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function HavenDialog({ open, onClose, title, description, children, footer, modal = true, className = '' }: HavenDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    if (modal) document.body.style.overflow = 'hidden';

    const frame = modal
      ? requestAnimationFrame(() => {
          const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
          (first ?? dialogRef.current)?.focus();
        })
      : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (!modal || event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
      if (modal) {
        document.body.style.overflow = originalOverflow;
        if (previous?.isConnected) previous.focus();
      }
    };
  }, [modal, onClose, open]);

  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="haven-dialog-backdrop"
          className={`haven-dialog-backdrop ${modal ? '' : 'non-modal'}`.trim()}
          variants={havenOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={havenOverlayTransition}
          onClick={(event) => {
            if (!modal || event.target !== event.currentTarget) return;
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }}
        >
          <motion.div
            layout
            ref={dialogRef}
            className={`haven-dialog ${className}`.trim()}
            role="dialog"
            aria-modal={modal}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            variants={havenDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={havenDialogTransition}
          >
            <div className="haven-dialog-header">
              <div>
                <h2 id={titleId}>{title}</h2>
                {description && <p id={descriptionId}>{description}</p>}
              </div>
              <motion.button
                type="button"
                className="haven-dialog-close"
                aria-label="Đóng"
                onClick={onClose}
                whileHover={{ scale: 1.06 }}
                whileTap={havenPressStrong}
              >
                <X size={18} />
              </motion.button>
            </div>
            <motion.div layout="position" className="haven-dialog-body" transition={havenLayoutTransition}>
              {children}
            </motion.div>
            {footer && (
              <motion.div layout="position" className="haven-dialog-footer" transition={havenLayoutTransition}>
                {footer}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
