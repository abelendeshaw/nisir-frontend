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
} from "./catalog";

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
  /**
   * The model as nisir-backend stored and measured it, from
   * `POST /custom/uploads`. Checkout sends this rather than the geometry —
   * the price is rebuilt from the server's own reading of the file.
   */
  fileId: string;
  material: MaterialId;
  finish: FinishId;
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

/** Filled from `GET /catalog` — see the note at the top of `catalog.ts`. */
export const zones: Zone[] = [];

export const zoneById = new Map<ZoneId, Zone>();

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

/**
 * One row per (method, zone) pair — `id` repeats across zones on purpose, so
 * `findMethod` narrows by zone first. Filled from `GET /catalog`.
 */
export const shippingMethods: ShippingMethod[] = [];

export function methodsForZone(zone: ZoneId) {
  return shippingMethods.filter((method) => method.zones.includes(zone));
}

export function findMethod(zone: ZoneId, id: ShippingId) {
  return methodsForZone(zone).find((method) => method.id === id) ?? methodsForZone(zone)[0];
}

/* ------------------------------------------------------------- rush tier -- */

export type RushId = "standard" | "priority" | "overnight";

export type RushTier = { id: RushId; name: string; note: string; multiplier: number };

export const rushTiers: RushTier[] = [];

export const rushById = new Map<RushId, RushTier>();

/* ---------------------------------------------------------------- promos -- */

export type Promo = {
  code: string;
  label: string;
  kind: "percent" | "amount" | "shipping";
  value: number;
  /** Minimum subtotal in cents. */
  minimum?: number;
};

/**
 * Filled from `GET /catalog`, which only ever sends live codes. This copy is
 * what makes the cart's feedback instant; nisir-backend re-resolves the code
 * when the order is actually created, so a stale or edited one here cannot
 * buy a discount.
 */
export const promos: Promo[] = [];

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
