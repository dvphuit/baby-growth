import React from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  icon?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((t) => (
        <div key={t.id} className="toast-item">
          <span>{t.icon || '🌿'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
