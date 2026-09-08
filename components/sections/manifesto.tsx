"use client";

import { MarkDock, markSlotClass } from "@/components/chrome/mark-travel";
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
          <p className="relative z-10 marker tag-sm">
            <span>01 / The practice</span>
          </p>
        </Reveal>

        <TextReveal
          className="relative z-10 d2 mt-10 max-w-[16ch]"
          text="Influential work is not louder. It is clearer, better resolved, and built by people who put their name on it."
          accent={["clearer", "resolved"]}
        />

        <div className="relative mt-16 flex items-center justify-between gap-8 border-t-2 border-line pt-10">
          <Reveal className="relative z-10 min-w-0 flex-1">
            <p className="lede max-w-2xl">
              Nisir is organised less like an agency menu and more like a set of accountable
              practices. Digital systems and 3D production run out of Ontario; the Fashion Academy
              teaches hands-on craft in Addis Ababa. Different materials, one standard.
            </p>
          </Reveal>
          <MarkDock className={markSlotClass("dock")} />
        </div>
      </div>
    </section>
  );
}
