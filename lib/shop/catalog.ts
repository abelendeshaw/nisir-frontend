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

export const materials: Material[] = [
  {
    id: "matte-pla",
    name: "Matte Shell",
    note: "Plant-based, chalk finish, holds a crisp edge",
    multiplier: 1,
    densityGPerCm3: 1.24,
    pricePerKgCents: 3400,
    preview: { color: "#d9d5c9", roughness: 0.92, metalness: 0 },
    swatch: "#d9d5c9",
  },
  {
    id: "wood-fibre",
    name: "Wood Fibre",
    note: "Milled hardwood in the blend — sands and stains like timber",
    multiplier: 1.28,
    densityGPerCm3: 1.15,
    pricePerKgCents: 6200,
    preview: { color: "#9a7248", roughness: 0.96, metalness: 0 },
    swatch: "#9a7248",
  },
  {
    id: "basalt",
    name: "Basalt Composite",
    note: "Stone-filled, cold to the hand — the Lalibela material",
    multiplier: 1.45,
    densityGPerCm3: 1.62,
    pricePerKgCents: 7800,
    preview: { color: "#4a4d52", roughness: 0.88, metalness: 0.06 },
    swatch: "#4a4d52",
  },
  {
    id: "resin",
    name: "Fine Resin",
    note: "25-micron detail for relief and letterform work",
    multiplier: 1.62,
    densityGPerCm3: 1.18,
    pricePerKgCents: 9500,
    preview: { color: "#efede6", roughness: 0.42, metalness: 0.02 },
    swatch: "#efede6",
  },
  {
    id: "brass-fill",
    name: "Brass Fill",
    note: "Metal-loaded, polishes to a warm gold",
    multiplier: 1.75,
    densityGPerCm3: 3.9,
    pricePerKgCents: 11800,
    preview: { color: "#d4af37", roughness: 0.34, metalness: 0.86 },
    swatch: "#d4af37",
  },
  {
    id: "nylon-cf",
    name: "Carbon Nylon",
    note: "Structural — for pieces that carry weight or live outdoors",
    multiplier: 1.9,
    densityGPerCm3: 1.16,
    pricePerKgCents: 13400,
    preview: { color: "#22262c", roughness: 0.62, metalness: 0.12 },
    swatch: "#22262c",
  },
];

export const materialById = new Map(materials.map((m) => [m.id, m]));

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

export const finishes: Finish[] = [
  {
    id: "as-printed",
    name: "As printed",
    note: "Layer lines left legible — the object admits how it was made",
    surcharge: 0,
    benchCents: 0,
  },
  {
    id: "hand-sanded",
    name: "Hand sanded",
    note: "Three grits, by hand, until the layers read as one surface",
    surcharge: 0.18,
    benchCents: 900,
  },
  {
    id: "stone-sealed",
    name: "Stone sealed",
    note: "Mineral primer and matte seal — closes the grain, kills the shine",
    surcharge: 0.32,
    benchCents: 1600,
  },
  {
    id: "gold-leaf",
    name: "Gold leafed",
    note: "Sanded, sized, and laid with imitation leaf on the raised faces",
    surcharge: 0.55,
    benchCents: 3800,
  },
];

export const finishById = new Map(finishes.map((f) => [f.id, f]));

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

export const sizes: Size[] = [
  { id: "desk", name: "Desk", note: "Hand-sized", scale: 1, multiplier: 1 },
  { id: "shelf", name: "Shelf", note: "Reads across a room", scale: 1.35, multiplier: 1.45 },
  { id: "floor", name: "Floor", note: "Architectural", scale: 1.85, multiplier: 2.2 },
];

export const sizeById = new Map(sizes.map((s) => [s.id, s]));

/* --------------------------------------------------------------- products -- */

