/**
 * Navigation source of truth.
 *
 * Every navigation layer reads routes and sections from here:
 *   - the per-page SubNav and MiniNav progress rail (via `sectionsForRoute`),
 *   - the Breadcrumb trail (via `routeFor`),
 *   - the MegaNav dropdown panels + mobile drawer (via `NAV_GROUPS`, plus
 *     the promoted `NAV_PRIMARY` link),
 *   - the SiteFooter columns (via `FOOTER_COLUMNS`).
 *
 * Before this module drove the last two, MegaNav.GROUPS and the footer each
 * carried their own hand-maintained href lists and had already drifted apart.
 * They now compose from the single route/section table below, so a link target
 * can never diverge from the route that owns it.
 *
 * `sections` are the in-page anchor targets for a route, in document order. The
 * `id` must match the DOM `id` of the section on that page; the `label` is the
 * short, plain destination name shown in the SubNav and MiniNav. `/ops` is a
 * single-purpose route with no in-page sections, so it carries an empty array
 * and the SubNav renders nothing for it.
 *
 * The optional per-section metadata (`blurb`, `mode`, `familyId`) and the
 * per-route `landing` copy exist for the richer surfaces (MegaNav previews and
 * mode-aware links). SubNav / MiniNav / Breadcrumb ignore them, so the existing
 * exports keep their exact shape and behavior.
 *
 * It is intentionally dependency-free except for the shared `UserMode` type, so
 * any layer can import it without pulling in React or component state.
 */

import type { UserMode } from "@/types/domain";

/**
 * Everything a rich navigation surface needs to sell one destination.
 *
 * The MegaNav dropdown used to show a title and a single blurb, which told a
 * visitor what a section was called but never why to open it. The four fields
 * below split that job:
 *
 *   kicker — what kind of thing this is, in two or three words.
 *   sub    — a short line under the label in the link list, so the LIST is
 *            scannable on its own without hovering anything.
 *   blurb  — the one-line promise, shown large in the preview pane.
 *   proof  — two or three concrete specifics a visitor can verify on arrival.
 *            This is the field that earns the click: it names what is on the
 *            screen, and it carries the synthetic-data disclosure where one is owed.
 *   cta    — the named action, matching what happens next (see 05-CTA-AND-UX-COPY).
 *
 * All five are optional so SubNav, MiniNav, Breadcrumb, and the footer keep
 * ignoring them and keep their exact shape.
 */
export interface NavDetail {
  /** One-line destination promise, shown large in the MegaNav preview pane. */
  blurb?: string;
  /** Two-to-three word category eyebrow above the preview title. */
  kicker?: string;
  /** Short line under the label in the dropdown link list. */
  sub?: string;
  /** Concrete specifics the visitor will find there. Two or three, never more. */
  proof?: string[];
  /** The named action for the preview-pane link. Names the verb and the destination. */
  cta?: string;
  /** Account lane to switch into when this destination is followed. */
  mode?: UserMode;
  /** Product family id used to preview a real photo in the MegaNav panel. */
  familyId?: string;
}

export interface NavSection extends NavDetail {
  id: string;
  label: string;
}

/** Copy for a link that lands on the route itself, with no in-page anchor. */
export type NavLanding = NavDetail;

export interface NavRoute {
  path: string;
  label: string;
  sections: NavSection[];
  /** Metadata for a bare-path link to this route (used by MegaNav / footer). */
  landing?: NavLanding;
}

