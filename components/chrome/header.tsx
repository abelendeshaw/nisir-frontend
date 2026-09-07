"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Mark } from "@/components/chrome/mark";
import { Menu } from "@/components/chrome/menu";
import { FlipLink } from "@/components/ui/links";
import { Magnetic } from "@/components/ui/magnetic";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * A header that stays out of the way: transparent over the hero, condensing
 * to a bordered rail once the page moves, and retreating entirely while the
 * visitor is reading downward.
 */
export function Header() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setCondensed(y > 24);
    setHidden(!open && y > 320 && y > previous);
  });

  return (
    <>
      <motion.header
        className={cn(
          // Every page opens on an ink slab, so the header can hold one colour
          // the whole way down: bone type, transparent at rest, solid ink bar
          // the moment the page moves under it.
          "fixed inset-x-0 top-0 z-[75] h-[var(--header-h)] text-bone",
          "transition-colors duration-500",
          condensed && !open ? "bg-ink/92 backdrop-blur-xl" : "bg-transparent",
        )}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex h-full items-center justify-between px-[var(--gutter)]">
          <Link
            href="/"
            aria-label="Nisir — home"
            className="group flex items-center gap-3"
          >
            <Mark className="w-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:text-gold md:w-9" />
            <span className="tag">Nisir</span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {nav.slice(1, 4).map((item) => (
              <FlipLink
                key={item.href}
                href={item.href}
                className={cn("tag transition-colors", pathname.startsWith(item.href) && "text-gold")}
              >
                {item.label}
              </FlipLink>
            ))}
          </nav>

          <div className="flex items-center gap-5 md:gap-7">
            <Magnetic strength={0.2}>
              <Link
                href="/contact"
                className="tag hidden border-2 border-bone/35 px-5 py-3 transition-colors duration-500 hover:border-gold hover:text-gold lg:inline-flex"
              >
                Start a project
              </Link>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open index"
              className="tag group flex items-center gap-3"
            >
              <span className="hidden sm:inline">Index</span>
              <span className="flex flex-col gap-[5px]">
                <span className="block h-px w-6 bg-current transition-transform duration-500 group-hover:translate-x-1" />
                <span className="block h-px w-6 bg-current transition-transform duration-500 group-hover:-translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
