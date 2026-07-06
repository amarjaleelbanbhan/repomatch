/**
 * Badge
 *
 * Does NOT use the .chip class — entirely separate hierarchy to avoid collision.
 *
 * Usage:
 *   <Badge>typescript</Badge>
 *   <Badge variant="success">✓ actively welcoming</Badge>
 *   <Badge variant="danger" onRemove={() => …}>react</Badge>
 *
 * Props:
 *   variant   "primary" | "secondary" | "success" | "warning" | "danger" | "info"
 *   size      "sm" | "md" | "lg"
 *   onRemove  () => void — shows × button
 *   className string
 *
 * Edge: long text truncated at 200px with ellipsis (CSS).
 *       Zero children: renders as zero-width span — caller's responsibility.
 */

import type { HTMLAttributes, ReactNode } from "react";

interface Props {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  onRemove?: () => void;
  className?: string;
  children: ReactNode;
}

export function Badge({
  variant = "secondary",
  size = "md",
  onRemove,
  className = "",
  children,
}: Props) {
  return (
    <span
      className={[
        "rm-badge",
        `rm-badge--${variant}`,
        size !== "md" ? `rm-badge--${size}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          className="rm-badge__remove"
          onClick={onRemove}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}

/**
 * BadgeGroup — flex row wrapper for multiple badges.
 */
export function BadgeGroup({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={["rm-badge-group", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
