import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

/**
 * An anchor styled as a FireFlow button. Use this for a button-looking control
 * that navigates (an href), so it renders as ONE interactive element instead of
 * an anchor wrapping a <button> (which is invalid and breaks keyboard behavior).
 */
export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: ButtonLinkProps) {
  const cls = [styles.btn, styles[variant], styles[size], styles.asLink, className].filter(Boolean).join(" ");
  return (
    <a className={cls} {...rest}>
      {children}
    </a>
  );
}
