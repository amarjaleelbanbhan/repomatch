/**
 * Button
 *
 * Usage:
 *   <Button variant="primary" size="md" onClick={…}>Click me</Button>
 *   <Button variant="primary" href="/dashboard">Go to Dashboard</Button>
 *   <Button loading>Saving…</Button>
 *
 * Props:
 *   variant   "primary" | "secondary" | "ghost" | "danger"  (default: "secondary")
 *   size      "sm" | "md" | "lg"                            (default: "md")
 *   loading   boolean — shows spinner, blocks interaction
 *   disabled  boolean
 *   href      string — renders as <a> instead of <button>
 *   type      "button" | "submit" | "reset"                 (default: "button")
 *   className string — appended to root for overrides
 *
 * CSS override note:
 *   globals.css "button, .btn" = specificity (0,1,1).
 *   globals.css "button[type=submit].btn-danger" = (0,2,1).
 *   We use .rm-button.rm-button.rm-button = (0,3,0) to beat all global button rules.
 *   For <a href> rendering: globals "a" = (0,0,1), ".btn" = (0,1,0).
 *   .rm-button.rm-button on <a> = (0,2,0) beats both cleanly.
 */

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface BaseProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    disabled?: boolean;
  };

type Props = ButtonAsButton | ButtonAsAnchor;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  function Button(
    {
      variant = "secondary",
      size = "md",
      loading = false,
      className = "",
      children,
      ...rest
    }: Props,
    ref,
  ) {
    const cls = [
      "rm-button rm-button rm-button",
      `rm-button--${variant}`,
      `rm-button--${size}`,
      loading ? "rm-button--loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if ((rest as ButtonAsAnchor).href !== undefined) {
      const { href, disabled, ...anchorRest } = rest as ButtonAsAnchor;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          className={cls}
          aria-disabled={disabled || loading || undefined}
          {...anchorRest}
        >
          {loading && <span className="rm-button__spinner" aria-hidden="true" />}
          {children}
        </a>
      );
    }

    const { disabled, type = "button", ...btnRest } = rest as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={cls}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...btnRest}
      >
        {loading && <span className="rm-button__spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
