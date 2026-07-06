/**
 * Tabs
 *
 * Keyboard: roving tabindex within tab list; ←/→ cycle tabs.
 *           Tab from active tab exits to panel content.
 *
 * Usage:
 *   <Tabs defaultValue="matches">
 *     <Tabs.List>
 *       <Tabs.Tab value="matches">Matches</Tabs.Tab>
 *       <Tabs.Tab value="saved">Saved</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel value="matches"><MatchList /></Tabs.Panel>
 *     <Tabs.Panel value="saved"><SavedList /></Tabs.Panel>
 *   </Tabs>
 *
 * Props (Tabs):
 *   defaultValue  string — initially selected tab value
 *   value         string — controlled
 *   onChange      (value: string) => void
 *   className     string
 *
 * Edge states:
 *   Zero tabs: renders empty container.
 *   Single tab: renders without animation (nothing to animate between).
 *   Active value not found in tabs: defaults to first tab.
 */

"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface TabsCtx {
  active: string;
  setActive: (v: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsCtx | null>(null);

/* ── Tabs root ───────────────────────────────────────────────────────────── */

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  children: ReactNode;
}

function Tabs({ defaultValue = "", value, onChange, className = "", children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const baseId = useId();

  const active = value ?? internal;
  const setActive = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ active, setActive, baseId }}>
      <div className={["rm-tabs", className].filter(Boolean).join(" ")}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ── Tabs.List ───────────────────────────────────────────────────────────── */

function List({ children, className = "" }: { children: ReactNode; className?: string }) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const idx = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (idx === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      tabs[(idx + 1) % tabs.length]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      tabs[(idx - 1 + tabs.length) % tabs.length]?.focus();
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      className={["rm-tabs__list", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

/* ── Tabs.Tab ────────────────────────────────────────────────────────────── */

function Tab({
  value,
  children,
  disabled = false,
  className = "",
}: {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const ctx = useContext(TabsContext)!;
  const isSelected = ctx.active === value;
  const panelId = `${ctx.baseId}-panel-${value}`;
  const tabId = `${ctx.baseId}-tab-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      className={[
        "rm-tabs__tab rm-tabs__tab",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => ctx.setActive(value)}
    >
      {children}
    </button>
  );
}

/* ── Tabs.Panel ──────────────────────────────────────────────────────────── */

function Panel({
  value,
  children,
  className = "",
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext)!;
  const panelId = `${ctx.baseId}-panel-${value}`;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const isActive = ctx.active === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={["rm-tabs__panel", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

Tabs.List = List;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

export { Tabs };