export const ROUTES: NavRoute[] = [
  {
    path: "/",
    label: "Home",
    landing: {
      blurb: "Every U.S. format on one board, filtered the way a category buyer reads a shelf.",
      kicker: "The catalog",
      sub: "45 families, 76 formats",
      proof: [
        "Filter by brand, pack type, and heat, and the filters stack",
        "Every card carries its SKU code, case pack, and pallet quantity",
        "The full public U.S. lineup in one place",
      ],
      cta: "Open the portfolio",
      familyId: "buldak-carbonara",
    },
    sections: [
      { id: "hero", label: "Overview" },
      { id: "portfolio", label: "Portfolio" },
      {
        id: "compare",
        label: "Comparison",
        kicker: "Head to head",
        sub: "Two products, differences flagged",
        blurb: "Two formats side by side on the facts that actually differ.",
        proof: [
          "Case pack, minimum, lead time, and allergens aligned row by row",
          "Differences are called out for you, not left to be spotted",
          "Two products at a time, so the read stays honest",
        ],
        cta: "Compare two products",
        familyId: "buldak-2x-spicy",
      },
      { id: "order", label: "Order" },
      {
        id: "ops-teaser",
        label: "Case board",
        kicker: "One case, end to end",
        sub: "A short shipment, worked in public",
        blurb: "One short shipment, and the full lifecycle that works it before the ad runs.",
        proof: [
          "Every stage names its owner and the update the customer is owed",
          "Shows where the resolve clock starts and where it stops",
          "One short shipment, worked from the report to the fix",
        ],
        cta: "Open the case board",
      },
      { id: "studies", label: "Studies" },
    ],
  },
  {
    path: "/products",
    label: "Products",
    sections: [
      {
        id: "rankings",
        label: "Rankings",
        kicker: "Editorial rankings",
        sub: "Eight views, weights you control",
        blurb: "Eight ranking views you can re-weight, with the weighting shown on screen.",
        proof: [
          "Move the weight on heat, breadth, or retail presence and watch the order change",
          "Each view states the evidence behind it and the limit of that evidence",
          "An editorial read, weighted in the open, never an official list",
        ],
        cta: "Open the rankings lab",
        familyId: "buldak-original",
      },
      {
        id: "product",
        label: "Dossier",
        kicker: "One product, in full",
        sub: "Sourced facts, allergens by format",
        blurb: "One product, fully sourced, down to the format that carries the allergen.",
        proof: [
          "Allergens bound to the exact format, not smeared across the family",
          "Every claim shows whether it is official, retail, or editorial",
          "The order actions sit on the same page as the facts",
        ],
        cta: "Open a product dossier",
        familyId: "buldak-habanero-lime",
      },
      {
        id: "brands",
        label: "Brands",
        kicker: "Four brands",
        sub: "Four brands, four shelf positions",
        blurb: "Four brands holding four different positions on the same shelf.",
        proof: [
          "Buldak's breadth read against MEP's soup focus",
          "Where the brands overlap, and where they deliberately do not",
          "Positioning read from the public U.S. lineup",
        ],
        cta: "Open the brand universe",
      },
    ],
  },
  {
    path: "/order",
    label: "Order",
    landing: {
      kicker: "Case ordering",
      sub: "Volume pricing, shown as you build",
      blurb: "Case packs, minimums, volume breaks, and lead times on the card, not buried at checkout.",
      proof: [
        "Pricing follows your account lane, retailer or distributor",
        "Minimum per line and pallet quantity are visible before you add a case",
        "Volume breaks and lead times on the card, not buried at checkout",
      ],
      cta: "Build a bulk order",
      mode: "retailer",
    },
    sections: [
      {
        id: "quote",
        label: "Quote",
        kicker: "Quote desk",
        sub: "Terms in, turnaround committed",
        blurb: "Send volume, ship-to, and terms to account service, and see the turnaround you are promised.",
        proof: [
          "The form asks for what a rep would otherwise chase over three emails",
          "The turnaround commitment is stated before you send, not after",
          "Terms, ship-to, and volume in one pass, nothing chased later",
        ],
        cta: "Request a quote",
        mode: "retailer",
      },
      {
        id: "standing-order",
        label: "Standing order",
        kicker: "Replenishment",
        sub: "Monthly cadence, fill-rate promise",
        blurb: "Recurring monthly replenishment with the PO written for you and a fill rate attached to it.",
        proof: [
          "Auto-generated PO number and a cadence you set once",
          "The fill-rate target is stated up front, so a miss is visible",
          "Change or cancel before each release",
        ],
        cta: "Set a standing order",
        mode: "retailer",
      },
    ],
  },
  {
    path: "/support",
    label: "Support",
    landing: {
      kicker: "Case intake",
      sub: "Routed with its evidence attached",
      blurb: "PO issues, short shipments, deductions, EDI, and invoices, routed with the evidence they need.",
      proof: [
        "Intake collects the evidence the owner will ask for, before routing",
        "Routing names the owner and the resolve target on the confirmation",
        "Six case types, each carrying its own procedure",
      ],
      cta: "Open an account case",
      mode: "retailer",
    },
    sections: [
      { id: "resolve", label: "Resolution" },
      {
        id: "simulate",
        label: "Walkthrough",
        kicker: "Lifecycle",
        sub: "Reported to resolved, stage by stage",
        blurb: "Watch one account case move from reported to resolved, stage by stage.",
        proof: [
          "Each stage names the owner and the customer update owed at that moment",
          "Shows where the resolve clock starts, pauses, and stops",
          "Reported to resolved, one stage at a time",
        ],
        cta: "Walk a case through",
      },
    ],
  },
  {
    path: "/intelligence",
    label: "Order-to-Cash",
    sections: [
      {
        id: "o2c",
        label: "Order-to-Cash",
        kicker: "Process study",
        sub: "PO to cash, with the failure points",
        blurb: "One order from PO to cash, with the failure point CX owns at every step.",
        proof: [
          "Score an order on four visible factors, with the arithmetic shown",
          "Exceptions mapped to the SD objects they actually touch",
          "Built around SAP SD as a process, not a system I configured",
        ],
        cta: "Work the order queue",
      },
      {
        id: "customer-master",
        label: "Customer Master",
        kicker: "Master data",
        sub: "The record behind a clean order",
        blurb: "What has to be right in the customer record before an order can ever be clean.",
        proof: [
          "Partner functions, sales area, and material master for one account",
          "Condition records, EDI setup, and deduction history in one view",
          "The record that has to be right before an order can be clean",
        ],
        cta: "Open the customer record",
      },
      {
        id: "integration",
        label: "Integration Map",
        kicker: "Integration patterns",
        sub: "One PO across five systems",
        blurb: "How one purchase order is assembled across ERP, CRM, EDI, and the web, and where it stalls.",
        proof: [
          "Each flow names its object, its pattern, its cadence, and the failure mode",
          "Which system is the source of truth for each data domain, stated plainly",
          "Built around real EDI and SAP SD patterns, mapped end to end",
        ],
        cta: "Trace the integration map",
      },
      {
        id: "data-model",
        label: "Dimensional Model",
        kicker: "Data modeling",
        sub: "Facts, dimensions, and the grain",
        blurb: "The star schema the catalog, orders, cases, and deductions actually share, grain first.",
        proof: [
          "Fact tables at the grain of one event, with conformed product, account, and date",
          "Every table maps to the FireFlow data it was modeled from",
          "A star schema for the catalog, orders, cases, and deductions",
        ],
        cta: "Open the dimensional model",
      },
      {
        id: "command",
        label: "Command Center",
        kicker: "Manager's queue",
        sub: "What breaches next, and who owns it",
        blurb: "SLA exposure, overdue updates, and open deductions, in the order a manager triages them.",
        proof: [
          "What breaches next, with the hours left and the name against it",
          "Overdue customer updates surface before the customer asks",
          "The queue in the order a manager triages it",
        ],
        cta: "Open the command center",
      },
      {
        id: "warroom",
        label: "War Room",
        kicker: "Ownership model",
        sub: "A named lead for every scenario",
        blurb: "Who leads, who supports, and in what order, across Sales, Supply Chain, Logistics, and Finance.",
        proof: [
          "Each scenario has one named lead, never a committee",
          "The handoff sequence is written down before the incident, not during",
          "States plainly where CX holds the pen and where it does not",
        ],
        cta: "See the ownership map",
      },
      {
        id: "signals",
        label: "Product Signals",
        kicker: "Root cause",
        sub: "Repeat cases become measured fixes",
        blurb: "How repeated cases turn into a root-cause review and a fix somebody has to prove.",
        proof: [
          "The threshold that promotes a pattern into a formal review",
          "Every fix carries an owner and the metric that closes it out",
          "Repeat cases, promoted into a root-cause review",
        ],
        cta: "Trace a signal",
      },
    ],
  },
  {
    path: "/leadership",
    label: "Leadership",
    sections: [
      {
        id: "results",
        label: "Track record",
        kicker: "What I have moved",
        sub: "Results, with their limits stated",
        blurb: "Results from prior roles, attributed plainly, with what cannot be claimed stated on the page.",
        proof: [
          "Each result names the role, the lever I pulled, and the limit of the claim",
          "Separates what I owned from what I only contributed to",
          "No borrowed metrics and no numbers I cannot source",
        ],
        cta: "Read the track record",
      },
      {
        id: "standards",
        label: "Standards",
        kicker: "How the floor runs",
        sub: "SLAs, escalation, approval limits",
        blurb: "The SLA matrix, escalation ladder, approval authority, and deduction dispute procedure.",
        proof: [
          "Response and resolve targets by case type and priority",
          "Who can approve what, at which dollar line, without asking",
          "When an escalation is owed before the customer thinks to ask",
        ],
        cta: "Open the standards",
      },
      {
        id: "sop-register",
        label: "Procedures",
        kicker: "The SOP register",
        sub: "Every procedure the intake routes",
        blurb:
          "Every procedure the intake actually routes, with its owner, its metric, and its resolve target.",
        proof: [
          "One row per procedure, so nothing routes to an empty owner",
          "Each SOP carries the metric that says whether it is working",
          "The register the escalation ladder reads from",
        ],
        cta: "Open the SOP register",
      },
      {
        id: "team",
        label: "Team",
        kicker: "Running the function",
        sub: "Roster, workload, QA rubric",
        blurb: "The roster, the workload balance, the approval limits, and the rubric I would coach against.",
        proof: [
          "Workload balanced by case weight, not by case count",
          "A QA rubric a rep can score themselves against before I do",
          "How I would staff and balance the function",
        ],
        cta: "See the team model",
      },
      {
        id: "plan",
        label: "First 90 days",
        kicker: "The plan",
        sub: "Assess, standardize, then improve",
        blurb: "Assess the queue, stand up the standards, then start the improvement loop.",
        proof: [
          "Days 1 to 30: read the queue before changing anything in it",
          "Days 31 to 60: publish the standards and the escalation ladder",
          "Days 61 to 90: run the first root-cause cycle end to end",
        ],
        cta: "Read the 90-day plan",
      },
    ],
  },
  {
    path: "/about",
    label: "About",
    sections: [
      {
        id: "fit",
        label: "What this shows",
        kicker: "Role fit",
        sub: "Each requirement, mapped to a screen",
        blurb: "Every capability the job asks for, tied to a working part of this site.",
        proof: [
          "The requirement, then the feature that answers it, side by side",
          "Each row links straight to the working screen, not to a description of it",
          "Where the evidence is thin, the page says so",
        ],
        cta: "See the role map",
      },
      {
        id: "why",
        label: "Why FireFlow",
        kicker: "In Nathan's words",
        sub: "The thinking a résumé can't show",
        blurb: "The thinking a résumé cannot show, written plainly.",
        proof: [
          "Why a working portfolio instead of a longer cover letter",
          "What I chose not to build, and the reason I stopped",
          "The tradeoffs I would defend out loud in an interview",
        ],
        cta: "Read why I built it",
      },
      { id: "colors", label: "Five Colors" },
      {
        id: "methodology",
        label: "Methodology",
        kicker: "How we know",
        sub: "Official, editorial, modeled, unknown",
        blurb: "What is official, what is editorial, what is modeled, and what stays unknown.",
        proof: [
          "Every fact on the site carries its source type",
          "Unknowns are printed as unknown rather than guessed",
          "Modeled data is labeled everywhere it appears",
        ],
        cta: "Read the methodology",
      },
      {
        id: "faq",
        label: "FAQ",
        kicker: "Straight answers",
        sub: "What it is, and what it isn't",
        blurb: "What FireFlow is, what it is not, and who built it.",
        proof: [
          "Independent work. Not affiliated with or endorsed by Samyang Foods.",
          "What FireFlow is, and what it is not",
          "Who to contact, and what to contact them about",
        ],
        cta: "Read the FAQ",
      },
    ],
  },
  {
    path: "/accounts/99-ranch-market",
    label: "Account",
    landing: {
      kicker: "Account dossier",
      sub: "One retailer, fully worked",
      blurb:
        "A retail account operations dossier: purchase orders, cases, routing, procedures, and risk.",
      proof: [
        "Open POs and open cases read against the same account",
        "The procedures this account's cases route into",
        "One retail account, worked end to end",
      ],
      cta: "Open the account dossier",
    },
    sections: [],
  },
  {
    path: "/ops",
    label: "Ops",
    landing: {
      kicker: "Manager's board",
      sub: "Drag, filter, see what is aging",
      blurb:
        "The case board a CX manager actually works, with the aging visible before the customer calls.",
      proof: [
        "Drag cases across the lifecycle, or move them by keyboard alone",
        "Filter by priority, owner, and account to find what is slipping",
        "The board a CX manager works, with aging visible",
      ],
      cta: "Open the ops board",
    },
    sections: [],
  },
];

