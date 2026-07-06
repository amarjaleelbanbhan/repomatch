/**
 * Spinner
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" />
 *
 * Props:
 *   size      "sm" | "md" | "lg"
 *   label     string — screen reader label (default: "Loading")
 *   className string
 */

interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label = "Loading", className = "" }: Props) {
  return (
    <span
      role="status"
      aria-label={label}
      className={["rm-spinner", `rm-spinner--${size}`, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
