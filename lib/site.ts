/**
 * Site-wide constants. Navigation, contact details and the two studio
 * locations live here so the header, footer, contact page and footprint
 * section all read from one place.
 */

export const site = {
  name: "Nisir",
  legalName: "Nisir Designs",
  tagline: "A brighter tomorrow, by design.",
  description:
    "Nisir is a multidisciplinary design practice — web, apps, brand, motion, 3D modelling, 3D printing and fashion education, across Ontario and Addis Ababa.",
  email: "hello@nisirdesigns.com",
  url: "https://nisirdesigns.com",
  founded: 2019,
} as const;

export const nav = [
  { href: "/", label: "Index", index: "00" },
  { href: "/services", label: "Services", index: "01" },
  { href: "/studio", label: "Studio", index: "02" },
  { href: "/store", label: "Store", index: "03" },
  { href: "/contact", label: "Contact", index: "04" },
] as const;

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
