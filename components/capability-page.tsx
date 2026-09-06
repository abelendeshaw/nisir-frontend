import Link from "next/link";
import type { Capability } from "@/lib/capabilities";
import { capabilityName } from "@/lib/capabilities";
import { cn } from "@/lib/utils";
import { EagleMark } from "@/components/brand";
import { SkyScene } from "@/components/sky";
import { Magnetic, MaskLines, Reveal, RevealGroup } from "@/components/motion";
import { SpotlightCard } from "@/components/spotlight-card";
import { CapabilityFields } from "@/components/form-fields";
import { InquiryForm } from "@/components/inquiry-form";

const steps = [
  { n: "01", title: "Frame", body: "Context, constraints, users, desired outcome." },
  { n: "02", title: "Define", body: "The brief, the system, the decisions that matter." },
  { n: "03", title: "Make", body: "Deliberate iteration against the frame we set." },
  { n: "04", title: "Resolve", body: "Details, delivery, and use in the real world." },
];

/** Gallery tiles alternate size so the grid reads like a contact sheet. */
const tileSpans = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
];

export function CapabilityPage({ capability, next }: { capability: Capability; next: Capability }) {
  const name = capabilityName(capability);
  const nextName = capabilityName(next);

  return (
    <main id="top">
      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[86svh] flex-col justify-end overflow-hidden pb-14 pt-36">
        <SkyScene compact />

        <div className="shell relative">
          <Reveal immediate y={14}>
            <p className="eyebrow">Capability {capability.number}</p>
          </Reveal>

          <MaskLines
            immediate
            className="display display-xl mt-7 max-w-[13ch]"
            delay={0.12}
            lines={[
              <>{capability.titleTop}</>,
              <span key="bottom" className="text-gradient-gold">
                {capability.titleBottom}
              </span>,
            ]}
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <Reveal immediate delay={0.45} y={20}>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                {capability.blurb} {capability.detail}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Magnetic>
                  <a href="#inquiry" className="btn btn-solid">
                    Start an inquiry ↗
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href="#gallery" className="btn">
                    View gallery ↓
                  </a>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal immediate delay={0.6} y={20} className="lg:pb-2">
              <dl className="flex gap-10">
                <div>
                  <dt className="label text-[9px] text-subtle">Capability</dt>
                  <dd className="display mt-2 text-4xl text-accent">{capability.number}</dd>
                </div>
                <div>
                  <dt className="label text-[9px] text-subtle">Scope areas</dt>
                  <dd className="display mt-2 text-4xl text-accent">
                    {String(capability.scope.length).padStart(2, "0")}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- scope */}
      <section className="py-24 md:py-32">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal y={14}>
              <p className="eyebrow">What this practice owns</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display display-md mt-6 max-w-[14ch]">
                A focused capability, inside{" "}
                <span className="text-gradient-gold">one studio.</span>
              </h2>
            </Reveal>
          </div>

          <div>
            <Reveal delay={0.15}>
              <p className="max-w-2xl text-lg leading-relaxed text-muted">{capability.detail}</p>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-px sm:grid-cols-2" stagger={0.06}>
              {capability.scope.map((item, index) => (
                <div
                  key={item}
                  className="group flex items-baseline gap-4 border-t border-line py-5 transition-colors duration-500 hover:border-accent"
                >
                  <span className="label text-[10px] text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] transition-transform duration-500 group-hover:translate-x-1">
                    {item}
                  </span>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- gallery */}
      <section id="gallery" className="relative overflow-hidden bg-bg-deep py-24 md:py-32">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Reveal y={14}>
                <p className="eyebrow">Selected gallery</p>
              </Reveal>
              <MaskLines
                as="h2"
                className="display display-lg mt-6 max-w-[14ch]"
                lines={[<>Work, studies &</>, <><span className="text-gradient-gold">proof of craft.</span></>]}
              />
            </div>
            <Reveal delay={0.15} className="max-w-sm lg:pb-3">
              <p className="text-muted">
                Designed placeholders — swap each slot for real case-study imagery, prototypes or
                student work. No fabricated client claims here.
              </p>
            </Reveal>
          </div>

          <RevealGroup
            className="mt-14 grid gap-3 md:grid-cols-6 md:auto-rows-[minmax(190px,1fr)]"
            stagger={0.07}
          >
            {capability.gallery.map((label, index) => (
              <SpotlightCard
                key={label}
                className={cn("card sheen group/tile rounded-2xl", tileSpans[index])}
              >
                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  <span className="label text-[10px] text-subtle">
                    Slot {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "display transition-transform duration-700 group-hover/tile:-translate-y-1",
                      index === 0 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
                    )}
                  >
                    {label}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-700 group-hover/tile:opacity-100"
                  style={{
                    background:
                      index % 2 === 0
                        ? "radial-gradient(70% 60% at 80% 10%, color-mix(in srgb, var(--accent-bright) 12%, transparent), transparent 70%)"
                        : "radial-gradient(60% 70% at 15% 90%, color-mix(in srgb, var(--accent-bright) 10%, transparent), transparent 72%)",
                  }}
                />
                <EagleMark
                  className={cn(
                    "pointer-events-none absolute opacity-[0.05] transition-transform duration-700 group-hover/tile:scale-105",
                    index === 0 ? "-bottom-10 -right-8 w-52" : "-bottom-6 -right-6 w-28",
                  )}
                />
              </SpotlightCard>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ------------------------------------------------------- process */}
      <section className="py-24 md:py-32">
        <div className="shell">
          <Reveal y={14}>
            <p className="eyebrow">Working method</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display display-md mt-6">
              Clarity before <span className="text-gradient-gold">output.</span>
            </h2>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {steps.map((step) => (
              <div key={step.n} className="group border-t border-line pt-6 transition-colors duration-500 hover:border-accent">
                <span className="display text-4xl text-accent">{step.n}</span>
                <h3 className="mt-10 text-lg font-medium">{step.title}</h3>
                <p className="mt-3 max-w-[30ch] text-sm text-muted">{step.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* --------------------------------------------------------- owner */}
      <section className="py-24 md:py-32">
        <div className="shell">
          <Reveal y={14}>
            <p className="eyebrow">Capability ownership</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display display-md mt-6 max-w-[16ch]">
              The person accountable for the <span className="text-gradient-gold">craft.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            <SpotlightCard className="card rounded-3xl">
              <div className="relative z-10 grid gap-10 p-8 md:grid-cols-[280px_1fr] md:p-12">
                <div className="relative grid aspect-4/5 place-items-center overflow-hidden rounded-2xl bg-navy">
                  <div className="absolute size-[62%] rounded-full border border-gold/50" />
                  <span className="display text-8xl text-ivory/90">?</span>
                  <EagleMark
                    alwaysGold
                    className="pointer-events-none absolute -bottom-6 -right-6 w-32 opacity-10"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="label text-[10px] text-accent">{name} · Capability lead</p>
                  <h3 className="display mt-4 text-4xl md:text-5xl">Add owner name</h3>
                  <p className="mt-6 max-w-xl text-muted">
                    This block is ready for the real person who owns the capability: background,
                    point of view, specialties, and the standard they hold across Nisir Designs.
                  </p>
                  <p className="mt-4 max-w-xl text-sm text-subtle">
                    The brief defines the capability but names no individual owners, so nothing has
                    been invented here.
                  </p>
                  <span className="label mt-8 inline-flex w-fit rounded-full border border-dashed border-line-strong px-4 py-2 text-[9px] text-subtle">
                    Edit in lib/capabilities.ts
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- inquiry */}
      {/* overflow-hidden would break the sticky inquiry copy column. */}
      <section id="inquiry" className="relative bg-bg-deep py-24 md:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(50% 40% at 88% 0%, var(--glow), transparent 65%)" }}
        />
        <div className="shell relative grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal y={14}>
              <p className="eyebrow">Specific inquiry</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display display-md mt-6 max-w-[12ch]">
                Talk directly to <span className="text-gradient-gold">this practice.</span>
              </h2>
              <p className="mt-6 max-w-sm text-muted">
                Scoped to {name}. Baseline contact details, plus the questions that actually
                qualify this kind of work.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <InquiryForm submitLabel={`Send ${name} inquiry ↗`}>
              <CapabilityFields fields={capability.fields} />
            </InquiryForm>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- next */}
      <section className="py-16 md:py-24">
        <div className="shell">
          <Link
            href={`/capabilities/${next.slug}`}
            className="group flex flex-col gap-6 border-t border-line pt-10 transition-colors duration-500 hover:border-accent sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <span className="label text-[10px] text-subtle">
                Next capability · {next.number}
              </span>
              <p className="display display-md mt-4 transition-transform duration-700 group-hover:translate-x-2">
                {nextName}
              </p>
            </div>
            <span className="text-4xl text-accent transition-transform duration-700 group-hover:-translate-y-1 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
