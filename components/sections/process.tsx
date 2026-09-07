"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Lines, Reveal } from "@/components/ui/reveal";
import { MagicCard } from "@/components/ui/surfaces";

const steps = [
  {
    n: "01",
    title: "Position",
    body: "Before anything is drawn we agree what the work has to be true about — the audience, the constraint, the one thing it must not fail at.",
    out: "Brief · Success criteria · Scope",
  },
  {
    n: "02",
    title: "Shape",
    body: "Structure first, surface second. Sitemaps, flows, geometry and typographic systems get resolved while they are still cheap to change.",
    out: "Architecture · Direction · Prototype",
  },
  {
    n: "03",
    title: "Build",
    body: "One team takes it through: interface, code, model, print, film. No handover gap where the intent quietly leaks out.",
    out: "Production · Review · QA",
  },
  {
    n: "04",
    title: "Prove",
    body: "It ships, then it earns its place — measured, iterated and documented so the next person can carry it without guessing.",
    out: "Launch · Iteration · Handbook",
  },
];

/**
 * Four cards that stack. Each one sticks to the top rail while the next slides
 * over it and pushes it slightly away — the process compresses as you read it,
 * which is exactly what a process does.
 */
export function Process() {
  return (
    <section className="slab-bone relative py-20 md:py-32">
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Reveal>
              <p className="marker tag-sm">
                <span>03 / How the work runs</span>
              </p>
            </Reveal>
            <Lines
              as="h2"
              className="d1 mt-8 max-w-[12ch]"
              lines={[<>Four moves,</>, <>every <span className="thin text-gold">time</span>.</>]}
            />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-xs text-[15px] text-muted">
              The disciplines change. The sequence does not — it is what keeps a print run and a
              product launch answerable to the same standard.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24">
          {steps.map((step, i) => (
            <Card key={step.n} index={i} total={steps.length} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  n,
  title,
  body,
  out,
  index,
  total,
}: {
  n: string;
  title: string;
  body: string;
  out: string;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.32", "end 0.1"] });
  // Cards recede a little as the next one lands on top of them.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - index) * 0.028]);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `calc(var(--header-h) + ${16 + index * 16}px)`, marginBottom: 20 }}
    >
      <motion.div style={{ scale, transformOrigin: "top center" }}>
        <MagicCard className="slab-ink border-0">
          <div className="grid gap-6 p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] md:items-end md:gap-14 md:p-12">
            <div>
              <div className="flex items-baseline gap-5">
                {/* The index carries the weight, so the stack reads as a
                    sequence even when only its top edge is showing. */}
                <span className="d2 text-gold/85">{n}</span>
                <h3 className="d2">{title}</h3>
              </div>
              <p className="lede mt-7 max-w-xl">{body}</p>
            </div>
            <div className="border-t-2 border-line pt-5 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0">
              <p className="tag-sm mb-3 text-faint">Output</p>
              <p className="text-[15px] leading-snug">{out}</p>
            </div>
          </div>
        </MagicCard>
      </motion.div>
    </div>
  );
}
