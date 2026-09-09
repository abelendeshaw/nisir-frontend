"use client";

import { Fragment, useRef } from "react";
import { Beam, BeamNode } from "@/components/ui/beam";
import { Lines, Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Ticker } from "@/components/ui/ticker";
import { locations, stats } from "@/lib/site";

/**
 * Two studios, one practice. The signal running between the nodes is the whole
 * argument of this section — Ontario and Addis Ababa are not two offices, they
 * are one loop: systems out, craft back.
 */
export function Footprint() {
  const container = useRef<HTMLDivElement>(null);
  const west = useRef<HTMLDivElement>(null);
  const east = useRef<HTMLDivElement>(null);

  return (
    <section className="slab-ink relative overflow-hidden py-24 md:py-36">
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Reveal>
              <p className="marker tag-sm">
                <span>04 / Footprint</span>
              </p>
            </Reveal>
            <Lines
              as="h2"
              className="d2 mt-8 max-w-[14ch]"
              lines={[
                <Fragment key="a">Two grounds,</Fragment>,
                <Fragment key="b">
                  one <span className="thin text-gold">practice</span>.
                </Fragment>,
              ]}
            />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-xs text-[15px] text-muted">
              Digital and dimensional production runs from Ontario. The Fashion Academy teaches in
              Addis Ababa. Each keeps the other honest.
            </p>
          </Reveal>
        </div>

        {/* The link */}
        <div
          ref={container}
          className="relative mt-20 grid gap-14 md:mt-28 md:grid-cols-2 md:gap-24"
        >
          <Beam
            containerRef={container}
            fromRef={west}
            toRef={east}
            curvature={-96}
            duration={4}
            className="hidden md:block"
          />

          {locations.map((place, i) => (
            <Reveal key={place.id} delay={i * 0.12}>
              <div className="relative">
                <div className="mb-8 flex items-center gap-4">
                  <BeamNode ref={i === 0 ? west : east} />
                  <span className="tag-sm text-accent">{place.role}</span>
                </div>

                <h3 className="d2">{place.city}</h3>
                <p className="tag mt-4 text-faint">{place.country}</p>

                <p className="lede mt-8 max-w-sm border-t-2 border-line pt-6">{place.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The count */}
        <Stagger className="mt-20 grid gap-px border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="border-b border-line py-8 pr-6 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <p className="d3 text-fg">
                  <Ticker value={stat.value} suffix={stat.suffix} plain={"plain" in stat} />
                </p>
                <p className="mt-4 max-w-[22ch] text-[14px] leading-snug text-muted">
                  {stat.label}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

