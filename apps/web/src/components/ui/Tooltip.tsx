/**
 * Tooltip
 *
 * Shows on :hover AND :focus-visible on the trigger child.
 * Flips placement near viewport edges (JS-based).
 * Escape hides the tooltip.
 *
 * Usage:
 *   <Tooltip content="Copy to clipboard" placement="top">
 *     <button>Copy</button>
 *   </Tooltip>
 *
 * Props:
 *   content    string | ReactNode — tooltip content
 *   placement  "top" | "right" | "bottom" | "left"  (default: "top")
 *   className  string
 *   children   ReactNode — trigger element (should be a focusable element)
 *
 * Edge: No content → tooltip not rendered.
 *       Near viewport edge → placement flips.
 */

"use client";

import { useId, useRef, useState, useCallback, type ReactNode } from "react";

type Placement = "top" | "right" | "bottom" | "left";

interface Props {
  content: ReactNode;
  placement?: Placement;
  children: ReactNode;
  className?: string;
}

const FLIP: Record<Placement, Placement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export function Tooltip({
  content,
  placement = "top",
  children,
  className = "",
}: Props) {
  const [visible, setVisible] = useState(false);
  const [actualPlacement, setActualPlacement] = useState<Placement>(placement);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const computePlacement = useCallback(() => {
    if (!tooltipRef.current || !wrapperRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let p = placement;
    if (placement === "top" && rect.top < 0) p = "bottom";
    if (placement === "bottom" && rect.bottom > vh) p = "top";
    if (placement === "left" && rect.left < 0) p = "right";
    if (placement === "right" && rect.right > vw) p = "left";
    setActualPlacement(p);
  }, [placement]);

  if (!content) return <>{children}</>;

  return (
    <span
      ref={wrapperRef}
      className={["rm-tooltip-wrapper", className].filter(Boolean).join(" ")}
      onMouseEnter={() => { setVisible(true); setTimeout(computePlacement, 0); }}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => { setVisible(true); setTimeout(computePlacement, 0); }}
      onBlur={() => setVisible(false)}
      onKeyDown={(e) => { if (e.key === "Escape") setVisible(false); }}
    >
      {/* Clone child to inject aria-describedby */}
      <span aria-describedby={visible ? tooltipId : undefined}>{children}</span>
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className={[
          "rm-tooltip",
          `rm-tooltip--${actualPlacement}`,
          visible ? "rm-tooltip--visible" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {content}
      </span>
    </span>
  );
}
