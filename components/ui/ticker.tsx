"use client";

import { useRef, useState } from "react";
import { motion, useAnimationFrame } from "motion/react";
import { useStillness } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Figures that count up once, on entry. Used in the footprint numbers rail. */
export function Ticker({
  value,
  className,
  suffix = "",
  plain = false,
}: {
  value: number;
  className?: string;
  suffix?: string;
  /** Years and similar literals: shown as-is rather than counted up. */
  plain?: boolean;
}) {
  const still = useStillness();
  // Counting a year up from zero reads as a glitch, so `plain` lands at once.
  const [shown, setShown] = useState(plain ? value : 0);
  const started = useRef(false);
  const start = useRef(0);

  useAnimationFrame((t) => {
    if (!started.current || shown === value) return;
    if (!start.current) start.current = t;
    const p = Math.min((t - start.current) / 1400, 1);
    // Ease-out cubic, so the last digits settle rather than snap.
    setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
  });

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      onViewportEnter={() => {
        if (still || plain) setShown(value);
        else started.current = true;
      }}
      viewport={{ once: true, margin: "-20% 0px" }}
    >
      {plain ? shown : shown.toLocaleString("en-US")}
      {suffix}
    </motion.span>
  );
}
