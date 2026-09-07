"use client";

import { type RefObject, useCallback, useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { useStillness } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * A signal travelling between two nodes on the page. Positions are measured
 * from the live DOM and re-measured on resize, so the arc holds at any
 * breakpoint without hard-coded coordinates.
 */
export function Beam({
  containerRef,
  fromRef,
  toRef,
  className,
  curvature = 90,
  duration = 4.5,
  delay = 0,
  reverse = false,
}: {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  className?: string;
  curvature?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
}) {
  const id = useId().replace(/[:]/g, "");
  const reduced = useStillness();
  const [path, setPath] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;

    const c = container.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();

    const ax = a.left - c.left + a.width / 2;
    const ay = a.top - c.top + a.height / 2;
    const bx = b.left - c.left + b.width / 2;
    const by = b.top - c.top + b.height / 2;

    setBox({ w: c.width, h: c.height });
    setPath(`M ${ax},${ay} Q ${(ax + bx) / 2},${(ay + by) / 2 - curvature} ${bx},${by}`);
  }, [containerRef, fromRef, toRef, curvature]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, containerRef]);

  if (!path) return null;

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      viewBox={`0 0 ${box.w} ${box.h}`}
      fill="none"
      aria-hidden
    >
      <path d={path} stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
      {!reduced && (
        <>
          <path d={path} stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" />
          <defs>
            <motion.linearGradient
              id={id}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: "0%", x2: "5%", y1: "0%", y2: "0%" }}
              animate={{
                x1: reverse ? ["100%", "-5%"] : ["-5%", "100%"],
                x2: reverse ? ["105%", "0%"] : ["0%", "105%"],
              }}
              transition={{ duration, delay, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
            >
              <stop stopColor="var(--gold)" stopOpacity="0" />
              <stop offset="45%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
}

/** A node on the beam: a dot that pings. Takes a ref so Beam can measure it. */
export function BeamNode({
  className,
  children,
  ping = true,
  ref,
}: {
  className?: string;
  children?: React.ReactNode;
  ping?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={cn("relative grid size-3 place-items-center", className)}>
      <span className="size-2.5 rounded-full bg-gold" />
      {ping && (
        <span
          className="absolute size-2.5 rounded-full bg-gold/70"
          style={{ animation: "ping-ring 2.8s var(--out) infinite" }}
        />
      )}
      {children}
    </div>
  );
}
