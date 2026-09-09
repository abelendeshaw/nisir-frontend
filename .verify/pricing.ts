/**
 * What an order costs.
 *
 * Two things are priced here: a catalogue object once it has been configured,
 * and an order once it has a destination. The custom-model quote is a
 * different animal — it lives in `./quote.ts`, because it prices machine time
 * rather than a listed thing.
 */

import {
  finishById,
  materialById,
  sizeById,
  type FinishId,
  type MaterialId,
  type Product,
  type RelicKind,
  type SizeId,
} from "./catalog.ts";

/* ------------------------------------------------------ configured price -- */

export type Configuration = {
  material: MaterialId;
  finish: FinishId;
  size: SizeId;
};

export function defaultConfiguration(product: Product): Configuration {
  return {
    material: product.materials[0],
    finish: product.finishes[0],
    size: product.sizes[0],
  };
}

/**
 * base × material × size, then the finish surcharge and its bench time on top.
 *
 * The finish is added last and outside the size multiplier on purpose: leafing
 * a floor-sized piece costs more in leaf but the same in setup, and charging
 * the multiplier twice would put the large gold pieces somewhere silly.
 */
export function configuredPrice(product: Product, config: Configuration) {
  const material = materialById.get(config.material);
  const size = sizeById.get(config.size);
  const finish = finishById.get(config.finish);
  if (!material || !size || !finish) return product.baseCents;

  const body = product.baseCents * material.multiplier * size.multiplier;
  const withFinish = body * (1 + finish.surcharge) + finish.benchCents;
  // To the dollar. A storefront this typographic should not be printing cents.
  return Math.round(withFinish / 100) * 100;
}

/** The lowest a product can be bought for — what the grid card quotes. */
export function fromPrice(product: Product) {
  const prices = product.sizes.flatMap((size) =>
    product.materials.flatMap((material) =>
      product.finishes.map((finish) => configuredPrice(product, { material, finish, size })),
    ),
  );
  return Math.min(...prices);
}

/** Human-readable configuration, for cart lines and receipts. */
export function describeConfiguration(product: Product, config: Configuration) {
  const rows: { label: string; value: string }[] = [];
  const material = materialById.get(config.material);
  const finish = finishById.get(config.finish);
  const size = sizeById.get(config.size);

  if (material) rows.push({ label: "Material", value: material.name });
  if (finish) rows.push({ label: "Finish", value: finish.name });
  if (size && !product.digital && product.sizes.length > 1) {
    rows.push({ label: "Size", value: size.name });
  }
  return rows;
}

/* ----------------------------------------------------------- cart lines -- */

export type CustomSpec = {
  fileName: string;
  /** Millimetres, after the scale the visitor chose. */
  bboxMm: [number, number, number];
  volumeCm3: number;
  triangles: number;
  scale: number;
  infill: number;
  layerMm: number;
  rush: RushId;
  estimatedHours: number;
  note: string;
};

export type CartLine = {
  /** Identity is the configuration: the same object twice merges, a different
      finish does not. */
  id: string;
  kind: "catalogue" | "custom";
  slug: string;
  name: string;
  line: string;
  relic: RelicKind;
  unitCents: number;
  qty: number;
  digital: boolean;
  options: { label: string; value: string }[];
  custom?: CustomSpec;
};

export function lineId(slug: string, config: Configuration) {
  return `${slug}:${config.material}:${config.finish}:${config.size}`;
}

export function lineTotal(line: CartLine) {
  return line.unitCents * line.qty;
}

/* ------------------------------------------------------------- delivery -- */

export type ZoneId = "ca" | "et" | "intl";

export type Zone = {
  id: ZoneId;
  name: string;
  note: string;
  /** Fraction applied to the taxable base. */
  tax: number;
  taxLabel: string;
  /** Free standard shipping above this. `null` disables the offer. */
  freeOver: number | null;
};

export const zones: Zone[] = [
  {
    id: "ca",
    name: "Canada",
    note: "Printed and shipped from Ontario",
    tax: 0.13,
    taxLabel: "HST (13%)",
    freeOver: 25000,
  },
  {
    id: "et",
    name: "Ethiopia",
    note: "Cleared through Addis Ababa",
    tax: 0.15,
    taxLabel: "VAT (15%)",
    freeOver: 40000,
  },
  {
    id: "intl",
    name: "Rest of world",
    note: "Duties and import fees are the buyer’s",
    tax: 0,
    taxLabel: "Tax",
    freeOver: null,
  },
];

export const zoneById = new Map(zones.map((z) => [z.id, z]));

export type ShippingId = "standard" | "express" | "pickup-on" | "pickup-et";

export type ShippingMethod = {
  id: ShippingId;
  name: string;
  note: string;
  cents: number;
  /** Business days added to the slowest lead time in the cart. */
  transit: [number, number];
  zones: ZoneId[];
  /** Pickup can never be free-shipped away — it is already free. */
  pickup?: boolean;
};

