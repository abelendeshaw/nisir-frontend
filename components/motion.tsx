"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE, gsap, reducedMotion, useGSAP } from "@/lib/motion";

/**
 * Scroll-triggered entrance. Initial state is set inside useGSAP (which runs
 * in a layout effect), so there is no flash — and if JS never runs, content
 * simply stays visible instead of disappearing.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  y = 26,
  blur = false,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  y?: number;
  blur?: boolean;
  /** Above-the-fold content plays on load — never gated behind a scroll trigger. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y, filter: blur ? "blur(10px)" : "none" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.1,
          delay,
          ease: EASE,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: ref.current, start: "top 88%" } }),
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Same idea, but the direct children arrive one after another. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  y = 30,
  start = "top 85%",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      const items = gsap.utils.toArray<HTMLElement>(ref.current.children);
      if (!items.length) return;
      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: EASE,
          stagger,
          scrollTrigger: { trigger: ref.current, start },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Headline reveal: each line rises out from behind a mask. Lines are passed
 * explicitly so the typographic rag stays art-directed rather than reflowed.
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  as: Tag = "h1",
  delay = 0,
  duration = 1.15,
  immediate = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  as?: ElementType;
  delay?: number;
  duration?: number;
  /** Hero headlines animate on load rather than waiting for a scroll trigger. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      const inners = ref.current.querySelectorAll("[data-line-inner]");
      gsap.fromTo(
        inners,
        { yPercent: 112, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration,
          delay,
          ease: "power4.out",
          stagger: 0.11,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: ref.current, start: "top 92%" } }),
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.08em]">
          <span data-line-inner className={cn("block", lineClassName)}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Pointer-following button wrapper — subtle pull, released on leave. */
export function Magnetic({
  children,
  className,
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

      const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
        moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
      };
      const onLeave = () => {
        moveX(0);
        moveY(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-flex will-change-transform", className)}>
      {children}
    </div>
  );
}

/** Seamless marquee — the track is duplicated and shifted by exactly 50%. */
export function Marquee({
  children,
  className,
  duration = 42,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className="animate-marquee flex w-max shrink-0 items-center group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
