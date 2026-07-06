/**
 * Select
 *
 * Usage:
 *   <Select label="Language" options={langs} value={val} onChange={…} />
 *   <Select label="Sort" options={[]} placeholder="No options available" />
 *
 * Props:
 *   label       string
 *   options     Array<{ value: string; label: string }> | string[]
 *   placeholder string — shown as first disabled option
 *   helper      string
 *   error       string | undefined
 *   required    boolean
 *   size        "sm" | "md" | "lg"
 *   disabled    boolean
 *   value       string
 *   onChange    (value: string) => void
 *
 * Edge states:
 *   No options: placeholder "No options available" shown, select disabled.
 */

"use client";

import { useId, type ChangeEvent, type CSSProperties } from "react";

type Option = { value: string; label: string } | string;

interface Props {
  label?: string;
  options: Option[];
  placeholder?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

function normalise(opt: Option): { value: string; label: string } {
  return typeof opt === "string" ? { value: opt, label: opt } : opt;
}

export function Select({
  label,
  options,
  placeholder,
  helper,
  error,
  required,
  size = "md",
  disabled,
  value,
  onChange,
  className = "",
  style,
  id: externalId,
}: Props) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const noOptions = options.length === 0;

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    onChange?.(e.target.value);
  }

  return (
    <div
      className={[
        "rm-select",
        error ? "rm-select--error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {label && (
        <label
          htmlFor={id}
          className={["rm-select__label", required ? "rm-select__label--required" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </label>
      )}
      <div className="rm-select__wrapper">
        <select
          id={id}
          className="rm-select__field"
          value={value}
          onChange={handleChange}
          disabled={disabled || noOptions}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            [error ? errorId : null, helper ? helperId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          {(placeholder || noOptions) && (
            <option value="" disabled>
              {noOptions ? "No options available" : placeholder}
            </option>
          )}
          {options.map((opt) => {
            const { value: v, label: l } = normalise(opt);
            return (
              <option key={v} value={v}>
                {l}
              </option>
            );
          })}
        </select>
        <span className="rm-select__chevron" aria-hidden="true">
          ▾
        </span>
      </div>
      {helper && !error && (
        <span id={helperId} className="rm-select__helper">
          {helper}
        </span>
      )}
      {error && (
        <span id={errorId} className="rm-select__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
