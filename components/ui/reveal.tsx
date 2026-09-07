"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView } from "motion/react";
import { useStillness } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/* Entrance primitives. Every section on the site enters through one of these
   three, so the whole page has a single sense of gravity.

   Reveal   — a block rises and un-blurs once (BlurFade).
   Lines    — display type climbs out from behind its own baseline.
   Stagger  — a list, each child offset from the last. */

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Start the animation on mount rather than on scroll — for above-the-fold. */
  immediate?: boolean;
  delay?: number;
  y?: number;
  blur?: number;
  as?: "div" | "span" | "li" | "p";
};

export function Reveal({
  children,
  className,
  immediate = false,
  delay = 0,
  y = 24,
  blur = 6,
  as = "div",
}: RevealProps) {
  const reduced = useStillness();
  const Tag = motion[as];

  const hidden = reduced
    ? { opacity: 0 }
    : { opacity: 0, y, filter: `blur(${blur}px)` };
  const shown = reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <Tag
      className={className}
      initial={hidden}
      {...(immediate
        ? { animate: shown }
        : { whileInView: shown, viewport: { once: true, margin: "-12% 0px -12% 0px" } })}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

type LinesProps = {
  /** One entry per visual line. Line breaks are authored, never automatic. */
  lines: ReactNode[];
  className?: string;
  immediate?: boolean;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
};

export function Lines({
  lines,
  className,
  immediate = false,
  delay = 0,
  stagger = 0.09,
  as: Tag = "div",
}: LinesProps) {
  const reduced = useStillness();

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        // The outer span is the clip; the inner one does the travelling.
        <span key={i} className="mask-line">
          <motion.span
            className="block will-change-transform"
            initial={reduced ? { opacity: 0 } : { y: "110%", rotate: 2 }}
            {...(immediate
              ? { animate: reduced ? { opacity: 1 } : { y: "0%", rotate: 0 } }
              : {
                  whileInView: reduced ? { opacity: 1 } : { y: "0%", rotate: 0 },
                  viewport: { once: true, margin: "-8% 0px -8% 0px" },
                })}
            transition={{ duration: 1.05, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{ shown: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduced = useStillness();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y, filter: "blur(6px)" },
        shown: reduced
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Draws a hairline out from its origin as it enters the viewport. */
export function DrawRule({
  className,
  origin = "left",
  delay = 0,
}: {
  className?: string;
  origin?: "left" | "center";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <div ref={ref} className={cn("h-px w-full overflow-hidden bg-line/40", className)}>
      <motion.div
        className="h-full w-full bg-line-strong"
        style={{ transformOrigin: origin }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay, ease: EASE }}
      />
    </div>
  );
}
