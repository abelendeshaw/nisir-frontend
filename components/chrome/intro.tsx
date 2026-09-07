"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStillness } from "@/lib/hooks";
import { Mark } from "@/components/chrome/mark";

const KEY = "nisir-intro-seen";
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The first two seconds.
 *
 * A bone curtain counts to 100 while the eagle draws in, then splits and
 * leaves. It runs once per session — a curtain you have to sit through on
 * every navigation stops being an entrance and becomes a toll.
 */
export function Intro() {
  const reduced = useStillness();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* private mode — just skip the curtain */
    }
    if (seen || reduced) return;

    document.body.dataset.lock = "true";

    // Raised on the next frame rather than inline: the curtain then has a
    // painted frame to animate out of, and this effect never triggers a
    // cascading render of its own.
    const raise = requestAnimationFrame(() => setOpen(true));

    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - started) / 1700, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const done = setTimeout(() => {
      setOpen(false);
      document.body.dataset.lock = "false";
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* nothing to do */
      }
    }, 2350);

    return () => {
      cancelAnimationFrame(raise);
      cancelAnimationFrame(frame);
      clearTimeout(done);
      document.body.dataset.lock = "false";
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[90] flex flex-col"
          exit={{ transition: { staggerChildren: 0.06 } }}
          aria-hidden
        >
          {/* Two panels, so the curtain parts rather than fades. */}
          {[0, 1].map((half) => (
            <motion.div
              key={half}
              className="relative flex-1 overflow-hidden bg-bg"
              initial={{ y: 0 }}
              exit={{ y: half === 0 ? "-100%" : "100%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.1 }}
            >
              <div
                className="absolute inset-x-0 grid h-[100vh] place-items-center"
                style={{ top: half === 0 ? 0 : "-50vh" }}
              >
                <motion.div
                  className="flex flex-col items-center gap-8"
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <Mark className="w-28 text-fg md:w-36" />
                  <span className="tag text-accent">Nisir Designs</span>
                </motion.div>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-[var(--gutter)]"
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span className="tag-sm text-muted">Ontario · Addis Ababa</span>
            <span className="d3 tabular-nums text-fg">{String(count).padStart(3, "0")}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
