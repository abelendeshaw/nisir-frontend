"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A gold hairline across the top edge, tracking read position. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 240, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[65] h-px origin-left bg-gradient-to-r from-accent via-gold to-accent"
      style={{ scaleX }}
    />
  );
}
