/**
 * Navbar
 *
 * Includes a skip-to-content link targeting #rm-main-content.
 * REQUIREMENT: Pages using Navbar MUST have an element with id="rm-main-content"
 * as the first content element after the nav. This is enforced by convention only.
 *
 * Usage:
 *   <Navbar
 *     brand="RepoMatch"
 *     brandHref="/"
 *     links={[
 *       { label: "Dashboard", href: "/dashboard" },
 *       { label: "Matches", href: "/matches", active: true },
 *     ]}
 *     user={<Avatar src={avatarUrl} name={username} size="sm" />}
 *   />
 *
 *   // In the page body:
 *   <main id="rm-main-content">…</main>
 *
 * Props:
 *   brand      string | ReactNode
 *   brandHref  string  (default: "/")
 *   links      NavLink[]
 *   user       ReactNode — slot for Avatar + username, or auth button
 *   className  string
 *
 * Edge states:
 *   No user slot: renders without user section.
 *   Long username: truncated at 120px (CSS).
 *   Mobile: links hidden at <480px.
 */

import type { ReactNode } from "react";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface Props {
  brand?: string | ReactNode;
  brandHref?: string;
  links?: NavLink[];
  user?: ReactNode;
  className?: string;
}

export function Navbar({
  brand = "RepoMatch",
  brandHref = "/",
  links = [],
  user,
  className = "",
}: Props) {
  return (
    <nav
      className={["rm-navbar", className].filter(Boolean).join(" ")}
      aria-label="Main navigation"
    >
      {/* Skip-to-content — visually hidden until focused, jumps to #rm-main-content */}
      <a href="#rm-main-content" className="rm-skip-link rm-skip-link rm-skip-link">
        Skip to content
      </a>

      <div className="rm-navbar__inner">
        <a href={brandHref} className="rm-navbar__brand" aria-label="RepoMatch home">
          {brand}
        </a>

        {links.length > 0 && (
          <div className="rm-navbar__links">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={[
                  "rm-navbar__link",
                  link.active ? "rm-navbar__link--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={link.active ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {user && <div className="rm-navbar__user">{user}</div>}
      </div>
    </nav>
  );
}
