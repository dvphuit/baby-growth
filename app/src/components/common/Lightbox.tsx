import React from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  mediaSrc: string | null;
  isVideo?: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ mediaSrc, isVideo, onClose }) => {
  if (!mediaSrc) return null;

  return (
    <div
      className="media-lightbox open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="lightbox-close-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={18} />
      </button>
      <div className="lightbox-content-box">
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
      </div>
    </div>
  );
};
