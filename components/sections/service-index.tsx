"use client";

import Link from "next/link";
import { services, serviceName } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * The practice as seven full-bleed rules.
 *
 * Hovering a row floods it with gold from the floor up and the type inverts to
 * ink against it — the row becomes the slab. The index number scales to fill
 * the height at the same time, so the whole band changes state at once rather
 * than nudging a few pixels.
 */
export function ServiceIndex({ className }: { className?: string }) {
  return (
    <ul className={cn("relative", className)}>
      {services.map((service, i) => (
        <li key={service.slug}>
          <Link
            href={`/services/${service.slug}`}
            className={cn(
              "group relative isolate flex items-center overflow-hidden border-t-2 border-line",
              i === services.length - 1 && "border-b-2",
            )}
          >
            {/* The flood. */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 translate-y-full bg-gold transition-transform duration-[0.55s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0"
            />

            <div className="bleed flex w-full items-center gap-4 py-6 transition-colors duration-300 group-hover:text-ink md:gap-10 md:py-8">
              <span className="tag-sm w-8 shrink-0 text-faint transition-colors duration-300 group-hover:text-ink/60">
                {service.number}
              </span>

              <h3 className="d2-row min-w-0 flex-1 whitespace-nowrap transition-transform duration-[0.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                {serviceName(service)}
              </h3>

              <span className="tag-sm hidden w-24 shrink-0 text-right text-faint transition-colors duration-300 group-hover:text-ink/60 md:block">
                {service.discipline}
              </span>

              <span className="shrink-0 text-2xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 md:text-4xl">
                ↗
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
