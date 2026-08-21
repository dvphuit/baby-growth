import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useNativePresence } from '@/shared/hooks/useNativePresence';

interface LightboxProps {
  mediaSrc: string | null;
  isVideo?: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ mediaSrc, isVideo, onClose }) => {
  const lastMediaRef = useRef<{ src: string; isVideo: boolean } | null>(null);
  if (mediaSrc) lastMediaRef.current = { src: mediaSrc, isVideo: Boolean(isVideo) };
  const presence = useNativePresence(Boolean(mediaSrc), 180);
  const media = mediaSrc ? { src: mediaSrc, isVideo: Boolean(isVideo) } : lastMediaRef.current;

  if (!presence.mounted || !media) return null;
  const phaseClass = presence.phase === 'open' ? 'native-open' : 'native-closing';

  return (
    <div
      className={`media-lightbox ${mediaSrc ? 'open' : 'closing'} ${phaseClass}`}
      aria-hidden={mediaSrc ? undefined : true}
      onClick={(event) => {
        if (mediaSrc && event.target === event.currentTarget) onClose();
      }}
    >
      <button
        className="lightbox-close-btn"
        onClick={onClose}
        aria-label="Đóng"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <X size={18} />
      </button>
      <div className="lightbox-content-box native-lightbox-content">
        {media.isVideo ? (
          <video
            src={media.src}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px' }}
          />
        ) : (
          <img src={media.src} alt="Phóng to ảnh" />
        )}
      </div>
    </div>
  );
};
