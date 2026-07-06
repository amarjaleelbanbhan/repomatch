/**
 * Dropdown
 *
 * Keyboard: Tab reaches trigger; Enter/Space opens; ↑/↓ navigates items;
 *           Enter selects; Escape closes; click outside closes.
 * Placement: opens downward by default; flips to upward if near viewport bottom.
 *
 * Usage:
 *   <Dropdown
 *     trigger={<Button variant="ghost">Options ▾</Button>}
 *     items={[
 *       { label: "Edit", onClick: () => … },
 *       { label: "Delete", variant: "danger", onClick: () => … },
 *       { separator: true },
 *       { label: "View on GitHub", href: "https://…" },
 *     ]}
 *   />
 *
 * DropdownItem:
 *   label     string
 *   onClick   () => void
 *   href      string — renders as <a>
 *   variant   "default" | "danger"
 *   disabled  boolean
 *   icon      ReactNode
 *   separator true — renders a <hr> instead
 */

"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type DropdownItem =
  | {
      separator: true;
    }
  | {
      separator?: false;
      label: string;
      onClick?: () => void;
      href?: string;
      variant?: "default" | "danger";
      disabled?: boolean;
      icon?: ReactNode;
    };

interface Props {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, className = "", align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Check if near viewport bottom and flip
  function openMenu() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setUp(rect.bottom + 220 > window.innerHeight);
    setOpen(true);
    setActiveIdx(-1);
  }

  function toggleMenu() {
    if (open) setOpen(false);
    else openMenu();
  }

  const actionItems = items.filter(
    (it): it is Exclude<DropdownItem, { separator: true }> =>
      !("separator" in it && it.separator),
  );

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, actionItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const item = actionItems[activeIdx];
      if (item && !item.disabled) {
        item.onClick?.();
        setOpen(false);
      }
    }
  }

  // Sync focus to active item
  useEffect(() => {
    if (activeIdx < 0 || !menuRef.current) return;
    const btns = menuRef.current.querySelectorAll<HTMLElement>(
      ".rm-dropdown__item",
    );
    btns[activeIdx]?.focus();
  }, [activeIdx]);

  const noItems = actionItems.length === 0;

  return (
    <div
      ref={containerRef}
      className={["rm-dropdown", up ? "rm-dropdown--up" : "", className]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open && (
        <div
          ref={menuRef}
          className="rm-dropdown__menu"
          role="menu"
          style={align === "right" ? { left: "auto", right: 0 } : undefined}
        >
          {noItems ? (
            <p className="rm-dropdown__empty">No options</p>
          ) : (
            items.map((item, i) => {
              if ("separator" in item && item.separator) {
                return <div key={i} className="rm-dropdown__separator" role="separator" />;
              }

              const it = item as Exclude<DropdownItem, { separator: true }>;
              const cls = [
                "rm-dropdown__item rm-dropdown__item rm-dropdown__item",
                it.variant === "danger" ? "rm-dropdown__item--danger" : "",
              ]
                .filter(Boolean)
                .join(" ");

              if (it.href) {
                return (
                  <a
                    key={i}
                    href={it.disabled ? undefined : it.href}
                    className={cls}
                    role="menuitem"
                    aria-disabled={it.disabled}
                    onClick={() => setOpen(false)}
                  >
                    {it.icon && <span aria-hidden="true">{it.icon}</span>}
                    {it.label}
                  </a>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  role="menuitem"
                  aria-disabled={it.disabled}
                  disabled={it.disabled}
                  onClick={() => {
                    it.onClick?.();
                    setOpen(false);
                  }}
                >
                  {it.icon && <span aria-hidden="true">{it.icon}</span>}
                  {it.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
