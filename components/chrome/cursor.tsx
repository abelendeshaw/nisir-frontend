"use client";

import { useEffect, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useMediaQuery, useStillness } from "@/lib/hooks";

/**
 * The pointer, redrawn.
 *
 * Three rules it has to obey, because the old version broke all three:
 *
 *  1. Never cover what it is pointing at. The ring is an outline, never a
 *     filled disc, and nothing floats alongside it — a pointer is not a place
 *     to put copy.
 *  2. Never lose the point. The dot stays visible the whole time — it *is* the
 *     cursor, and hiding it on hover is exactly when aim matters most.
 *  3. Stay legible on every slab. `mix-blend-difference` inverts to blue over
 *     gold, and any single colour disappears on one of the three grounds — a
 *     gold ring vanishes on a gold row. So each piece carries a light edge and
 *     a dark edge at once: whichever ground it lands on, one of the two reads.
 *
 * It only exists for a fine pointer with motion allowed, and native cursors
 * are left alone on form controls — typing without a caret is a worse
 * experience than any amount of polish buys back.
 */
export function Cursor() {
  const fine = useMediaQuery("(pointer: fine)");
  const still = useStillness();
  const enabled = fine && !still;

  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  // The exact pointer position, and a copy that chases it a frame behind.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useMotionValue(-100);
  const ry = useMotionValue(-100);

  // An explicit exponential follow rather than useSpring: the trailing values
  // have to be correct every frame, and this stays frame-rate independent
  // without depending on how a spring latches onto its source.
  useAnimationFrame((_, delta) => {
    const k = 1 - Math.pow(0.0015, Math.min(delta, 50) / 1000);
    rx.set(rx.get() + (x.get() - rx.get()) * k);
    ry.set(ry.get() + (y.get() - ry.get()) * k);
  });

  useEffect(() => {
    if (!enabled) return;

    // Hand the native cursor over to us only once we are definitely mounted.
    document.documentElement.setAttribute("data-cursor", "custom");

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const el = (event.target as Element | null)?.closest?.(
        "a, button, [role='button'], input, textarea, select, label",
      );
      const typing = !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
      setHot(!!el && !typing);
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.removeAttribute("data-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Outline only — it frames the target instead of hiding it. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border-2 border-bone shadow-[0_0_0_1.5px_rgba(10,18,32,0.55)]"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hot ? 38 : 0,
          height: hot ? 38 : 0,
          opacity: visible && hot ? 1 : 0,
          scale: down ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.4 }}
      />

      {/* The point. Always on. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full bg-gold shadow-[0_0_0_1.5px_rgba(10,18,32,0.55)]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: down ? 10 : 7, height: down ? 10 : 7, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.16 }}
      />

    </>
  );
}
