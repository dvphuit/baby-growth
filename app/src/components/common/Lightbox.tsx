import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  havenDialogTransition,
  havenOverlayTransition,
  havenOverlayVariants,
  havenPressStrong,
} from '@/components/motion/motionPresets';

interface LightboxProps {
  mediaSrc: string | null;
  isVideo?: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ mediaSrc, isVideo, onClose }) => (
  <AnimatePresence initial={false}>
    {mediaSrc && (
      <motion.div
        key="media-lightbox"
        className="media-lightbox open"
        variants={havenOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={havenOverlayTransition}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.button
          className="lightbox-close-btn"
          onClick={onClose}
          aria-label="Đóng"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          whileHover={{ scale: 1.06 }}
          whileTap={havenPressStrong}
        >
          <X size={18} />
        </motion.button>
        <motion.div
          key={mediaSrc}
          className="lightbox-content-box"
          initial={{ opacity: 0, y: 14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={havenDialogTransition}
        >
          {isVideo ? (
            <video
              src={mediaSrc}
              controls
              autoPlay
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px' }}
            />
          ) : (
            <img src={mediaSrc} alt="Phóng to ảnh" />
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
