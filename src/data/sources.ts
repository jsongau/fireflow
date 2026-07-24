import type { SourceType } from "@/types/domain";

/** Registry of source types and their UI labels + accent tokens. */
export const SOURCE_TYPES: Record<SourceType, { label: string; short: string; token: string; description: string }> = {
  official: {
    label: "Official Samyang America product information",
    short: "Official",
    token: "--src-official",
    description: "Packaging, allergen, preparation, and positioning facts as captured from public product information.",
  },
  "retail-signal": {
    label: "Public retail signal",
    short: "Retail signal",
    token: "--src-retail",
    description: "Engagement or merchandising markers from a third-party retail listing, date-stamped. Not sales.",
  },
  editorial: {
    label: "FireFlow editorial model",
    short: "Editorial",
    token: "--src-editorial",
    description: "Scores and interpretations created by this project, clearly not official Samyang ratings.",
  },
  synthetic: {
    label: "Modeled operational data",
    short: "Modeled",
    token: "--src-synthetic",
    description: "Cases, owners, metrics, and timelines built to show how the workflow behaves.",
  },
};

/** Standing reminder shown wherever product facts appear. */
export const VERIFY_PACKAGE_REMINDER =
  "Ingredients, allergens, packaging, and preparation may change. Always verify the current physical package.";

/**
 * The site-wide independence statement, rendered in the footer on every route.
 *
 * It became the ONLY site-wide disclaimer when the entrance cover was removed on
 * 2026-07-09, so it now carries what the cover used to say: no affiliation with
 * Samyang, no access to any internal system, and, per DECISIONS.md D-010, no
 * affiliation with the real grocery banners used as illustrative accounts.
 */
export const INDEPENDENCE_DISCLAIMER =
  "FireFlow is an independent working study by Nathan J. Song, built for the Samyang America Customer Experience application. It is not affiliated with or endorsed by Samyang Foods. Grocery banner names appear only as sample accounts.";
