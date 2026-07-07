import type { Brand } from "@/types/domain";

/**
 * Four public U.S. brands. Accents map to tokens in styles/tokens.css.
 * Positioning is editorial framing derived from the catalog, not official copy.
 */
export const BRANDS: Brand[] = [
  {
    id: "buldak",
    name: "Buldak",
    accentToken: "--chili-600",
    positioning: "The spicy-chicken flagship — the widest range of flavors and formats in the portfolio.",
    role: "Portfolio center of gravity (29 families across noodles, sauces, snacks, frozen).",
  },
  {
    id: "samyang",
    name: "Samyang",
    accentToken: "--samyang-accent",
    positioning: "Heritage soup noodles and snacks that established the house.",
    role: "Heritage line — soup-forward ramen and legacy snacks.",
  },
  {
    id: "tangle",
    name: "Tangle",
    accentToken: "--tangle-accent",
    positioning: "Protein-forward pasta with familiar sauces.",
    role: "Better-for-you protein pasta extension.",
  },
  {
    id: "mep",
    name: "MEP",
    accentToken: "--mep-accent",
    positioning: "Broth-led soup noodles with distinct flavor pairings.",
    role: "Soup-noodle specialist line.",
  },
];

export const BRAND_BY_ID = Object.fromEntries(BRANDS.map((b) => [b.id, b]));
