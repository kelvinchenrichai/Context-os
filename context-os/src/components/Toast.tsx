import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  loading: <Loader2 className="w-4 h-4 text-stone-400 animate-spin shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    if (toast.type === 'loading') return;
    const timer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.type]);

  return (
    <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-sans font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-full">
      {ICONS[toast.type]}
      <span className="leading-snug">{toast.text}</span>
    </div>
  );
}