/** The full route record for a pathname, or undefined if it is not a known route. */
export function routeFor(pathname: string): NavRoute | undefined {
  return ROUTES.find((r) => r.path === pathname);
}

/** The in-page sections for a pathname, in document order. Empty for unknown routes. */
export function sectionsForRoute(pathname: string): NavSection[] {
  return routeFor(pathname)?.sections ?? [];
}

/**
 * The href for an in-page section link.
 *
 * The rule is read directly from the existing MegaNav / footer hrefs: a section
 * link is `path#sectionId`, and Home's path is `/`, so a Home section reads
 * `/#compare` while a Products section reads `/products#rankings`. A link that
 * lands on the route with no anchor (Build a bulk order, Open an account case,
 * Ops Dashboard) uses the bare `route.path` instead of calling this helper.
 */
export function hrefForSection(route: NavRoute, section: NavSection): string {
  return `${route.path}#${section.id}`;
}

/* ------------------------------------------------------------------ */
/* Composed navigation: MegaNav groups and footer columns.            */
/*                                                                    */
/* The MegaNav top-level groups do NOT map one-to-one to routes:      */
/* Account Support spans /support sections plus the 99 Ranch          */
/* account landing, one group across two routes. So the               */
/* honest model is option (a): a NAV_GROUPS structure that references */
/* routes and sections by id and derives every href, rather than a    */
/* `group` field on NavRoute (which cannot express a group that spans */
/* several routes, nor a section rehomed under another group).        */
/*                                                                    */
/* 2026-07-23: the Ops board (/ops) was promoted out of the Account   */
/* Support dropdown to the NAV_PRIMARY top-level link below, the one  */
/* destination the whole site funnels into. The About and             */
/* Order-to-Cash dropdowns were trimmed the same day; Methodology     */
/* and the FAQ stay reachable from the footer, which carries the      */
/* not-affiliated disclosure.                                         */
/*                                                                    */
/* Each reference carries only its display label, because the same    */
/* destination is labeled differently per surface (for example        */
/* "Build a bulk order" in the MegaNav vs "Bulk order builder" in the */
/* footer). The href, blurb, mode, and familyId are all resolved from */
/* the single route/section table above, so they cannot drift.        */
/* ------------------------------------------------------------------ */

