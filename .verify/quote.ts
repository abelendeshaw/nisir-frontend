/**
 * The custom quote engine.
 *
 * A listed object has a price because someone decided one. An uploaded model
 * does not — so it gets costed the way the print floor actually costs it:
 * grams of material, hours on a machine, minutes at the bench, and whatever
 * the queue is worth to you. Every control in the customiser moves one of
 * those four terms, which is why the number moves as you drag.
 *
 * The volume comes from the mesh itself (see `mesh.ts`), so scaling a model to
 * 140% raises the price by roughly 2.7×, not 1.4× — that surprises people, and
 * the breakdown is there so it does not have to.
 */

import { finishById, materialById, type FinishId, type MaterialId } from "./catalog.ts";
import { rushById, type RushId } from "./pricing.ts";

/** The largest thing that fits on one bed, in millimetres. */
export const BUILD_VOLUME_MM: [number, number, number] = [350, 350, 400];

/** Nothing leaves the floor for less than this, however small. */
const MINIMUM_CENTS = 2800;

/** Bed levelling, slicing, purge and first-layer watching, once per order. */
const SETUP_CENTS = 1400;

/** What an hour of machine, power and floor space is worth. */
const MACHINE_RATE_CENTS_PER_HOUR = 1150;

/** Volume a machine lays down per hour at a 0.2mm layer, in cm³. */
const DEPOSITION_CM3_PER_HOUR = 17;

/** Perimeters and top/bottom skins exist at any infill. */
const SHELL_FRACTION = 0.16;

/** A model split across several prints costs more to make and to glue. */
const OVERSIZE_SURCHARGE = 0.18;

export const layerOptions = [
  { mm: 0.08, name: "Fine", note: "80µm — for relief and lettering" },
  { mm: 0.12, name: "Detail", note: "120µm — the usual choice" },
  { mm: 0.2, name: "Standard", note: "200µm — fast, layers legible" },
  { mm: 0.28, name: "Draft", note: "280µm — form checks only" },
] as const;

/** Quantity breaks. Setup is amortised, so the curve is real, not marketing. */
const quantityBreaks: { min: number; discount: number }[] = [
  { min: 25, discount: 0.28 },
  { min: 10, discount: 0.2 },
  { min: 5, discount: 0.12 },
  { min: 2, discount: 0.06 },
  { min: 1, discount: 0 },
];

export function quantityDiscount(qty: number) {
  return quantityBreaks.find((tier) => qty >= tier.min)?.discount ?? 0;
}

export type QuoteInput = {
  /** Mesh volume at scale 1, in cm³. */
  volumeCm3: number;
  /** Mesh bounding box at scale 1, in millimetres. */
  bboxMm: [number, number, number];
  triangles: number;
  material: MaterialId;
  finish: FinishId;
  /** 0.25–4. Applied linearly to the box, cubically to the volume. */
  scale: number;
  /** 0.05–1. */
  infill: number;
  layerMm: number;
  rush: RushId;
  qty: number;
};

export type QuoteRow = { label: string; detail: string; cents: number };

export type Quote = {
  unitCents: number;
  totalCents: number;
  /** Everything below is the scaled model, not the uploaded one. */
  volumeCm3: number;
  materialVolumeCm3: number;
  massG: number;
  bboxMm: [number, number, number];
  hours: number;
  rows: QuoteRow[];
  discount: number;
  oversize: boolean;
  notes: string[];
};

