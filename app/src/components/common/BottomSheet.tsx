import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle-bar" onClick={onClose} style={{ cursor: 'pointer' }}></div>

        {title && (
          <div className="sheet-header-row">
            <h3 className="sheet-title">{title}</h3>
            <button
              className="sheet-close-btn"
              onClick={onClose}
              title="Đóng"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="sheet-content-body">{children}</div>
      </div>
    </div>
  );
};
