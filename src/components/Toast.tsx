import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[toast.type];

  const borderColors = {
    success: 'border-l-4 border-emerald-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-amber-500',
    info: 'border-l-4 border-gold-500',
  };

  const textColors = {
    success: 'text-emerald-900',
    error: 'text-red-900',
    warning: 'text-amber-900',
    info: 'text-emerald-950',
  };

  return (
    <div
      className={`pointer-events-auto bg-white rounded-2xl p-4 shadow-xl border border-ivory-300 ${borderColors[toast.type]} flex items-start gap-3 animate-in slide-in-from-right duration-200`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
        toast.type === 'success' ? 'text-emerald-600' :
        toast.type === 'error' ? 'text-red-600' :
        toast.type === 'warning' ? 'text-amber-600' : 'text-gold-600'
      }`} />
      
      <div className={`text-xs font-semibold flex-1 ${textColors[toast.type]}`}>
        {toast.message}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-charcoal p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
