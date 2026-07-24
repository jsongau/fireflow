import type { StandingOrder, OrderCadence, StandingOrderStatus } from "@/types/domain";

/**
 * SYNTHETIC standing-order (recurring replenishment) layer. Demonstration only.
 * Account names, cadences, ship dates, and fill rates are invented.
 */

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const SAMPLE_STANDING_ORDERS: StandingOrder[] = [
  {
    synthetic: true,
    id: "SO-2207",
    accountLabel: "Northgate Grocery",
    accountType: "retailer",
    cadence: "monthly",
    nextShipDate: daysFromNow(12),
    lines: [
      { variantId: "buldak-original--multi", cases: 20 },
      { variantId: "buldak-carbonara--multi", cases: 16 },
      { variantId: "buldak-original--cup", cases: 12 },
    ],
    status: "active",
    amendmentWindowDays: 5,
    autoHoldOnBackorder: true,
    fillRatePct: 98,
  },
  {
    synthetic: true,
    id: "SO-2231",
    accountLabel: "Pacific Foods Distribution",
    accountType: "distributor",
    cadence: "biweekly",
    nextShipDate: daysFromNow(6),
    lines: [
      { variantId: "buldak-original--multi", cases: 80 },
      { variantId: "buldak-2x-spicy--multi", cases: 50 },
      { variantId: "buldak-original-hot-sauce--sauce-200g", cases: 24 },
    ],
    status: "active",
    amendmentWindowDays: 7,
    autoHoldOnBackorder: true,
    fillRatePct: 96,
  },
  {
    synthetic: true,
    id: "SO-2244",
    accountLabel: "Sunrise Convenience Co-op",
    accountType: "retailer",
    cadence: "every-4-weeks",
    nextShipDate: daysFromNow(20),
    lines: [{ variantId: "buldak-mac-and-cheese-carbo--box", cases: 12 }],
    status: "paused",
    amendmentWindowDays: 5,
    autoHoldOnBackorder: false,
    fillRatePct: 94,
  },
  {
    synthetic: true,
    id: "SO-2250",
    accountLabel: "Harbor Market Group",
    accountType: "distributor",
    cadence: "monthly",
    nextShipDate: daysFromNow(3),
    lines: [{ variantId: "buldak-dumpling--frozen", cases: 20 }],
    status: "pending-approval",
    amendmentWindowDays: 10,
    autoHoldOnBackorder: true,
    fillRatePct: 92,
  },
];

export const CADENCE_LABEL: Record<OrderCadence, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  "every-4-weeks": "Every 4 weeks",
  monthly: "Monthly",
};

/** Days between shipments per cadence, for the next-ship preview. */
export const CADENCE_DAYS: Record<OrderCadence, number> = {
  weekly: 7,
  biweekly: 14,
  "every-4-weeks": 28,
  monthly: 30,
};

export const STANDING_STATUS_LABEL: Record<StandingOrderStatus, string> = {
  active: "Active",
  paused: "Paused",
  "pending-approval": "Pending approval",
};

/** Colorblind-safe glyph per standing-order status (word + glyph). */
export const STANDING_STATUS_GLYPH: Record<StandingOrderStatus, string> = {
  active: "▶",
  paused: "⏸",
  "pending-approval": "◔",
};
