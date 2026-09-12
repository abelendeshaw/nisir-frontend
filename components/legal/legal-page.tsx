import type { ReactNode } from "react";
import Link from "next/link";
import { legal, legalPages } from "@/lib/legal";
import { locations, site } from "@/lib/site";

/**
 * The frame the three legal documents are set in.
 *
 * A server component, deliberately — these pages are static prose with no
 * state and no interaction, and there is no reason to ship a kilobyte of
 * client bundle to render a contract.
 *
 * The measure is capped near 70 characters. The rest of the site sets type
 * edge to edge at display sizes, which is right for a headline running across
 * a slab and wrong for four thousand words of clause: past roughly 75
 * characters the eye loses the line return and re-reads the one it just
 * finished. The ink hero keeps the page recognisably part of the site; the
 * body drops to bone because that is the slab meant for reading.
 */
export function LegalPage({
  title,
  summary,
  children,
}: {
  title: string;
  /** One paragraph, plain language, above the formal text. */
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <main id="main">
      <section className="slab-ink pb-14 pt-[calc(var(--header-h)+clamp(40px,8vh,96px))]">
        <div className="shell">
          <p className="marker tag-sm">
            <Link href="/" className="ul transition-colors hover:text-accent">
              Home
            </Link>
            <span className="text-faint">{title}</span>
          </p>

          <h1 className="d2 mt-8 max-w-[22ch]">{title}</h1>

          <p className="tag-sm mt-8 text-faint">Last updated {legal.updated}</p>

          {/* The other two documents, from inside each one. Somebody reading
              the Terms to find out what happens to their address is looking
              for the Privacy Policy, and should not have to go back out to
              the footer to find it. */}
          <nav aria-label="Legal documents" className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {legalPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={
                  page.label === title
                    ? "tag-sm text-gold"
                    : "tag-sm ul text-muted transition-colors hover:text-accent"
                }
                aria-current={page.label === title ? "page" : undefined}
              >
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="slab-bone py-16 md:py-24">
        <div className="shell">
          <div className="max-w-[70ch]">
            <p className="lede border-l-2 border-gold pl-6">{summary}</p>

            <div className="mt-14 flex flex-col gap-12">{children}</div>

            <p className="mt-16 border-t-2 border-line pt-8 text-[14px] leading-relaxed text-muted">
              Questions about any of this go to{" "}
              <a href={`mailto:${legal.contactEmail}`} className="ul text-fg hover:text-accent">
                {legal.contactEmail}
              </a>
              . {site.legalName} operates from{" "}
              {locations.map((place, index) => (
                <span key={place.id}>
                  {index > 0 && " and "}
                  {place.city}, {place.country}
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/** A numbered clause. The number is what a dispute cites. */
export function Clause({
  n,
  heading,
  children,
}: {
  n: number;
  heading: string;
  children: ReactNode;
}) {
  const id = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="d4 flex gap-4">
        <span className="tag-sm mt-[0.45em] shrink-0 text-gold">
          {String(n).padStart(2, "0")}
        </span>
        <span>{heading}</span>
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-muted sm:ml-12">
        {children}
      </div>
    </section>
  );
}

/** A list inside a clause. */
export function Points({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A term being defined, or a row of a table that would be overkill. */
export function Definition({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-line pl-5">
      <p className="text-[14px] font-semibold text-fg">{term}</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}
