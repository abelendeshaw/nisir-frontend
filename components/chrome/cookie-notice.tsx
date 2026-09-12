"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useStillness } from "@/lib/hooks";

const KEY = "nisir_cookie_notice";

/*
 * Dismissal is external state — it lives in localStorage, which React does
 * not own — so it is read through `useSyncExternalStore` rather than copied
 * into a `useState` from an effect. Same reasoning as `lib/shop/store.ts`,
 * and the same shape: a set of listeners, and a snapshot read on demand.
 *
 * `getServerSnapshot` reports "dismissed" so the server renders no banner at
 * all. That is what keeps the markup identical on both sides of hydration; a
 * returning visitor would otherwise be shown a notice they cleared weeks ago
 * for the one frame before React caught up.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isDismissed() {
  try {
    return window.localStorage.getItem(KEY) === "dismissed";
  } catch {
    // Private mode, or storage blocked outright. Showing the notice is the
    // safe side of that failure.
    return false;
  }
}

/** Hidden until the client says otherwise. */
function dismissedOnServer() {
  return true;
}

function dismiss() {
  try {
    window.localStorage.setItem(KEY, "dismissed");
  } catch {
    // It reappears next visit. Harmless, and better than throwing on a
    // quota wall.
  }
  listeners.forEach((listener) => listener());
}

/**
 * A disclosure, not a consent gate — and the distinction is the whole design.
 *
 * This site sets exactly one cookie, the signed-in session, and runs no
 * analytics, no pixels and no third-party scripts. A strictly necessary
 * cookie needs no consent under PIPEDA or the ePrivacy rules, so an
 * Accept/Reject pair here would be theatre: "Reject" would have nothing to
 * switch off, and a button that claims to refuse something it cannot refuse
 * is a worse compliance position than saying plainly what is set and why.
 *
 * So: one line, a link to the detail, and a dismiss. It does not block the
 * page, it traps no focus, and it is not a modal — nothing behind it is
 * gated on a decision, because there is no decision to take.
 *
 * The day analytics arrives, this component is the wrong shape and should be
 * replaced by a real consent manager that gates the script until asked. The
 * Cookie Policy already promises that in writing.
 */
export function CookieNotice() {
  const shown = !useSyncExternalStore(subscribe, isDismissed, dismissedOnServer);
  const still = useStillness();

  return (
    <AnimatePresence>
      {shown && (
        <motion.aside
          // Announced, but politely: this interrupts nothing, so it should
          // not interrupt a screen reader mid-sentence either.
          role="region"
          aria-label="Cookie notice"
          initial={still ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={still ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          // Above the page, below the index overlay (z-80) and the header
          // (z-75), so opening the menu covers it rather than fighting it.
          className="slab-ink fixed inset-x-0 bottom-0 z-[70] border-t-2 border-gold/40"
        >
          <div className="shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="max-w-[68ch] text-[13px] leading-relaxed text-muted">
              We set one cookie, and only when you sign in — it keeps you signed in, and
              nothing else. No analytics, no advertising, no third-party tracking.{" "}
              <Link href="/legal/cookies" className="ul text-fg transition-colors hover:text-accent">
                The details
              </Link>
              .
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="tag-sm shrink-0 self-start border-2 border-line-strong px-5 py-3 transition-colors duration-500 hover:border-accent hover:text-accent sm:self-auto"
            >
              Got it
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
