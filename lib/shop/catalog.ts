/**
 * The catalogue.
 *
 * Nisir prints one thing: Ethiopian form, in matter. Every object here is a
 * reference to something that already exists — a rock-hewn church, a stele, a
 * coffee vessel, a woven border — reduced to geometry a printer can lay down.
 *
 * Money is integer cents throughout. Floats drift, and a storefront that
 * disagrees with itself by a penny between the card and the cart is worse than
 * one that never launched.
 *
 * The rows themselves now live in Postgres and arrive from nisir-backend's
 * `GET /catalog` — see `catalog-server.ts` (fetch) and `catalog-store.ts`
 * (the fill). The containers below are exported as stable, *mutable* objects
 * and refilled in place, which is deliberate: `pricing.ts`, `quote.ts` and
 * every component that prices something read these maps **synchronously**
 * during render. Swapping them for promises would have turned the whole
 * pricing layer async for data that is a few kilobytes and identical for
 * everyone. Filled once per request on the server, once at hydration on the
 * client, before anything renders that reads them.
 */

export type RelicKind =
  | "cross"
  | "stele"
  | "jebena"
  | "mesob"
  | "tibeb"
  | "daisy"
  | "fidel"
  | "gebeta"
  | "ibex"
  | "gate"
  | "lantern"
  | "tray"
  /** Not a source — the stand-in for a model somebody uploaded themselves. */
  | "mesh";

export type Category = "Wall" | "Objects" | "Lighting" | "Table" | "Digital";

/* ------------------------------------------------------------- materials -- */

export type MaterialId =
  | "matte-pla"
  | "wood-fibre"
  | "basalt"
  | "resin"
  | "brass-fill"
  | "nylon-cf";

export type Material = {
  id: MaterialId;
  name: string;
  /** One line, on the configurator row. */
  note: string;
  /** Applied to a catalogue object's base price. */
  multiplier: number;
  /** Both used by the custom quote engine, not the catalogue. */
  densityGPerCm3: number;
  pricePerKgCents: number;
  /** How the preview mesh renders in the customiser. */
  preview: { color: string; roughness: number; metalness: number };
  /** The dot beside the name. */
  swatch: string;
};

export const materials: Material[] = [];

export const materialById = new Map<MaterialId, Material>();

/* --------------------------------------------------------------- finishes -- */

export type FinishId = "as-printed" | "hand-sanded" | "stone-sealed" | "gold-leaf";

export type Finish = {
  id: FinishId;
  name: string;
  note: string;
  /** Fraction of the material + machine subtotal. */
  surcharge: number;
  /** Flat bench time, per unit. */
  benchCents: number;
};

export const finishes: Finish[] = [];

export const finishById = new Map<FinishId, Finish>();

/* ------------------------------------------------------------------ sizes -- */

export type SizeId = "desk" | "shelf" | "floor";

export type Size = {
  id: SizeId;
  name: string;
  note: string;
  /** Linear scale, used to state real dimensions. */
  scale: number;
  /** Price scale. Material goes as the cube, machine time closer to the
      square, so the honest exponent sits between the two. */
  multiplier: number;
};

export const sizes: Size[] = [];

export const sizeById = new Map<SizeId, Size>();

/* --------------------------------------------------------------- products -- */

export type Product = {
  slug: string;
  number: string;
  name: string;
  /** The subtitle — always the source the form comes from. */
  line: string;
  relic: RelicKind;
  /**
   * A photograph or render of the actual object, absolute, from the backend.
   *
   * Optional because `relic` remains the fallback and not a legacy: a design
   * that has been priced but not yet photographed has no `image`, and the
   * procedural figure keyed on `relic` is what stands in for it. Products
   * that do have one should show it — line art is a placeholder for a
   * photograph, not a substitute for one.
   */
  image?: string;
  category: Category;
  collection: string;
  /** Price of the default size in the default material, in cents. */
  baseCents: number;
  sizes: SizeId[];
  materials: MaterialId[];
  finishes: FinishId[];
  /** Millimetres at `desk` scale — W × H × D. */
  dimsMm: [number, number, number];
  /** Grams at `desk` scale in Matte Shell. */
  weightG: number;
  leadDays: [number, number];
  story: string;
  /** Bullet facts on the detail page. */
  notes: string[];
  /** Digital goods skip shipping, and the size selector. */
  digital?: boolean;
  stock: number;
  featured?: boolean;
};

export const products: Product[] = [];

/* ---------------------------------------------------------------- lookups -- */

/**
 * Claimed by the storefront's own routes. Static segments beat `[slug]` in
 * the router, so a product named `cart` would simply never render — this list
 * is what keeps that from being discovered in production. nisir-backend
 * refuses to save one too, so it cannot enter the catalogue in the first
 * place.
 */
export const reservedSlugs = new Set(["cart", "checkout", "custom", "order", "wishlist"]);

/**
 * Stays a constant rather than coming from the API: `Category` is a union
 * *type*, so a category invented in the database could not be rendered
 * without a code change anyway — and this order is the order the filter row
 * reads in, which is a design decision rather than a row ordering.
 */
export const categories: Category[] = ["Wall", "Objects", "Lighting", "Table", "Digital"];

/** Derived from whatever the catalogue currently holds. Filled with it. */
export const collections: string[] = [];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function relatedProducts(product: Product, count = 3) {
  const kin = products.filter(
    (other) => other.slug !== product.slug && other.collection === product.collection,
  );
  const rest = products.filter(
    (other) => other.slug !== product.slug && other.collection !== product.collection,
  );
  return [...kin, ...rest].slice(0, count);
}

/** The options a product actually offers, resolved and kept in its own order. */
export function optionsFor(product: Product) {
  return {
    materials: product.materials
      .map((id) => materialById.get(id))
      .filter((m): m is Material => !!m),
    finishes: product.finishes.map((id) => finishById.get(id)).filter((f): f is Finish => !!f),
    sizes: product.sizes.map((id) => sizeById.get(id)).filter((s): s is Size => !!s),
  };
}
