"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { Mark } from "@/components/chrome/mark";
import { useStillness } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * The eagle as a shared element.
 *
 * It begins as the cropped field-mark in the hero and travels down the page
 * to the practice lede, shrinking to the height of that sentence. Pose is
 * sampled every frame from the live scroll, so the eagle cannot fall behind.
 */

type TravelApi = {
  originRef: RefObject<HTMLDivElement | null>;
  dockRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  ready: boolean;
};

const MarkTravelContext = createContext<TravelApi | null>(null);

export function useMarkTravel() {
  return useContext(MarkTravelContext);
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

export function MarkTravel({ children }: { children: ReactNode }) {
  const originRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useStillness();
  const [live, setLive] = useState(false);

  const onReady = useCallback(() => {
    setLive(true);
  }, []);

  return (
    <MarkTravelContext.Provider
      value={{ originRef, dockRef, heroRef, ready: !reduced && live }}
    >
      {children}
      {reduced ? null : (
        <FlyingMark
          originRef={originRef}
          dockRef={dockRef}
          heroRef={heroRef}
          onReady={onReady}
        />
      )}
    </MarkTravelContext.Provider>
  );
}

export function MarkOrigin({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const travel = useMarkTravel();
  return (
    <div ref={travel?.originRef} aria-hidden className={className}>
      {children}
    </div>
  );
}

export function MarkDock({ className }: { className?: string }) {
  const travel = useMarkTravel();
  return <div ref={travel?.dockRef} aria-hidden className={className} />;
}

function FlyingMark({
  originRef,
  dockRef,
  heroRef,
  onReady,
}: {
  originRef: RefObject<HTMLDivElement | null>;
  dockRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const tint = useMotionValue(0.14);
  const color = useMotionValue("rgba(212, 175, 55, 0.14)");
  const clipPath = useMotionValue("inset(0px)");
  const width = useMotionValue(0);
  const visible = useMotionValue(0);

  const originDoc = useRef({ left: 0, top: 0, width: 1, height: 1 });
  const measured = useRef(false);
  const readyOnce = useRef(false);

  const measureOrigin = useCallback((force = false) => {
    if (measured.current && !force) return;
    const origin = originRef.current;
    if (!origin) return;
    const r = origin.getBoundingClientRect();
    if (r.width < 2) return;
    originDoc.current = {
      left: r.left + window.scrollX,
      top: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    };
    width.set(r.width);
    measured.current = true;
  }, [originRef, width]);

  const apply = useCallback(() => {
    const dock = dockRef.current;
    const hero = heroRef.current;
    const o = originDoc.current;
    if (!dock || !measured.current) return;

    const d = dock.getBoundingClientRect();
    const dockDoc = {
      left: d.left + window.scrollX,
      top: d.top + window.scrollY,
      width: d.width,
    };
    // Land as the practice lede comes into the lower half — the mark has to
    // cross the page, not sit in the hero while the dock is still below.
    const settle = Math.max(1, dockDoc.top - window.innerHeight * 0.7);
    const p = clamp(window.scrollY / settle);

    x.set(o.left + (dockDoc.left - o.left) * p - window.scrollX);
    y.set(o.top + (dockDoc.top - o.top) * p - window.scrollY);
    scale.set(1 + (dockDoc.width / o.width - 1) * p);
    const fill = p < 0.5 ? 0.14 : 0.14 + 0.86 * smoothstep((p - 0.5) / 0.5);
    tint.set(fill);
    color.set(`rgba(212, 175, 55, ${fill})`);
    visible.set(1);

    if (hero) {
      const h = hero.getBoundingClientRect();
      const release = clamp(p / 0.18);
      const top = Math.max(0, h.top) * (1 - release);
      const right = Math.max(0, window.innerWidth - h.right) * (1 - release);
      const bottom = Math.max(0, window.innerHeight - h.bottom) * (1 - release);
      const left = Math.max(0, h.left) * (1 - release);
      clipPath.set(`inset(${top}px ${right}px ${bottom}px ${left}px)`);
    }

    if (!readyOnce.current) {
      readyOnce.current = true;
      onReady();
    }
  }, [clipPath, color, dockRef, heroRef, onReady, scale, tint, visible, x, y]);

  useLayoutEffect(() => {
    measureOrigin();
    apply();

    const onResize = () => {
      measureOrigin(true);
      apply();
    };

    const ro = new ResizeObserver(onResize);
    if (originRef.current) ro.observe(originRef.current);
    if (dockRef.current) ro.observe(dockRef.current);
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [apply, dockRef, measureOrigin, originRef]);

  useAnimationFrame(apply);

  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setHost(document.body);
  }, []);

  if (!host) return null;

  // Portalled past `app/template.tsx`: that wrapper keeps a transform, which
  // would otherwise turn this `fixed` mark into a scrolling element.
  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[4]"
      style={{ clipPath, opacity: visible }}
    >
      <motion.div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          x,
          y,
          scale,
          width,
          color,
          transformOrigin: "top left",
        }}
      >
        <Mark className="w-full" />
      </motion.div>
    </motion.div>,
    host,
  );
}

export function markSlotClass(kind: "origin" | "dock") {
  return cn(
    "pointer-events-none aspect-[1400/1120]",
    kind === "origin" &&
      "absolute -right-[22%] top-1/2 w-[110vw] -translate-y-1/2 md:-right-[10%] md:w-[70vw]",
    kind === "dock" && "relative h-20 w-auto shrink-0 md:h-[7.5rem]",
  );
}
