/**
 * Avatar
 *
 * Usage:
 *   <Avatar src="https://avatars.githubusercontent.com/u/1" name="octocat" />
 *   <Avatar name="John Doe" size="lg" />
 *   <Avatar />  — renders generic silhouette
 *
 * Props:
 *   src      string | undefined — image URL
 *   name     string | undefined — used for initials + alt text
 *   size     "sm" | "md" | "lg"
 *   className string
 *
 * Fallback chain:
 *   1. Image loads successfully → shows image
 *   2. Image fails (broken URL / 404) → shows initials derived from `name`
 *   3. No name → shows generic SVG silhouette
 *
 * CSS note: img inside .rm-avatar overrides globals "img { border-radius; border }"
 * by specificity: ".rm-avatar img" (0,1,1) > "img" (0,0,1).
 */

"use client";

import { useState } from "react";

interface Props {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const SilhouetteIcon = () => (
  <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);

export function Avatar({ src, name, size = "md", className = "" }: Props) {
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;
  const showInitials = !showImage && name;

  return (
    <div
      className={["rm-avatar", `rm-avatar--${size}`, className]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={name ?? "User avatar"}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? "Avatar"}
          onError={() => setImgError(true)}
        />
      ) : showInitials ? (
        <span className="rm-avatar__fallback">{initials(name!)}</span>
      ) : (
        <SilhouetteIcon />
      )}
    </div>
  );
}
