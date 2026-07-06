/**
 * Checkbox
 *
 * Usage:
 *   <Checkbox label="Welcoming repos only" checked={val} onChange={…} />
 *   <Checkbox label="Select all" indeterminate />
 *
 * Props:
 *   label          string
 *   checked        boolean
 *   indeterminate  boolean — partial-selection state
 *   disabled       boolean
 *   onChange       (checked: boolean) => void
 *   size           "sm" | "md" | "lg"
 *   className      string
 *
 * CSS override:
 *   "label { display:block; margin: 8px 0 }" beaten by .rm-checkbox.rm-checkbox label
 */

"use client";

import { useId, useEffect, useRef } from "react";

interface Props {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

export function Checkbox({
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  size = "md",
  className = "",
  id: externalId,
}: Props) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={[
        "rm-checkbox",
        disabled ? "rm-checkbox--disabled" : "",
        `rm-checkbox--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      htmlFor={id}
    >
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className="rm-checkbox__input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        aria-checked={indeterminate ? "mixed" : checked}
      />
      <span className="rm-checkbox__box" aria-hidden="true" />
      {label && <span>{label}</span>}
    </label>
  );
}
