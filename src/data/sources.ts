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
    label: "Synthetic demonstration data",
    short: "Synthetic",
    token: "--src-synthetic",
    description: "Invented for demonstration: cases, metrics, owners, timelines. Not real.",
  },
};

/** Standing reminder shown wherever product facts appear. */
export const VERIFY_PACKAGE_REMINDER =
  "Ingredients, allergens, packaging, and preparation may change. Always verify the current physical package.";

export const INDEPENDENCE_DISCLAIMER =
  "FireFlow CX is an independent portfolio concept created from publicly available information. It is not affiliated with, commissioned by, or connected to Samyang America or Samyang Foods. All customers, orders, shipments, complaints, employees, metrics, financial values, lot codes, and outcomes shown are fictional.";