export const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard",
    note: "Tracked ground",
    cents: 1800,
    transit: [4, 8],
    zones: ["ca"],
  },
  {
    id: "express",
    name: "Express",
    note: "Tracked air, signature on delivery",
    cents: 3400,
    transit: [1, 3],
    zones: ["ca"],
  },
  {
    id: "pickup-on",
    name: "Collect — Ontario",
    note: "From the print floor, once you are emailed",
    cents: 0,
    transit: [0, 0],
    zones: ["ca"],
    pickup: true,
  },
  {
    id: "standard",
    name: "Standard",
    note: "Tracked air freight",
    cents: 4600,
    transit: [9, 16],
    zones: ["et"],
  },
  {
    id: "pickup-et",
    name: "Collect — Addis Ababa",
    note: "From the Academy, Bole",
    cents: 0,
    transit: [0, 0],
    zones: ["et"],
    pickup: true,
  },
  {
    id: "standard",
    name: "Standard",
    note: "Tracked air freight, duties unpaid",
    cents: 6400,
    transit: [10, 21],
    zones: ["intl"],
  },
  {
    id: "express",
    name: "Express",
    note: "Courier, duties unpaid",
    cents: 11200,
    transit: [3, 6],
    zones: ["intl"],
  },
];

export function methodsForZone(zone: ZoneId) {
  return shippingMethods.filter((method) => method.zones.includes(zone));
}

export function findMethod(zone: ZoneId, id: ShippingId) {
  return methodsForZone(zone).find((method) => method.id === id) ?? methodsForZone(zone)[0];
}

/* ------------------------------------------------------------- rush tier -- */

export type RushId = "standard" | "priority" | "overnight";

export const rushTiers: { id: RushId; name: string; note: string; multiplier: number }[] = [
  { id: "standard", name: "Standard queue", note: "Printed in turn", multiplier: 1 },
  { id: "priority", name: "Priority", note: "Next machine free", multiplier: 1.35 },
  { id: "overnight", name: "Overnight", note: "Off the queue entirely", multiplier: 1.8 },
];

export const rushById = new Map(rushTiers.map((t) => [t.id, t]));

/* ---------------------------------------------------------------- promos -- */

export type Promo = {
  code: string;
  label: string;
  kind: "percent" | "amount" | "shipping";
  value: number;
  /** Minimum subtotal in cents. */
  minimum?: number;
};

export const promos: Promo[] = [
  { code: "MESKEL15", label: "Meskel — 15% off", kind: "percent", value: 0.15 },
  { code: "ADEY10", label: "Adey Abeba — 10% off", kind: "percent", value: 0.1 },
  {
    code: "BUNA25",
    label: "$25 off orders over $150",
    kind: "amount",
    value: 2500,
    minimum: 15000,
  },
  { code: "FREESHIP", label: "Shipping on us", kind: "shipping", value: 0 },
];

export type PromoResult =
  | { ok: true; promo: Promo }
  | { ok: false; reason: string };

export function resolvePromo(code: string, subtotalCents: number): PromoResult {
  const promo = promos.find((entry) => entry.code === code.trim().toUpperCase());
  if (!promo) return { ok: false, reason: "That code isn’t one of ours." };
  if (promo.minimum && subtotalCents < promo.minimum) {
    return {
      ok: false,
      reason: `${promo.code} needs a subtotal over $${Math.round(promo.minimum / 100)}.`,
    };
  }
  return { ok: true, promo };
}

/* ---------------------------------------------------------------- totals -- */

export type Totals = {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  taxLabel: string;
  /** How much more is needed to earn free standard shipping, or 0. */
  freeShippingGapCents: number;
  /** True when nothing in the cart has to be posted. */
  digitalOnly: boolean;
  itemCount: number;
};

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function subtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function calculateTotals(
  lines: CartLine[],
  {
    zone = "ca",
    shipping = "standard",
    promo = null,
  }: { zone?: ZoneId; shipping?: ShippingId; promo?: Promo | null } = {},
): Totals {
  const subtotalCents = subtotal(lines);
  const digitalOnly = lines.length > 0 && lines.every((line) => line.digital);
  const zoneRow = zoneById.get(zone) ?? zones[0];
  const method = findMethod(zone, shipping);

  let discountCents = 0;
  if (promo?.kind === "percent") discountCents = Math.round(subtotalCents * promo.value);
  if (promo?.kind === "amount") discountCents = Math.min(promo.value, subtotalCents);

  const discounted = subtotalCents - discountCents;

  let shippingCents = digitalOnly ? 0 : (method?.cents ?? 0);
  const earnsFreeShipping =
    !digitalOnly &&
    !method?.pickup &&
    zoneRow.freeOver !== null &&
    discounted >= zoneRow.freeOver;
  if (earnsFreeShipping || (promo?.kind === "shipping" && !digitalOnly)) shippingCents = 0;

  const freeShippingGapCents =
    digitalOnly || method?.pickup || zoneRow.freeOver === null
      ? 0
      : Math.max(0, zoneRow.freeOver - discounted);

  const taxCents = Math.round((discounted + shippingCents) * zoneRow.tax);

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents: discounted + shippingCents + taxCents,
    taxLabel: zoneRow.taxLabel,
    freeShippingGapCents,
    digitalOnly,
    itemCount: cartCount(lines),
  };
}
