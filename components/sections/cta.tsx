"use client";

import Link from "next/link";
import { Lines, Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { Mark } from "@/components/chrome/mark";
import { site } from "@/lib/site";

/** The last thing on every page: one line, one address, one door. */
export function Cta({
  eyebrow = "Next",
  lines,
  href = "/contact",
  action = "Start a project",
}: {
  eyebrow?: string;
  lines?: React.ReactNode[];
  href?: string;
  action?: string;
}) {
  return (
    <section className="slab-bone relative isolate overflow-hidden py-28 md:py-40">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[22%] left-1/2 block w-[120vw] max-w-[1200px] -translate-x-1/2 text-ink/[0.06] md:w-[70vw]"
      >
        <Mark className="w-full" />
      </span>
      <div className="shell relative text-center">
        <Reveal>
          <p className="marker tag-sm justify-center [&::before]:hidden">
            <span>{eyebrow}</span>
          </p>
        </Reveal>

        <Lines
          as="h2"
          className="d1 mx-auto mt-8 max-w-[14ch]"
          lines={
            lines ?? [
              <>Bring us the</>,
              <>
                hard <span className="thin text-gold">half</span>.
              </>,
            ]
          }
        />

        <Reveal delay={0.25} className="mt-14 flex flex-wrap items-center justify-center gap-5">
          <Magnetic strength={0.3}>
            <Link href={href} className="btn btn-solid h-16 px-10">
              {action}
            </Link>
          </Magnetic>
          <a href={`mailto:${site.email}`} className="ul text-[15px] text-muted hover:text-accent">
            {site.email}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
