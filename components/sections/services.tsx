"use client";

import { ServiceIndex } from "@/components/sections/service-index";
import { Lines, Reveal } from "@/components/ui/reveal";
import { ArrowLink } from "@/components/ui/links";

/** The seven, as an index of full-bleed rules. */
export function Services() {
  return (
    <section id="services" className="slab-ink relative py-20 md:py-28">
      <div className="bleed mb-12 md:mb-16">
        <div>
          <Reveal>
            <p className="marker tag-sm">
              <span>02 / Services</span>
              <span className="text-faint">01 — 07</span>
            </p>
          </Reveal>
          <Lines
            as="h2"
            className="d1 mt-7 max-w-[14ch]"
            lines={[<>Everything we</>, <>actually <span className="thin text-gold">make</span></>]}
          />
        </div>
        <Reveal delay={0.15} className="mt-8">
          <ArrowLink href="/services" className="tag">
            All services
          </ArrowLink>
        </Reveal>
      </div>

      <ServiceIndex />
    </section>
  );
}
