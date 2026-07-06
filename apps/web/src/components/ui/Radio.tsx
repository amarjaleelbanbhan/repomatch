/**
 * RadioGroup + Radio
 *
 * STRUCTURAL REQUIREMENT:
 *   Radio MUST be used inside RadioGroup. RadioGroup supplies the shared `name`
 *   attribute that enforces mutual exclusivity among radio inputs.
 *
 *   A bare <Radio> without <RadioGroup> will:
 *   1. Log a console.warn in development.
 *   2. Fall back to name="radio-ungrouped" — which means multiple bare Radios
 *      will NOT be mutually exclusive unless they happen to share a name manually.
 *   This is a known limitation, not a bug — it's enforced at the component boundary.
 *
 * Usage:
 *   <RadioGroup name="skill" value={val} onChange={setVal} label="Skill level">
 *     <Radio value="beginner"     label="Beginner" />
 *     <Radio value="intermediate" label="Intermediate" />
 *     <Radio value="advanced"     label="Advanced" />
 *   </RadioGroup>
 *
 * RadioGroup Props:
 *   name        string — required, shared across all child Radios
 *   value       string — currently selected value
 *   onChange    (value: string) => void
 *   label       string — group label (rendered as <legend>)
 *   direction   "vertical" | "horizontal"  (default: "vertical")
 *   disabled    boolean — disables all child Radios
 *   className   string
 *
 * Radio Props:
 *   value    string — required
 *   label    string
 *   disabled boolean — overrides group disabled
 *   size     "sm" | "md" | "lg"
 *
 * Keyboard: Tab enters group; ↑/↓/←/→ cycles within group; Tab exits to panel.
 */

"use client";

import { createContext, useContext, useId, type ReactNode } from "react";

interface GroupCtx {
  name: string;
  selectedValue: string | undefined;
  onChange: (value: string) => void;
  groupDisabled: boolean;
}

const RadioGroupContext = createContext<GroupCtx | null>(null);

/* ── RadioGroup ─────────────────────────────────────────────────────────── */

interface GroupProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  direction?: "vertical" | "horizontal";
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function RadioGroup({
  name,
  value,
  onChange,
  label,
  direction = "vertical",
  disabled = false,
  className = "",
  children,
}: GroupProps) {
  return (
    <RadioGroupContext.Provider
      value={{ name, selectedValue: value, onChange, groupDisabled: disabled }}
    >
      <fieldset
        className={[
          "rm-radio-group",
          direction === "horizontal" ? "rm-radio-group--horizontal" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ border: "none", padding: 0, margin: 0 }}
        disabled={disabled}
      >
        {label && (
          <legend
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--text)",
              marginBottom: "var(--space-2)",
              padding: 0,
            }}
          >
            {label}
          </legend>
        )}
        {children}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

/* ── Radio ──────────────────────────────────────────────────────────────── */

interface RadioProps {
  value: string;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Radio({
  value,
  label,
  disabled: ownDisabled = false,
  size = "md",
  className = "",
}: RadioProps) {
  const ctx = useContext(RadioGroupContext);
  const generatedId = useId();

  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Radio] Used without a RadioGroup. Mutual exclusivity is NOT guaranteed. " +
          "Wrap Radio components in a <RadioGroup name=\"…\"> to fix this.",
      );
    }
  }

  const name = ctx?.name ?? "radio-ungrouped";
  const isChecked = ctx?.selectedValue === value;
  const isDisabled = ownDisabled || ctx?.groupDisabled || false;

  function handleChange() {
    ctx?.onChange(value);
  }

  return (
    <label
      className={[
        "rm-radio",
        isDisabled ? "rm-radio--disabled" : "",
        `rm-radio--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      htmlFor={generatedId}
    >
      <input
        type="radio"
        id={generatedId}
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className="rm-radio__input"
      />
      <span className="rm-radio__dot" aria-hidden="true" />
      {label && <span>{label}</span>}
    </label>
  );
}
