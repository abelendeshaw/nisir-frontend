"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion";
import { EagleMark } from "@/components/brand";

/**
 * The sky the whole site is built under: banded atmosphere from altitude down
 * to a lit horizon, with the Nisir eagle riding a thermal through it.
 * Everything is gradients and transforms — no images, no canvas — so it paints
 * immediately and animates on the compositor.
 *
 * On scroll the bird climbs while the strata fall away: the ascent the brand
 * is named for.
 */
export function SkyScene({
  className,
  eagle = true,
  compact = false,
}: {
  className?: string;
  eagle?: boolean;
  compact?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;

      const scrub = {
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      } as const;

      gsap.to(root.current.querySelectorAll("[data-sky-far]"), {
        yPercent: 10,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(root.current.querySelectorAll("[data-sky-near]"), {
        yPercent: 24,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(root.current.querySelectorAll("[data-sky-glow]"), {
        opacity: 0.3,
        scale: 1.12,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(root.current.querySelectorAll("[data-eagle-wrap]"), {
        yPercent: -30,
        xPercent: 5,
        scale: 1.06,
        ease: "none",
        scrollTrigger: scrub,
      });

      // Entrance: the bird glides in on a shallow arc, rings settle behind it.
      const intro = gsap.timeline();
      intro
        .from(root.current.querySelectorAll("[data-eagle-wrap]"), {
          xPercent: -22,
          yPercent: 14,
          rotate: 5,
          opacity: 0,
          duration: 2.2,
          ease: "power3.out",
        })
        .from(
          root.current.querySelectorAll("[data-ring]"),
          { scale: 0.62, opacity: 0, duration: 1.8, stagger: 0.14, ease: "power3.out" },
          0.25,
        )
        .from(
          root.current.querySelectorAll("[data-horizon]"),
          { scaleX: 0.4, opacity: 0, duration: 1.8, ease: "power3.out" },
          0.1,
        );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        background:
          "linear-gradient(180deg, var(--sky-1) 0%, var(--sky-2) 38%, var(--sky-3) 76%, var(--sky-4) 100%)",
      }}
    >
      {/* Star field — lit only at night, and fading out toward the horizon. */}
      <div
        data-sky-far
        className="animate-twinkle absolute inset-x-0 top-0 h-[78%]"
        style={{
          opacity: "var(--star-opacity)",
          maskImage: "linear-gradient(180deg, #000 0%, #000 45%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 45%, transparent 100%)",
          backgroundImage: [
            "radial-gradient(1.7px 1.7px at 9% 14%, rgb(255 255 255 / .95), transparent)",
            "radial-gradient(1.2px 1.2px at 18% 32%, rgb(255 255 255 / .6), transparent)",
            "radial-gradient(1.4px 1.4px at 26% 8%, rgb(230 204 119 / .85), transparent)",
            "radial-gradient(1px 1px at 33% 26%, rgb(255 255 255 / .55), transparent)",
            "radial-gradient(1.6px 1.6px at 41% 17%, rgb(255 255 255 / .8), transparent)",
            "radial-gradient(1.1px 1.1px at 49% 35%, rgb(255 255 255 / .5), transparent)",
            "radial-gradient(1.8px 1.8px at 56% 11%, rgb(255 255 255 / .9), transparent)",
            "radial-gradient(1.2px 1.2px at 63% 29%, rgb(230 204 119 / .7), transparent)",
            "radial-gradient(1.4px 1.4px at 71% 6%, rgb(255 255 255 / .75), transparent)",
            "radial-gradient(1px 1px at 78% 24%, rgb(255 255 255 / .5), transparent)",
            "radial-gradient(1.6px 1.6px at 86% 15%, rgb(255 255 255 / .85), transparent)",
            "radial-gradient(1.2px 1.2px at 93% 31%, rgb(255 255 255 / .6), transparent)",
            "radial-gradient(1.3px 1.3px at 4% 40%, rgb(255 255 255 / .45), transparent)",
            "radial-gradient(1.1px 1.1px at 67% 43%, rgb(255 255 255 / .4), transparent)",
          ].join(","),
        }}
      />

      {/* Sun: a tight core low on the right, with a restrained halo. Kept
          small on purpose — the eagle is the focal point, not the light. */}
      <div
        data-sky-glow
        className="absolute inset-0"
        style={{
          opacity: 0.85,
          background:
            "radial-gradient(7% 5% at 78% 66%, var(--sky-sun-core) 0%, transparent 72%), radial-gradient(30% 22% at 78% 66%, var(--sky-sun) 0%, transparent 74%)",
        }}
      />

      {/* Cloud strata — thin horizontal banks near the horizon. */}
      <div
        data-sky-far
        className="animate-drift absolute inset-x-[-18%] top-[52%] h-[14%] opacity-50"
        style={{
          animationDuration: "52s",
          background:
            "radial-gradient(50% 60% at 22% 50%, var(--sky-haze) 0%, transparent 76%), radial-gradient(40% 55% at 62% 60%, var(--sky-haze) 0%, transparent 78%)",
        }}
      />
      <div
        data-sky-near
        className="animate-drift absolute inset-x-[-22%] top-[68%] h-[16%] opacity-60"
        style={{
          animationDuration: "38s",
          animationDirection: "alternate-reverse",
          background:
            "radial-gradient(55% 62% at 34% 55%, var(--sky-haze) 0%, transparent 74%), radial-gradient(45% 58% at 76% 62%, var(--sky-haze) 0%, transparent 76%)",
        }}
      />

      {/* Lit horizon + its line: the structural anchor of the whole scene. */}
      <div
        data-sky-glow
        className="absolute inset-x-0 bottom-0 h-[46%]"
        style={{
          background:
            "radial-gradient(150% 90% at 50% 106%, var(--sky-horizon) 0%, transparent 58%)",
          opacity: 0.32,
        }}
      />
      <div
        data-horizon
        className="absolute inset-x-[8%] top-[88%] h-px origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--sky-horizon) 22%, var(--sky-horizon) 78%, transparent)",
          opacity: 0.45,
        }}
      />

      {/* Instrument grid — the calculated half of the brand. */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent calc(25% - 0.5px), var(--line) 25%, transparent calc(25% + 0.5px)), linear-gradient(90deg, transparent calc(50% - 0.5px), var(--line) 50%, transparent calc(50% + 0.5px)), linear-gradient(90deg, transparent calc(75% - 0.5px), var(--line) 75%, transparent calc(75% + 0.5px))",
        }}
      />

      {eagle ? (
        <div
          data-eagle-wrap
          className={cn(
            "absolute will-change-transform",
            compact
              ? "right-[4%] top-[18%] w-[min(30vw,320px)]"
              : "right-[7%] top-[13%] w-[min(32vw,430px)]",
          )}
        >
          {/* Halo so the mark reads against the deep sky. */}
          <div
            className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, var(--glow) 0%, transparent 62%)",
              opacity: 0.75,
            }}
          />
          <div
            data-ring
            className="absolute left-1/2 top-1/2 aspect-square w-[128%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: "color-mix(in srgb, var(--accent-bright) 40%, transparent)" }}
          />
          <div
            data-ring
            className="absolute left-1/2 top-1/2 aspect-square w-[164%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
            style={{ borderColor: "color-mix(in srgb, var(--accent-bright) 18%, transparent)" }}
          />
          <div
            data-ring
            className="absolute left-1/2 top-1/2 aspect-square w-[128%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-bright) 34%, transparent)",
              animation: "pulse-ring 7s var(--ease-out) infinite",
            }}
          />
          <div className="animate-soar relative">
            <EagleMark className="w-full drop-shadow-[0_18px_50px_var(--glow)] [filter:saturate(1.15)_brightness(1.08)]" />
          </div>
        </div>
      ) : null}

      {/* Handoff into the page background. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22%]"
        style={{ background: "linear-gradient(180deg, transparent, var(--bg) 94%)" }}
      />
    </div>
  );
}