export function quote(input: QuoteInput): Quote {
  const material = materialById.get(input.material) ?? materialById.get("matte-pla")!;
  const finish = finishById.get(input.finish) ?? finishById.get("as-printed")!;
  const rush = rushById.get(input.rush) ?? rushById.get("standard")!;

  const scale = clamp(input.scale, 0.25, 4);
  const infill = clamp(input.infill, 0.05, 1);
  const layerMm = clamp(input.layerMm, 0.08, 0.28);
  const qty = Math.max(1, Math.round(input.qty));

  const bboxMm = input.bboxMm.map((mm) => mm * scale) as [number, number, number];
  const volumeCm3 = Math.max(input.volumeCm3, 0) * scale ** 3;

  // Walls and skins are printed solid whatever the infill slider says.
  const materialVolumeCm3 = volumeCm3 * (SHELL_FRACTION + (1 - SHELL_FRACTION) * infill);
  const massG = materialVolumeCm3 * material.densityGPerCm3;
  const materialCents = (massG / 1000) * material.pricePerKgCents;

  // Thicker layers lay down proportionally more per hour; the fixed term is
  // the travel and perimeter work that a taller part pays regardless.
  const rate = DEPOSITION_CM3_PER_HOUR * (layerMm / 0.2);
  const heightHours = (bboxMm[1] / 1000) * (0.2 / layerMm);
  const hours = materialVolumeCm3 / rate + heightHours + 0.25;
  const machineCents = hours * MACHINE_RATE_CENTS_PER_HOUR;

  // A million-triangle scan is all small moves; the machine never gets going.
  const complexity = 1 + Math.min(0.25, input.triangles / 2_000_000);

  const oversize = bboxMm.some((mm, i) => mm > BUILD_VOLUME_MM[i]);

  const bodyCents = (materialCents + machineCents) * complexity;
  const oversizeCents = oversize ? bodyCents * OVERSIZE_SURCHARGE : 0;
  const finishCents = (bodyCents + oversizeCents) * finish.surcharge + finish.benchCents;
  const beforeRush = bodyCents + oversizeCents + finishCents;
  const rushCents = beforeRush * (rush.multiplier - 1);

  const perUnit = Math.max(MINIMUM_CENTS, beforeRush + rushCents);
  const discount = quantityDiscount(qty);
  const unitCents = Math.round((perUnit * (1 - discount)) / 100) * 100;
  const totalCents = unitCents * qty + SETUP_CENTS;

  const rows: QuoteRow[] = [
    {
      label: material.name,
      detail: `${massG.toFixed(0)}g at ${Math.round(infill * 100)}% infill`,
      cents: Math.round(materialCents),
    },
    {
      label: "Machine time",
      detail: `${hours.toFixed(1)}h at ${layerMm.toFixed(2)}mm layers`,
      cents: Math.round(machineCents),
    },
  ];

  if (complexity > 1.001) {
    rows.push({
      label: "Geometry",
      detail: `${formatTriangles(input.triangles)} triangles`,
      cents: Math.round(bodyCents - materialCents - machineCents),
    });
  }
  if (oversizeCents > 0) {
    rows.push({
      label: "Sectioning",
      detail: "Exceeds one bed — printed in parts and joined",
      cents: Math.round(oversizeCents),
    });
  }
  if (finishCents > 0) {
    rows.push({ label: finish.name, detail: "Bench work", cents: Math.round(finishCents) });
  }
  if (rushCents > 0) {
    rows.push({ label: rush.name, detail: rush.note, cents: Math.round(rushCents) });
  }
  if (perUnit === MINIMUM_CENTS && beforeRush + rushCents < MINIMUM_CENTS) {
    rows.push({
      label: "Minimum",
      detail: "Floor price for a single part",
      cents: Math.round(MINIMUM_CENTS - beforeRush - rushCents),
    });
  }

  const notes: string[] = [];
  if (oversize) {
    notes.push(
      `At ${Math.round(scale * 100)}% this is ${bboxMm
        .map((mm) => Math.round(mm))
        .join(" × ")}mm — larger than one bed. We print it in sections and join them.`,
    );
  }
  if (infill >= 0.6) {
    notes.push("Above 60% infill you are mostly buying material. 25% is rigid for most parts.");
  }
  if (layerMm <= 0.08) {
    notes.push("80µm quadruples the layer count. Worth it for relief; wasted on a smooth form.");
  }
  if (bboxMm.some((mm) => mm < 6)) {
    notes.push("One dimension is under 6mm. Thin features may not survive removal from the bed.");
  }

  return {
    unitCents,
    totalCents,
    volumeCm3,
    materialVolumeCm3,
    massG,
    bboxMm,
    hours,
    rows,
    discount,
    oversize,
    notes,
  };
}

export const SETUP_FEE_CENTS = SETUP_CENTS;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTriangles(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1000) return `${Math.round(count / 1000)}k`;
  return String(count);
}