/** A reference into the route/section table. Omit `section` for a route landing. */
interface NavRef {
  label: string;
  route: string;
  section?: string;
}

/** A fully resolved navigation link, ready for a consumer to render. */
export interface NavGroupItem extends NavDetail {
  label: string;
  href: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavGroupItem[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/** Copy the preview payload off a section or landing, minus its id and label. */
function detailOf(source: NavDetail | undefined): NavDetail {
  if (!source) return {};
  const { blurb, kicker, sub, proof, cta, mode, familyId } = source;
  return { blurb, kicker, sub, proof, cta, mode, familyId };
}

function resolveRef(ref: NavRef): NavGroupItem {
  const route = routeFor(ref.route);
  if (!route) {
    throw new Error(`nav.ts: unknown route "${ref.route}" for "${ref.label}"`);
  }
  if (ref.section != null) {
    const section = route.sections.find((s) => s.id === ref.section);
    if (!section) {
      throw new Error(`nav.ts: unknown section "${ref.section}" on "${ref.route}"`);
    }
    return {
      label: ref.label,
      href: hrefForSection(route, section),
      ...detailOf(section),
    };
  }
  return {
    label: ref.label,
    href: route.path,
    ...detailOf(route.landing),
  };
}

/** The one destination the whole site funnels into. Rendered by MegaNav as a
    highlighted top-level link, not a dropdown group. */
export const NAV_PRIMARY: NavGroupItem = resolveRef({ label: "Ops Dashboard", route: "/ops" });

/** Raw MegaNav composition, resolved into `NAV_GROUPS` below. */
const NAV_GROUP_REFS: { id: string; label: string; items: NavRef[] }[] = [
  {
    id: "explore",
    label: "Explore",
    items: [
      { label: "Portfolio Pulse", route: "/" },
      { label: "Rankings Lab", route: "/products", section: "rankings" },
      { label: "Comparison Lab", route: "/", section: "compare" },
      { label: "Product Dossier", route: "/products", section: "product" },
    ],
  },
  {
    id: "order",
    label: "Order & Buy",
    items: [
      { label: "Build a bulk order", route: "/order" },
      { label: "Request a quote", route: "/order", section: "quote" },
      { label: "Set a standing order", route: "/order", section: "standing-order" },
    ],
  },
  {
    id: "account",
    label: "Account Support",
    items: [
      { label: "Open an account case", route: "/support" },
      { label: "Resolution walkthrough", route: "/support", section: "simulate" },
      { label: "99 Ranch account dossier", route: "/accounts/99-ranch-market" },
    ],
  },
  {
    id: "intel",
    label: "Order-to-Cash",
    items: [
      { label: "SAP SD / Order-to-Cash", route: "/intelligence", section: "o2c" },
      { label: "Customer Master study", route: "/intelligence", section: "customer-master" },
      { label: "Command Center", route: "/intelligence", section: "command" },
      { label: "Cross-Functional War Room", route: "/intelligence", section: "warroom" },
      { label: "Product Signals", route: "/intelligence", section: "signals" },
    ],
  },
  {
    id: "leadership",
    label: "Leadership",
    items: [
      { label: "Track record", route: "/leadership", section: "results" },
      { label: "Standards and escalation", route: "/leadership", section: "standards" },
      /* The SOP register was reachable only from the in-page SubNav. It is the
         thing the escalation ladder actually routes into, so it earns a door. */
      { label: "SOP register", route: "/leadership", section: "sop-register" },
      { label: "Team and coaching", route: "/leadership", section: "team" },
      { label: "First 90 days", route: "/leadership", section: "plan" },
    ],
  },
  {
    id: "about",
    label: "About",
    items: [
      { label: "What this demonstrates", route: "/about", section: "fit" },
      { label: "Why I built FireFlow", route: "/about", section: "why" },
    ],
  },
];

/** The MegaNav top-level groups and their resolved dropdown links. */
export const NAV_GROUPS: NavGroup[] = NAV_GROUP_REFS.map((g) => ({
  id: g.id,
  label: g.label,
  items: g.items.map(resolveRef),
}));

/** Raw footer composition, resolved into `FOOTER_COLUMNS` below. */
const FOOTER_COLUMN_REFS: { title: string; links: NavRef[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Portfolio Pulse", route: "/" },
      { label: "Rankings Lab", route: "/products", section: "rankings" },
      { label: "Comparison Lab", route: "/", section: "compare" },
      { label: "Product Dossier", route: "/products", section: "product" },
    ],
  },
  {
    title: "Order & Buy",
    links: [
      { label: "Bulk order builder", route: "/order" },
      { label: "Request a quote", route: "/order", section: "quote" },
      { label: "Standing order", route: "/order", section: "standing-order" },
    ],
  },
  {
    title: "Account Support",
    links: [
      { label: "Ops Dashboard", route: "/ops" },
      { label: "Open an account case", route: "/support" },
      { label: "Resolution Simulator", route: "/support", section: "simulate" },
      { label: "SAP SD / Order-to-Cash", route: "/intelligence", section: "o2c" },
      { label: "Customer Master study", route: "/intelligence", section: "customer-master" },
    ],
  },
  {
    title: "Order-to-Cash",
    links: [
      { label: "Integration architecture", route: "/intelligence", section: "integration" },
      { label: "Dimensional data model", route: "/intelligence", section: "data-model" },
      { label: "Command Center", route: "/intelligence", section: "command" },
      { label: "Cross-Functional War Room", route: "/intelligence", section: "warroom" },
      { label: "Product Signals", route: "/intelligence", section: "signals" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "What this demonstrates", route: "/about", section: "fit" },
      { label: "Why I built FireFlow", route: "/about", section: "why" },
      { label: "Brand Universe", route: "/products", section: "brands" },
      { label: "Methodology", route: "/about", section: "methodology" },
      { label: "FAQ", route: "/about", section: "faq" },
    ],
  },
];

/** The SiteFooter columns and their resolved links. */
export const FOOTER_COLUMNS: FooterColumn[] = FOOTER_COLUMN_REFS.map((c) => ({
  title: c.title,
  links: c.links.map(resolveRef).map(({ label, href }) => ({ label, href })),
}));

/**
 * The MegaNav top-level group that owns the given route, or null.
 *
 * Groups span multiple routes and a route could appear in more than one group
 * (none does since the 2026-07-23 trim took the Products "Brands" section out
 * of About), so ownership is defined as the FIRST group in document order that
 * links to the route. This yields exactly one active group per route, which
 * the MegaNav marks with `aria-current="page"`.
 */
export function activeGroupId(pathname: string): string | null {
  const group = NAV_GROUPS.find((g) =>
    g.items.some((item) => (item.href.split("#")[0] || "/") === pathname),
  );
  return group ? group.id : null;
}
