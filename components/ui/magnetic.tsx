"use client";

import { type ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useStillness } from "@/lib/hooks";

/**
 * The element leans toward the pointer while it is nearby, then springs back.
 * Strength is a fraction of the distance from centre, so big targets pull
 * further than small ones without any per-instance tuning.
 */
export function Magnetic({
  children,
  strength = 0.32,
  radius = 1.6,
  className,
}: {
  children: ReactNode;
  /** 0 = inert, 1 = the element sits under the cursor. */
  strength?: number;
  /** Active area as a multiple of the element's own box. */
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useStillness();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 16, mass: 0.35 });
  const y = useSpring(my, { stiffness: 180, damping: 16, mass: 0.35 });

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const within =
      Math.abs(dx) < (box.width * radius) / 2 && Math.abs(dy) < (box.height * radius) / 2;
    mx.set(within ? dx * strength : 0);
    my.set(within ? dy * strength : 0);
  }

  function reset() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </motion.div>
  );
}
