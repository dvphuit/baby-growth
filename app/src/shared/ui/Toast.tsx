import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { havenLayoutTransition, havenToastVariants } from '@/shared/motion/motionPresets';

export interface ToastMessage {
  id: string;
  message: string;
  icon?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => (
  <AnimatePresence initial={false}>
    {toasts.length > 0 && (
      <motion.div
        key="toast-container"
        className="toast-container"
        id="toastContainer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((toast) => (
            <motion.div
              layout
              key={toast.id}
              className="toast-item"
              variants={havenToastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={havenLayoutTransition}
            >
              <span>{toast.icon || '🌿'}</span>
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    )}
  </AnimatePresence>
);
