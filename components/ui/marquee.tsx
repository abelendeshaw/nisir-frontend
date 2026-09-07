"use client";

import { type ReactNode, Children } from "react";
import { cn } from "@/lib/utils";

/**
 * An endless band. The children are rendered twice and the track is pulled
 * exactly -50%, so the seam lands where the first copy ends — no gap, no jump,
 * no measuring.
 */
export function Marquee({
  children,
  className,
  duration = 34,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  fade?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/marquee relative flex overflow-hidden",
        vertical ? "h-full flex-col" : "w-full",
        fade && !vertical && "edge-fade-x",
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className={cn(
            "flex shrink-0 items-center will-change-transform",
            vertical ? "flex-col" : "flex-row",
            pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
          )}
          style={{
            animationName: vertical ? "marquee-y" : "marquee-x",
            animationDuration: `${duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {Children.map(children, (child) => child)}
        </div>
      ))}
    </div>
  );
}
