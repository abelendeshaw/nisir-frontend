/**
 * Site-wide constants. Navigation, contact details and the two studio
 * locations live here so the header, footer, contact page and footprint
 * section all read from one place.
 */

import { SERVICES_LIVE } from "@/lib/flags";

export const site = {
  name: "Nisir",
  legalName: "Nisir Designs",
  tagline: "A brighter tomorrow, by design.",
  description:
    "Nisir is a multidisciplinary design practice — web, apps, brand, motion, 3D modelling, 3D printing and fashion education, across Ontario and Addis Ababa.",
  email: "hello@nisirdesigns.com",
  /**
   * Canonical origin — `metadataBase`, Open Graph and canonical links all hang
   * off it. Overridable so a staging or preview deploy doesn't advertise
   * production URLs in its share cards.
   *
   * Written as a literal `process.env.X` read on purpose: Next inlines
   * `NEXT_PUBLIC_` variables at build time by substituting the text, so a
   * dynamic lookup like `process.env[name]` would never be replaced. It is also
   * baked in at `next build`, not read at runtime — rebuild to change it.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nisirdesigns.com",
  founded: 2019,
} as const;

/**
 * The full site map, indices and all. Kept complete even when a section is
 * switched off, so the numbering does not shuffle every time one comes and
 * goes — `02` is the Studio whether or not Services is showing.
 */
export const nav = [
  { href: "/", label: "Index", index: "00" },
  { href: "/services", label: "Services", index: "01" },
  { href: "/studio", label: "Studio", index: "02" },
  { href: "/store", label: "Store", index: "03" },
  { href: "/contact", label: "Contact", index: "04" },
] as const;

/**
 * What visitors are actually offered. Everything that reads navigation reads
 * this, not `nav` — one filter, so a section cannot be hidden in the header
 * and left linked in the footer.
 */
export const liveNav = nav.filter((item) => SERVICES_LIVE || item.href !== "/services");

/**
 * The header's middle rail.
 *
 * Stated as what it excludes rather than as `slice(1, 4)`: the mark already
 * links home and "Start a project" already links to contact, so those two are
 * the exclusions. The old slice silently changed meaning the moment the list
 * it indexed into got shorter — dropping Services from it would have pulled
 * Contact into the header beside the button that already goes there.
 */
export const headerNav = liveNav.filter(
  (item) => item.href !== "/" && item.href !== "/contact",
);

export const locations = [
  {
    id: "on",
    city: "Ontario",
    country: "Canada",
    role: "Digital & 3D production",
    detail: "Web and product systems, brand and motion, 3D modelling and print production.",
  },
  {
    id: "et",
    city: "Addis Ababa",
    country: "Ethiopia",
    role: "Fashion Academy",
    detail: "An offline school where apparel is taught by making it, in the room, by hand.",
  },
] as const;

export const social = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Behance", href: "https://behance.net" },
] as const;

export const stats = [
  { value: 7, suffix: "", label: "Services under one standard" },
  { value: 2, suffix: "", label: "Continents, one practice" },
  { value: 100, suffix: "%", label: "Work owned by a named lead" },
  { value: site.founded, suffix: "", label: "Practising since", plain: true },
] as const;
