"use client";

import { Fragment, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion";

/**
 * Long-form statement that lights up word by word as it scrolls through the
 * viewport — the reading pace becomes part of the story.
 */
export function ScrollHighlight({
  text,
  className,
  accentWords = [],
}: {
  text: string;
  className?: string;
  accentWords?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");
  const accents = new Set(accentWords.map((word) => word.toLowerCase()));

  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      gsap.fromTo(
        ref.current.querySelectorAll("[data-word]"),
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "bottom 55%",
            scrub: 0.5,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={cn("display", className)}>
      {words.map((word, index) => {
        const bare = word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
        // The space sits outside the inline-block so words don't collide.
        return (
          <Fragment key={`${word}-${index}`}>
            <span
              data-word
              className={cn("inline-block", accents.has(bare) && "text-gradient-gold")}
            >
              {word}
            </span>
            {index < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </p>
  );
}