export type Product = {
  slug: string;
  number: string;
  name: string;
  /** The subtitle — always the source the form comes from. */
  line: string;
  relic: RelicKind;
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

export const products: Product[] = [
  {
    slug: "lalibela-relief",
    number: "01",
    name: "Lalibela Relief",
    line: "Bete Giyorgis, read from above",
    relic: "cross",
    category: "Wall",
    collection: "Rock-hewn",
    baseCents: 18500,
    sizes: ["desk", "shelf", "floor"],
    materials: ["basalt", "matte-pla", "wood-fibre", "brass-fill"],
    finishes: ["as-printed", "hand-sanded", "stone-sealed", "gold-leaf"],
    dimsMm: [240, 240, 26],
    weightG: 410,
    leadDays: [5, 9],
    story:
      "Bete Giyorgis was cut downward into the rock — a cross carved as a trench, so the plan is the elevation. The relief keeps that logic: a single plate, three stepped courses deep, lit from the side so the shadow does the drawing.",
    notes: [
      "Three stepped courses, deepest at 26mm",
      "French cleat cast into the back plate",
      "Hangs portrait or square — the form is symmetric",
    ],
    stock: 24,
    featured: true,
  },
  {
    slug: "axum-stele",
    number: "02",
    name: "Axum Stele",
    line: "The false-door obelisk, at desk height",
    relic: "stele",
    category: "Objects",
    collection: "Rock-hewn",
    baseCents: 14500,
    sizes: ["desk", "shelf", "floor"],
    materials: ["basalt", "matte-pla", "nylon-cf", "brass-fill"],
    finishes: ["as-printed", "stone-sealed", "hand-sanded", "gold-leaf"],
    dimsMm: [64, 320, 48],
    weightG: 330,
    leadDays: [4, 8],
    story:
      "Nine storeys of blind windows and a false door at the base, carried in granite by a kingdom that traded with Rome. Printed upright in one piece so the storey lines land on layer boundaries rather than fighting them.",
    notes: [
      "Nine storeys, false door at the base",
      "Weighted foot — will not walk on a desk",
      "Printed upright, no seam across the face",
    ],
    stock: 31,
    featured: true,
  },
  {
    slug: "jebena-vessel",
    number: "03",
    name: "Jebena Vessel",
    line: "The coffee pot, kept as a silhouette",
    relic: "jebena",
    category: "Table",
    collection: "Buna",
    baseCents: 12800,
    sizes: ["desk", "shelf"],
    materials: ["matte-pla", "wood-fibre", "basalt", "resin"],
    finishes: ["as-printed", "hand-sanded", "stone-sealed"],
    dimsMm: [140, 210, 140],
    weightG: 280,
    leadDays: [4, 7],
    story:
      "A jebena is a bulb, a neck, a spout and a handle, and every one is slightly different because every one was thrown by hand. This is a vase built on that outline — the same proportions, opened at the top, with a sealed liner so it holds water.",
    notes: [
      "Water-tight liner, removable for cleaning",
      "Spiral vase walls — one continuous extrusion",
      "Not for heat: this is a vessel, not a pot",
    ],
    stock: 18,
  },
  {
    slug: "mesob-shade",
    number: "04",
    name: "Mesob Shade",
    line: "The injera basket, as a pendant",
    relic: "mesob",
    category: "Lighting",
    collection: "Buna",
    baseCents: 21500,
    sizes: ["shelf", "floor"],
    materials: ["matte-pla", "wood-fibre", "resin"],
    finishes: ["as-printed", "hand-sanded"],
    dimsMm: [340, 300, 340],
    weightG: 620,
    leadDays: [7, 12],
    story:
      "A mesob is coiled grass — a table, a basket and a room divider at once. The shade takes the coil and thins it until light passes: the weave becomes the aperture, and the pattern lands on the wall instead of the basket.",
    notes: [
      "0.8mm coil walls — the weave throws the pattern",
      "E26 socket, cord and canopy included",
      "LED only, 9W maximum",
    ],
    stock: 12,
    featured: true,
  },
  {
    slug: "tibeb-coasters",
    number: "05",
    name: "Tibeb Coasters",
    line: "Four borders from the habesha kemis",
    relic: "tibeb",
    category: "Table",
    collection: "Tibeb",
    baseCents: 6800,
    sizes: ["desk"],
    materials: ["matte-pla", "wood-fibre", "basalt", "brass-fill"],
    finishes: ["as-printed", "hand-sanded", "stone-sealed"],
    dimsMm: [100, 10, 100],
    weightG: 40,
    leadDays: [3, 6],
    story:
      "Tibeb is the woven band that runs the hem and cuffs of a habesha kemis, and no two weavers set it the same way. Four patterns, four coasters, each cut to full depth so the border is structural rather than printed on.",
    notes: [
      "Set of four, four distinct borders",
      "Cork base, seated and glued",
      "Through-cut pattern — 10mm deep",
    ],
    stock: 46,
  },
  {
    slug: "adey-abeba-diffuser",
    number: "06",
    name: "Adey Abeba Diffuser",
    line: "The Meskel daisy, opened",
    relic: "daisy",
    category: "Objects",
    collection: "Meskel",
    baseCents: 9400,
    sizes: ["desk", "shelf"],
    materials: ["matte-pla", "resin", "wood-fibre"],
    finishes: ["as-printed", "hand-sanded", "gold-leaf"],
    dimsMm: [150, 150, 60],
    weightG: 150,
    leadDays: [3, 6],
    story:
      "The yellow daisy that covers the highlands at the end of the rains, and turns up on every Meskel and every new year. Thirteen petals, one per month of the Ethiopian calendar, with a reed well cut into the centre.",
    notes: ["Thirteen petals — one per month", "Ceramic reed well, 60ml", "Reeds not included"],
    stock: 38,
  },
  {
    slug: "fidel-bookends",
    number: "07",
    name: "Fidel Bookends",
    line: "ሀ and ለ, at full weight",
    relic: "fidel",
    category: "Objects",
    collection: "Fidel",
    baseCents: 16400,
    sizes: ["desk", "shelf"],
    materials: ["nylon-cf", "basalt", "matte-pla", "brass-fill"],
    finishes: ["as-printed", "hand-sanded", "stone-sealed", "gold-leaf"],
    dimsMm: [130, 180, 110],
    weightG: 520,
    leadDays: [5, 9],
    story:
      "The first two characters of the fidel, drawn at the weight the syllabary actually carries — Ge’ez letterforms are square, footed and heavy, and they hold a shelf of books without argument.",
    notes: [
      "Pair: ሀ and ለ",
      "Sand-fillable cavity, plugged — 1.8kg loaded",
      "Felted base, no marks on wood",
    ],
    stock: 21,
  },
  {
    slug: "gebeta-board",
    number: "08",
    name: "Gebeta Board",
    line: "Two rows, twelve pits, one long argument",
    relic: "gebeta",
    category: "Table",
    collection: "Gebeta",
    baseCents: 19800,
    sizes: ["shelf"],
    materials: ["wood-fibre", "matte-pla", "basalt"],
    finishes: ["hand-sanded", "as-printed", "stone-sealed"],
    dimsMm: [420, 60, 150],
    weightG: 740,
    leadDays: [6, 10],
    story:
      "Gebeta is played on anything — a board, a bench, holes scooped in the ground. This is the board version: twelve pits, two stores, printed in one piece so nothing can rack out of square.",
    notes: [
      "Twelve pits, two stores",
      "48 stones, tumbled basalt composite",
      "Printed as one piece — no glued joints",
    ],
    stock: 14,
  },
  {
    slug: "walia",
    number: "09",
    name: "Walia",
    line: "The ibex of the Simien escarpment",
    relic: "ibex",
    category: "Objects",
    collection: "Simien",
    baseCents: 11200,
    sizes: ["desk", "shelf"],
    materials: ["basalt", "matte-pla", "wood-fibre", "brass-fill"],
    finishes: ["as-printed", "stone-sealed", "hand-sanded", "gold-leaf"],
    dimsMm: [90, 190, 160],
    weightG: 240,
    leadDays: [4, 8],
    story:
      "Fewer than a thousand Walia ibex remain, all of them on one escarpment in the Simien mountains. The figure is reduced to the two ridged horns and the set of the head — the parts you would recognise at distance, which is how anyone has ever seen one.",
    notes: [
      "Ridged horns, printed without supports",
      "Reads as a silhouette from three metres",
      "A dollar per unit goes to Simien park wardens",
    ],
    stock: 27,
  },
  {
    slug: "harar-gate-tile",
    number: "10",
    name: "Harar Gate Tile",
    line: "One of the five gates of the Jugol",
    relic: "gate",
    category: "Wall",
    collection: "Jugol",
    baseCents: 7600,
    sizes: ["desk", "shelf"],
    materials: ["basalt", "matte-pla", "wood-fibre"],
    finishes: ["stone-sealed", "as-printed", "hand-sanded"],
    dimsMm: [160, 200, 18],
    weightG: 210,
    leadDays: [3, 7],
    story:
      "The wall around Harar has five gates and eighty-two mosques inside it. The tile takes one gate — the arch, the two flanking piers, the lime-rendered face — at the depth a low-angle lamp needs to throw the arch into shadow.",
    notes: [
      "Rendered face texture, 0.4mm relief",
      "Keyhole slot cast into the back",
      "Sits flush — no standoff needed",
    ],
    stock: 35,
  },
  {
    slug: "sheba-lantern",
    number: "11",
    name: "Sheba Lantern",
    line: "A lattice that only exists as shadow",
    relic: "lantern",
    category: "Lighting",
    collection: "Tibeb",
    baseCents: 17800,
    sizes: ["desk", "shelf"],
    materials: ["matte-pla", "resin", "wood-fibre", "brass-fill"],
    finishes: ["as-printed", "hand-sanded", "gold-leaf"],
    dimsMm: [150, 260, 150],
    weightG: 380,
    leadDays: [5, 9],
    story:
      "A tibeb border run around a cylinder and cut through, so the pattern is a hole rather than a mark. Lit, the lantern almost disappears and the room takes the drawing instead.",
    notes: [
      "Through-cut lattice, four repeats",
      "USB-C, dimmable, 2700K",
      "Six hours on the internal cell",
    ],
    stock: 16,
  },
  {
    slug: "rekebot-tray",
    number: "12",
    name: "Rekebot Tray",
    line: "The table the ceremony is set on",
    relic: "tray",
    category: "Table",
    collection: "Buna",
    baseCents: 15600,
    sizes: ["shelf", "floor"],
    materials: ["wood-fibre", "matte-pla", "nylon-cf"],
    finishes: ["hand-sanded", "as-printed", "stone-sealed"],
    dimsMm: [360, 120, 360],
    weightG: 690,
    leadDays: [6, 11],
    story:
      "A rekebot holds the jebena, the cini, the sugar and the incense, and nothing else — it is sized by the ceremony. The tray keeps that footprint, with six turned legs printed separately so the top stays flat.",
    notes: [
      "Six legs, threaded, ship flat",
      "Rim turned to catch a spill",
      "Sized to a full jebena and six cini",
    ],
    stock: 11,
  },
  {
    slug: "fidel-set-digital",
    number: "13",
    name: "Fidel Set — Digital",
    line: "All 231 characters, print-ready",
    relic: "fidel",
    category: "Digital",
    collection: "Fidel",
    baseCents: 4800,
    sizes: ["desk"],
    materials: ["matte-pla"],
    finishes: ["as-printed"],
    dimsMm: [0, 0, 0],
    weightG: 0,
    leadDays: [0, 0],
    story:
      "The full Ge’ez syllabary as manifold solids — seven orders across thirty-three base characters — modelled at a common cap height and footed so any of them stands unsupported. Yours to print, not to resell.",
    notes: [
      "231 characters, STL and STEP",
      "Manifold, watertight, zero non-planar faces",
      "Personal and small-commercial licence included",
    ],
    digital: true,
    stock: 9999,
  },
  {
    slug: "tibeb-pattern-pack",
    number: "14",
    name: "Tibeb Pattern Pack — Digital",
    line: "Twelve borders, parametric",
    relic: "tibeb",
    category: "Digital",
    collection: "Tibeb",
    baseCents: 3900,
    sizes: ["desk"],
    materials: ["matte-pla"],
    finishes: ["as-printed"],
    dimsMm: [0, 0, 0],
    weightG: 0,
    leadDays: [0, 0],
    story:
      "Twelve woven borders traced from garments in Addis and rebuilt as parametric profiles — set the repeat, the depth and the run length, and the pack sweeps the band for you. Ships as STEP with the parameters live.",
    notes: [
      "Twelve borders, parametric STEP",
      "Repeat, depth and run length exposed",
      "Also flat SVG for laser and vinyl",
    ],
    digital: true,
    stock: 9999,
  },
];

/* ---------------------------------------------------------------- lookups -- */

/**
 * Claimed by the storefront's own routes. Static segments beat `[slug]` in the
 * router, so a product named `cart` would simply never render — this list is
 * what keeps that from being discovered in production.
 */
export const reservedSlugs = new Set(["cart", "checkout", "custom", "order", "wishlist"]);

export const categories: Category[] = ["Wall", "Objects", "Lighting", "Table", "Digital"];

export const collections = [...new Set(products.map((p) => p.collection))];

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
