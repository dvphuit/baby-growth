import React from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  icon?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => (
  toasts.length > 0 ? (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          <span>{toast.icon || '🌿'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  ) : null
);
