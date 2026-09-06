"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EASE, gsap, reducedMotion, useGSAP } from "@/lib/motion";

const stages = [
  {
    n: "01",
    title: "Frame",
    body: "Understand the context, constraints, users and the outcome that actually matters. Nothing gets made before the problem is stated plainly.",
    marker: "Ground",
  },
  {
    n: "02",
    title: "Define",
    body: "Shape the brief, the system and the decisions worth arguing about — direction agreed before a single pixel or millimetre is committed.",
    marker: "Climb",
  },
  {
    n: "03",
    title: "Make",
    body: "Design, build, model, animate or teach. Deliberate iteration, reviewed against the frame we set, never against taste alone.",
    marker: "Cruise",
  },
  {
    n: "04",
    title: "Resolve",
    body: "Refine the details, prepare delivery, and make the work useful in the real world — the part most studios call finished too early.",
    marker: "Approach",
  },
];

export function FlightPath() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!root.current) return;
      const steps = gsap.utils.toArray<HTMLElement>("[data-stage]", root.current);

      steps.forEach((step, index) => {
        // Each stage claims the gauge as it reaches the middle of the screen.
        gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: "top 62%",
            end: "bottom 62%",
            onToggle: ({ isActive }) => isActive && setActive(index),
          },
        });

        if (reducedMotion()) return;
        gsap.fromTo(
          step,
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: EASE,
            scrollTrigger: { trigger: step, start: "top 82%" },
          },
        );
      });

      if (reducedMotion()) return;
      gsap.fromTo(
        "[data-gauge-fill]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: root.current,
            start: "top 60%",
            end: "bottom 70%",
            scrub: 0.4,
          },
        },
      );
    },
    { scope: root },
  );

  // No overflow-hidden on the section: it would clip the sticky gauge out of
  // its scroll context and stop it sticking. The glow inside is inset-0.
  return (
    <section className="relative bg-bg-deep py-28 md:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 80% 8%, var(--glow) 0%, transparent 62%)",
          opacity: 0.5,
        }}
      />

      <div ref={root} className="shell relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Working method</p>
          <h2 className="display display-lg mt-6 max-w-[12ch]">
            The <span className="text-gradient-gold">flight path.</span>
          </h2>
          <p className="mt-6 max-w-sm text-muted">
            Clarity before output. The same four stages carry every capability, from a web
            platform to a printed prototype to a classroom in Addis.
          </p>

          {/* Altitude gauge */}
          <div className="mt-12 hidden gap-6 lg:flex">
            <div className="relative w-px bg-line">
              <div
                data-gauge-fill
                className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
              />
            </div>
            <ul className="space-y-6">
              {stages.map((stage, index) => (
                <li
                  key={stage.n}
                  className={cn(
                    "label flex items-center gap-3 text-[10px] transition-colors duration-500",
                    index === active ? "text-fg" : "text-subtle",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-all duration-500",
                      index === active ? "scale-150 bg-accent" : "bg-line-strong",
                    )}
                  />
                  {stage.n} — {stage.marker}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ol className="space-y-4">
          {stages.map((stage, index) => (
            <li
              key={stage.n}
              data-stage
              className={cn(
                "card rounded-2xl p-8 transition-all duration-700 md:p-10",
                index === active
                  ? "border-accent/40 bg-surface"
                  : "border-line opacity-70 md:opacity-55",
              )}
            >
              <div className="flex items-baseline justify-between gap-6">
                <span
                  className={cn(
                    "display text-5xl transition-colors duration-500 md:text-6xl",
                    index === active ? "text-accent" : "text-subtle",
                  )}
                >
                  {stage.n}
                </span>
                <span className="label text-[10px] text-subtle">{stage.marker}</span>
              </div>
              <h3 className="display mt-6 text-3xl md:text-4xl">{stage.title}</h3>
              <p className="mt-4 max-w-lg text-muted">{stage.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
