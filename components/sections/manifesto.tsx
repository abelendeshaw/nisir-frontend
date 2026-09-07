"use client";

import { TextReveal } from "@/components/ui/text-reveal";
import { Reveal } from "@/components/ui/reveal";

/**
 * The argument, delivered at reading speed — words light as the passage rises,
 * so the visitor sets the pace and the statement can't be skimmed past.
 */
export function Manifesto() {
  return (
    <section id="practice" className="slab-bone relative py-20 md:py-32">
      <div className="bleed">
        <Reveal>
          <p className="marker tag-sm">
            <span>01 / The practice</span>
          </p>
        </Reveal>

        <TextReveal
          className="d2 mt-10 max-w-[16ch]"
          text="Influential work is not louder. It is clearer, better resolved, and built by people who put their name on it."
          accent={["clearer", "resolved"]}
        />

        <Reveal className="mt-16 border-t-2 border-line pt-10">
          <p className="lede max-w-2xl">
            Nisir is organised less like an agency menu and more like a set of accountable
            practices. Digital systems and 3D production run out of Ontario; the Fashion Academy
            teaches hands-on craft in Addis Ababa. Different materials, one standard.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
