/**
 * Card
 *
 * Renders as <div> NOT <section> — deliberately avoids the global
 * "section { margin-top: 40px; padding: 24px; bg; border }" rule.
 *
 * Usage:
 *   <Card>
 *     <Card.Header><h3>Title</h3></Card.Header>
 *     <Card.Body>Content here</Card.Body>
 *     <Card.Footer><Button>Action</Button></Card.Footer>
 *   </Card>
 *
 *   // Or flat (no slots):
 *   <Card hoverable>Simple card content</Card>
 *
 * Props:
 *   hoverable boolean — adds hover border glow
 *   className string
 *
 * Note: h2/h3 inside .rm-card__header will inherit global monospace font and
 * cyan color rules. Use .rm-card__title class to override (specificity beats globals).
 */

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
}

function Card({ hoverable = false, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={[
        "rm-card",
        hoverable ? "rm-card--hoverable" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

function Header({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={["rm-card__header", className].filter(Boolean).join(" ")} {...rest}>{children}</div>;
}

function Body({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={["rm-card__body", className].filter(Boolean).join(" ")} {...rest}>{children}</div>;
}

function Footer({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={["rm-card__footer", className].filter(Boolean).join(" ")} {...rest}>{children}</div>;
}

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export { Card };
