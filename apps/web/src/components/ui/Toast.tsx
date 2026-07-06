/**
 * Toast + ToastProvider
 *
 * Priority-aware eviction:
 *   Max queue: 5 visible toasts.
 *   When adding a 6th toast:
 *   1. Find the oldest non-danger toast → evict it.
 *   2. If all queued toasts are danger → evict the oldest danger toast.
 *   This ensures danger/error toasts are never silently dropped by low-priority spam.
 *
 * Toast variants: "success" | "danger" | "warning" | "info"
 * Auto-dismiss: 4000ms by default (adjustable per-toast via `duration`).
 * Enter animation: slides up from bottom-right (translateY(16px) → 0, 180ms ease-out).
 * Exit: slides down + fades (translateY(8px) + opacity 0, 180ms ease-in).
 * Progress bar: linear depletion over auto-dismiss duration.
 *
 * Usage:
 *   // Wrap app (or layout) with ToastProvider:
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 *   // Anywhere inside:
 *   const toast = useToast();
 *   toast.success("Saved!", "Your changes have been applied.");
 *   toast.danger("Error", "Something went wrong.");
 *   toast.push({ variant: "warning", title: "Heads up", message: "…", duration: 6000 });
 *
 * useToast() throws if used outside ToastProvider.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "danger" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
  exiting: boolean;
}

interface ToastAPI {
  push: (opts: Omit<ToastItem, "id" | "exiting">) => void;
  success: (title: string, message?: string) => void;
  danger: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const MAX_TOASTS = 5;

const ToastContext = createContext<ToastAPI | null>(null);

const ICONS: Record<ToastVariant, string> = {
  success: "✓",
  danger: "✕",
  warning: "⚠",
  info: "ℹ",
};

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Stable ref to avoid stale closures in dismiss
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const dismiss = useCallback((id: string) => {
    // Mark as exiting so CSS animation plays
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    // Remove from DOM after animation completes (180ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const push = useCallback(
    (opts: Omit<ToastItem, "id" | "exiting">) => {
      const id = uid();
      setToasts((prev) => {
        let next = [...prev];

        // Priority-aware eviction when at max capacity
        if (next.length >= MAX_TOASTS) {
          // 1. Evict oldest non-danger toast
          const oldestNonDangerIdx = next.findIndex(
            (t) => t.variant !== "danger" && !t.exiting,
          );
          if (oldestNonDangerIdx !== -1) {
            next.splice(oldestNonDangerIdx, 1);
          } else {
            // 2. All are danger — evict oldest danger
            const oldestIdx = next.findIndex((t) => !t.exiting);
            if (oldestIdx !== -1) next.splice(oldestIdx, 1);
          }
        }

        return [...next, { ...opts, id, exiting: false }];
      });
      return id;
    },
    [],
  );

  const success = useCallback(
    (title: string, message = "") => push({ variant: "success", title, message, duration: 4000 }),
    [push],
  );
  const danger = useCallback(
    (title: string, message = "") => push({ variant: "danger", title, message, duration: 6000 }),
    [push],
  );
  const warning = useCallback(
    (title: string, message = "") => push({ variant: "warning", title, message, duration: 5000 }),
    [push],
  );
  const info = useCallback(
    (title: string, message = "") => push({ variant: "info", title, message, duration: 4000 }),
    [push],
  );

  const api: ToastAPI = { push, success, danger, warning, info, dismiss };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastRegion toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ── ToastRegion ─────────────────────────────────────────────────────────── */

function ToastRegion({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}) {
  return (
    <div
      className="rm-toast-region"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

/* ── ToastCard ───────────────────────────────────────────────────────────── */

function ToastCard({
  toast,
  dismiss,
}: {
  toast: ToastItem;
  dismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      className={[
        "rm-toast",
        `rm-toast--${toast.variant}`,
        toast.exiting ? "rm-toast--exiting" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-atomic="true"
    >
      <span className="rm-toast__icon" aria-hidden="true">
        {ICONS[toast.variant]}
      </span>
      <div className="rm-toast__content">
        {toast.title && <p className="rm-toast__title">{toast.title}</p>}
        {toast.message && <p className="rm-toast__message">{toast.message}</p>}
      </div>
      <button
        type="button"
        className="rm-toast__dismiss rm-toast__dismiss rm-toast__dismiss"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
      {/* Progress bar — animates from 100% → 0% over toast.duration */}
      <span
        className="rm-toast__progress"
        aria-hidden="true"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}
