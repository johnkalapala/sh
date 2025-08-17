import React from 'react';
import { ToastMessage } from '../types';
import { Icons } from './Icons';

interface ToastProps {
  toasts: ToastMessage[];
}

const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
           <div className="mr-3">
              {toast.type === 'success' ? <Icons.status.ok /> : <Icons.status.error />}
            </div>
            {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;