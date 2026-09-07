import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIndex } from "@/components/sections/service-index";
import { Cta } from "@/components/sections/cta";
import { Plate } from "@/components/ui/plate";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { services, serviceName } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Seven services under one standard: web, apps, graphic design, motion, 3D modelling, 3D printing and the Nisir Fashion Academy.",
};

const disciplines = [
  {
    name: "Digital",
    note: "Systems people use every day — built to stay maintainable after we leave.",
  },
  { name: "Brand", note: "The language a business is recognised by, in stillness and in motion." },
  { name: "Matter", note: "Geometry that has to survive contact with a machine and a material." },
  { name: "Education", note: "Craft passed on in person, in Addis Ababa." },
];

export default function ServicesPage() {
  return (
    <main id="main">
      <section className="slab-ink relative overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(56px,12vh,140px))]">
        <div className="grid-rails" aria-hidden />
        <div className="shell relative">
          <Reveal immediate y={10}>
            <p className="marker tag-sm">
              <span>Services</span>
              <span className="text-faint">01 — 07</span>
            </p>
          </Reveal>
          <Lines
            as="h1"
            immediate
            delay={0.12}
            className="d1 mt-8 max-w-[12ch]"
            lines={[<>Seven ways</>, <>to make it <span className="thin text-gold">real</span>.</>]}
          />
          <Reveal immediate delay={0.5} className="mt-10">
            <p className="lede max-w-xl">
              Pick the one you need and brief it directly — each service carries its own
              questions, its own lead, and its own definition of done.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="shell">
          <ServiceIndex />
        </div>
      </section>

      {/* Grouped by material, not by department. */}
      <section className="slab-ink py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <p className="marker tag-sm">
              <span>Grouped by material</span>
            </p>
          </Reveal>

          <div className="mt-14 flex flex-col gap-16">
            {disciplines.map((discipline) => {
              const group = services.filter((item) => item.discipline === discipline.name);
              return (
                <div key={discipline.name}>
                  <div className="flex flex-col gap-3 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
                    <h2 className="d3">{discipline.name}</h2>
                    <p className="max-w-sm text-[14px] leading-snug text-muted">
                      {discipline.note}
                    </p>
                  </div>

                  <Stagger
                    className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    stagger={0.07}
                  >
                    {group.map((item) => (
                      <StaggerItem key={item.slug}>
                        <Link
                          href={`/services/${item.slug}`}
                          className="group block"
                        >
                          <Plate
                            kind={item.plate}
                            className="aspect-4/5 transition-colors duration-500 group-hover:border-accent"
                            index={item.number}
                          />
                          <p className="mt-4 text-[15px] text-fg transition-colors duration-300 group-hover:text-accent">
                            {serviceName(item)}
                          </p>
                          <p className="mt-1.5 text-[13px] leading-snug text-muted">
                            {item.blurb}
                          </p>
                        </Link>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Cta
        eyebrow="Not sure which"
        lines={[<>Describe the</>, <>problem <span className="thin text-gold">instead</span>.</>]}
        action="Send a general inquiry"
      />
    </main>
  );
}
