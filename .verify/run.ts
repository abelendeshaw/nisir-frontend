/**
 * Verification harness for the shop's arithmetic. Throwaway — lives outside
 * the source tree, imports the real modules, asserts against known answers.
 */
import { BoxGeometry, BufferGeometry, SphereGeometry, TorusKnotGeometry } from "three";
import { measure, loadModelFile } from "./mesh.ts";
import { quote } from "./quote.ts";
import { calculateTotals, configuredPrice, fromPrice, resolvePromo, defaultConfiguration } from "./pricing.ts";
import { getProduct, products, reservedSlugs } from "./catalog.ts";
import { luhn, validateCard, formatCardNumber, detectBrand } from "./payment.ts";
import { money } from "./format.ts";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "  ok  " : "FAIL  "}${label}${detail ? ` — ${detail}` : ""}`);
}
function near(a: number, b: number, tolerance: number) {
  return Math.abs(a - b) <= tolerance;
}

/* ---------------------------------------------------- binary STL writer -- */

function toBinaryStl(geometry: BufferGeometry) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const position = g.getAttribute("position");
  const faces = position.count / 3;
  const buffer = new ArrayBuffer(84 + faces * 50);
  const view = new DataView(buffer);
  view.setUint32(80, faces, true);
  let offset = 84;
  for (let f = 0; f < faces; f += 1) {
    offset += 12; // normal left at zero; STLLoader recomputes what it needs
    for (let v = 0; v < 3; v += 1) {
      const i = f * 3 + v;
      view.setFloat32(offset, position.getX(i), true);
      view.setFloat32(offset + 4, position.getY(i), true);
      view.setFloat32(offset + 8, position.getZ(i), true);
      offset += 12;
    }
    offset += 2;
  }
  return buffer;
}

async function loadAs(name: string, geometry: BufferGeometry) {
  const bytes = toBinaryStl(geometry);
  const file = new File([bytes], name, { type: "model/stl" });
  return loadModelFile(file);
}

console.log("\n── mesh: volume from real STL bytes ──────────────────────────");

// A 20mm cube: 8000mm³ = 8cm³, 12 triangles, closed.
const cube = await loadAs("cube.stl", new BoxGeometry(20, 20, 20));
check("cube volume is 8cm³", near(cube.stats.volumeCm3, 8, 0.001), `${cube.stats.volumeCm3}`);
check("cube bbox is 20×20×20", cube.stats.bboxMm.every((mm) => near(mm, 20, 0.001)));
check("cube is 12 triangles", cube.stats.triangles === 12, `${cube.stats.triangles}`);
check("cube reads watertight", cube.stats.watertight);
check("cube surface is 24cm²", near(cube.stats.surfaceCm2, 24, 0.01), `${cube.stats.surfaceCm2}`);

// A sphere of r=15: 4/3·π·r³ = 14137mm³. Tessellation undershoots slightly.
const sphere = await loadAs("sphere.stl", new SphereGeometry(15, 64, 32));
const trueSphere = (4 / 3) * Math.PI * 15 ** 3 / 1000;
check(
  "sphere volume within 1% of analytic",
  near(sphere.stats.volumeCm3, trueSphere, trueSphere * 0.01),
  `${sphere.stats.volumeCm3.toFixed(3)} vs ${trueSphere.toFixed(3)}`,
);

// A knot is the case a bounding box gets badly wrong — that is the whole
// argument for measuring enclosed volume rather than the box.
const knot = await loadAs("knot.stl", new TorusKnotGeometry(30, 8, 200, 32));
const boxVolume = (knot.stats.bboxMm[0] * knot.stats.bboxMm[1] * knot.stats.bboxMm[2]) / 1000;
check(
  "knot volume is far under its bounding box",
  knot.stats.volumeCm3 < boxVolume * 0.2,
  `${knot.stats.volumeCm3.toFixed(1)}cm³ vs box ${boxVolume.toFixed(1)}cm³`,
);

// An open surface must be flagged, since its volume is meaningless.
const open = new SphereGeometry(15, 32, 16, 0, Math.PI);
check("open shell is flagged not watertight", !measure([open]).watertight);

console.log("\n── quote: every control moves the number ─────────────────────");

const base = {
  volumeCm3: cube.stats.volumeCm3,
  bboxMm: cube.stats.bboxMm,
  triangles: cube.stats.triangles,
  material: "matte-pla" as const,
  finish: "as-printed" as const,
  scale: 1,
  infill: 0.25,
  layerMm: 0.12,
  rush: "standard" as const,
  qty: 1,
};

const q = (patch: Partial<typeof base>) => quote({ ...base, ...patch });
const at = q({});

check("a small part lands on the floor price", at.unitCents === 2800, money(at.unitCents));

// Scale is cubic in material — the headline claim the UI makes.
const big = q({ scale: 3, volumeCm3: 200, bboxMm: [60, 60, 60] });
const small = q({ scale: 1, volumeCm3: 200, bboxMm: [60, 60, 60] });
check("3× scale costs well over 3×", big.unitCents > small.unitCents * 3, `${money(small.unitCents)} → ${money(big.unitCents)}`);
check("3× scale is 27× the material", near(big.massG / small.massG, 27, 0.01), `${(big.massG / small.massG).toFixed(2)}×`);

const heavy = { volumeCm3: 200, bboxMm: [60, 60, 60] as [number, number, number] };
check(
  "infill raises the price",
  q({ ...heavy, infill: 1 }).unitCents > q({ ...heavy, infill: 0.05 }).unitCents,
);
check(
  "finer layers raise the price",
  q({ ...heavy, layerMm: 0.08 }).unitCents > q({ ...heavy, layerMm: 0.28 }).unitCents,
);
check(
  "denser material raises the price",
  q({ ...heavy, material: "brass-fill" }).unitCents > q({ ...heavy, material: "matte-pla" }).unitCents,
);
check(
  "gold leaf raises the price",
  q({ ...heavy, finish: "gold-leaf" }).unitCents > q({ ...heavy, finish: "as-printed" }).unitCents,
);
check(
  "overnight raises the price",
  q({ ...heavy, rush: "overnight" }).unitCents > q({ ...heavy, rush: "standard" }).unitCents,
);
check(
  "a run of 25 lowers the unit price",
  q({ ...heavy, qty: 25 }).unitCents < q({ ...heavy, qty: 1 }).unitCents,
);
check("quantity discount at 25 is 28%", q({ ...heavy, qty: 25 }).discount === 0.28);

const over = q({ bboxMm: [400, 400, 100], volumeCm3: 4000 });
check("a part larger than the bed is flagged", over.oversize);
check("sectioning appears in the breakdown", over.rows.some((row) => row.label === "Sectioning"));
check("oversize explains itself", over.notes.some((note) => note.includes("larger than one bed")));
check("scale flows into the stated box", near(q({ scale: 2 }).bboxMm[0], 40, 0.001));

console.log("\n── catalogue and cart totals ─────────────────────────────────");

check("no product claims a reserved route", products.every((p) => !reservedSlugs.has(p.slug)));
check("every product slug is unique", new Set(products.map((p) => p.slug)).size === products.length);
check(
  "every product's default options are ones it offers",
  products.every((p) => {
    const c = defaultConfiguration(p);
    return p.materials.includes(c.material) && p.finishes.includes(c.finish) && p.sizes.includes(c.size);
  }),
);
check(
  "the from-price is never above a configured price",
  products.every((p) => fromPrice(p) <= configuredPrice(p, defaultConfiguration(p))),
);
check("every price is a whole dollar", products.every((p) => fromPrice(p) % 100 === 0));

const relief = getProduct("lalibela-relief")!;
const cheap = configuredPrice(relief, { material: "matte-pla", finish: "as-printed", size: "desk" });
const dear = configuredPrice(relief, { material: "brass-fill", finish: "gold-leaf", size: "floor" });
check("configuration meaningfully moves price", dear > cheap * 3, `${money(cheap)} → ${money(dear)}`);

const line = {
  id: "x",
  kind: "catalogue" as const,
  slug: "lalibela-relief",
  name: "Lalibela Relief",
  line: "",
  relic: "cross" as const,
  unitCents: 10000,
  qty: 2,
  digital: false,
  options: [],
};

const plain = calculateTotals([line], { zone: "ca", shipping: "standard" });
check("subtotal is unit × qty", plain.subtotalCents === 20000);
check("shipping is charged under the threshold", plain.shippingCents === 1800);
check("HST is 13% of goods plus shipping", plain.taxCents === Math.round(21800 * 0.13), `${plain.taxCents}`);
check("total adds up", plain.totalCents === 20000 + 1800 + plain.taxCents);

const free = calculateTotals([{ ...line, qty: 3 }], { zone: "ca", shipping: "standard" });
check("free shipping kicks in over $250", free.shippingCents === 0);
check("no free-shipping gap once earned", free.freeShippingGapCents === 0);

const promo = resolvePromo("MESKEL15", 20000);
check("a live code resolves", promo.ok);
const discounted = calculateTotals([line], {
  zone: "ca",
  shipping: "standard",
  promo: promo.ok ? promo.promo : null,
});
check("15% comes off the subtotal", discounted.discountCents === 3000);
check("tax follows the discount", discounted.taxCents === Math.round((17000 + 1800) * 0.13));

check("a minimum-spend code is refused below it", !resolvePromo("BUNA25", 10000).ok);
check("the same code passes above it", resolvePromo("BUNA25", 20000).ok);
check("an invented code is refused", !resolvePromo("NOPE", 99999).ok);

const digital = calculateTotals([{ ...line, digital: true }], { zone: "ca", shipping: "standard" });
check("digital orders are not shipped", digital.shippingCents === 0 && digital.digitalOnly);
check("digital orders are still taxed", digital.taxCents > 0);

const pickup = calculateTotals([line], { zone: "ca", shipping: "pickup-on" });
check("collection is free", pickup.shippingCents === 0);
check("collection shows no free-shipping nag", pickup.freeShippingGapCents === 0);

const abroad = calculateTotals([line], { zone: "intl", shipping: "standard" });
check("international is untaxed here", abroad.taxCents === 0);
check("international shipping is charged", abroad.shippingCents === 6400);

const ethiopia = calculateTotals([line], { zone: "et", shipping: "standard" });
check("Ethiopian VAT is 15%", ethiopia.taxCents === Math.round((20000 + 4600) * 0.15));

console.log("\n── card validation ───────────────────────────────────────────");

check("a valid test number passes Luhn", luhn("4242424242424242"));
check("a transposed digit fails Luhn", !luhn("4242424242424243"));
check("Visa is detected", detectBrand("4242424242424242") === "Visa");
check("Amex is detected", detectBrand("378282246310005") === "Amex");
check("Visa groups in fours", formatCardNumber("4242424242424242") === "4242 4242 4242 4242");
check("Amex groups 4-6-5", formatCardNumber("378282246310005") === "3782 822463 10005");

const good = validateCard({ number: "4242 4242 4242 4242", name: "A Person", expiry: "12/34", cvc: "123" });
check("a good card has no errors", Object.keys(good).length === 0, JSON.stringify(good));
check("a past expiry is caught", !!validateCard({ number: "4242 4242 4242 4242", name: "A", expiry: "01/20", cvc: "123" }).expiry);
check("a 13th month is caught", !!validateCard({ number: "4242 4242 4242 4242", name: "A", expiry: "13/34", cvc: "123" }).expiry);
check("a short CVC is caught", !!validateCard({ number: "4242 4242 4242 4242", name: "A", expiry: "12/34", cvc: "12" }).cvc);
check("Amex wants four CVC digits", !!validateCard({ number: "3782 822463 10005", name: "A", expiry: "12/34", cvc: "123" }).cvc);
check("a bad checksum is caught", !!validateCard({ number: "4242 4242 4242 4241", name: "A", expiry: "12/34", cvc: "123" }).number);

console.log("\n── formatting ────────────────────────────────────────────────");
check("whole dollars drop the cents", money(18500) === "$185", money(18500));
check("part dollars keep them", money(18550) === "$185.50", money(18550));
check("thousands get a comma", money(123456) === "$1,234.56", money(123456));
check("negatives use a minus sign", money(-2500) === "−$25", money(-2500));

console.log(
  failures === 0
    ? "\n✓ every check passed\n"
    : `\n✗ ${failures} check${failures === 1 ? "" : "s"} failed\n`,
);
process.exit(failures === 0 ? 0 : 1);
