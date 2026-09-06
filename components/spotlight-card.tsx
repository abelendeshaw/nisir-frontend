"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer-tracking spotlight (the Aceternity card pattern, tuned to Nisir's
 * gold). The gradient follows the cursor across the card face and fades out
 * when the pointer leaves.
 */
export function SpotlightCard({
  children,
  className,
  radius = 380,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn("group/spot relative isolate overflow-hidden", className)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, var(--glow), transparent 72%)`,
        }}
      />
      {children}
    </div>
  );
}
