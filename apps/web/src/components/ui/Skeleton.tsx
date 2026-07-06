/**
 * Skeleton
 *
 * Shimmer moves left→right, 40% gradient width, 1.4s linear infinite.
 * Gradient highlight at 4% white opacity — barely visible against #151b23.
 *
 * Usage:
 *   <Skeleton width="100%" height={20} />
 *   <Skeleton variant="circle" width={40} height={40} />
 *   <Skeleton variant="text" width="60%" />
 *
 * Props:
 *   variant   "text" | "title" | "rect" | "circle"  (default: "rect")
 *   width     number | string
 *   height    number | string
 *   className string
 *
 * Note: Caller controls visibility — renders unconditionally.
 */

interface Props {
  variant?: "text" | "title" | "rect" | "circle";
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  className = "",
}: Props) {
  return (
    <span
      className={["rm-skeleton", `rm-skeleton--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      style={{
        display: "block",
        width: width ?? "100%",
        height:
          height ??
          (variant === "text"
            ? "1em"
            : variant === "title"
              ? "1.5em"
              : variant === "circle"
                ? width ?? 40
                : 20),
      }}
    />
  );
}

/**
 * SkeletonGroup — vertical stack of skeletons with a gap.
 */
export function SkeletonGroup({
  children,
  gap = 8,
}: {
  children: React.ReactNode;
  gap?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ display: "flex", flexDirection: "column", gap }}
    >
      {children}
    </div>
  );
}
