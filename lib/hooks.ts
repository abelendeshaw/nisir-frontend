"use client";

import { useSyncExternalStore } from "react";

/**
 * Client service checks, read as external stores rather than mirrored into
 * state inside an effect. That keeps hydration honest — React renders the
 * server snapshot, then swaps once — and it means the value tracks changes
 * (plugging in a mouse, flipping the OS theme) instead of being sampled once
 * at mount.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * `prefers-reduced-motion`, read as an external store.
 *
 * Motion's own `useReducedMotion` samples matchMedia during render, so the
 * server (which always says "no preference") and a client that *does* prefer
 * reduced motion disagree on the very first render — a hydration mismatch
 * wherever the flag decides what gets rendered. Going through
 * `useSyncExternalStore` gives React a server snapshot to hydrate against and
 * a client snapshot to re-render with, which is exactly the supported path.
 */
export function useStillness() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
