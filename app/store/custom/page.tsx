import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Customiser } from "@/components/shop/custom/customiser";
import { InquiryForm } from "@/components/forms/inquiry";
import { DimensionsField, FileField, NumberField, SelectField } from "@/components/forms/fields";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ArrowLink } from "@/components/ui/links";
import { BUILD_VOLUME_MM } from "@/lib/shop/quote";
import { materials } from "@/lib/shop/catalog";

export const metadata: Metadata = {
  title: "Custom printing",
  description:
    "Upload an STL, OBJ, 3MF or PLY, see it on the bed at real scale, and get a live price as you change material, infill, layer height, finish and queue position. Or describe what you need and we will model it.",
};

const steps = [
  {
    title: "Upload",
    body: "STL, OBJ, 3MF or PLY. The file is parsed and measured in your browser — enclosed volume, bounding box, triangle count, open edges. Nothing is uploaded to get a price.",
  },
  {
    title: "Customise",
    body: "Material, scale, infill, layer height, finish and queue. Each one moves grams, hours or bench time, and the quote follows in real time rather than after a form is sent.",
  },
  {
    title: "Confirm",
    body: "Add the run to the cart and check out like anything else. We repair the mesh, orient it, and come back to you if repairing it moves the number.",
  },
];

export default function CustomPage() {
  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
        <div className="grid-rails" aria-hidden />
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <Link href="/store" className="ul transition-colors hover:text-accent">
                Shop
              </Link>
              <span className="text-faint">Custom</span>
            </p>
          </Reveal>

          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[13ch]"
            lines={[
              <Fragment key="a">Your model,</Fragment>,
              <Fragment key="b">
                on our <span className="thin text-gold">bed</span>.
              </Fragment>,
            ]}
          />

          <Reveal immediate delay={0.45}>
            <p className="lede mt-9 max-w-2xl">
              Drop a file in and it appears at true scale on a {BUILD_VOLUME_MM[0]} ×{" "}
              {BUILD_VOLUME_MM[1]} × {BUILD_VOLUME_MM[2]}mm plate. The price is not a lookup — it is
              material by mass, machine time by layer count, bench time by finish, and where you sit
              in the queue.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="shell">
          <Customiser />
        </div>
      </section>

      {/* How it works, for anyone who has not dropped a file yet. */}
      <section className="slab-ink py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <p className="marker tag-sm">
              <span>Three steps</span>
            </p>
          </Reveal>

          <Stagger className="mt-10 grid gap-px border-t-2 border-line md:grid-cols-3" stagger={0.08}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="flex h-full flex-col gap-5 border-b-2 border-line py-8 md:border-b-0 md:pr-10">
                  <span className="tag-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="d4 text-fg">{step.title}</h2>
                  <p className="lede">{step.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
            <Reveal>
              <p className="d3 max-w-[12ch]">
                What we <span className="thin text-gold">print in</span>.
              </p>
            </Reveal>
            <ul className="grid gap-px border-t border-line">
              {materials.map((material) => (
                <li
                  key={material.id}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-line py-5"
                >
                  <span
                    aria-hidden
                    className="size-3 shrink-0 self-center rounded-full border border-line-strong"
                    style={{ background: material.swatch }}
                  />
                  <span className="w-40 shrink-0 text-[15px] text-fg">{material.name}</span>
                  <span className="min-w-0 flex-1 text-[14px] text-muted">{material.note}</span>
                  <span className="tag-sm shrink-0 tabular-nums text-faint">
                    ${(material.pricePerKgCents / 100).toFixed(0)}/kg
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The other lane: no model yet. */}
      <section id="request" className="py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal>
            <p className="marker tag-sm">
              <span>No model yet</span>
            </p>
            <p className="d3 mt-7 max-w-[13ch]">
              Describe it <span className="thin text-gold">instead</span>.
            </p>
            <p className="lede mt-8">
              Bring a sketch, a photograph, a broken part or a paragraph. We model it, quote the
              print against the same numbers as above, and send both back before anything is made.
            </p>
            <div className="mt-10">
              <ArrowLink href="/services/3d-modelling" className="tag">
                How the modelling works
              </ArrowLink>
            </div>
          </Reveal>

          <div>
            <InquiryForm
              submitLabel="Request a quote"
              note="Modelling and printing are quoted separately, so you can take the geometry elsewhere if you want to."
            >
              <SelectField
                name="object_kind"
                label="What is it"
                options={[
                  "A replacement part",
                  "A prototype",
                  "An object or sculpture",
                  "A fixture or jig",
                  "A run of the same thing",
                  "Not sure yet",
                ]}
              />
              <SelectField
                name="from_what"
                label="What you have"
                options={[
                  "Sketches or drawings",
                  "Photographs",
                  "The physical object",
                  "Technical drawings",
                  "Only a description",
                ]}
              />
              <DimensionsField className="sm:col-span-2" />
              <NumberField name="run_size" label="How many" />
              <SelectField
                name="material_pref"
                label="Material"
                options={[...materials.map((material) => material.name), "Advise me"]}
              />
              <FileField
                name="references"
                label="References"
                accept=".step,.stp,.stl,.obj,.3mf,.ply,image/*,application/pdf"
                hint="Sketches, photographs, drawings or an existing model. 100MB per file."
                maxBytes={104_857_600}
                className="sm:col-span-2"
              />
            </InquiryForm>
          </div>
        </div>
      </section>
    </main>
  );
}
