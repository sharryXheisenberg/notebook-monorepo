"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

type ToastVariant = "success" | "info";
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Lightweight, dependency-free toast — replaces plain inline text for confirmations
 * (share link created, etc.) with something that actually reads as a confirmation
 * rather than static page copy. No new package added; this is ~40 lines of React state.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="flex items-start gap-2 bg-surface-raised border border-border-subtle rounded-md shadow-lg px-3 py-2.5 text-sm text-ink-primary animate-in fade-in slide-in-from-bottom-2"
          >
            {toast.variant === "success" ? (
              <CheckCircle2 size={16} className="text-signal shrink-0 mt-0.5" />
            ) : (
              <Info size={16} className="text-annotation shrink-0 mt-0.5" />
            )}
            <span className="flex-1 break-words">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="text-ink-muted hover:text-ink-primary shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
