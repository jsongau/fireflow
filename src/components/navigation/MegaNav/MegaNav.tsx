import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useHome } from "@/state/homeStore";
import { imageForVariant } from "@/data/images";
import { NAV_GROUPS, NAV_PRIMARY, activeGroupId, type NavGroupItem } from "@/data/nav";
import { SoundToggle } from "@/components/home/SoundToggle/SoundToggle";
import { useStickyHeightVar } from "@/lib/layout/useStickyHeightVar";
import styles from "./MegaNav.module.css";

/* ------------------------------------------------------------------ */
/* Nav model lives in src/data/nav.ts (the single source of truth).    */
/* NAV_GROUPS composes the top-level groups and resolves every href,   */
/* blurb, mode, and product-preview familyId from the route table, so  */
/* the MegaNav and the footer can never drift from each other.         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* One link renderer for both the desktop panel and mobile drawer.     */
/* A route path (starts with "/") becomes a react-router <Link> so      */
/* BrowserRouter navigates without a full reload; an in-page "#anchor"  */
/* stays a plain <a>, which ScrollAndFocusManager scrolls to.           */
/* ------------------------------------------------------------------ */

interface NavAnchorProps {
  href: string;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  children: ReactNode;
}

function NavAnchor({ href, children, ...rest }: NavAnchorProps) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export function MegaNav() {
  const { dispatch } = useHome();
  const { pathname } = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preview, setPreview] = useState<NavGroupItem | null>(null);

  /* The group that owns the current route. Marked aria-current="page" and given
     a heavier weight plus a gold bottom bar (never color alone). */
  const activeId = activeGroupId(pathname);

  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  /* Publish the bar's real height to --nav-h so the selected-product rail
     sticks exactly beneath it. We measure the bar rather than the whole <nav>
     because the mobile drawer is an in-flow child of <nav> and would otherwise
     report an 80vh "nav height". The +1 covers the nav's bottom border. */
  useStickyHeightVar(barRef, "--nav-h", 1);

  const openGroup = NAV_GROUPS.find((g) => g.id === openId) ?? null;

  const closePanel = useCallback((returnFocusIndex?: number) => {
    setOpenId(null);
    setPreview(null);
    if (returnFocusIndex != null) btnRefs.current[returnFocusIndex]?.focus();
  }, []);

  const toggleGroup = (id: string) => {
    setOpenId((cur) => {
      const next = cur === id ? null : id;
      const group = NAV_GROUPS.find((g) => g.id === next);
      setPreview(next && group ? group.items[0] ?? null : null);
      return next;
    });
  };

  const onFollow = (item: NavGroupItem) => {
    if (item.mode) dispatch({ type: "SET_MODE", mode: item.mode });
    setOpenId(null);
    setPreview(null);
    setDrawerOpen(false);
  };

  /* Roving arrow-key navigation across the group buttons. */
  const onBtnKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        btnRefs.current[(i + 1) % NAV_GROUPS.length]?.focus();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        btnRefs.current[(i - 1 + NAV_GROUPS.length) % NAV_GROUPS.length]?.focus();
        break;
      }
      case "Home":
        e.preventDefault();
        btnRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        btnRefs.current[NAV_GROUPS.length - 1]?.focus();
        break;
      case "Escape":
        if (openId) {
          e.preventDefault();
          closePanel(i);
        }
        break;
    }
  };

  /* Escape anywhere in the open panel returns focus to its group button. */
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && openId) {
      e.preventDefault();
      const idx = NAV_GROUPS.findIndex((g) => g.id === openId);
      closePanel(idx >= 0 ? idx : undefined);
    }
  };

  /* Close the panel on outside click. */
  useEffect(() => {
    if (!openId) return;
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenId(null);
        setPreview(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openId]);

  const previewImage = preview?.familyId ? imageForVariant("", preview.familyId) : null;

  return (
    <nav
      className={styles.nav}
      aria-label="Primary"
      ref={navRef}
      onMouseLeave={() => { setOpenId(null); setPreview(null); }}
    >
      <div className={styles.bar} ref={barRef}>
        <Link to="/" className={styles.brand} onClick={() => closePanel()}>
          <span className={styles.brandMark}>FireFlow</span>
          <span className={styles.brandTag}>Product Intelligence</span>
        </Link>

        {/* Desktop menubar. Opens on hover and on click, closes when the
            pointer leaves the whole menubar+panel area. */}
        <div className={styles.menubar} role="menubar" aria-label="Sections">
          {NAV_GROUPS.map((group, i) => {
            const isOpen = openId === group.id;
            const isActive = activeId === group.id;
            return (
              <button
                key={group.id}
                ref={(el) => { btnRefs.current[i] = el; }}
                type="button"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-current={isActive ? "page" : undefined}
                tabIndex={i === 0 ? 0 : -1}
                className={isOpen ? `${styles.groupBtn} ${styles.groupBtnOn}` : styles.groupBtn}
                /* Active-route cue pairs weight with a 2px gold bottom bar, never
                   color alone. Inline so the shared CSS module is left untouched. */
                style={isActive ? { fontWeight: 800, boxShadow: "inset 0 -2px 0 0 var(--gold)" } : undefined}
                onClick={() => toggleGroup(group.id)}
                onMouseEnter={() => { setOpenId(group.id); setPreview(group.items[0] ?? null); }}
                onKeyDown={(e) => onBtnKeyDown(e, i)}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {/* The one promoted destination. It sits OUTSIDE role="menubar" on
            purpose, so the menubar stays a clean set of group menuitems and
            the pill rides the normal tab order like the brand link. */}
        <Link
          to={NAV_PRIMARY.href}
          className={styles.opsCta}
          aria-current={pathname === NAV_PRIMARY.href ? "page" : undefined}
          onClick={() => closePanel()}
        >
          <span className={styles.opsCtaGlyph} aria-hidden="true">◆</span>
          {/* Two labels, one visible at a time: the full name where the bar has
              room, a short one on small laptops so the pill survives instead of
              overflowing the bar (the media queries in the module pick). */}
          <span className={styles.opsCtaLong}>{NAV_PRIMARY.label}</span>
          <span className={styles.opsCtaShort}>Ops board</span>
        </Link>

        {/* Quiet global control (desktop). Operator Notes are always on, so
            there is no notes toggle to crowd the bar. */}
        <SoundToggle className={styles.navToggle} />

        {/* Mobile disclosure toggle */}
        <button
          type="button"
          className={styles.drawerToggle}
          aria-expanded={drawerOpen}
          aria-controls="meganav-drawer"
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Desktop split panel.

          Left: the link list. Each row carries a `sub` line, so the list is
          readable on its own and a visitor who never moves the pointer still
          learns what each destination is.

          Right: the preview card for whichever row is hovered, focused, or
          first in the group. It answers "why open this" with a kicker, a
          one-line promise, two or three concrete proof points, and a CTA that
          names the action. The proof list is the part that earns the click. */}
      {openGroup && (
        <div className={styles.panel} onKeyDown={onPanelKeyDown}>
          <div className={styles.panelInner}>
            <ul className={styles.catList} aria-label={`${openGroup.label} sections`}>
              {openGroup.items.map((item) => {
                const isPreviewed = preview?.href === item.href && preview?.label === item.label;
                return (
                  <li key={`${openGroup.id}-${item.href}-${item.label}`}>
                    <NavAnchor
                      href={item.href}
                      className={
                        isPreviewed ? `${styles.catLink} ${styles.catLinkActive}` : styles.catLink
                      }
                      onMouseEnter={() => setPreview(item)}
                      onFocus={() => setPreview(item)}
                      onClick={() => onFollow(item)}
                    >
                      <span className={styles.catLabel}>{item.label}</span>
                      {item.sub && <span className={styles.catSub}>{item.sub}</span>}
                    </NavAnchor>
                  </li>
                );
              })}
            </ul>

            <div
              className={
                previewImage ? styles.previewPane : `${styles.previewPane} ${styles.previewPaneNoImg}`
              }
              aria-live="polite"
            >
              {preview ? (
                <>
                  {previewImage && (
                    <img className={styles.previewImg} src={previewImage} alt="" loading="lazy" />
                  )}

                  <div className={styles.previewHead}>
                    {preview.kicker && <p className={styles.previewKicker}>{preview.kicker}</p>}
                    <p className={styles.previewTitle}>{preview.label}</p>
                  </div>

                  <div className={styles.previewBody}>
                    {preview.blurb && <p className={styles.previewBlurb}>{preview.blurb}</p>}

                    {preview.proof && preview.proof.length > 0 && (
                      <ul className={styles.proofList}>
                        {preview.proof.map((line) => (
                          <li key={line} className={styles.proofItem}>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {preview.cta && (
                      <NavAnchor
                        href={preview.href}
                        className={styles.previewCta}
                        onClick={() => onFollow(preview)}
                      >
                        {preview.cta}
                      </NavAnchor>
                    )}
                  </div>
                </>
              ) : (
                <p className={styles.previewEmpty}>Hover a section to preview it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className={styles.drawer} id="meganav-drawer">
          <Link
            to={NAV_PRIMARY.href}
            className={styles.drawerOpsCta}
            onClick={() => { setDrawerOpen(false); }}
          >
            Ops Dashboard · the live case board
          </Link>
          <div className={styles.drawerControls}>
            <SoundToggle />
          </div>
          {NAV_GROUPS.map((group) => (
            <section key={group.id} className={styles.drawerGroup}>
              <p className={styles.drawerLabel}>{group.label}</p>
              <ul className={styles.drawerList}>
                {group.items.map((item) => (
                  <li key={`${group.id}-${item.href}-${item.label}`}>
                    <NavAnchor href={item.href} className={styles.drawerLink} onClick={() => onFollow(item)}>
                      <span className={styles.drawerLinkLabel}>{item.label}</span>
                      {/* The short `sub` line, not the full blurb: a drawer row is a
                          target, and a paragraph inside it costs thumb travel. */}
                      <span className={styles.drawerLinkBlurb}>{item.sub ?? item.blurb}</span>
                    </NavAnchor>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </nav>
  );
}
