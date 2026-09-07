"use client";

import { type ReactNode, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useStillness } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * A card that knows where the cursor is. The border lights along the nearest
 * edge and a soft gold field follows underneath — enough to make a static
 * panel feel handled, not enough to become decoration.
 */
export function MagicCard({
  children,
  className,
  size = 340,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-size);
  const y = useMotionValue(-size);

  const border = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, var(--gold), transparent 72%)`;
  const field = useMotionTemplate`radial-gradient(${size * 1.15}px circle at ${x}px ${y}px, color-mix(in srgb, var(--gold) 12%, transparent), transparent 70%)`;

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        x.set(event.clientX - box.left);
        y.set(event.clientY - box.top);
      }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      // No background here on purpose: the caller decides the surface, so a
      // MagicCard can sit on a slab without fighting it.
      className={cn("group/card relative isolate overflow-hidden border-2 border-line", className)}
    >
      {/* The lit border is a full-bleed gradient masked to a 1px inset frame. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          background: border,
          opacity: active ? 1 : 0,
          mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          maskComposite: "exclude",
          WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          WebkitMaskComposite: "xor",
          padding: 1,
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ background: field, opacity: active ? 1 : 0 }}
      />
      <div className="relative z-20">{children}</div>
    </div>
  );
}

/** Slight three-dimensional lean toward the pointer. Used on store objects. */
export function Tilt({
  children,
  className,
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useStillness();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      className={cn("[transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, perspective: 1000 }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        const px = (event.clientX - box.left) / box.width - 0.5;
        const py = (event.clientY - box.top) / box.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
