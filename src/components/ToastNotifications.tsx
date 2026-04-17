"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useRef } from "react";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = (++idCounter.current).toString();
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-500 text-green-100";
      case "error":
        return "bg-red-900/90 border-red-500 text-red-100";
      case "warning":
        return "bg-yellow-900/90 border-yellow-500 text-yellow-100";
      case "info":
      default:
        return "bg-blue-900/90 border-blue-500 text-blue-100";
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      case "info": default: return "ℹ️";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-right-2 ${getToastStyles(toast.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="text-xl flex-shrink-0">{getToastIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.message && (
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Convenience hooks for different toast types
export function useToastSuccess() {
  const { addToast } = useToast();
  return (title: string, message?: string, duration?: number) =>
    addToast({ type: "success", title, message, duration });
}

export function useToastError() {
  const { addToast } = useToast();
  return (title: string, message?: string, duration?: number) =>
    addToast({ type: "error", title, message, duration });
}

export function useToastWarning() {
  const { addToast } = useToast();
  return (title: string, message?: string, duration?: number) =>
    addToast({ type: "warning", title, message, duration });
}

export function useToastInfo() {
  const { addToast } = useToast();
  return (title: string, message?: string, duration?: number) =>
    addToast({ type: "info", title, message, duration });
}