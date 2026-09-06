import Link from "next/link";
import { capabilities, capabilityName } from "@/lib/capabilities";
import { cn } from "@/lib/utils";
import { EagleMark } from "@/components/brand";
import { MaskLines, Reveal, RevealGroup } from "@/components/motion";
import { SpotlightCard } from "@/components/spotlight-card";

/** Bento spans, ordered to match the capability list. */
const spans = [
  "md:col-span-3 md:row-span-2",
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-6",
];

export function CapabilityBento() {
  return (
    <section id="capabilities" className="relative py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Reveal y={14}>
              <p className="eyebrow">Capability architecture</p>
            </Reveal>
            <MaskLines
              as="h2"
              className="display display-lg mt-6 max-w-[18ch]"
              lines={[<>Not a list of services.</>, <>A set of <span className="text-gradient-gold">practices.</span></>]}
            />
          </div>
          <Reveal delay={0.15} className="max-w-md lg:pb-3">
            <p className="text-muted">
              Each capability keeps its own page, gallery, lead, point of view and inquiry path —
              while staying visibly part of one system.
            </p>
          </Reveal>
        </div>

        <RevealGroup
          className="mt-14 grid gap-3 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)]"
          stagger={0.07}
        >
          {capabilities.map((capability, index) => {
            const feature = index === 0;
            const wide = index === 6;

            return (
              <SpotlightCard
                key={capability.slug}
                className={cn("card rounded-2xl", spans[index])}
              >
                <Link
                  href={`/capabilities/${capability.slug}`}
                  className="relative z-10 flex h-full flex-col justify-between gap-10 p-6 md:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="label text-[10px] text-accent">{capability.number}</span>
                    <span className="text-lg text-subtle transition-all duration-500 group-hover/spot:-translate-y-1 group-hover/spot:translate-x-1 group-hover/spot:text-accent">
                      ↗
                    </span>
                  </div>

                  <div className={cn(wide && "md:flex md:items-end md:justify-between md:gap-10")}>
                    <div>
                      <h3
                        className={cn(
                          "display",
                          feature ? "text-4xl md:text-5xl" : "text-2xl md:text-[28px]",
                        )}
                      >
                        {capabilityName(capability)}
                      </h3>
                      <p
                        className={cn(
                          "mt-3 text-muted",
                          feature ? "max-w-sm text-base" : "text-sm",
                        )}
                      >
                        {capability.blurb}
                      </p>
                    </div>

                    {(feature || wide) && (
                      <ul className="mt-6 flex flex-wrap gap-2 md:mt-0">
                        {capability.scope.slice(0, feature ? 4 : 3).map((item) => (
                          <li
                            key={item}
                            className="rounded-full border border-line px-3 py-1.5 text-[11px] text-subtle"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>

                {feature ? (
                  <EagleMark
                    className="pointer-events-none absolute -bottom-8 -right-6 w-40 opacity-[0.07] transition-transform duration-700 group-hover/spot:-translate-y-2 group-hover/spot:rotate-3"
                  />
                ) : null}
              </SpotlightCard>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
