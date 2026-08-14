import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { Smartphone, Plus, X, Share2, PlusSquare, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event on Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <div className="pwa-install-banner">
        <div className="pwa-install-info">
          <div className="pwa-install-icon">
            <Smartphone size={20} strokeWidth={2.2} />
          </div>
          <div className="pwa-install-text">
            <span className="pwa-install-title">Cài đặt BabyGrowth AI</span>
            <span className="pwa-install-sub">Trải nghiệm toàn màn hình & dùng offline</span>
          </div>
        </div>

        <div className="pwa-install-actions">
          <button className="pwa-install-btn" onClick={handleInstallClick}>
            <span>Cài đặt</span>
            <Plus size={13} strokeWidth={2.5} />
          </button>
          <button
            className="pwa-dismiss-btn"
            onClick={() => setIsDismissed(true)}
            title="Đóng thông báo"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* iOS & Manual Installation Instruction Modal */}
      <BottomSheet
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
        title="Hướng Dẫn Cài Đặt PWA"
      >
        <div style={{ padding: '4px 0 12px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'var(--color-sage-subtle)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '16px',
            }}
          >
            <div style={{ color: 'var(--color-sage-dark)' }}>
              <Smartphone size={32} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                Cài đặt lên màn hình chính
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Sử dụng như ứng dụng gốc không cần tải từ App Store.
              </div>
            </div>
          </div>

          <div className="ios-install-steps">
            <div className="ios-step-item">
              <div className="ios-step-num">1</div>
              <div className="ios-step-content">
                <span className="ios-step-text">
                  Bấm vào biểu tượng <strong>Chia sẻ (Share)</strong>{' '}
                  <Share2 size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> ở thanh công cụ dưới đáy trình duyệt Safari / Chrome.
                </span>
              </div>
            </div>

            <div className="ios-step-item">
              <div className="ios-step-num">2</div>
              <div className="ios-step-content">
                <span className="ios-step-text">
                  Cuộn xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>{' '}
                  <PlusSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />.
                </span>
              </div>
            </div>

            <div className="ios-step-item">
              <div className="ios-step-num">3</div>
              <div className="ios-step-content">
                <span className="ios-step-text">
                  Nhấn nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất.
                </span>
              </div>
            </div>
          </div>

          <button
            className="log-btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => setShowIosGuide(false)}
          >
            <span>Đã Hiểu</span>
            <Check size={16} strokeWidth={2.4} />
          </button>
        </div>
      </BottomSheet>
    </>
  );
};
