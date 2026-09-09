"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Plate } from "@/components/ui/plate";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { InquiryForm } from "@/components/forms/inquiry";
import {
  DimensionsField,
  FileField,
  NumberField,
  SelectField,
} from "@/components/forms/fields";
import { serviceName, type Service, type PlateKind } from "@/lib/services";

/* Six identical drawings would read as a rendering bug, so the gallery walks
   the whole set of figures rather than repeating the service's own. */
const FIGURES: PlateKind[] = ["grid", "stack", "solid", "wave", "lattice", "orbit", "weave"];

function galleryKind(own: PlateKind, i: number) {
  const start = FIGURES.indexOf(own);
  return FIGURES[(start + i) % FIGURES.length];
}

/**
 * One layout, seven services. Each page states the number, the discipline
 * and the scope in the same order, so a visitor comparing two of them is
 * comparing the work rather than re-learning a layout.
 */
export function ServiceDetail({
  service,
  next,
}: {
  service: Service;
  next: Service;
}) {
  return (
    <main id="main">
      {/* Statement */}
      <section className="slab-ink relative overflow-hidden pb-20 pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="grid-rails" aria-hidden />
        <div className="shell relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:gap-20">
          <div>
            <Reveal immediate y={10}>
              <p className="marker tag-sm">
                <span>{service.number} / {service.discipline}</span>
              </p>
            </Reveal>

            <Lines
              as="h1"
              immediate
              delay={0.12}
              className="d1 mt-8 max-w-[11ch]"
              lines={[
                <Fragment key="a">{service.titleTop}</Fragment>,
                <span className="text-gold" key="b">
                  {service.titleBottom}
                </span>,
              ]}
            />

            <Reveal immediate delay={0.5} className="mt-10">
              <p className="lede max-w-xl">{service.detail}</p>
            </Reveal>

            <Reveal immediate delay={0.6} className="mt-10">
              <Magnetic strength={0.22}>
                <a href="#inquiry" className="btn btn-solid">
                  Start this brief
                </a>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal immediate delay={0.35}>
            <Plate
              kind={service.plate}
              className="aspect-4/5 w-full"
              label={service.discipline}
              index={service.number}
            />
          </Reveal>
        </div>
      </section>

      {/* Scope */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <Reveal>
              <p className="marker tag-sm">
                <span>Scope</span>
              </p>
              <p className="d4 mt-6 max-w-[12ch]">What sits inside this practice.</p>
            </Reveal>
          </div>

          <Stagger className="grid sm:grid-cols-2" stagger={0.06}>
            {service.scope.map((item, i) => (
              <StaggerItem key={item}>
                <div className="group flex items-baseline gap-5 border-t border-line py-6 transition-colors duration-500 hover:border-accent">
                  <span className="tag-sm text-faint transition-colors duration-500 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[16px] leading-snug text-fg">{item}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Evidence */}
      <section className="slab-ink py-20 md:py-28">
        <div className="shell">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <Reveal>
              <p className="marker tag-sm">
                <span>Selected output</span>
              </p>
              <p className="d3 mt-6 max-w-[16ch]">
                The shapes this work <span className="thin text-gold">takes</span>.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="max-w-xs text-[14px] leading-snug text-muted">
                Case studies are being photographed. Until then, each slot names a real category of
                work this practice delivers.
              </p>
            </Reveal>
          </div>

          <Stagger
            className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.07}
          >
            {service.gallery.map((item, i) => (
              <StaggerItem key={item}>
                <Plate
                  kind={galleryKind(service.plate, i)}
                  variant={i + 1}
                  className="aspect-4/5"
                  label={item}
                  index={String(i + 1).padStart(2, "0")}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Inquiry */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <Reveal>
              <p className="marker tag-sm">
                <span>Inquiry</span>
              </p>
              <p className="d3 mt-6 max-w-[12ch]">
                Brief us on <span className="thin text-gold">{service.titleBottom}</span>.
              </p>
              <p className="lede mt-6 max-w-sm">
                These questions are specific to this service, so the first reply can be useful
                rather than a request for more information.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <InquiryForm
              submitLabel={`Send ${serviceName(service).toLowerCase()} inquiry`}
              note="No account required. This form is a prototype and does not transmit yet."
            >
              {service.fields.map((field) => {
                switch (field.type) {
                  case "select":
                    return (
                      <SelectField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        options={field.options}
                      />
                    );
                  case "number":
                    return <NumberField key={field.name} name={field.name} label={field.label} />;
                  case "dimensions":
                    return <DimensionsField key="dimensions" className="sm:col-span-2" />;
                  case "file":
                    return (
                      <FileField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        accept={field.accept}
                        hint={field.hint}
                        maxBytes={field.maxBytes}
                        className="sm:col-span-2"
                      />
                    );
                }
              })}
            </InquiryForm>
          </Reveal>
        </div>
      </section>

      {/* Next */}
      <section className="border-t border-line">
        <Link
          href={`/services/${next.slug}`}
          className="group block py-20 transition-colors duration-500 hover:bg-surface md:py-28"
        >
          <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="tag-sm text-faint">Next service — {next.number}</p>
              <p className="d2 mt-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                {serviceName(next)}
              </p>
            </div>
            <span className="text-5xl text-faint transition-all duration-700 group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:text-accent">
              ↗
            </span>
          </div>
        </Link>
      </section>
    </main>
  );
}
