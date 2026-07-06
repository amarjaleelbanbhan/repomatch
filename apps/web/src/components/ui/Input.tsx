/**
 * Input
 *
 * Usage:
 *   <Input label="Email" type="email" placeholder="you@example.com" />
 *   <Input label="Username" error="Already taken" value={val} onChange={…} />
 *
 * Props:
 *   label       string
 *   helper      string — help text below field
 *   error       string | undefined — truthy = error state + message
 *   required    boolean — adds visual asterisk
 *   size        "sm" | "md" | "lg"
 *   disabled    boolean
 *   className   string — appended to root wrapper
 *
 * CSS override:
 *   globals.css "input[type=text]" = (0,1,1)
 *   .rm-input__field.rm-input__field = (0,2,0) — beats it.
 *   globals.css "label" = (0,1,0)
 *   widgets.css loads after globals so .rm-input__label (0,1,0) wins by cascade order.
 */

"use client";

import { useId, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helper?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Input({
  label,
  helper,
  error,
  size = "md",
  required,
  className = "",
  disabled,
  id: externalId,
  ...rest
}: Props) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  return (
    <div
      className={[
        "rm-input",
        error ? "rm-input--error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label
          htmlFor={id}
          className={[
            "rm-input__label",
            required ? "rm-input__label--required" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className="rm-input__field rm-input__field"
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          [error ? errorId : null, helper ? helperId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        {...rest}
      />
      {helper && !error && (
        <span id={helperId} className="rm-input__helper">
          {helper}
        </span>
      )}
      {error && (
        <span id={errorId} className="rm-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
