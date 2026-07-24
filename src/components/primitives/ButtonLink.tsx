import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  /**
   * A react-router path. When provided, renders a client-side <Link to={to}>
   * instead of an <a href>. Prefer this for in-app route navigation so the
   * browser does not do a full reload. Leave it off (and pass href) for
   * external links or in-page #anchor targets.
   */
  to?: string;
  children: ReactNode;
}

/**
 * An anchor styled as a FireFlow button. Use this for a button-looking control
 * that navigates (an href or a router `to`), so it renders as ONE interactive
 * element instead of an anchor wrapping a <button> (which is invalid and breaks
 * keyboard behavior).
 */
export function ButtonLink({ variant = "primary", size = "md", className, children, to, href, ...rest }: ButtonLinkProps) {
  const cls = [styles.btn, styles[variant], styles[size], styles.asLink, className].filter(Boolean).join(" ");
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a className={cls} href={href} {...rest}>
      {children}
    </a>
  );
}
