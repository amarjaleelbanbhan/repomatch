/**
 * Modal
 *
 * Z-index lifecycle (fully specified):
 *   - Base z-index: 1000 (CSS variable --rm-modal-z default).
 *   - A global module-level counter tracks open modal count.
 *   - On open: counter increments; modal gets z-index = 1000 + (counter * 10).
 *   - On close: counter decrements. Counter never goes below 0.
 *   - Re-open after close: counter increments again from whatever current value is.
 *     For a single modal used repeatedly: open → 1010, close → 1000, reopen → 1010.
 *     For stacked modals: first = 1010, second = 1020, close second → counter=1,
 *     next open from anywhere = 1020 again (safe, they don't overlap).
 *   - SSR safety: Modal renders nothing on server (isOpen checked after mount via
 *     useEffect). dialog[open] is set purely client-side.
 *
 * Focus trap:
 *   Tab cycles only within dialog.
 *   Shift+Tab reverses.
 *   Escape closes modal and returns focus to trigger element.
 *
 * Usage:
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   const [open, setOpen] = useState(false);
 *
 *   <Button ref={triggerRef} onClick={() => setOpen(true)}>Open</Button>
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm action" triggerRef={triggerRef}>
 *     <p>Are you sure?</p>
 *   </Modal>
 *
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   title       string
 *   triggerRef  RefObject<HTMLElement> — focus returns here on close
 *   children    ReactNode
 *   className   string
 */

"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type RefObject,
} from "react";

// Module-level counter — tracks concurrent open modals for z-index stacking.
// Decrements on close; does NOT keep climbing indefinitely.
let openModalCount = 0;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  triggerRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  triggerRef,
  children,
  className = "",
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const zIndexRef = useRef<number>(1000);

  // Manage z-index counter and focus
  useEffect(() => {
    if (isOpen) {
      openModalCount = Math.max(0, openModalCount) + 1;
      zIndexRef.current = 1000 + openModalCount * 10;
      document.body.style.overflow = "hidden";

      // Focus first focusable element inside dialog
      requestAnimationFrame(() => {
        const el = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        el?.focus();
      });
    } else {
      openModalCount = Math.max(0, openModalCount - 1);
      document.body.style.overflow = "";

      // Return focus to trigger on close
      triggerRef?.current?.focus();
    }

    return () => {
      if (isOpen) {
        openModalCount = Math.max(0, openModalCount - 1);
        document.body.style.overflow = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Focus trap
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (first && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (last && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }, []);

  // Keyboard handling: Escape → close; Tab → trap
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else trapFocus(e);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, trapFocus]);

  if (!isOpen) return null;

  const z = zIndexRef.current;

  return (
    <div
      ref={backdropRef}
      className="rm-modal-backdrop"
      style={{ "--rm-modal-z": z } as React.CSSProperties}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={["rm-modal", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "rm-modal-title" : undefined}
        style={{ zIndex: z + 1 }}
      >
        <div className="rm-modal__header">
          {title && (
            <h2 id="rm-modal-title" className="rm-modal__title">
              {title}
            </h2>
          )}
          <button
            type="button"
            className="rm-modal__close rm-modal__close rm-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="rm-modal__body">{children}</div>
      </div>
    </div>
  );
}
