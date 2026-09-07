"use client";

import { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked reading. Words light from faint to full ink as the passage
 * travels up the viewport, so the visitor reads at the speed they scroll.
 * The statement is the interaction — no other decoration is needed.
 */
export function TextReveal({
  text,
  className,
  accent = [],
}: {
  text: string;
  className?: string;
  /** Words dropped to the thin weight once lit. Matched case-insensitively. */
  accent?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = text.split(" ");
  const accents = new Set(accent.map((word) => word.toLowerCase()));

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const stripped = word.replace(/[^a-z]/gi, "").toLowerCase();
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {accents.has(stripped) ? <span className="thin">{word}</span> : word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <span className="relative mr-[0.28em] inline-block">
      <motion.span style={{ opacity }} className="inline-block">
        {children}
      </motion.span>
    </span>
  );
}
