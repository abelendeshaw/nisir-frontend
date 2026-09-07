"use client";

import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Nav links flip: the visible word rides up and out while a copy climbs in
 * from below, letter by letter. Two identical stacks, one clip, no layout cost.
 */
export function FlipLink({
  href,
  children,
  className,
  stagger = 0.018,
  ...rest
}: {
  href: string;
  children: string;
  className?: string;
  stagger?: number;
} & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">) {
  const letters = children.split("");

  return (
    <Link
      href={href}
      className={cn("relative block overflow-hidden whitespace-nowrap", className)}
      {...rest}
    >
      <span className="sr-only">{children}</span>
      <motion.span initial="rest" whileHover="hover" animate="rest" className="block" aria-hidden>
        <span className="block">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block"
              variants={{ rest: { y: 0 }, hover: { y: "-108%" } }}
              transition={{ duration: 0.42, ease: EASE, delay: i * stagger }}
            >
              {letter === " " ? " " : letter}
            </motion.span>
          ))}
        </span>
        <span className="absolute inset-0 block">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block text-accent"
              variants={{ rest: { y: "108%" }, hover: { y: 0 } }}
              transition={{ duration: 0.42, ease: EASE, delay: i * stagger }}
            >
              {letter === " " ? " " : letter}
            </motion.span>
          ))}
        </span>
      </motion.span>
    </Link>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+/<>";

/**
 * Metadata that resolves itself on hover — the label scrambles through noise
 * and lands on the real word. Fixed-width mono, so nothing reflows.
 */
export function Scramble({
  children,
  className,
  speed = 42,
}: {
  children: string;
  className?: string;
  speed?: number;
}) {
  const [text, setText] = useState(children);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function scramble() {
    let frame = 0;
    stop();
    timer.current = setInterval(() => {
      setText(
        children
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < frame / 2) return children[i];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      frame += 1;
      if (frame / 2 >= children.length) stop();
    }, speed);
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }

  return (
    <span
      className={cn("inline-block font-mono", className)}
      onMouseEnter={scramble}
      onMouseLeave={() => {
        stop();
        setText(children);
      }}
    >
      {text}
    </span>
  );
}

/** A label with an arrow that steps out and re-enters from the opposite corner. */
export function ArrowLink({
  href,
  children,
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="ul">{children}</span>
      <span className="relative ml-3 inline-block size-[1em] overflow-hidden align-middle">
        <span className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/arrow:translate-x-full group-hover/arrow:-translate-y-full">
          ↗
        </span>
        <span className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/arrow:translate-x-0 group-hover/arrow:translate-y-0">
          ↗
        </span>
      </span>
    </>
  );

  const classes = cn(
    "group/arrow inline-flex items-center text-fg transition-colors duration-400 hover:text-accent",
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
