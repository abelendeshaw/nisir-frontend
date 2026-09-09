"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { Chip, Flash, OptionGroup, Slider, Stat, Stepper } from "@/components/shop/bits";
import { Magnetic } from "@/components/ui/magnetic";
import { money } from "@/lib/shop/format";
import { finishes, materialById, materials, type FinishId, type MaterialId } from "@/lib/shop/catalog";
import { rushTiers, type RushId } from "@/lib/shop/pricing";
import { BUILD_VOLUME_MM, layerOptions, quote, SETUP_FEE_CENTS } from "@/lib/shop/quote";
import { ACCEPTED, disposeModel, loadModelFile, MAX_BYTES, type LoadedModel } from "@/lib/shop/mesh";
import { openCart, useCart } from "@/lib/shop/store";
import { uploadCustomModel } from "@/app/actions/orders";
import { cn } from "@/lib/utils";

/**
 * The customiser.
 *
 * Two halves that argue with each other: a bed on the left showing what the
 * machine will actually be asked to do, and the controls on the right that
 * change it. The price between them is not a lookup — it is grams, hours,
 * bench time and queue position, recomputed on every drag (see
 * `lib/shop/quote.ts`), which is why moving the scale slider to 140% raises
 * the number by more than 40%.
 *
 * The model is parsed in the browser by three-stdlib's loaders and measured
 * locally — nothing is uploaded to *price* it, so the number keeps up with the
 * sliders. The file is sent once, on "add to cart", where nisir-backend
 * measures it again and that reading becomes the price the order is placed at.
 */

const ModelViewer = dynamic(() => import("@/components/shop/custom/viewer"), {
  ssr: false,
  loading: () => <ViewerFallback line="Loading the viewer…" />,
});

