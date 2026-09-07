"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Mark } from "@/components/chrome/mark";
import { Plate } from "@/components/ui/plate";
import { services, serviceName } from "@/lib/services";
import { locations, nav, site, social } from "@/lib/site";
import { useState } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The index. A full-bleed panel that wipes down over the page, carrying the
 * whole site map: five destinations, seven services, both studios and the
 * one email address. Hovering a service draws its plate on the right, so
 * the menu previews the work rather than just listing it.
 */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [preview, setPreview] = useState(services[0]);

  useEffect(() => {
    if (!open) return;
    document.body.dataset.lock = "true";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.dataset.lock = "false";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          className="slab-ink fixed inset-0 z-[80] flex flex-col"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label="Site index"
        >
          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b-2 border-line px-[var(--gutter)]">
            <Link href="/" onClick={onClose} className="flex items-center gap-3">
              <Mark className="w-9" />
              <span className="tag">Nisir</span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="tag-sm group flex items-center gap-3 text-muted transition-colors hover:text-fg"
            >
              Close
              <span className="relative grid size-6 place-items-center">
                <span className="absolute h-px w-5 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
                <span className="absolute h-px w-5 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[45deg]" />
              </span>
            </button>
          </div>

          <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
            {/* Destinations */}
            <nav className="flex flex-col justify-center gap-1 px-[var(--gutter)] py-14">
              {nav.slice(1).map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.28 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-5 border-b border-line py-4 md:gap-8"
                  >
                    <span className="tag-sm w-8 shrink-0 text-faint transition-colors duration-500 group-hover:text-accent">
                      {item.index}
                    </span>
                    <span className="d1 relative block overflow-hidden">
                      <span className="block transition-transform duration-[0.55s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
                        {item.label}
                      </span>
                      <span className="absolute inset-0 block translate-y-full text-accent transition-transform duration-[0.55s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0">
                        {item.label}
                      </span>
                    </span>
                    <span className="ml-auto text-2xl text-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-accent">
                      ↗
                    </span>
                  </Link>
                </motion.div>
              ))}

              <motion.a
                href={`mailto:${site.email}`}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="ul mt-10 w-fit text-lg text-muted transition-colors hover:text-accent"
              >
                {site.email}
              </motion.a>
            </nav>

            {/* Service index with live preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="flex flex-col justify-between gap-10 border-line px-[var(--gutter)] pb-12 pt-4 lg:border-l lg:py-14"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
                <ul className="flex flex-col gap-0.5">
                  <li className="tag-sm mb-3 text-faint">Services — 07</li>
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        onClick={onClose}
                        onMouseEnter={() => setPreview(service)}
                        className="group flex items-center gap-3 py-1.5 text-[15px] text-muted transition-colors duration-300 hover:text-fg"
                      >
                        <span className="tag-sm text-faint">{service.number}</span>
                        <span className="ul">{serviceName(service)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="hidden w-52 lg:block">
                  <Plate
                    key={preview.slug}
                    kind={preview.plate}
                    className="aspect-4/5"
                    index={preview.number}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-8">
                <ul className="flex flex-col gap-1.5">
                  {locations.map((place) => (
                    <li key={place.id} className="tag-sm flex items-center gap-3 text-faint">
                      <span className="w-28 text-muted">{place.city}</span>
                      <span className="text-accent">{place.role}</span>
                    </li>
                  ))}
                </ul>
                <ul className="flex gap-5">
                  {social.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="tag-sm ul text-muted transition-colors hover:text-fg"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
