/**
 * The facts the three legal pages share.
 *
 * Kept here rather than repeated in each document because an effective date
 * or a contact address that disagrees between the Terms and the Privacy
 * Policy is exactly the kind of discrepancy that makes both look unmaintained
 * — and in a dispute, unmaintained reads as unenforced.
 *
 * `updated` is the date the wording last changed. Bump it whenever you edit
 * any of the three, and say what changed in the Terms' final section.
 */
export const legal = {
  /** Governing jurisdiction for the Terms. */
  jurisdiction: "Ontario, Canada",
  updated: "12 September 2026",
  /** Where privacy requests and legal notices actually land. */
  contactEmail: "hello@nisirdesigns.com",
  /**
   * Canada's federal privacy regulator, named because PIPEDA requires a
   * complaints route and "contact us" is not one.
   */
  regulator: {
    name: "Office of the Privacy Commissioner of Canada",
    href: "https://www.priv.gc.ca/en/report-a-concern/",
  },
} as const;

export const legalPages = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/cookies", label: "Cookies" },
] as const;