export function Customiser() {
  const cart = useCart();
  const [model, setModel] = useState<LoadedModel | null>(null);
  // `loadModelFile` keeps only the parsed geometry, so the file itself is held
  // here — it is what the print floor ultimately needs.
  const [source, setSource] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const [material, setMaterial] = useState<MaterialId>("matte-pla");
  const [finish, setFinish] = useState<FinishId>("as-printed");
  const [scale, setScale] = useState(100);
  const [infill, setInfill] = useState(25);
  const [layerMm, setLayerMm] = useState(0.12);
  const [rush, setRush] = useState<RushId>("standard");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const [wireframe, setWireframe] = useState(false);
  const [spin, setSpin] = useState(true);

  // Loaders allocate megabytes of buffers; a session of trying six models
  // should not keep all six.
  const previous = useRef<LoadedModel | null>(null);
  useEffect(() => {
    if (previous.current && previous.current !== model) disposeModel(previous.current.geometries);
    previous.current = model;
  }, [model]);
  useEffect(() => () => {
    if (previous.current) disposeModel(previous.current.geometries);
  }, []);

  const take = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setReading(true);
    setError(null);
    try {
      const loaded = await loadModelFile(file);
      setModel(loaded);
      setSource(file);
      setScale(100);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That file could not be read.");
      setModel(null);
      setSource(null);
    } finally {
      setReading(false);
    }
  }, []);

  if (!model) {
    return <Dropzone onFile={take} reading={reading} error={error} />;
  }

  const swatch = materialById.get(material)!;
  const q = quote({
    volumeCm3: model.stats.volumeCm3,
    bboxMm: model.stats.bboxMm,
    triangles: model.stats.triangles,
    material,
    finish,
    scale: scale / 100,
    infill: infill / 100,
    layerMm,
    rush,
    qty,
  });

  // Setup is charged once per run, so the cart carries it amortised into the
  // unit — otherwise changing quantity in the cart would silently re-quote.
  const perUnit = Math.round(q.totalCents / qty / 100) * 100;
  const runTotal = perUnit * qty;

  async function addToCart() {
    if (!model || !source) return;

    // The one upload, at the one moment it is needed. Until this point the
    // file has never left the tab.
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append("file", source, source.name);
    const uploaded = await uploadCustomModel(form);

    setUploading(false);
    if (!uploaded.ok) {
      setError(uploaded.message);
      return;
    }

    cart.add({
      id: `custom:${model.fileName}:${material}:${finish}:${scale}:${infill}:${layerMm}:${rush}`,
      kind: "custom",
      slug: "custom",
      name: model.fileName.replace(/\.[^.]+$/, ""),
      line: `Printed to order — ${swatch.name}`,
      relic: "mesh",
      unitCents: perUnit,
      qty,
      digital: false,
      options: [
        { label: "Material", value: swatch.name },
        { label: "Finish", value: finishes.find((entry) => entry.id === finish)?.name ?? "" },
        { label: "Scale", value: `${scale}%` },
        { label: "Infill", value: `${infill}%` },
        { label: "Layer", value: `${layerMm.toFixed(2)}mm` },
        { label: "Queue", value: rushTiers.find((entry) => entry.id === rush)?.name ?? "" },
      ],
      custom: {
        fileName: model.fileName,
        fileId: uploaded.fileId,
        material,
        finish,
        bboxMm: q.bboxMm,
        volumeCm3: q.volumeCm3,
        triangles: model.stats.triangles,
        scale: scale / 100,
        infill: infill / 100,
        layerMm,
        rush,
        estimatedHours: q.hours,
        note,
      },
    });
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 2600);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
      {/* The bed. */}
      <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+20px)] lg:self-start">
        <div className="relative aspect-4/3 w-full overflow-hidden border-2 border-line bg-surface">
          <ModelViewer
            geometries={model.geometries}
            height={model.stats.bboxMm[2]}
            scale={scale / 100}
            colour={swatch.preview.color}
            roughness={swatch.preview.roughness}
            metalness={swatch.preview.metalness}
            wireframe={wireframe}
            spin={spin}
            oversize={q.oversize}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
            <p className="tag-sm text-muted">
              Bed {BUILD_VOLUME_MM[0]} × {BUILD_VOLUME_MM[1]} × {BUILD_VOLUME_MM[2]}mm
            </p>
            {q.oversize && <p className="tag-sm text-accent">Exceeds one bed</p>}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="tag-sm text-muted">
              {q.bboxMm.map((mm) => Math.round(mm)).join(" × ")}mm
            </p>
            <div className="flex items-center gap-5">
              <Toggle on={spin} onClick={() => setSpin(!spin)}>
                Rotate
              </Toggle>
              <Toggle on={wireframe} onClick={() => setWireframe(!wireframe)}>
                Wireframe
              </Toggle>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="min-w-0 text-[13px] text-muted">
            <span className="text-fg">{model.fileName}</span>
            <span className="text-faint">
              {" "}
              · {(model.fileSize / 1_048_576).toFixed(1)}MB ·{" "}
              {model.stats.triangles.toLocaleString("en-US")} triangles
            </span>
          </p>
          <label className="tag-sm ul cursor-pointer text-muted transition-colors hover:text-accent">
            Replace model
            <input
              type="file"
              accept={ACCEPTED}
              className="sr-only"
              onChange={(event) => take(event.target.files?.[0])}
            />
          </label>
        </div>

        {!model.stats.watertight && (
          <p className="mt-4 border-l-2 border-accent pl-4 text-[13px] leading-relaxed text-muted">
            This mesh has open edges, so its enclosed volume is an estimate and the quote with it.
            We repair the shell before printing and confirm the price if repairing moves it.
          </p>
        )}
      </div>

      {/* The controls. */}
      <div className="flex min-w-0 flex-col gap-9">
        <OptionGroup label="Material">
          <div className="grid gap-2 sm:grid-cols-2">
            {materials.map((entry) => (
              <Chip
                key={entry.id}
                selected={material === entry.id}
                onClick={() => setMaterial(entry.id)}
                swatch={entry.swatch}
                note={`$${(entry.pricePerKgCents / 100).toFixed(0)}/kg · ${entry.densityGPerCm3}g/cm³`}
              >
                {entry.name}
              </Chip>
            ))}
          </div>
        </OptionGroup>

        <Slider
          label="Scale"
          value={scale}
          onChange={setScale}
          min={25}
          max={400}
          step={5}
          format={(value) => `${value}%`}
          hint="Material goes as the cube of this. Doubling the size is roughly eight times the plastic."
        />

        <Slider
          label="Infill"
          value={infill}
          onChange={setInfill}
          min={5}
          max={100}
          step={5}
          format={(value) => `${value}%`}
          hint="Walls and skins print solid regardless. 25% is rigid for almost anything decorative."
        />

        <OptionGroup label="Layer height">
          <div className="grid gap-2 sm:grid-cols-2">
            {layerOptions.map((entry) => (
              <Chip
                key={entry.mm}
                selected={layerMm === entry.mm}
                onClick={() => setLayerMm(entry.mm)}
                note={entry.note}
              >
                {entry.name}
              </Chip>
            ))}
          </div>
        </OptionGroup>

        <OptionGroup label="Finish">
          <div className="grid gap-2 sm:grid-cols-2">
            {finishes.map((entry) => (
              <Chip
                key={entry.id}
                selected={finish === entry.id}
                onClick={() => setFinish(entry.id)}
                note={entry.note}
              >
                {entry.name}
              </Chip>
            ))}
          </div>
        </OptionGroup>

        <OptionGroup label="Queue">
          <div className="grid gap-2 sm:grid-cols-3">
            {rushTiers.map((entry) => (
              <Chip
                key={entry.id}
                selected={rush === entry.id}
                onClick={() => setRush(entry.id)}
                note={entry.note}
              >
                {entry.name}
              </Chip>
            ))}
          </div>
        </OptionGroup>

        <div className="group">
          <label htmlFor="custom-note" className="tag-sm block text-faint group-focus-within:text-accent">
            Anything we should know
          </label>
          <div className="relative mt-3">
            <textarea
              id="custom-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Orientation, which faces matter, what it has to fit."
              className="w-full resize-none bg-transparent pb-3 text-[15px] text-fg outline-none placeholder:text-faint"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-x-100" />
          </div>
        </div>

        <QuotePanel
          rows={q.rows}
          perUnit={perUnit}
          runTotal={runTotal}
          qty={qty}
          onQty={setQty}
          discount={q.discount}
          hours={q.hours}
          massG={q.massG}
          volumeCm3={q.volumeCm3}
          notes={q.notes}
          onAdd={addToCart}
          uploading={uploading}
          added={added}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ the quote -- */

