"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Wordmark } from "@/components/chrome/mark";
import { Magnetic } from "@/components/ui/magnetic";
import { Scramble } from "@/components/ui/links";
import { services, serviceName } from "@/lib/services";
import { locations, nav, site, social } from "@/lib/site";

const shopLinks = [
  { href: "/store", label: "All objects" },
  { href: "/store/custom", label: "Custom printing" },
  { href: "/store/wishlist", label: "Saved" },
  { href: "/store/cart", label: "Cart" },
] as const;

/**
 * The colophon. Always ink, in both themes — it reads as the plate the whole
 * site is printed on, and gives the page a floor to land on.
 */
export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-ink text-bone">
      <div className="shell pb-10 pt-24 md:pt-32">
        {/* The ask, before the index. */}
        <div className="flex flex-col gap-10 border-b border-bone/12 pb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="tag-sm text-gold">Available for new work</p>
            <p className="d3 mt-6 max-w-[14ch] text-bone">
              Let&rsquo;s make something <span className="thin text-gold">worth keeping.</span>
            </p>
          </div>
          <Magnetic strength={0.25}>
            <Link
              href="/contact"
              className="tag group inline-flex h-16 items-center gap-4 rounded-full bg-bone px-8 text-ink transition-colors duration-500 hover:bg-gold"
            >
              Start a project
              <span className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </Link>
          </Magnetic>
        </div>

        {/* Index */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="tag-sm mb-5 text-bone/40">Services</p>
            <ul className="flex flex-col gap-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="ul text-[15px] text-bone/70 transition-colors duration-300 hover:text-gold"
                  >
                    {serviceName(service)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="tag-sm mb-5 text-bone/40">Studio</p>
            <ul className="flex flex-col gap-2.5">
              {nav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="ul text-[15px] text-bone/70 transition-colors duration-300 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="ul text-[15px] text-bone/70 transition-colors duration-300 hover:text-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <p className="tag-sm mb-5 mt-10 text-bone/40">Shop</p>
            <ul className="flex flex-col gap-2.5">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="ul text-[15px] text-bone/70 transition-colors duration-300 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="tag-sm mb-5 text-bone/40">Studios</p>
            <ul className="flex flex-col gap-6">
              {locations.map((place) => (
                <li key={place.id}>
                  <p className="text-[15px] text-bone">
                    {place.city}, {place.country}
                  </p>
                  <p className="tag-sm mt-2 text-bone/45">{place.role}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="tag-sm mb-5 text-bone/40">Direct</p>
            <a
              href={`mailto:${site.email}`}
              className="ul text-[15px] text-bone/70 transition-colors duration-300 hover:text-gold"
            >
              {site.email}
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="tag-sm group mt-8 flex items-center gap-3 text-bone/50 transition-colors hover:text-gold"
            >
              <span className="transition-transform duration-500 group-hover:-translate-y-1">↑</span>
              <Scramble>Back to top</Scramble>
            </button>
          </div>
        </div>
      </div>

      {/* The identity, at the size it deserves, cropped by the page edge. */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="px-[var(--gutter)] pb-6"
      >
        <Wordmark className="w-full text-bone/[0.16]" />
      </motion.div>

      <div className="shell flex flex-col gap-3 border-t border-bone/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="tag-sm text-bone/35">
          © {new Date().getFullYear()} {site.legalName}
        </p>
        <p className="tag-sm text-bone/35">{site.tagline}</p>
      </div>
    </footer>
  );
}
