import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useHome } from "@/state/homeStore";
import { imageForVariant } from "@/data/images";
import type { UserMode } from "@/types/domain";
import { OperatorNotesToggle } from "@/components/employer/OperatorNotesToggle/OperatorNotesToggle";
import { SoundToggle } from "@/components/home/SoundToggle/SoundToggle";
import styles from "./MegaNav.module.css";

/* ------------------------------------------------------------------ */
/* Nav model — every href resolves to a real in-page anchor.           */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  blurb: string;
  /** Optional mode to set when the link is followed. */
  mode?: UserMode;
  /** Optional family id to preview a real product photo (Explore group). */
  familyId?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "explore",
    label: "Explore",
    items: [
      {
        label: "Portfolio Pulse",
        href: "#portfolio",
        blurb: "Browse 45 families across 76 formats. Flavors, not repetition.",
        familyId: "buldak-carbonara",
      },
      {
        label: "Rankings Lab",
        href: "#rankings",
        blurb: "Multi-axis rankings you can re-weight. Editorial, never official.",
        familyId: "buldak-original",
      },
      {
        label: "Comparison Lab",
        href: "#compare",
        blurb: "Put formats side by side on the facts that actually differ.",
        familyId: "buldak-2x-spicy",
      },
      {
        label: "Product Dossier",
        href: "#product",
        blurb: "One product, fully sourced. Allergens bound to the exact format.",
        familyId: "buldak-habanero-lime",
      },
    ],
  },
  {
    id: "consumer",
    label: "Consumer Care",
    items: [
      {
        label: "Start a consumer case",
        href: "#resolve",
        blurb: "Missing packet, damaged bottle, a heat question. Routed with the evidence it needs.",
        mode: "consumer",
      },
      {
        label: "Resolution walkthrough",
        href: "#simulate",
        blurb: "Watch a synthetic case move from reported to resolved, stage by stage.",
      },
    ],
  },
  {
    id: "vendor",
    label: "Vendor Support",
    items: [
      {
        label: "Start a vendor case",
        href: "#resolve",
        blurb: "PO issues, deductions, lead times. Structured for the retail relationship.",
        mode: "vendor",
      },
      {
        label: "Resolution walkthrough",
        href: "#simulate",
        blurb: "See how a vendor deduction becomes a corrective action.",
      },
    ],
  },
  {
    id: "intel",
    label: "CX Intelligence",
    items: [
      {
        label: "SAP SD / Order-to-Cash",
        href: "#o2c",
        blurb: "Follow one synthetic order from PO to cash, with the failure points CX owns at each step.",
      },
      {
        label: "Command Center",
        href: "#command",
        blurb: "A manager's synthetic queue: SLA exposure, overdue updates, open deductions.",
      },
      {
        label: "Product Signals",
        href: "#signals",
        blurb: "How repeated cases become root-cause reviews and measured fixes.",
      },
    ],
  },
  {
    id: "about",
    label: "About",
    items: [
      {
        label: "What this demonstrates",
        href: "#fit",
        blurb: "Each target capability tied to a working part of FireFlow.",
      },
      {
        label: "Why I built FireFlow",
        href: "#why",
        blurb: "The thinking a résumé can't show, in Nathan's words.",
      },
      {
        label: "Brand Universe",
        href: "#brands",
        blurb: "Four brands, four positions, from Buldak's breadth to MEP's soup focus.",
      },
      {
        label: "Methodology",
        href: "#methodology",
        blurb: "What's official, editorial, or synthetic, and what we leave unknown.",
      },
      {
        label: "FAQ",
        href: "#faq",
        blurb: "Straight answers about what FireFlow is, and what it isn't.",
      },
    ],
  },
];

export function MegaNav() {
  const { dispatch } = useHome();
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preview, setPreview] = useState<NavItem | null>(null);

  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement | null>(null);

  const openGroup = GROUPS.find((g) => g.id === openId) ?? null;

  const closePanel = useCallback((returnFocusIndex?: number) => {
    setOpenId(null);
    setPreview(null);
    if (returnFocusIndex != null) btnRefs.current[returnFocusIndex]?.focus();
  }, []);

  const toggleGroup = (id: string) => {
    setOpenId((cur) => {
      const next = cur === id ? null : id;
      const group = GROUPS.find((g) => g.id === next);
      setPreview(next && group ? group.items[0] ?? null : null);
      return next;
    });
  };

  const onFollow = (item: NavItem) => {
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
        btnRefs.current[(i + 1) % GROUPS.length]?.focus();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        btnRefs.current[(i - 1 + GROUPS.length) % GROUPS.length]?.focus();
        break;
      }
      case "Home":
        e.preventDefault();
        btnRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        btnRefs.current[GROUPS.length - 1]?.focus();
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
      const idx = GROUPS.findIndex((g) => g.id === openId);
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
      <div className={styles.bar}>
        <a href="#hero" className={styles.brand} onClick={() => closePanel()}>
          <span className={styles.brandMark}>FireFlow</span>
          <span className={styles.brandTag}>Product Intelligence</span>
        </a>

        {/* Desktop menubar. Opens on hover and on click, closes when the
            pointer leaves the whole menubar+panel area. */}
        <div className={styles.menubar} role="menubar" aria-label="Sections">
          {GROUPS.map((group, i) => {
            const isOpen = openId === group.id;
            return (
              <button
                key={group.id}
                ref={(el) => { btnRefs.current[i] = el; }}
                type="button"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={isOpen}
                tabIndex={i === 0 ? 0 : -1}
                className={isOpen ? `${styles.groupBtn} ${styles.groupBtnOn}` : styles.groupBtn}
                onClick={() => toggleGroup(group.id)}
                onMouseEnter={() => { setOpenId(group.id); setPreview(group.items[0] ?? null); }}
                onKeyDown={(e) => onBtnKeyDown(e, i)}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {/* Quiet global controls (desktop). */}
        <OperatorNotesToggle className={styles.navToggle} />
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

      {/* Desktop split panel */}
      {openGroup && (
        <div className={styles.panel} onKeyDown={onPanelKeyDown}>
          <div className={styles.panelInner}>
            <ul className={styles.catList} aria-label={`${openGroup.label} sections`}>
              {openGroup.items.map((item) => (
                <li key={`${openGroup.id}-${item.href}-${item.label}`}>
                  <a
                    href={item.href}
                    className={styles.catLink}
                    onMouseEnter={() => setPreview(item)}
                    onFocus={() => setPreview(item)}
                    onClick={() => onFollow(item)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className={styles.previewPane} aria-live="polite">
              {preview ? (
                <>
                  {previewImage && (
                    <img className={styles.previewImg} src={previewImage} alt="" loading="lazy" />
                  )}
                  <p className={styles.previewTitle}>{preview.label}</p>
                  <p className={styles.previewBlurb}>{preview.blurb}</p>
                </>
              ) : (
                <p className={styles.previewBlurb}>Hover a section to preview it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className={styles.drawer} id="meganav-drawer">
          <div className={styles.drawerControls}>
            <OperatorNotesToggle />
            <SoundToggle />
          </div>
          {GROUPS.map((group) => (
            <section key={group.id} className={styles.drawerGroup}>
              <p className={styles.drawerLabel}>{group.label}</p>
              <ul className={styles.drawerList}>
                {group.items.map((item) => (
                  <li key={`${group.id}-${item.href}-${item.label}`}>
                    <a href={item.href} className={styles.drawerLink} onClick={() => onFollow(item)}>
                      <span className={styles.drawerLinkLabel}>{item.label}</span>
                      <span className={styles.drawerLinkBlurb}>{item.blurb}</span>
                    </a>
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
