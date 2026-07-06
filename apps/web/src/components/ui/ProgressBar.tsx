/**
 * ProgressBar
 *
 * Usage:
 *   <ProgressBar value={72} label="Health score" />
 *   <ProgressBar />  // indeterminate — value prop omitted
 *
 * Props:
 *   value     number | undefined — 0–100; undefined = indeterminate; clamped at both ends
 *   label     string
 *   showValue boolean — display numeric % beside label
 *   size      "sm" | "md" | "lg"
 *   className string
 */

interface Props {
  value?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  size = "md",
  className = "",
}: Props) {
  const isIndeterminate = value === undefined;
  const clamped = isIndeterminate ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div
      className={[
        "rm-progress",
        `rm-progress--${size}`,
        isIndeterminate ? "rm-progress--indeterminate" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(label || showValue) && (
        <div className="rm-progress__label">
          {label && <span>{label}</span>}
          {showValue && !isIndeterminate && <span>{clamped}%</span>}
        </div>
      )}
      <div
        className="rm-progress__track"
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        aria-valuetext={isIndeterminate ? "Loading…" : `${clamped}%`}
      >
        <div
          className="rm-progress__fill"
          style={isIndeterminate ? undefined : { width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
