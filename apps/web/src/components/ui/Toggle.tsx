/**
 * Toggle (role="switch")
 *
 * Usage:
 *   <Toggle label="Dark mode" checked={val} onChange={setVal} />
 *
 * Props:
 *   label    string
 *   checked  boolean
 *   disabled boolean
 *   onChange (checked: boolean) => void
 *   size     "sm" | "md" | "lg"
 *   className string
 *
 * Keyboard: Space/Enter toggles; aria-checked updates.
 */

"use client";

import { useId } from "react";

interface Props {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

export function Toggle({
  label,
  checked = false,
  disabled = false,
  onChange,
  size = "md",
  className = "",
  id: externalId,
}: Props) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onChange?.(!checked);
    }
  }

  return (
    <div
      className={[
        "rm-toggle",
        checked ? "rm-toggle--checked" : "",
        disabled ? "rm-toggle--disabled" : "",
        `rm-toggle--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        role="switch"
        id={id}
        type="button"
        className="rm-toggle__track rm-toggle__track rm-toggle__track"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        onKeyDown={handleKeyDown}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <span className="rm-toggle__thumb" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </button>
      {label && (
        <label htmlFor={id} style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
          {label}
        </label>
      )}
    </div>
  );
}