function QuotePanel({
  rows,
  perUnit,
  runTotal,
  qty,
  onQty,
  discount,
  hours,
  massG,
  volumeCm3,
  notes,
  onAdd,
  uploading,
  added,
}: {
  rows: { label: string; detail: string; cents: number }[];
  perUnit: number;
  runTotal: number;
  qty: number;
  onQty: (next: number) => void;
  discount: number;
  hours: number;
  massG: number;
  volumeCm3: number;
  notes: string[];
  onAdd: () => void;
  uploading: boolean;
  added: boolean;
}) {
  return (
    <div className="border-2 border-line bg-surface p-7 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <p className="tag-sm text-faint">Quote</p>
        <p className="tag-sm text-accent">Live</p>
      </div>

      <motion.p
        key={perUnit}
        initial={{ opacity: 0.35, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="d3 mt-6 tabular-nums text-fg"
      >
        {money(perUnit)}
        <span className="tag-sm ml-3 align-middle text-faint">each</span>
      </motion.p>

      <dl className="mt-8 flex flex-col gap-3.5 border-t border-line pt-7">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-5">
            <dt className="min-w-0">
              <span className="text-[14px] text-muted">{row.label}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-faint">{row.detail}</span>
            </dt>
            <dd className="shrink-0 text-[14px] tabular-nums text-fg">{money(row.cents)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-5">
          <dt className="min-w-0">
            <span className="text-[14px] text-muted">Setup</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-faint">
              Levelling, slicing and the first layer — once per run
            </span>
          </dt>
          <dd className="shrink-0 text-[14px] tabular-nums text-fg">{money(SETUP_FEE_CENTS)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex items-baseline justify-between gap-5">
            <dt className="text-[14px] text-accent">Run of {qty}</dt>
            <dd className="shrink-0 text-[14px] tabular-nums text-accent">
              −{Math.round(discount * 100)}%
            </dd>
          </div>
        )}
      </dl>

      <dl className="mt-8 grid grid-cols-3 gap-5 border-t border-line pt-7">
        <Stat label="Material" value={`${massG.toFixed(0)}g`} />
        <Stat label="Volume" value={`${volumeCm3.toFixed(1)}cm³`} />
        <Stat label="Machine" value={`${hours.toFixed(1)}h`} />
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t-2 border-line pt-7">
        <Stepper value={qty} onChange={onQty} label="Quantity" max={250} />
        <Magnetic strength={0.2}>
          <button
            type="button"
            onClick={onAdd}
            disabled={uploading}
            className="btn btn-solid disabled:opacity-60"
          >
            {uploading ? "Sending the model…" : added ? "Added" : `Add — ${money(runTotal)}`}
          </button>
        </Magnetic>
      </div>

      <Flash show={added}>In the cart — quantity is fixed to this quote.</Flash>

      {notes.length > 0 && (
        <ul className="mt-7 flex flex-col gap-3 border-t border-line pt-7">
          {notes.map((entry) => (
            <li key={entry} className="border-l-2 border-accent pl-4 text-[13px] leading-relaxed text-muted">
              {entry}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- upload -- */

function Dropzone({
  onFile,
  reading,
  error,
}: {
  onFile: (file: File | undefined) => void;
  reading: boolean;
  error: string | null;
}) {
  const [over, setOver] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          onFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-6 border-2 border-dashed px-8 py-24 text-center transition-colors duration-300 md:py-32",
          over ? "border-accent bg-accent/5" : "border-line hover:border-line-strong",
        )}
      >
        <AnimatePresence mode="wait">
          {reading ? (
            <motion.p
              key="reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="tag-sm text-accent"
            >
              Reading the mesh…
            </motion.p>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5"
            >
              <p className="d4 max-w-[16ch] text-fg">
                Drop a model, or <span className="thin text-gold underline underline-offset-8">browse</span>
              </p>
              <p className="lede max-w-md">
                STL, OBJ, 3MF or PLY, up to {Math.round(MAX_BYTES / 1_048_576)}MB. Files are read and
                measured in your browser — nothing is uploaded to get a price.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </label>

      {error && <p className="mt-5 text-[13px] text-accent">{error}</p>}

      <p className="mt-8 text-center text-[13px] leading-relaxed text-faint">
        Units are read as millimetres, which is what every slicer assumes. If your model arrives at
        the wrong size, the scale control fixes it and the price follows.
      </p>
    </div>
  );
}

function ViewerFallback({ line }: { line: string }) {
  return (
    <div className="grid size-full place-items-center">
      <p className="tag-sm text-faint">{line}</p>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "tag-sm pointer-events-auto transition-colors duration-300",
        on ? "text-accent" : "text-faint hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
