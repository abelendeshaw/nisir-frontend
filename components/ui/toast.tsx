"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * The one thing a long form owes you when it refuses to advance: a straight
 * answer about what is wrong and where.
 *
 * Checkout used to fail quietly. Errors appeared under the offending inputs,
 * which is right, but on a step taller than the viewport the shopper pressed
 * Continue, nothing visibly happened, and the reason was somewhere above or
 * below the fold. This says how many fields need attention and names them,
 * from a corner that does not move.
 *
 * `role="alert"` rather than a polite live region — the shopper has just
 * pressed a button and is waiting on the answer, so interrupting is the
 * correct behaviour here and the reason screen readers distinguish the two.
 */
export function Toast({
  open,
  title,
  items,
  onDismiss,
  duration = 6000,
}: {
  open: boolean;
  title: string;
  /** Field labels to name. Rendered as a list when there is more than one. */
  items?: string[];
  onDismiss: () => void;
  /** Milliseconds before it leaves on its own. `0` keeps it until dismissed. */
  duration?: number;
}) {
  // Kept in a ref so re-rendering with the same message does not restart the
  // clock, and so the timer is always cleared on the way out. Assigned in an
  // effect rather than during render — a render can be thrown away, and a ref
  // written from one is a mutation React never agreed to.
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  const signature = `${title}|${items?.join("|") ?? ""}`;

  useEffect(() => {
    if (!open || duration <= 0) return;
    const timer = window.setTimeout(() => dismiss.current(), duration);
    return () => window.clearTimeout(timer);
    // `signature` restarts the countdown when the message itself changes, so a
    // second failed attempt gets its own full reading time.
  }, [open, duration, signature]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="toast"
          role="alert"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          /* Bottom rather than top: the header is fixed up there, and on a
             phone the thumb is down here. `max-w` keeps it from spanning a
             desktop window, the inset keeps it inside the gutter on a phone. */
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex justify-center px-[var(--gutter)] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:justify-end"
        >
          <div className="pointer-events-auto flex w-full max-w-[26rem] items-start gap-4 border-2 border-accent bg-ink px-5 py-4 text-bone shadow-[0_18px_40px_-12px_rgb(10_18_32_/_0.55)]">
            <span aria-hidden className="mt-[2px] text-[15px] leading-none text-accent">
              !
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-snug">{title}</p>
              {items && items.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  {items.map((item) => (
                    <li key={item} className="tag-sm text-accent">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              /* A real word, not a bare ×: the icon is decorative and this is
                 the only label a screen reader would get. */
              aria-label="Dismiss"
              className="-mr-1 -mt-1 shrink-0 p-1 text-[15px] leading-none text-bone/50 transition-colors hover:text-bone"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
